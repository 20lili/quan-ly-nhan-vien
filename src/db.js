'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'employees.db');

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_FILE);

db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    name_key   TEXT NOT NULL,
    phone      TEXT NOT NULL,
    gender     TEXT NOT NULL,
    department TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
  CREATE INDEX IF NOT EXISTS idx_employees_name_key   ON employees(name_key);
`);

// U+0300..U+036F: cac dau thanh/dau mu tach ra sau khi normalize('NFD')
const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * Bo dau tieng Viet + ha chu thuong, de go "nguyen van an" van tim ra "Nguyen Van An".
 */
function normalize(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

module.exports = { db, normalize, DB_FILE };

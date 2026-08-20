'use strict';

const { db, normalize } = require('./db');

/** Cac gia tri gioi tinh hop le cho bo loc 3 nut (Tat ca | Nam | Nu). */
const GENDERS = ['Nam', 'Nữ'];

/** Danh sach phong ban (lay tu DB) de do vao o "Loc theo phong ban". */
function listDepartments() {
  return db
    .prepare('SELECT DISTINCT department FROM employees ORDER BY department COLLATE NOCASE')
    .all()
    .map((row) => row.department);
}

/**
 * Dung menh de WHERE dung chung cho ca cau dem va cau lay du lieu.
 * - q: tim theo TEN (khong dau, khong phan biet hoa thuong) HOAC SO DIEN THOAI
 * - department: loc theo phong ban
 * - gender: '' (Tat ca) | 'Nam' | 'Nu'
 */
function buildWhere({ q, department, gender }) {
  const conditions = [];
  const params = [];

  if (q) {
    conditions.push('(name_key LIKE ? OR phone LIKE ?)');
    params.push(`%${normalize(q)}%`, `%${q.replace(/\s+/g, '')}%`);
  }

  if (department) {
    conditions.push('department = ?');
    params.push(department);
  }

  // Chuoi rong = trang thai "Tat ca" => khong them dieu kien nao.
  if (GENDERS.includes(gender)) {
    conditions.push('gender = ?');
    params.push(gender);
  }

  return {
    clause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
}

/**
 * Tra ve mot "trang" nhan vien kem thong tin phan trang.
 */
function findEmployees({ q = '', department = '', gender = '', page = 1, limit = 5 }) {
  const { clause, params } = buildWhere({ q, department, gender });

  const { total } = db.prepare(`SELECT COUNT(*) AS total FROM employees ${clause}`).get(...params);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const offset = (currentPage - 1) * limit;

  const rows = db
    .prepare(
      `SELECT id, name, phone, gender, department
         FROM employees
         ${clause}
        ORDER BY id
        LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);

  return { rows, total, totalPages, currentPage, limit, offset };
}

module.exports = { GENDERS, listDepartments, findEmployees };

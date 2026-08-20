'use strict';

const path = require('node:path');
const express = require('express');

const { seed } = require('./src/seed');
const { listDepartments, findEmployees } = require('./src/employeeRepo');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const PAGE_SIZES = [5, 10, 20];
const DEFAULT_LIMIT = 5;

// Lan chay dau tien: tu dong nap du lieu mau neu bang con rong.
const seedResult = seed();
if (!seedResult.skipped) console.log(`> Da nap ${seedResult.inserted} nhan vien mau vao SQLite.`);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

/** Sinh cac so trang hien thi, rut gon bang "..." khi qua nhieu trang. */
function pageWindow(current, total, span = 2) {
  const pages = new Set([1, total]);
  for (let i = current - span; i <= current + span; i += 1) {
    if (i >= 1 && i <= total) pages.add(i);
  }

  const items = [];
  let previous = 0;
  for (const page of [...pages].sort((a, b) => a - b)) {
    if (previous && page - previous > 1) items.push('...');
    items.push(page);
    previous = page;
  }
  return items;
}

app.get('/', (req, res) => {
  const q = String(req.query.q || '').trim();
  const department = String(req.query.department || '').trim();

  const requestedLimit = Number(req.query.limit);
  const limit = PAGE_SIZES.includes(requestedLimit) ? requestedLimit : DEFAULT_LIMIT;
  const page = Number.parseInt(req.query.page, 10) || 1;

  const result = findEmployees({ q, department, page, limit });

  // Giu nguyen tu khoa tim kiem / bo loc khi bam sang trang khac.
  const buildUrl = (overrides = {}) => {
    const state = { q, department, limit, page: result.currentPage, ...overrides };
    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.department) params.set('department', state.department);
    if (Number(state.limit) !== DEFAULT_LIMIT) params.set('limit', state.limit);
    if (Number(state.page) > 1) params.set('page', state.page);
    const query = params.toString();
    return query ? `/?${query}` : '/';
  };

  res.render('index', {
    ...result,
    q,
    department,
    departments: listDepartments(),
    pageSizes: PAGE_SIZES,
    pages: pageWindow(result.currentPage, result.totalPages),
    buildUrl,
  });
});

app.use((req, res) => {
  res.status(404).send('404 - Khong tim thay trang. <a href="/">Ve trang chu</a>');
});

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).send('500 - Loi may chu. <a href="/">Ve trang chu</a>');
});

app.listen(PORT, () => {
  console.log(`> Quan ly nhan vien dang chay tai http://localhost:${PORT}`);
});

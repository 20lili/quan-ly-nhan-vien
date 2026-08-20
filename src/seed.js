'use strict';

const { db, normalize } = require('./db');

const EMPLOYEES = [
  { name: 'Nguyễn Văn An',      phone: '0901234567', gender: 'Nam', department: 'Kỹ thuật' },
  { name: 'Trần Thị Bình',      phone: '0912345678', gender: 'Nữ',  department: 'Nhân sự' },
  { name: 'Lê Hoàng Cường',     phone: '0923456789', gender: 'Nam', department: 'Kinh doanh' },
  { name: 'Phạm Thị Dung',      phone: '0934567890', gender: 'Nữ',  department: 'Kế toán' },
  { name: 'Hoàng Minh Đức',     phone: '0945678901', gender: 'Nam', department: 'Kỹ thuật' },
  { name: 'Vũ Thị Hà',          phone: '0956789012', gender: 'Nữ',  department: 'Marketing' },
  { name: 'Đỗ Quang Huy',       phone: '0967890123', gender: 'Nam', department: 'Kỹ thuật' },
  { name: 'Bùi Thị Lan',        phone: '0978901234', gender: 'Nữ',  department: 'Chăm sóc khách hàng' },
  { name: 'Đặng Văn Long',      phone: '0989012345', gender: 'Nam', department: 'Kinh doanh' },
  { name: 'Ngô Thị Mai',        phone: '0990123456', gender: 'Nữ',  department: 'Kế toán' },
  { name: 'Dương Tuấn Nam',     phone: '0311234567', gender: 'Nam', department: 'Marketing' },
  { name: 'Lý Thị Oanh',        phone: '0322345678', gender: 'Nữ',  department: 'Nhân sự' },
  { name: 'Trịnh Văn Phúc',     phone: '0333456789', gender: 'Nam', department: 'Kỹ thuật' },
  { name: 'Cao Thị Quyên',      phone: '0344567890', gender: 'Nữ',  department: 'Chăm sóc khách hàng' },
  { name: 'Hồ Minh Sơn',        phone: '0355678901', gender: 'Nam', department: 'Kinh doanh' },
  { name: 'Phan Thị Thu',       phone: '0366789012', gender: 'Nữ',  department: 'Marketing' },
  { name: 'Võ Anh Tuấn',        phone: '0377890123', gender: 'Nam', department: 'Kế toán' },
  { name: 'Đinh Thị Uyên',      phone: '0388901234', gender: 'Nữ',  department: 'Nhân sự' },
  { name: 'Tạ Quốc Việt',       phone: '0399012345', gender: 'Nam', department: 'Kỹ thuật' },
  { name: 'Mai Thị Xuân',       phone: '0787123456', gender: 'Nữ',  department: 'Chăm sóc khách hàng' },
];

/**
 * Nap du lieu mau. Mac dinh chi nap khi bang dang rong,
 * chay `npm run seed` (co --force) de xoa sach va nap lai tu dau.
 */
function seed({ force = false } = {}) {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM employees').get();

  if (total > 0 && !force) return { inserted: 0, skipped: true };

  if (force) {
    db.exec('DELETE FROM employees');
    db.exec("DELETE FROM sqlite_sequence WHERE name = 'employees'");
  }

  const insert = db.prepare(
    'INSERT INTO employees (name, name_key, phone, gender, department) VALUES (?, ?, ?, ?, ?)'
  );

  db.exec('BEGIN');
  try {
    for (const e of EMPLOYEES) {
      insert.run(e.name, normalize(e.name), e.phone, e.gender, e.department);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return { inserted: EMPLOYEES.length, skipped: false };
}

module.exports = { seed, EMPLOYEES };

// Cho phep chay truc tiep: node src/seed.js --force
if (require.main === module) {
  const force = process.argv.includes('--force');
  const result = seed({ force });
  console.log(
    result.skipped
      ? 'Bang employees da co du lieu, bo qua seed. Dung "npm run seed" de nap lai.'
      : `Da nap ${result.inserted} nhan vien mau.`
  );
}

/**
 * Kéo các nhóm khoá dịch mà khu quản trị cần từ `Zoldify_Frontend`.
 *
 *   npm run pull:messages
 *
 * Vì sao KHÔNG đưa file dịch vào `shared-files.mjs`: hai file `vi.json` và
 * `en.json` bên Frontend nặng hơn 40 KB và chứa toàn bộ khoá của trang bán hàng
 * — giỏ hàng, thanh toán, chat, trang chủ. App quản trị không dùng cái nào
 * trong số đó, và bắt nó phải giống hệt sẽ khoá luôn Frontend: thêm một khoá
 * cho trang chủ là cổng kiểm đỏ.
 *
 * Nên ở đây lọc theo nhóm. `admin` và `adminWithdrawals` rồi sẽ CHUYỂN HẲN sang
 * repo này (xoá khỏi Frontend) khi bảy trang được dời sang — lúc đó bỏ chúng ra
 * khỏi danh sách dưới đây và sửa tay trong repo này.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE_REPO } from './shared-files.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.resolve(ROOT, SOURCE_REPO);

/** Nhóm khoá khu quản trị KÉO từ Frontend. `admin` và `adminWithdrawals` đã
 *  chuyển hẳn sang repo này — sửa tay ở đây, không kéo nữa. */
const NAMESPACES = [
  'meta',            // tiêu đề tab, skip link — layout gốc dùng
  'common',          // nút, trạng thái tải, phân trang
  'errors',
  'orderStatus',
  'orderStatusShort',
  'withdrawalStatus',
  'productStatus',
  'condition',
];

const LOCALES = ['vi', 'en'];

for (const locale of LOCALES) {
  const from = path.join(SRC, 'src/i18n/messages', `${locale}.json`);
  if (!fs.existsSync(from)) {
    console.error(`Không thấy ${from}`);
    process.exit(1);
  }

  const all = JSON.parse(fs.readFileSync(from, 'utf8'));
  const picked = {};
  const missing = [];

  for (const ns of NAMESPACES) {
    if (all[ns] === undefined) missing.push(ns);
    else picked[ns] = all[ns];
  }

  if (missing.length > 0) {
    console.error(`${locale}.json thiếu nhóm: ${missing.join(', ')}`);
    process.exit(1);
  }

  // Đọc file hiện tại để giữ lại các nhóm repo này tự quản (admin,
  // adminWithdrawals…). Chỉ ghi đè các nhóm trong NAMESPACES.
  const to = path.join(ROOT, 'src/i18n/messages', `${locale}.json`);
  let existing = {};
  if (fs.existsSync(to)) {
    existing = JSON.parse(fs.readFileSync(to, 'utf8'));
  }
  const merged = { ...existing, ...picked };

  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.writeFileSync(to, JSON.stringify(merged, null, 2) + '\n', 'utf8');

  const count = Object.values(merged).reduce(
    (n, group) => n + Object.keys(group).length, 0);
  console.log(`  ${locale}.json — ${Object.keys(merged).length} nhóm, ${count} khoá`);
}

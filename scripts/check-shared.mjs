/**
 * Cổng kiểm: các file dùng chung phải giống hệt bản gốc bên `Zoldify_Frontend`.
 *
 *   npm run check:shared
 *
 * Chạy trong CI của CẢ HAI repo. Sửa `status-tone.ts` ở một bên mà quên bên kia
 * thì lệnh này đỏ ngay, chứ không phải ba tuần sau mới lộ ra bằng hai bảng màu
 * khác nhau trên hai trang.
 *
 * Nếu repo gốc không có mặt (ví dụ CI chỉ checkout một repo), lệnh này BỎ QUA
 * chứ không báo lỗi giả. Muốn kiểm thật trong CI thì phải checkout cả hai —
 * ghi trong README mục CI.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SHARED_FILES, SOURCE_REPO } from './shared-files.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.resolve(ROOT, SOURCE_REPO);

if (!fs.existsSync(SRC)) {
  console.log(`Bỏ qua: không thấy repo gốc tại ${SRC}.`);
  console.log('Muốn kiểm thật thì checkout cả Zoldify_Frontend cạnh repo này.');
  process.exit(0);
}

const drifted = [];
const missing = [];

for (const rel of SHARED_FILES) {
  const from = path.join(SRC, rel);
  const to = path.join(ROOT, rel);

  if (!fs.existsSync(from)) {
    missing.push(`${rel}  (thiếu ở repo gốc)`);
    continue;
  }
  if (!fs.existsSync(to)) {
    missing.push(`${rel}  (thiếu ở repo này)`);
    continue;
  }
  if (!fs.readFileSync(from).equals(fs.readFileSync(to))) {
    drifted.push(rel);
  }
}

if (missing.length === 0 && drifted.length === 0) {
  console.log(`${SHARED_FILES.length} file dùng chung khớp nhau.`);
  process.exit(0);
}

if (missing.length > 0) {
  console.error(`\nThiếu ${missing.length} file:`);
  for (const m of missing) console.error(`  ${m}`);
}

if (drifted.length > 0) {
  console.error(`\n${drifted.length} file ĐÃ LỆCH khỏi bản gốc:`);
  for (const d of drifted) console.error(`  ${d}`);
  console.error('\nBản gốc là Zoldify_Frontend. Chạy `npm run sync:shared` để');
  console.error('kéo về, hoặc nếu thay đổi vốn nên nằm ở cả hai bên thì đưa nó');
  console.error('sang Frontend trước rồi mới đồng bộ.');
}

process.exit(1);

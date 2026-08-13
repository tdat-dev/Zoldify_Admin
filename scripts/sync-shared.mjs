/**
 * Chép các file dùng chung từ `Zoldify_Frontend` sang repo này.
 *
 *   npm run sync:shared
 *
 * Một chiều, luôn luôn: Frontend là bản gốc. Nếu bạn vừa sửa một file dùng
 * chung Ở ĐÂY thì lệnh này sẽ ghi đè mất — đó là chủ ý. Sửa bên Frontend rồi
 * chạy lại.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SHARED_FILES, SOURCE_REPO } from './shared-files.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.resolve(ROOT, SOURCE_REPO);

if (!fs.existsSync(SRC)) {
  console.error(`Không thấy repo gốc: ${SRC}`);
  console.error('Hai repo phải nằm cạnh nhau trong cùng một thư mục cha.');
  process.exit(1);
}

let copied = 0;
let same = 0;
const missing = [];

for (const rel of SHARED_FILES) {
  const from = path.join(SRC, rel);
  const to = path.join(ROOT, rel);

  if (!fs.existsSync(from)) {
    missing.push(rel);
    continue;
  }

  const content = fs.readFileSync(from);
  if (fs.existsSync(to) && fs.readFileSync(to).equals(content)) {
    same += 1;
    continue;
  }

  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.writeFileSync(to, content);
  console.log(`  chép   ${rel}`);
  copied += 1;
}

if (missing.length > 0) {
  console.error(`\n${missing.length} file KHÔNG CÓ trong repo gốc:`);
  for (const m of missing) console.error(`  ${m}`);
  console.error('\nHoặc đường dẫn trong shared-files.mjs đã cũ, hoặc file đã bị');
  console.error('đổi tên bên Frontend. Sửa danh sách rồi chạy lại.');
  process.exit(1);
}

console.log(`\n${copied} file cập nhật, ${same} file đã trùng sẵn.`);

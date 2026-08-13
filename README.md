# Zoldify Admin

Khu quản trị Zoldify, tách khỏi `Zoldify_Frontend` thành ứng dụng riêng.

**Trạng thái: mới có khung.** Bảy trang quản trị chưa được chuyển sang — đó là
việc tiếp theo, mô tả ở mục [Việc tiếp theo](#việc-tiếp-theo).

Quyết định và lý do đầy đủ:
[`Zoldify_Backend/docs/system-design/2026-08-13-tach-admin-frontend.md`](../Zoldify_Backend/docs/system-design/2026-08-13-tach-admin-frontend.md)

---

## Chạy trên máy

Ba repo phải nằm cạnh nhau trong cùng một thư mục cha:

```
Zoldify/
  Zoldify_Backend/
  Zoldify_Frontend/
  Zoldify_Admin/     ← bạn đang ở đây
```

```bash
cp .env.sample .env.local     # sửa NEXT_PUBLIC_API_ORIGIN nếu cần
npm install
npm run gen:api               # sinh kiểu API từ openapi.json của backend
npm run dev                   # cổng 3002
```

Cổng đã chia sẵn để chạy cả ba cùng lúc: backend **3000**, trang bán hàng
**3001**, quản trị **3002**.

Đăng nhập bằng tài khoản có `role = 'admin'`. **Phiên đăng nhập KHÔNG dùng chung
với trang bán hàng** — token lưu theo origin, mà đây là origin khác. Đăng nhập ở
3001 rồi mở 3002 vẫn là chưa đăng nhập. Đây là hệ quả cố ý của việc tách app,
không phải lỗi.

---

## File dùng chung — đọc trước khi sửa bất cứ thứ gì

22 file trong repo này là **bản sao** từ `Zoldify_Frontend`. Danh sách nằm trong
[`scripts/shared-files.mjs`](scripts/shared-files.mjs).

**Sửa chúng ở đây là sai chỗ.** Sửa bên `Zoldify_Frontend`, rồi:

```bash
npm run sync:shared      # kéo bản mới về (một chiều, Frontend là gốc)
npm run check:shared     # kiểm đã khớp chưa
```

`check:shared` chạy trong CI và **đỏ ngay khi hai bản lệch nhau**. Nó có mặt vì
repo này đã dính đúng lỗi đó: bộ trạng thái đơn hàng từng tồn tại **bốn bản**, và
bản nằm ở trang quản trị thiếu hai giá trị — hậu quả là admin không có cách nào
chuyển đơn sang hai trạng thái đó, và đơn đang ở hai trạng thái ấy hiện ra ô
trống. Không ai cố ý; các bản sao chỉ được sửa vào những ngày khác nhau.

Hai thứ **không** nằm trong danh sách dùng chung, và có lý do:

| | Vì sao |
|---|---|
| `src/api/schema.d.ts` | Sinh tự động bằng `npm run gen:api` từ `openapi.json` của backend. Thứ sinh được thì không cần bản sao để mà trôi |
| `src/i18n/messages/*.json` | Bên Frontend hai file này hơn 40 KB và chứa toàn bộ khoá của trang bán hàng. Bắt phải giống hệt sẽ khoá luôn Frontend: thêm một khoá cho trang chủ là CI đỏ. Dùng `npm run pull:messages` để kéo theo nhóm |

---

## Việc tiếp theo

Chuyển bảy trang quản trị sang. Theo thứ tự:

**1. Chuyển trang.** Từ `Zoldify_Frontend/src/app/admin/` sang `src/app/` của
repo này. Đường dẫn đổi theo, bỏ tiền tố `/admin`:

| Repo cũ | Repo này |
|---|---|
| `src/app/admin/page.tsx` | `src/app/page.tsx` *(thay file giữ chỗ)* |
| `src/app/admin/orders/page.tsx` | `src/app/orders/page.tsx` |
| `src/app/admin/products/page.tsx` | `src/app/products/page.tsx` |
| `src/app/admin/categories/page.tsx` | `src/app/categories/page.tsx` |
| `src/app/admin/users/page.tsx` | `src/app/users/page.tsx` |
| `src/app/admin/withdrawals/page.tsx` | `src/app/withdrawals/page.tsx` |
| `src/app/admin/settings/page.tsx` | `src/app/settings/page.tsx` |

**2. Chuyển `AdminNav`.** `src/components/admin/AdminNav.tsx` sang
`src/components/AdminNav.tsx`, sửa các `href` bỏ tiền tố `/admin`, rồi gắn nó
vào `src/app/layout.tsx` — ngay bên trong `<AdminGate>`, phía trên `{children}`.

**3. Chuyển `StockControl`** nếu trang products dùng tới. Kiểm xem trang bán hàng
có dùng không: nếu có thì nó thuộc nhóm dùng chung, thêm vào
`scripts/shared-files.mjs`; nếu không thì chuyển hẳn.

**4. Cổng quyền.** Bỏ `src/app/admin/layout.tsx` cũ — việc của nó đã nằm trong
`src/components/AdminGate.tsx` của repo này. Không cần chuyển gì.

**5. Xoá khỏi repo cũ.** `src/app/admin/**` và `src/components/admin/**`, cộng
hai nhóm khoá `admin` và `adminWithdrawals` trong `src/i18n/messages/*.json`.
Sau đó bỏ hai nhóm đó khỏi `NAMESPACES` trong `scripts/pull-messages.mjs` của
repo này và sửa tay ở đây từ đó về sau.

> **Xoá thật, đừng để lại "cho chắc".** Hai bản khu quản trị cùng chạy được nghĩa
> là sớm muộn ai đó sẽ sửa nhầm bản chết. Git giữ lịch sử rồi.

**6. Kiểm không còn link chết.** Tìm `'/admin` trong `Zoldify_Frontend` — mọi
`<Link>` trỏ vào khu quản trị đều phải gỡ hoặc đổi thành link ngoài sang
`admin.zoldify.com`.

**7. Trang đăng nhập.** App này chưa có. Hiện `AdminGate` chỉ hiện một màn hình
báo chưa đăng nhập. Cần một `src/app/login/page.tsx` dùng `authService` — thêm
`src/services/auth.service.ts` vào danh sách dùng chung khi làm.

### Nghiệm thu

1. Đăng nhập bằng tài khoản admin và làm trọn một lệnh rút: duyệt → hoàn tất.
2. Không còn ô tìm kiếm, nút Đăng bán, hay giỏ hàng trên bất kỳ trang nào.
3. `zoldify.com/admin` trả 404 và không còn đường nào tới khu quản trị từ trang
   bán hàng.
4. Sửa một giá trị trong `src/lib/status-tone.ts` ở một repo mà không sửa repo
   kia thì `npm run check:shared` đỏ.
5. `npm run build` xanh ở cả hai repo.

---

## Lệnh

| | |
|---|---|
| `npm run dev` | Chạy máy, cổng 3002 |
| `npm run build` | Dựng bản production |
| `npm run lint` | ESLint |
| `npm run gen:api` | Sinh lại `src/api/schema.d.ts` từ `openapi.json` của backend |
| `npm run sync:shared` | Kéo file dùng chung từ `Zoldify_Frontend` |
| `npm run check:shared` | Kiểm file dùng chung đã lệch chưa *(chạy trong CI)* |
| `npm run pull:messages` | Kéo các nhóm khoá dịch khu quản trị cần |

## CI

`.github/workflows/ci.yml` checkout **cả hai** repo rồi mới chạy `check:shared`.
Không checkout `Zoldify_Frontend` thì script tự bỏ qua và cổng kiểm trở thành
trang trí — cố ý làm vậy để chạy trên máy cá nhân không bị lỗi giả, nhưng trong
CI thì phải có đủ hai.

## Triển khai

Dự kiến `admin.zoldify.com`, cùng Caddy với trang bán hàng. Chưa dựng. Phương án
lùi nếu lịch căng: deploy dưới đường dẫn phụ của cùng máy chủ — vẫn tách repo và
build, chỉ bỏ phần tên miền riêng. Chi tiết ở mục 3.2 của tài liệu kiến trúc.

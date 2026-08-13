/**
 * Chỗ giữ chỗ cho trang tổng quan.
 *
 * File này BỊ THAY THẾ khi bảy trang quản trị được chuyển sang: nội dung của
 * `Zoldify_Frontend/src/app/admin/page.tsx` sẽ nằm ở đây. Xem README mục
 * "Việc tiếp theo".
 */
export default function Placeholder() {
  return (
    <main className="mx-auto max-w-3xl p-10">
      <h1 className="text-2xl font-bold text-ink">Zoldify Admin</h1>
      <p className="mt-2 text-body text-ink-muted">
        Khung ứng dụng đã dựng xong. Bảy trang quản trị chưa được chuyển sang.
      </p>

      <div className="mt-8 rounded-card bg-surface-card p-6">
        <h2 className="text-small font-semibold text-ink">Đã có sẵn</h2>
        <ul className="mt-3 space-y-1.5 text-small text-ink-muted">
          <li>Vỏ ứng dụng không kèm header, footer hay giỏ hàng của trang bán hàng</li>
          <li>Cổng quyền admin</li>
          <li>22 file dùng chung, đồng bộ một chiều từ Zoldify_Frontend</li>
          <li>Token thiết kế, i18n vi và en, kiểu API sinh từ openapi.json</li>
        </ul>
      </div>

      <div className="mt-4 rounded-card bg-surface-card p-6">
        <h2 className="text-small font-semibold text-ink">Việc tiếp theo</h2>
        <p className="mt-3 text-small leading-relaxed text-ink-muted">
          Chuyển bảy trang từ <code>Zoldify_Frontend/src/app/admin/</code> sang{' '}
          <code>src/app/</code> của repo này, rồi xoá chúng khỏi repo cũ. Các bước
          và tiêu chí nghiệm thu nằm trong README.
        </p>
      </div>
    </main>
  );
}

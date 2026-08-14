"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Cổng quyền cho toàn bộ app quản trị.
 *
 * Chuyển nguyên từ `Zoldify_Frontend/src/app/admin/layout.tsx`. Ở đó nó chỉ gác
 * một nhánh route; ở đây nó gác cả ứng dụng, nên đặt trong root layout.
 *
 * Phải chờ `authReady` rồi mới đá đi. Trước đây điều này đúng nhờ AuthProvider
 * không render gì cho tới khi đọc xong localStorage; bỏ được cái đó thì phải
 * kiểm tường minh, không thì admin nào tải lại trang cũng bị văng ra ngoài.
 *
 * KHÁC với bản cũ ở một chỗ: không `router.replace('/login')` được, vì app này
 * không có trang đăng nhập của riêng nó và cũng KHÔNG dùng chung phiên với
 * trang bán hàng (token lưu theo origin). Người chưa đăng nhập thấy một màn
 * hình nói rõ phải làm gì. Trang đăng nhập riêng cho khu quản trị là việc chưa
 * làm — xem README.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = isAuthenticated ? document.title : 'Zoldify Admin';
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-card bg-surface-card p-8 text-center">
          <h1 className="text-body font-semibold text-ink">Chưa đăng nhập</h1>
          <p className="mt-2 text-small leading-relaxed text-ink-muted">
            Khu quản trị chạy trên tên miền riêng nên không dùng chung phiên với
            trang bán hàng. Bạn phải đăng nhập lại ở đây.
          </p>
          <p className="mt-4 text-caption text-ink-faint">
            Trang đăng nhập của khu quản trị chưa được dựng.
          </p>
        </div>
      </main>
    );
  }

  if (user.role !== 'admin') {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-card bg-surface-card p-8 text-center">
          <h1 className="text-body font-semibold text-ink">Không có quyền</h1>
          <p className="mt-2 text-small leading-relaxed text-ink-muted">
            Tài khoản {user.email} không phải quản trị viên.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

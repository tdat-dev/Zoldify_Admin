'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FolderOpen,
  Wallet,
  Settings,
  Shield,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Thanh điều hướng chính của khu quản trị.
 *
 * Chuyển từ `Zoldify_Frontend/src/components/admin/AdminNav.tsx`, bỏ tiền tố
 * `/admin` khỏi mọi href vì ở repo này toàn bộ app ĐÃ LÀ admin.
 *
 * Sidebar cố định bên trái trên desktop, hamburger menu trên mobile.
 */

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Tổng quan' },
  { href: '/orders', icon: ShoppingCart, label: 'Đơn hàng' },
  { href: '/products', icon: Package, label: 'Sản phẩm' },
  { href: '/users', icon: Users, label: 'Người dùng' },
  { href: '/categories', icon: FolderOpen, label: 'Danh mục' },
  { href: '/withdrawals', icon: Wallet, label: 'Lệnh rút' },
  { href: '/settings', icon: Settings, label: 'Cài đặt' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Đóng menu khi chuyển trang
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const navContent = (
    <ul className="flex flex-col gap-0.5">
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active = isActive(href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`
                flex items-center gap-3 rounded-control px-3 py-2.5 text-small font-medium
                transition-colors
                ${active
                  ? 'bg-brand/10 text-brand font-semibold'
                  : 'text-ink-muted hover:bg-surface-sunken hover:text-ink'
                }
              `}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  /** Khối thông tin user + nút đăng xuất — dùng chung cho sidebar và drawer */
  const logoutBlock = (
    <div className="border-t border-ink/8 px-3 py-3">
      <div className="flex items-center gap-3 px-3 py-2">
        {/* Avatar tròn hiển thị chữ cái đầu */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold uppercase">
          {user?.full_name?.charAt(0) || 'A'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{user?.full_name || 'Admin'}</p>
          <p className="truncate text-xs text-ink-muted">{user?.email || ''}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={logout}
        className="mt-1 flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-small font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        Đăng xuất
      </button>
    </div>
  );

  return (
    <>
      {/* === SIDEBAR — Desktop (lg trở lên) === */}
      <aside
        className="hidden lg:flex lg:w-[220px] lg:shrink-0 lg:flex-col lg:border-r lg:border-ink/8 lg:bg-surface-card"
        aria-label="Điều hướng quản trị"
      >
        {/* Logo / Thương hiệu */}
        <div className="flex h-[56px] items-center gap-2 border-b border-ink/8 px-4">
          <Shield className="h-5 w-5 text-brand" aria-hidden="true" />
          <span className="text-h3 font-bold text-ink">Zoldify Admin</span>
        </div>

        {/* Menu items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navContent}
        </nav>

        {/* Thông tin user + Đăng xuất */}
        {logoutBlock}
      </aside>

      {/* === TOPBAR — Mobile (dưới lg) === */}
      <header
        className="flex h-[56px] items-center gap-3 border-b border-ink/8 bg-surface-card px-4 lg:hidden"
        aria-label="Thanh trên quản trị"
      >
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
          className="flex h-9 w-9 items-center justify-center rounded-control text-ink hover:bg-surface-sunken"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
        <Shield className="h-5 w-5 text-brand" aria-hidden="true" />
        <span className="text-h3 font-bold text-ink">Zoldify Admin</span>
      </header>

      {/* Menu mobile mở ra */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-backdrop bg-ink/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <nav
            className="fixed inset-y-0 left-0 z-modal w-[260px] flex flex-col overflow-y-auto bg-surface-card shadow-float lg:hidden"
            aria-label="Điều hướng quản trị"
          >
            <div className="mb-4 flex items-center gap-2 p-4">
              <Shield className="h-5 w-5 text-brand" aria-hidden="true" />
              <span className="text-h3 font-bold text-ink">Zoldify Admin</span>
            </div>
            <div className="flex-1 px-4">
              {navContent}
            </div>
            {/* Thông tin user + Đăng xuất (mobile) */}
            {logoutBlock}
          </nav>
        </>
      )}
    </>
  );
}

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
} from 'lucide-react';
import { useState, useEffect } from 'react';

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
            className="fixed inset-y-0 left-0 z-modal w-[260px] overflow-y-auto bg-surface-card p-4 shadow-float lg:hidden"
            aria-label="Điều hướng quản trị"
          >
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand" aria-hidden="true" />
              <span className="text-h3 font-bold text-ink">Zoldify Admin</span>
            </div>
            {navContent}
          </nav>
        </>
      )}
    </>
  );
}

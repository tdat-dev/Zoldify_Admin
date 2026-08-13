import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/Toast';
import { AdminGate } from '@/components/AdminGate';

/**
 * Vỏ của app quản trị.
 *
 * Điểm khác biệt duy nhất mà cũng là toàn bộ lý do tách app: KHÔNG có
 * SiteChrome, không Header, không Footer, không AnnounceBar, không CartProvider.
 *
 * Trước đây khu quản trị nằm lồng trong root layout của trang bán hàng, nên một
 * admin đang duyệt lệnh rút mười bốn triệu vẫn thấy ô tìm "Tìm đồ cũ: máy tính,
 * xe đạp…", nút Đăng bán, và một cái giỏ hàng trên đầu màn hình.
 *
 * Font giữ nguyên Be Vietnam Pro để hai app trông cùng một nhà.
 */
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-bvp',
});

/**
 * Không có OpenGraph, và đó là cố ý: khu quản trị không được chia sẻ lên mạng
 * xã hội. `robots` chặn hẳn — một trang quản trị nằm trong kết quả tìm kiếm là
 * lỗi, không phải cơ hội.
 */
export const metadata: Metadata = {
  title: {
    default: 'Zoldify Admin',
    template: '%s — Zoldify Admin',
  },
  description: 'Khu quản trị Zoldify.',
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${beVietnamPro.variable} ${beVietnamPro.className}`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <ToastProvider>
              <AdminGate>{children}</AdminGate>
            </ToastProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

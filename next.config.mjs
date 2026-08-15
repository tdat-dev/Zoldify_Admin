import createNextIntlPlugin from 'next-intl/plugin';

/** Locale đọc từ cookie, không từ URL — cùng quy ước với Zoldify_Frontend. */
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Gói runtime tối giản cho Docker: chỉ .next/standalone + static, bỏ toàn bộ
  // node_modules dev khỏi image. Ảnh nhỏ hơn ~1GB, đĩa VPS đỡ chật.
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);

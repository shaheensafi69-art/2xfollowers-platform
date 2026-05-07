import type { NextConfig } from "next";

const nextConfig: NextConfig & { eslint?: { ignoreDuringBuilds: boolean }; swcMinify?: boolean } = {
  // نادیده گرفتن تمام خطاهای ESLint در زمان بیلد
  eslint: {
    ignoreDuringBuilds: true,
  },
  // نادیده گرفتن تمام خطاهای تایپ‌اسکریپت در زمان بیلد
  typescript: {
    ignoreBuildErrors: true,
  },
  // تنظیمات اضافه برای پایداری
  swcMinify: true,
  images: {
    unoptimized: true, // اگر ارور تصویر داری این کمک می‌کند
  }
};

export default nextConfig;
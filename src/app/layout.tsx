import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar"; // ۱. ایمپورت کردن سایدبار جدید

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "2X Followers | Elevate Your Reach",
  description: "Premium Social Media Marketing Services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-brand-bg text-brand-text antialiased min-h-screen`}>
        {/* ۲. اینجا ساختار صفحه را با Flex می‌سازیم */}
        <div className="flex min-h-screen">
          {/* سایدبار ثابت در سمت چپ */}
          <aside className="w-64 border-r border-slate-100 bg-white">
            <Sidebar />
          </aside>

          {/* محتوای اصلی در سمت راست */}
          <main className="flex-1 p-8 bg-slate-50/50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
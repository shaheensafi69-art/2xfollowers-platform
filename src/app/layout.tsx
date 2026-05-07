import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
      <body className={`${inter.className} antialiased min-h-screen bg-white`}>
        {/* شاهین جان، اینجا دیگر هیچ سایدبار یا هیدری نمی‌گذاریم.
          هر بخش (مثل دشبورد یا صفحه اصلی) خودش لایه‌ی مخصوصش را دارد.
          این کار باعث می‌شود صفحه لاگین و ساین‌آپت کاملاً تمیز بماند.
        */}
        {children}
      </body>
    </html>
  );
}
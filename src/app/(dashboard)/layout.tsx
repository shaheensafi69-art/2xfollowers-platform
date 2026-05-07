import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* هیدر هوشمند و شیشه‌ای */}
      <Navbar />
      
      {/* بخش اصلی محتوا:
        1. flex-grow: باعث می‌شود اگر محتوا کم بود، فوتر باز هم در پایین صفحه بماند.
        2. pt-28: فاصله از بالا برای اینکه محتوا زیر هیدر فیکس نماند.
      */}
      <main className="flex-grow pt-28 pb-10 px-4 sm:px-8 max-w-[1400px] mx-auto w-full">
        {children}
      </main>

      {/* فوتر مدرن سایت */}
      <Footer />
    </div>
  );
}
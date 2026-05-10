"use client";
import { useState } from 'react';
import Link from 'next/link';
// اضافه کردن آیکون PhoneIncoming برای بخش تماس
import { Menu, X, LayoutDashboard, Zap, ShoppingBag, Settings, PhoneIncoming } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'New Order', href: '/dashboard/new-order', icon: Zap },
    { name: 'Services', href: '/services', icon: ShoppingBag },
    { name: 'Contact', href: '/dashboard/contact', icon: PhoneIncoming }, // اضافه شدن صفحه کانتکت
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* برندینگ */}
        <Link href="/" className="text-2xl font-black italic tracking-tighter flex items-center">
          <span className="text-emerald-600">2X</span>
          <span className="text-slate-900 ml-1">FOLLOWERS</span>
        </Link>

        {/* منوی کامپیوتر */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* دکمه منوی موبایل */}
        <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* منوی کشویی موبایل */}
      <div className={`lg:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[400px] py-6' : 'max-h-0'}`}>
        <div className="flex flex-col px-6 gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsOpen(false)} 
              className="flex items-center gap-4 text-lg font-bold text-slate-700 hover:text-emerald-600 transition-colors"
            >
              <link.icon size={22} className="text-emerald-600" />
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
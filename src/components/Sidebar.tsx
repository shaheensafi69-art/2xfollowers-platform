"use client"; // چون از هوک استفاده می‌کنیم باید کلاینت باشد

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, ListOrdered, Box, Settings } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname(); // ۱. گرفتن مسیر فعلی

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'New Order', href: '/dashboard/new-order', icon: PlusCircle },
    { name: 'Orders', href: '/dashboard/orders', icon: ListOrdered },
    { name: 'Services', href: '/dashboard/services', icon: Box },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="w-64 p-6 space-y-6">
      <h1 className="text-2xl font-black text-emerald-600 mb-8">2X Followers</h1>
      
      <div className="space-y-2">
        {navItems.map((item) => {
          // ۲. چک کردن اینکه آیا این لینک فعال است یا نه
          const isActive = pathname === item.href; 

          return (
            <Link 
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold ${
                isActive 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' // استایل حالت فعال
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' // استایل حالت عادی
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
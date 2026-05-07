// src/components/LogoutButton.tsx
"use client";
import { createClient } from '@/utils/supabase/client'; // آدرس دقیق supabase client
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // مهم: بعد از لاگ‌اوت، کاربر را به صفحه لاگین بفرست
    router.push('/login'); 
    router.refresh();
  };

  return (
    <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium w-full">
      <LogOut size={20} /> Logout
    </button>
  );
}
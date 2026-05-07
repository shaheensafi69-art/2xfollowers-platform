"use client"; // این خط باید اولین خط باشد

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// تنظیمات رندرینگ را به اینجا (زیر ایمپورت‌ها) منتقل کن
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    // استفاده از window.location.origin ایمن‌تر است
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    await supabase.auth.signUp({ 
      email, 
      password, 
      options: { emailRedirectTo: `${origin}/auth/callback` } 
    });
    alert("Please check your email to confirm signup!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100 w-96">
        <div className="flex flex-col items-center mb-6">
           <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-emerald-600">2X</span>
           </div>
           <h2 className="text-2xl font-bold text-slate-800">Welcome to Vantage</h2>
        </div>
        
        <input 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full p-3 mb-4 bg-slate-50 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" 
          placeholder="Email" 
        />
        <input 
          onChange={(e) => setPassword(e.target.value)} 
          type="password" 
          className="w-full p-3 mb-6 bg-slate-50 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" 
          placeholder="Password" 
        />
        
        <button 
          onClick={handleSignUp} 
          className="w-full bg-emerald-600 text-white p-3 rounded-lg font-bold hover:bg-emerald-700 transition shadow-md shadow-emerald-100"
        >
          Sign Up / Login
        </button>
        
        <p className="mt-4 text-center text-xs text-slate-400">
          By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

"use client";
// بقیه کدها...
import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/auth/callback` } });
    alert("Please check your email to confirm signup!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100 w-96">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Welcome to Vantage</h2>
        <input onChange={(e) => setEmail(e.target.value)} className="w-full p-3 mb-4 bg-slate-50 rounded-lg" placeholder="Email" />
        <input onChange={(e) => setPassword(e.target.value)} type="password" className="w-full p-3 mb-6 bg-slate-50 rounded-lg" placeholder="Password" />
        <button onClick={handleSignUp} className="w-full bg-emerald-600 text-white p-3 rounded-lg font-bold">Sign Up / Login</button>
      </div>
    </div>
  );
}
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../utils/supabase/client';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[450px]">
        <div className="text-center mb-10">
          {/* بخش تایپوگرافی برند به جای لوگو */}
          <div className="mb-4 inline-block">
            <h1 className="text-5xl font-black tracking-tighter italic">
              <span className="text-emerald-600">2X</span>
              <span className="text-slate-900 ml-1">FOLLOWERS</span>
            </h1>
            <div className="h-1.5 w-12 bg-emerald-600 mx-auto mt-1 rounded-full"></div>
          </div>
          <p className="text-slate-500 mt-4 font-medium">Welcome back! Sign in to manage your growth.</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" required placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" required placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 group"
            >
              {loading ? "Verifying..." : "Sign In to Dashboard"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account yet? <br />
              <Link href="/signup" className="text-emerald-600 font-bold hover:underline inline-block mt-2">
                Create a free account today
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
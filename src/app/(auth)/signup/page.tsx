"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../utils/supabase/client';
import { User, Mail, Lock, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { 
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      } 
    });
    
    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      alert("Registration successful! Please check your email for confirmation.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[480px]">
        {/* بخش تایپوگرافی برند */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="mb-4 inline-block">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter italic">
              <span className="text-emerald-600">2X</span>
              <span className="text-slate-900 ml-1">FOLLOWERS</span>
            </h1>
            <div className="h-1.5 w-12 bg-emerald-600 mx-auto mt-1 rounded-full"></div>
          </div>
          <p className="text-slate-500 mt-2 font-medium text-sm sm:text-base px-4">
            Join the elite circle and scale your social presence.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center uppercase tracking-wide">Create Account</h2>
          
          <form onSubmit={handleSignup} className="space-y-4 sm:space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" required placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm sm:text-base"
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" required placeholder="john@example.com"
                  className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm sm:text-base"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" required placeholder="Minimum 6 characters"
                  className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm sm:text-base"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 group mt-6 text-sm sm:text-base"
            >
              {loading ? "Creating..." : "Start Growing Now"}
              <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
            </button>
          </form>

          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-500 text-xs sm:text-sm">
              Already a member? <br />
              <Link href="/login" className="text-emerald-600 font-bold hover:underline inline-block mt-2">
                Sign in to your dashboard
              </Link>
            </p>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-slate-400 mt-6 px-10">
          By joining, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
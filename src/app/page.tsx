"use client";
import Link from 'next/link';
import { ArrowRight, Zap, ShieldCheck, TrendingUp, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-emerald-100">
      
      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black italic tracking-tighter cursor-default">
            <span className="text-emerald-600">2X</span>
            <span className="text-slate-900 ml-1">FOLLOWERS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-bold text-slate-600">
            <Link href="/services" className="hover:text-emerald-600 transition-colors">Services</Link>
            <Link href="/login" className="hover:text-emerald-600 transition-colors">Login</Link>
            <Link href="/signup" className="bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-8 animate-bounce">
            <Zap size={16} /> #1 SMM Panel in Afghanistan & Global
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8">
            Scale Your Social <br />
            <span className="brand-shimmer italic">Influence 2X Faster</span>
          </h1>
          
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium">
            The premium destination for Instagram, TikTok, and YouTube growth. 
            Instant delivery, secure payments, and professional support.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-emerald-700 hover:scale-105 transition-all shadow-2xl shadow-emerald-200 flex items-center justify-center gap-2 group">
              Start Growing Now
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/services" className="w-full sm:w-auto bg-slate-50 text-slate-900 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all border border-slate-200">
              View Services
            </Link>
          </div>
        </div>
      </section>

      {/* --- Stats Section (برای اعتماد سازی) --- */}
      <section className="py-20 border-y border-slate-50 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Orders Completed', val: '500K+', icon: ShieldCheck },
            { label: 'Active Users', val: '10K+', icon: Users },
            { label: 'Average Growth', val: '200%', icon: TrendingUp },
            { label: 'Global Servers', val: '150+', icon: Zap },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="flex justify-center mb-4 text-emerald-500 group-hover:scale-110 transition-transform">
                <stat.icon size={32} />
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">{stat.val}</div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
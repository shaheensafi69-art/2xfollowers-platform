"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Wallet, ShoppingBag, Clock, Bell, ArrowRight, PlusCircle, 
  Loader2, Zap, Instagram, Music, Facebook, TrendingUp 
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ balance: 0, orders: 0, tasks: 0 });
  
  // اعداد نمایشی برای فالورهای زنده
  const [liveFollowers, setLiveFollowers] = useState({ insta: 12450, tiktok: 85200, fb: 5320 });

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
    const { count: ordersCount } = await supabase.from('smm_orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    const { count: pendingCount } = await supabase.from('smm_orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['pending', 'processing']);

    const { data: latestOrders } = await supabase
      .from('smm_orders')
      .select(`id, created_at, status, total_charge, smm_services (name)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    setStats({ balance: profile?.balance || 0, orders: ordersCount || 0, tasks: pendingCount || 0 });
    setRecentOrders(latestOrders || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    
    // انیمیشن ریل‌تایم برای اعداد فالورها (هر ۳ ثانیه یک عدد اضافه می‌شود)
    const interval = setInterval(() => {
      setLiveFollowers(prev => ({
        insta: prev.insta + Math.floor(Math.random() * 5),
        tiktok: prev.tiktok + Math.floor(Math.random() * 12),
        fb: prev.fb + Math.floor(Math.random() * 3),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Header با دکمه شارژ سریع */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">
            <span className="text-emerald-600">COMMAND</span> CENTER
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">Real-time Growth Monitoring</p>
        </div>
        <Link href="/dashboard/new-order" className="group bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-black hover:bg-emerald-600 transition-all flex items-center gap-3 shadow-2xl active:scale-95">
           <PlusCircle size={22} className="text-emerald-400 group-hover:text-white" /> NEW CAMPAIGN
        </Link>
      </div>

      {/* بخش گوشی‌های زنده (Live Network Growth) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Instagram Card */}
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-8 rounded-[3rem] text-white shadow-xl shadow-rose-200 relative overflow-hidden group">
          <Instagram className="absolute -right-4 -top-4 w-32 h-32 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <Instagram size={20} />
              </div>
              <span className="font-black text-xs uppercase tracking-widest">Instagram Live</span>
            </div>
            <div>
              <p className="text-4xl font-black tabular-nums">{liveFollowers.insta.toLocaleString()}</p>
              <p className="text-[10px] font-bold opacity-80 uppercase mt-1 tracking-widest flex items-center gap-1">
                <TrendingUp size={12} /> +24% growth this week
              </p>
            </div>
          </div>
        </div>

        {/* TikTok Card */}
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl shadow-slate-300 relative overflow-hidden group">
          <Music className="absolute -right-4 -top-4 w-32 h-32 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-cyan-400">
                <Music size={20} />
              </div>
              <span className="font-black text-xs uppercase tracking-widest text-slate-400">TikTok Engine</span>
            </div>
            <div>
              <p className="text-4xl font-black tabular-nums">{liveFollowers.tiktok.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-cyan-400 uppercase mt-1 tracking-widest flex items-center gap-1">
                <TrendingUp size={12} /> +112% viral velocity
              </p>
            </div>
          </div>
        </div>

        {/* Facebook Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[3rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
          <Facebook className="absolute -right-4 -top-4 w-32 h-32 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <Facebook size={20} />
              </div>
              <span className="font-black text-xs uppercase tracking-widest">Facebook Reach</span>
            </div>
            <div>
              <p className="text-4xl font-black tabular-nums">{liveFollowers.fb.toLocaleString()}</p>
              <p className="text-[10px] font-bold opacity-80 uppercase mt-1 tracking-widest flex items-center gap-1">
                <TrendingUp size={12} /> +8% stable reach
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats & Balance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Panel */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-emerald-200 transition-all">
          <div>
            <div className="flex justify-between items-start mb-8">
               <div className="bg-emerald-50 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-emerald-600 group-hover:rotate-12 transition-transform">
                 <Wallet size={32} />
               </div>
               <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Available</span>
            </div>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-1">Your Balance</p>
            <p className="text-5xl font-black text-slate-900 tracking-tighter">${stats.balance.toFixed(2)}</p>
          </div>
          <Link href="/dashboard/add-funds" className="mt-10 bg-slate-50 text-slate-900 py-4 rounded-2xl font-black text-center hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-widest text-xs">
            Add Funds +
          </Link>
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-xl text-slate-900 tracking-tight italic uppercase">Recent Activity</h3>
            <Link href="/dashboard/orders" className="text-emerald-600 font-black text-xs uppercase tracking-widest hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all">View History</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr><td className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-600" /></td></tr>
                ) : recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                          <Zap size={18} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm uppercase leading-none">{order.smm_services?.name || 'Service'}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1.5">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-900 text-lg tracking-tighter">
                      ${order.total_charge.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
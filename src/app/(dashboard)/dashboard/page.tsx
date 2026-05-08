"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Wallet, PlusCircle, Loader2, Zap, Instagram, Music, Facebook, 
  ShieldCheck, Globe, Coins, CreditCard, Lock
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ balance: 0, orders: 0, tasks: 0 });
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
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
            <span className="text-emerald-600">Command</span> Center
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">Safi International Fin-Ops</p>
        </div>
        <Link href="/dashboard/new-order" className="group bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-black hover:bg-emerald-600 transition-all flex items-center gap-3 shadow-2xl active:scale-95">
           <PlusCircle size={22} className="text-emerald-400 group-hover:text-white" /> NEW CAMPAIGN
        </Link>
      </div>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
          <Instagram className="absolute -right-4 -top-4 w-32 h-32 opacity-10 rotate-12" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center"><Instagram size={20} /></div>
              <span className="font-black text-xs uppercase tracking-widest">Instagram</span>
            </div>
            <p className="text-4xl font-black tabular-nums">{liveFollowers.insta.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
          <Music className="absolute -right-4 -top-4 w-32 h-32 opacity-10 rotate-12" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-cyan-400"><Music size={20} /></div>
              <span className="font-black text-xs uppercase tracking-widest text-slate-400">TikTok</span>
            </div>
            <p className="text-4xl font-black tabular-nums">{liveFollowers.tiktok.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
          <Facebook className="absolute -right-4 -top-4 w-32 h-32 opacity-10 rotate-12" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center"><Facebook size={20} /></div>
              <span className="font-black text-xs uppercase tracking-widest">Facebook</span>
            </div>
            <p className="text-4xl font-black tabular-nums">{liveFollowers.fb.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COMPLETELY DISABLED WALLET BOX */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full relative group transition-all cursor-not-allowed">
            
            {/* Disabled Content with Blur */}
            <div className="p-10 space-y-6 opacity-20 blur-[2px] pointer-events-none">
              <div className="flex justify-between items-start">
                 <div className="bg-slate-100 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-slate-400">
                   <Wallet size={32} />
                 </div>
                 <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">System Locked</span>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-1">Available Funds</p>
                <p className="text-5xl font-black text-slate-300 tracking-tighter italic">$0.00</p>
              </div>
              <div className="w-full bg-slate-100 text-slate-300 py-4 rounded-2xl font-black text-center uppercase tracking-widest text-xs">
                Deposit Locked
              </div>
              
              <div className="flex justify-around items-center pt-4">
                  <ShieldCheck size={24} />
                  <Globe size={24} />
                  <Coins size={24} />
                  <CreditCard size={24} />
              </div>
            </div>

            {/* FULL BOX POLICE TAPE OVERLAY */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-30">
                {/* Yellow Tape */}
                <div className="absolute bg-yellow-400 text-black font-black text-[10px] py-3 px-60 rotate-[-25deg] shadow-2xl border-y-2 border-black whitespace-nowrap flex items-center gap-6 z-20">
                  <span>🚧 WALLET UNDER MAINTENANCE</span>
                  <span>•</span>
                  <span>COMING SOON</span>
                  <span>•</span>
                  <span>DO NOT CROSS 🚧</span>
                </div>
                {/* Black Tape */}
                <div className="absolute bg-black text-yellow-400 font-black text-[10px] py-3 px-60 rotate-[25deg] shadow-2xl border-y-2 border-yellow-400 whitespace-nowrap flex items-center gap-6 z-10">
                  <span>SYSTEM UPGRADE</span>
                  <span>•</span>
                  <span>NO ACCESS</span>
                  <span>•</span>
                  <span>2X FOLLOWERS INFRASTRUCTURE</span>
                </div>
                
                {/* Central Lock Icon */}
                <div className="absolute bg-white p-4 rounded-full shadow-2xl z-40 border-4 border-yellow-400 animate-pulse">
                   <Lock className="text-slate-900" size={32} />
                </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-xl text-slate-900 tracking-tight italic uppercase">Recent Activity</h3>
            <Link href="/dashboard/orders" className="text-emerald-600 font-black text-xs uppercase tracking-widest hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all">All Orders</Link>
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
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors"><Zap size={18} /></div>
                        <div>
                          <p className="font-black text-slate-800 text-sm uppercase leading-none">{order.smm_services?.name || 'Service'}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1.5 italic">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-900 text-lg tracking-tighter">${order.total_charge.toFixed(2)}</td>
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
"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Wallet, ShoppingBag, Clock, Bell, ArrowRight, PlusCircle, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    balance: 0,
    orders: 0,
    tasks: 0,
    alerts: 0
  });

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // ۱. دریافت موجودی و اطلاعات پروفایل
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();
    
    // ۲. دریافت آمار کلی سفارشات
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    // ۳. دریافت سفارش‌های در جریان (Pending یا Processing)
    const { count: pendingCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing']);

    // ۴. دریافت ۵ سفارش اخیر برای نمایش در جدول
    const { data: latestOrders } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        total_charge,
        smm_services (name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    setStats({
      balance: profile?.balance || 0,
      orders: ordersCount || 0,
      tasks: pendingCount || 0,
      alerts: 0 // اینجا می‌توانید تعداد پیام‌های خوانده نشده را بشمارید
    });
    
    setRecentOrders(latestOrders || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // ریل‌تایم: گوش دادن به تغییرات پروفایل و سفارشات
    const channel = supabase.channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const statCards = [
    { label: 'Balance', value: `$${stats.balance.toFixed(2)}`, icon: Wallet, color: 'bg-emerald-500' },
    { label: 'Total Orders', value: stats.orders.toString(), icon: ShoppingBag, color: 'bg-blue-600' },
    { label: 'Pending Tasks', value: stats.tasks.toString(), icon: Clock, color: 'bg-amber-500' },
    { label: 'Notifications', value: stats.alerts.toString(), icon: Bell, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h2>
          <p className="text-slate-500 font-medium">Welcome back, Shaheen.</p>
        </div>
        <Link href="/dashboard/new-order" className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 active:scale-95">
           <PlusCircle size={20} /> New Order
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className={`${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
              <stat.icon size={26} />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{loading ? "..." : stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-xl text-slate-900">Recent Orders</h3>
            <Link href="/dashboard/orders" className="text-emerald-600 font-bold text-sm hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <th className="px-8 py-4">Service</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" /></td></tr>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-800 text-sm line-clamp-1">{order.smm_services?.name || 'Service'}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          order.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 
                          order.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-slate-900">${order.total_charge.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="py-12 text-center text-slate-400 font-medium">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Promotion Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden h-full flex flex-col justify-between shadow-2xl shadow-slate-200">
            <div className="relative z-10">
              <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-2xl font-black mb-3">2X Followers Services</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                Unlock premium features and global services with SafiPay and Safi TopUp.
              </p>
            </div>
            
            <Link href="/dashboard/services" className="relative z-10 bg-white text-slate-900 p-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-emerald-500 hover:text-white transition-all group mt-10">
               Explore Services <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Decorative background circle */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
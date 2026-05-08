"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function OrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      // دریافت سفارش‌ها و جوین کردن با جدول سرویس‌ها برای نمایش نام سرویس
      const { data, error } = await supabase
        .from('smm_orders')
        .select(`
          *,
          smm_services (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading orders:", error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  // تابع تعیین رنگ وضعیت سفارش
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold"><CheckCircle2 size={14}/> Success</span>;
      case 'failed':
        return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg text-xs font-bold"><XCircle size={14}/> Failed</span>;
      default:
        return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg text-xs font-bold"><Clock size={14}/> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Order History</h2>
        <p className="text-slate-500">Track all your previous and active orders.</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex justify-center items-center gap-2">
            <Loader2 className="animate-spin" /> Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">You haven't placed any orders yet.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-6 font-bold">Service</th>
                <th className="p-6 font-bold">Link</th>
                <th className="p-6 font-bold">Quantity</th>
                <th className="p-6 font-bold">Total</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6 font-bold text-slate-700">
                    {order.smm_services?.name || "Unknown Service"}
                  </td>
                  <td className="p-6 text-slate-500 truncate max-w-[150px]">{order.link}</td>
                  <td className="p-6 font-medium">{order.quantity}</td>
                  <td className="p-6 font-bold text-emerald-600">${order.total_charge.toFixed(2)}</td>
                  <td className="p-6">{getStatusBadge(order.status)}</td>
                  <td className="p-6 text-sm text-slate-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
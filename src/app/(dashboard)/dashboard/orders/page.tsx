"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export default function OrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    setLoading(true);
    
    // دریافت تمام سفارش‌ها بدون فیلتر کردن یوزر
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
      case 'success':
        return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold"><CheckCircle2 size={14}/> Completed</span>;
      case 'error':
      case 'failed':
        return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg text-xs font-bold"><XCircle size={14}/> Failed</span>;
      default:
        return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg text-xs font-bold"><Clock size={14}/> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-slate-900">
        <div>
          <h2 className="text-2xl font-black">All System Orders</h2>
          <p className="text-slate-500 italic">Showing every order recorded in the database.</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="p-2 hover:bg-slate-100 rounded-full transition-all active:scale-90"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex justify-center items-center gap-2 font-bold uppercase tracking-widest text-xs">
            <Loader2 className="animate-spin text-emerald-600" /> Refreshing Database...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium italic">The database is currently empty.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-[0.2em]">
                  <th className="p-6 font-black">Service</th>
                  <th className="p-6 font-black">Link</th>
                  <th className="p-6 font-black">Quantity</th>
                  <th className="p-6 font-black">Total Cost</th>
                  <th className="p-6 font-black">Status</th>
                  <th className="p-6 font-black">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6 font-bold text-slate-700 italic">
                      {order.smm_services?.name || "Global Service"}
                    </td>
                    <td className="p-6 text-slate-500 truncate max-w-[200px] text-xs font-medium">
                      <a href={order.link} target="_blank" className="hover:text-emerald-600 transition-colors">
                        {order.link}
                      </a>
                    </td>
                    <td className="p-6 font-black text-slate-900">{order.quantity}</td>
                    <td className="p-6 font-black text-emerald-600">
                      ${Number(order.total_cost || 0).toFixed(2)}
                    </td>
                    <td className="p-6">{getStatusBadge(order.status)}</td>
                    <td className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
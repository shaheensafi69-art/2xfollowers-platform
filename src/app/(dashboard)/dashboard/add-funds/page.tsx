"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Wallet, CreditCard, Globe, ShieldCheck, 
  Coins, ArrowRight, Loader2, CheckCircle2, TrendingUp 
} from 'lucide-react';

const GATEWAYS = [
  { id: 'hesabpay', name: 'HesabPay (AFG)', provider: 'Local Bank / AFN', icon: ShieldCheck, color: 'bg-emerald-600', text: 'text-emerald-600' },
  { id: 'stripe', name: 'Credit Card', provider: 'Stripe / USD', icon: CreditCard, color: 'bg-indigo-600', text: 'text-indigo-600' },
  { id: 'paypal', name: 'PayPal Account', provider: 'PayPal / USD', icon: Globe, color: 'bg-blue-500', text: 'text-blue-600', status: 'disabled' },
  { id: 'crypto', name: 'Cryptocurrency', provider: 'USDT (TRC20)', icon: Coins, color: 'bg-orange-500', text: 'text-orange-600', status: 'disabled' },
];

export default function AddFundsPage() {
  const supabase = createClient();
  const [amount, setAmount] = useState('');
  const [selectedGateway, setSelectedGateway] = useState('hesabpay');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [liveRate, setLiveRate] = useState(0);
  const [margin, setMargin] = useState(2); 
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // ۱. دریافت موجودی اولیه
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
        if (profile) setBalance(profile.balance);

        // ۲. دریافت تنظیمات سود از دیتابیس
        const { data: settings } = await supabase.from('system_settings').select('*');
        if (settings) {
            const m = settings.find(s => s.key === 'profit_margin_percent')?.value;
            if (m) setMargin(Number(m));
        }

        // ۳. دریافت نرخ لحظه‌ای جهانی
        try {
            const res = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await res.json();
            setLiveRate(data.rates.AFN);
        } catch (e) { console.error("Rate fetch failed"); }

        // ۴. فعال‌سازی ریل‌تایم برای آپدیت آنی موجودی
        const channel = supabase.channel('balance-updates')
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, 
          (payload) => {
            setBalance(payload.new.balance);
          })
          .subscribe();

        setFetchingData(false);
        return () => { supabase.removeChannel(channel); };
      }
    }
    init();
  }, []);

  // محاسبات نرخ
  const customerRate = liveRate * (1 + margin / 100);
  const usdExpected = selectedGateway === 'hesabpay' 
    ? (amount ? (Number(amount) / customerRate) : 0) 
    : Number(amount);

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("Please login first");
        return;
      }

      const response = await fetch(`/api/checkout/${selectedGateway}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          userId: user.id, // فرستادن آی‌دی کاربر برای شارژ درست حساب
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url; // ریدایرکت به صفحه پرداخت
      } else {
        console.error("Gateway Error:", data.error);
        alert("Gateway Error: " + (data.error || "Check console for details"));
      }
    } catch (err) {
      alert("Connection failed. Check your internet or API routes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700 px-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
          <span className="text-emerald-600">RECHARGE</span> WALLET
        </h2>
        <p className="text-slate-500 font-medium text-lg">Top up your balance via global or local gateways.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
            
            {/* Amount Input */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                1. Enter Amount in {selectedGateway === 'hesabpay' ? 'AFN' : 'USD'}
              </label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">
                    {selectedGateway === 'hesabpay' ? '؋' : '$'}
                </div>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-14 pr-6 py-6 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-emerald-500 transition-all outline-none text-3xl font-black text-slate-900 placeholder:text-slate-200"
                />
              </div>

              {selectedGateway === 'hesabpay' && liveRate > 0 && amount && (
                <div className="flex items-center gap-3 p-5 bg-emerald-50 rounded-[2rem] border border-emerald-100 animate-in zoom-in-95">
                    <TrendingUp className="text-emerald-600" size={24} />
                    <div>
                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Exchange Analysis</p>
                        <p className="text-sm font-bold text-emerald-700">
                            You get: <span className="text-xl font-black">${usdExpected.toFixed(2)} USD</span>
                        </p>
                        <p className="text-[10px] text-emerald-400 font-medium">Rate: 1$ = {customerRate.toFixed(2)} AFN (Global + Fee)</p>
                    </div>
                </div>
              )}
            </div>

            {/* Gateways */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">2. Select Payment Gateway</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {GATEWAYS.map((gt) => (
                  <button 
                    key={gt.id}
                    disabled={gt.status === 'disabled'}
                    onClick={() => setSelectedGateway(gt.id)}
                    className={`flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all text-left group ${
                      selectedGateway === gt.id 
                      ? 'border-emerald-500 bg-emerald-50/30' 
                      : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                    } ${gt.status === 'disabled' ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                  >
                    <div className={`${selectedGateway === gt.id ? gt.color : 'bg-white'} p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                      <gt.icon size={20} className={selectedGateway === gt.id ? 'text-white' : gt.text} />
                    </div>
                    <div>
                      <p className={`font-black text-xs uppercase tracking-tight ${selectedGateway === gt.id ? 'text-slate-900' : 'text-slate-500'}`}>{gt.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{gt.provider}</p>
                    </div>
                    {gt.status === 'disabled' && <span className="ml-auto text-[8px] font-black bg-slate-200 px-2 py-0.5 rounded-full text-slate-500 tracking-tighter uppercase">Soon</span>}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleDeposit}
              disabled={loading || !amount}
              className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Process Payment <ArrowRight size={20} /></>}
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 space-y-8">
              <div className="w-16 h-16 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                <Wallet size={32} />
              </div>
              <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Available Balance</p>
                  <h3 className="text-5xl font-black italic tracking-tighter text-white">
                    {fetchingData ? <span className="opacity-20 animate-pulse">...</span> : `$${balance.toFixed(2)}`}
                  </h3>
              </div>
              <div className="pt-8 border-t border-white/10 space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase text-emerald-500 tracking-widest">
                    <CheckCircle2 size={16} /> Instant Deposit Verified
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                    Your funds are protected by 256-bit encryption. Balance updates automatically after successful checkout.
                  </p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
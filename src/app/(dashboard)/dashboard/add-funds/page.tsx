"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Wallet, CreditCard, Globe, ShieldCheck, 
  Coins, ArrowRight, Loader2, CheckCircle2 
} from 'lucide-react';

const GATEWAYS = [
  { id: 'stripe', name: 'Debit/Credit Card', provider: 'Stripe', icon: CreditCard, color: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-600' },
  { id: 'paypal', name: 'PayPal Account', provider: 'PayPal', icon: Globe, color: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
  { id: 'hesabpay', name: 'Local Bank (AFG)', provider: 'HesabPay', icon: ShieldCheck, color: 'bg-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-600' },
  { id: 'crypto', name: 'Cryptocurrency', provider: 'USDT / BTC', icon: Coins, color: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' },
];

export default function AddFundsPage() {
  const supabase = createClient();
  const [amount, setAmount] = useState('');
  const [selectedGateway, setSelectedGateway] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [fetchingBalance, setFetchingBalance] = useState(true);

  // ۱. دریافت موجودی واقعی از دیتابیس
  useEffect(() => {
    async function getBalance() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .single();
        
        if (data) setBalance(data.balance);
      }
      setFetchingBalance(false);
    }
    getBalance();

    // گوش دادن به تغییرات ریل‌تایم موجودی
    const channel = supabase.channel('realtime-balance')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        setBalance(payload.new.balance);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleDeposit = () => {
    if (!amount || Number(amount) < 5) {
      alert("Minimum deposit is $5");
      return;
    }
    setLoading(true);
    
    // اینجا در آینده به API درگاه وصل می‌شوید
    // فعلاً شبیه‌سازی می‌کنیم
    setTimeout(() => {
      setLoading(false);
      alert(`Redirecting to ${selectedGateway} gateway for $${amount}...`);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
          <span className="text-emerald-600">ADD</span> FUNDS
        </h2>
        <p className="text-slate-500 font-medium text-lg">Top up your balance to start your campaigns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Deposit Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
            
            {/* Amount Input */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">1. Enter Amount (USD)</label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">$</div>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-6 py-6 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-emerald-500 transition-all outline-none text-3xl font-black text-slate-900 placeholder:text-slate-200"
                />
              </div>
              <div className="flex gap-2 px-2">
                {['10', '50', '100', '500'].map(val => (
                  <button 
                    key={val} 
                    onClick={() => setAmount(val)}
                    className="flex-1 py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl text-xs font-black text-slate-400 transition-all border border-slate-100"
                  >
                    +${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Gateway Selection */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">2. Select Gateway</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {GATEWAYS.map((gt) => (
                  <button 
                    key={gt.id}
                    onClick={() => setSelectedGateway(gt.id)}
                    className={`flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all text-left group ${
                      selectedGateway === gt.id 
                      ? 'border-emerald-500 bg-emerald-50/30' 
                      : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`${selectedGateway === gt.id ? gt.color : 'bg-white'} p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                      <gt.icon size={20} className={selectedGateway === gt.id ? 'text-white' : gt.text} />
                    </div>
                    <div>
                      <p className={`font-black text-xs uppercase tracking-tight ${selectedGateway === gt.id ? 'text-slate-900' : 'text-slate-500'}`}>{gt.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{gt.provider}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleDeposit}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Pay Securely <ArrowRight size={20} /></>}
            </button>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Secure Badge */}
          <div className="bg-emerald-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-emerald-200 relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={30} />
              </div>
              <h3 className="text-2xl font-black leading-tight uppercase italic">Secure <br/>Payments</h3>
              <ul className="space-y-4">
                {['Instant Balance Update', 'Encrypted Transactions', '24/7 Billing Support'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-emerald-100">
                    <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Wallet Preview - متصل به دیتابیس */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm text-center group hover:border-emerald-200 transition-all">
            <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 mx-auto mb-4 group-hover:rotate-12 transition-transform">
              <Wallet size={30} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Your Current Balance</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter italic">
              {fetchingBalance ? (
                <span className="opacity-20 animate-pulse">...</span>
              ) : (
                `$${balance.toFixed(2)}`
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
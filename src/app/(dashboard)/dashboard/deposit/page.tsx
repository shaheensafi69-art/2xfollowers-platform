"use client";
import { useState } from 'react';
import { CreditCard, Globe, Wallet, ShieldCheck, Loader2 } from 'lucide-react';

const GATEWAYS = [
  { id: 'stripe', name: 'Stripe / Card', icon: CreditCard, color: 'bg-indigo-600' },
  { id: 'paypal', name: 'PayPal', icon: Globe, color: 'bg-blue-500' },
  { id: 'hesabpay', name: 'HesabPay', icon: ShieldCheck, color: 'bg-emerald-600' },
  { id: 'crypto', name: 'Crypto (USDT)', icon: Wallet, color: 'bg-orange-500' },
];

export default function DepositPage() {
  const [amount, setAmount] = useState('');
  const [selectedGateway, setSelectedGateway] = useState('stripe');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) < 5) return alert("حداقل مبلغ واریز ۵ دلار است.");
    setLoading(true);

    try {
      // ارسال درخواست به بک‌اند برای ایجاد لینک پرداخت
      const res = await fetch('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({ amount, gateway: selectedGateway }),
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url; // هدایت کاربر به درگاه پرداخت
      }
    } catch (err) {
      alert("خطا در اتصال به درگاه.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-slate-900">Add Funds</h2>
        <p className="text-slate-500">کیف پول خود را به صورت آنی شارژ کنید.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* بخش فرم مبلغ */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <label className="block font-bold text-slate-700">Amount to Deposit (USD)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none text-2xl font-black"
            placeholder="0.00"
          />

          <label className="block font-bold text-slate-700">Select Gateway</label>
          <div className="grid grid-cols-1 gap-3">
            {GATEWAYS.map((gt) => (
              <button 
                key={gt.id}
                onClick={() => setSelectedGateway(gt.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  selectedGateway === gt.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-50 bg-white'
                }`}
              >
                <div className={`${gt.color} p-2 rounded-lg text-white`}><gt.icon size={20} /></div>
                <span className="font-bold text-slate-700">{gt.name}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Pay Now"}
          </button>
        </div>

        {/* بخش توضیحات */}
        <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-4 text-emerald-400">Payment Information</h3>
            <ul className="space-y-4 text-slate-300">
                <li className="flex gap-2">✅ شارژ آنی بلافاصله پس از پرداخت</li>
                <li className="flex gap-2">✅ امنیت کامل توسط درگاه‌های بین‌المللی</li>
                <li className="flex gap-2">✅ پشتیبانی از ارزهای دیجیتال و کارت بانکی</li>
            </ul>
        </div>
      </div>
    </div>
  );
}
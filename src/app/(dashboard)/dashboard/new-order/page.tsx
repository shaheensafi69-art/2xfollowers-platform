"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Instagram, Music, Video, Layers, BookOpen, MessageCircle, 
  Bot, Cpu, Zap, Twitter, ShieldCheck, Facebook, Youtube, 
  Monitor, FileText, Wallet, CreditCard, Globe, Coins, ChevronDown, ArrowRight
} from 'lucide-react';

const PLATFORM_UI: { [key: string]: { icon: any, color: string, bg: string } } = {
  'Instagram': { icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
  'TikTok': { icon: Music, color: 'text-slate-900', bg: 'bg-slate-100' },
  'CapCut': { icon: Video, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  'Adobe': { icon: Layers, color: 'text-red-700', bg: 'bg-red-50' },
  'Linkedin': { icon: BookOpen, color: 'text-blue-700', bg: 'bg-blue-50' },
  'Telegram': { icon: MessageCircle, color: 'text-sky-500', bg: 'bg-sky-50' },
  'ChatGPT': { icon: Bot, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'Claude': { icon: Bot, color: 'text-orange-500', bg: 'bg-orange-50' },
  'Grok': { icon: Cpu, color: 'text-gray-800', bg: 'bg-gray-100' },
  'Gemini': { icon: Bot, color: 'text-blue-400', bg: 'bg-blue-50' },
  'Perplexity': { icon: Zap, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  'Twitter': { icon: Twitter, color: 'text-sky-400', bg: 'bg-sky-50' },
  'Whatsapp': { icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-50' },
  'Midjourney': { icon: Video, color: 'text-purple-600', bg: 'bg-purple-50' },
  'NordVPN': { icon: ShieldCheck, color: 'text-red-500', bg: 'bg-red-50' },
  'HMA': { icon: ShieldCheck, color: 'text-red-600', bg: 'bg-red-50' },
  'ExpressVPN': { icon: ShieldCheck, color: 'text-red-500', bg: 'bg-red-50' },
  'Facebook': { icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
  'YouTube': { icon: Youtube, color: 'text-red-600', bg: 'bg-red-50' },
  'ElevenLabs': { icon: Music, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  'Surfshark': { icon: ShieldCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
  'HBO': { icon: Monitor, color: 'text-purple-500', bg: 'bg-purple-50' },
  'Udemy': { icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50' },
  'Grammarly': { icon: FileText, color: 'text-green-500', bg: 'bg-green-50' },
  'QuillBot': { icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  'Windows': { icon: Monitor, color: 'text-blue-500', bg: 'bg-blue-50' },
  'Microsoft': { icon: Monitor, color: 'text-blue-600', bg: 'bg-blue-50' }
};

const CATEGORY_MAP = Object.keys(PLATFORM_UI);

const PAYMENT_GATEWAYS = [
  { id: 'crypto', name: 'Crypto USDT', icon: Coins, color: 'bg-orange-500', status: 'disabled' },
  { id: 'stripe', name: 'Stripe Card', icon: CreditCard, color: 'bg-indigo-600', status: 'active' },
  { id: 'paypal', name: 'PayPal Account', icon: Globe, color: 'bg-blue-500', status: 'disabled' },
  { id: 'hesabpay', name: 'HesabPay', icon: ShieldCheck, color: 'bg-emerald-600', status: 'active' },
  { id: 'balance', name: 'Wallet Balance', icon: Wallet, color: 'bg-slate-800', status: 'active' },
];

export default function NewOrderPage() {
  const supabase = createClient();
  const [allServices, setAllServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [link, setLink] = useState('');
  const [showGateways, setShowGateways] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
        if (profile) setUserBalance(profile.balance);
        const { data: services } = await supabase.from('smm_services').select('*');
        setAllServices(services || []);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const isFixedProduct = selectedService && 
    (selectedService.name.toLowerCase().includes("month") || 
     selectedService.name.toLowerCase().includes("year") || 
     selectedService.name.toLowerCase().includes("pro"));

  const calculateTotal = () => {
    if (!selectedService) return 0;
    return isFixedProduct ? selectedService.price : (selectedService.price * quantity / 1000);
  };

  const handlePayment = async (gatewayId: string, status: string) => {
    // ۱. چک کردن وضعیت درگاه
    if (status === 'disabled') {
      alert("Coming Soon! This payment method is currently being integrated.");
      return;
    }

    const total = calculateTotal();
    if (!selectedService || total <= 0 || !link) {
      alert("Please complete the order details (Service & Link) first.");
      return;
    }

    setIsSubmitting(true);

    try {
      // ۲. اگر پرداخت با ولت (Balance) است
      if (gatewayId === 'balance') {
        if (userBalance < total) {
          alert("Insufficient Balance! Please top up your wallet.");
          setIsSubmitting(false);
          return;
        }
        // اینجا کد کسر از دیتابیس در آینده قرار می‌گیرد
        alert(`Success! $${total.toFixed(2)} deducted from your wallet.`);
        setIsSubmitting(false);
        return;
      }

      // ۳. هدایت به درگاه‌های خارجی (Stripe / HesabPay)
      const response = await fetch(`/api/checkout/${gatewayId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          serviceName: selectedService.name,
          serviceId: selectedService.id,
          link: link,
          quantity: quantity
        }),
      });

      const data = await response.json();

      if (data.url) {
        // هدایت کاربر به صفحه پرداخت بانکی
        window.location.href = data.url;
      } else {
        alert("Payment Error: " + (data.error || "Could not generate payment link"));
      }

    } catch (err: any) {
      console.error("Payment Process Error:", err);
      alert("System Error: Connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
          <span className="text-emerald-600">NEW</span> ORDER
        </h2>
        <p className="text-slate-500 font-medium px-1 text-lg">Instant growth across 27+ platforms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 bg-white p-6 sm:p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
          
          {/* Step 1: Platform Dropdown */}
          <div className="space-y-3 relative">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">1. Select Platform</label>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-emerald-200 transition-all flex items-center justify-between group">
              {selectedCategory ? (
                <div className="flex items-center gap-3">
                  <div className={`${PLATFORM_UI[selectedCategory].bg} p-2 rounded-xl`}>
                    {(() => { const Icon = PLATFORM_UI[selectedCategory].icon; return <Icon className={PLATFORM_UI[selectedCategory].color} size={20} />; })()}
                  </div>
                  <span className="font-black text-slate-800">{selectedCategory}</span>
                </div>
              ) : <span className="font-bold text-slate-400 italic">Choose a platform...</span>}
              <ChevronDown className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-[100] max-h-[350px] overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in zoom-in-95">
                {CATEGORY_MAP.map((cat) => {
                  const ui = PLATFORM_UI[cat];
                  return (
                    <button key={cat} onClick={() => { 
                      setSelectedCategory(cat); 
                      setIsDropdownOpen(false); 
                      setFilteredServices(allServices.filter(s => s.name.toLowerCase().includes(cat.toLowerCase())));
                      setSelectedService(null);
                    }} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 text-left transition-colors">
                      <div className={`${ui.bg} p-2.5 rounded-xl`}><ui.icon className={ui.color} size={18} /></div>
                      <span className="font-bold text-sm text-slate-700">{cat}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Service Selector */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">2. Service Type</label>
            <select disabled={!selectedCategory} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-slate-700 disabled:opacity-30" value={selectedService?.id || ""} onChange={(e) => setSelectedService(filteredServices.find(s => String(s.id) === String(e.target.value)))}>
              <option value="">Choose a package...</option>
              {filteredServices.map((s) => <option key={s.id} value={s.id}>{s.name} - ${s.price}</option>)}
            </select>
          </div>

          {/* Step 3: Link */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">3. Destination Link</label>
            <div className="relative">
              <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input type="text" value={link} onChange={(e) => setLink(e.target.value)} className="w-full pl-14 pr-5 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold" placeholder="Paste link here..." />
            </div>
          </div>

          {/* Step 4: Quantity */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">4. Quantity</label>
            <input type="number" value={quantity} disabled={isFixedProduct} className={`w-full p-5 rounded-2xl border-2 border-transparent outline-none font-black text-xl ${isFixedProduct ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 focus:border-emerald-500'}`} onChange={(e) => setQuantity(Number(e.target.value))} />
          </div>

          {/* Payment Section */}
          {!showGateways ? (
            <button onClick={() => (selectedService && link) ? setShowGateways(true) : alert("Please complete the form.")} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all flex justify-center items-center gap-3 shadow-xl active:scale-95">
              Select Payment <ArrowRight size={20} />
            </button>
          ) : (
            <div className="pt-4 space-y-6 animate-in slide-in-from-bottom-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PAYMENT_GATEWAYS.map((gt) => (
                  <button key={gt.id} onClick={() => handlePayment(gt.id, gt.status)} className={`relative flex flex-col items-center justify-center p-5 rounded-[2rem] border-2 transition-all group ${gt.status === 'disabled' ? 'opacity-40 grayscale border-slate-50 cursor-not-allowed' : 'border-slate-100 hover:border-emerald-500 hover:bg-emerald-50'}`}>
                    <div className={`${gt.color} p-3.5 rounded-2xl text-white mb-2 shadow-lg group-hover:scale-110 transition-transform`}><gt.icon size={22} /></div>
                    <span className="font-black text-[8px] uppercase tracking-widest text-slate-700 text-center">{gt.name}</span>
                    {gt.status === 'disabled' && <span className="absolute top-2 right-2 text-[6px] font-black text-white bg-red-500 px-2 py-0.5 rounded-full uppercase italic">Soon</span>}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowGateways(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-900 text-center">← Edit Order</button>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl sticky top-28 border border-white/5 overflow-hidden">
            <div className="mb-8 p-5 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-500"><Wallet size={20} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Balance</span>
              </div>
              <span className="text-xl font-black text-emerald-400">${userBalance.toFixed(2)}</span>
            </div>

            {selectedService ? (
              <div className="space-y-8 relative z-10">
                <h3 className="text-2xl font-black italic uppercase text-emerald-500 tracking-tighter leading-none border-b border-white/10 pb-6">{selectedService.name}</h3>
                <div className="space-y-5">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                    <span>Rate</span>
                    <span className="text-white">${selectedService.price}</span>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Total Amount</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black tracking-tighter italic text-emerald-500">${calculateTotal().toFixed(2)}</span>
                      <span className="text-xs font-bold text-slate-600 uppercase">USD</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 opacity-30"><Zap size={48} className="mx-auto mb-4 animate-pulse" /><p className="font-black uppercase italic tracking-[0.2em] text-sm">Waiting Selection</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
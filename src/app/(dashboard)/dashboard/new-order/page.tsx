"use client";
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Loader2, Tag, Box, CreditCard, Globe, Wallet, ShieldCheck, 
  ArrowRight, Instagram, Music, Video, Layers, BookOpen, 
  MessageCircle, Bot, Cpu, Zap, Twitter, Monitor, ChevronDown,
  Youtube, Facebook
} from 'lucide-react';

// تنظیمات آیکون و رنگ برای هر پلتفرم
// اصلاح شده: نام آیکون‌ها باید دقیقاً با حروف بزرگ شروع شوند
const PLATFORM_UI: { [key: string]: { icon: any, color: string, bg: string } } = {
  'Instagram': { icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
  'TikTok': { icon: Music, color: 'text-slate-900', bg: 'bg-slate-100' },
  'YouTube': { icon: Youtube, color: 'text-red-600', bg: 'bg-red-50' }, // اصلاح شد
  'FaceBook': { icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' }, // اصلاح شد
  'Telegram': { icon: MessageCircle, color: 'text-sky-500', bg: 'bg-sky-50' },
  'ChatGPT': { icon: Bot, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'Twitter': { icon: Twitter, color: 'text-sky-400', bg: 'bg-sky-50' },
  'Whatsapp': { icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-50' },
  'NordVPN': { icon: ShieldCheck, color: 'text-red-500', bg: 'bg-red-50' },
  'ExpressVPN': { icon: ShieldCheck, color: 'text-red-500', bg: 'bg-red-50' },
  'Surfshark VPN': { icon: ShieldCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
  'Midjourney': { icon: Video, color: 'text-purple-600', bg: 'bg-purple-50' },
  'CapCut': { icon: Video, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  'Adobe Creative': { icon: Layers, color: 'text-red-700', bg: 'bg-red-50' },
  'Netflix': { icon: Monitor, color: 'text-red-600', bg: 'bg-red-50' },
  'HBO MAX': { icon: Monitor, color: 'text-purple-500', bg: 'bg-purple-50' },
  'Windows': { icon: Monitor, color: 'text-blue-500', bg: 'bg-blue-50' },
  'Microsoft': { icon: Monitor, color: 'text-blue-600', bg: 'bg-blue-50' },
  'Gemini': { icon: Bot, color: 'text-blue-400', bg: 'bg-blue-50' },
  'Claude AI': { icon: Bot, color: 'text-orange-500', bg: 'bg-orange-50' },
};

// این مپینگ کمک می‌کند که اگر اسم در دیتابیس کمی متفاوت بود، باز هم آیکون درست را پیدا کند
const CATEGORY_MAP: { [key: string]: string } = {
  "TikTok": "TikTok", 
  "CapCut": "CapCut", 
  "Adobe Creative": "Adobe",
  "Linkedin": "Linkedin", 
  "Telegram": "Telegram", 
  "ChatGPT": "ChatGPT",
  "Claude AI": "Claude", 
  "Grok Ai": "Grok", 
  "Gemini": "Gemini",
  "Perplexity": "Perplexity", 
  "Twitter": "Twitter", 
  "Whatsapp": "Whatsapp",
  "Midjourney": "Midjourney", 
  "NordVPN": "NordVPN", 
  "HMA": "HMA",
  "ExpressVPN": "ExpressVPN", 
  "FaceBook": "Facebook", // اصلاح شد
  "Instagram": "Instagram",
  "YouTube": "YouTube", // اصلاح شد
  "ElevenLabs AI": "ElevenLabs", 
  "Surfshark VPN": "Surfshark",
  "HBO MAX": "HBO", 
  "Udemy": "Udemy", 
  "Grammarly": "Grammarly",
  "QuillBot": "QuillBot", 
  "Windows": "Windows", 
  "Microsoft": "Microsoft"
};

const PAYMENT_GATEWAYS = [
  { id: 'stripe', name: 'Stripe', icon: CreditCard, color: 'bg-indigo-600' },
  { id: 'paypal', name: 'PayPal', icon: Globe, color: 'bg-blue-500' },
  { id: 'hesabpay', name: 'HesabPay', icon: ShieldCheck, color: 'bg-emerald-600' },
  { id: 'crypto', name: 'Crypto USDT', icon: Wallet, color: 'bg-orange-500' },
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

  const isFixedProduct = selectedService && 
    (selectedService.name.toLowerCase().includes("month") || 
     selectedService.name.toLowerCase().includes("year") || 
     selectedService.name.toLowerCase().includes("personal") ||
     selectedService.name.toLowerCase().includes("subscription") ||
     selectedService.name.toLowerCase().includes("pro") ||
     selectedService.name.toLowerCase().includes("valid"));

  useEffect(() => {
    async function fetchAllServices() {
      setLoading(true);
      const { data } = await supabase.from('smm_services').select('*');
      setAllServices(data || []);
      setLoading(false);
    }
    fetchAllServices();
  }, []);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setIsDropdownOpen(false);
    setSelectedService(null);
    const keyword = CATEGORY_MAP[cat] || cat;
    const filtered = allServices.filter(s => s.name.toLowerCase().includes(keyword.toLowerCase()));
    setFilteredServices(filtered);
  };

  const calculateTotal = () => {
    if (!selectedService) return 0;
    return isFixedProduct ? selectedService.price : (selectedService.price * quantity / 1000);
  };

  const handleGatewayPayment = async (gatewayId: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      alert(`Redirecting to ${gatewayId} payment gateway...`);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 px-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
          <span className="text-emerald-600">NEW</span> ORDER
        </h2>
        <p className="text-slate-500 font-medium px-1 text-lg">Boost your presence across 27+ platforms instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Form Section */}
        <div className="lg:col-span-3 bg-white p-6 sm:p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
          
          {/* Custom Category Dropdown */}
          <div className="space-y-3 relative">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">1. Select Platform</label>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-emerald-200 transition-all flex items-center justify-between group"
            >
              {selectedCategory ? (
                <div className="flex items-center gap-3">
                  <div className={`${PLATFORM_UI[selectedCategory]?.bg || 'bg-emerald-50'} p-2 rounded-xl`}>
                    {(() => {
                      const Icon = PLATFORM_UI[selectedCategory]?.icon || Zap;
                      return <Icon className={PLATFORM_UI[selectedCategory]?.color || 'text-emerald-600'} size={20} />;
                    })()}
                  </div>
                  <span className="font-black text-slate-800">{selectedCategory}</span>
                </div>
              ) : (
                <span className="font-bold text-slate-400 italic">Choose a platform...</span>
              )}
              <ChevronDown className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-[100] max-h-[400px] overflow-y-auto no-scrollbar p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in zoom-in-95 duration-200">
                {Object.keys(CATEGORY_MAP).map((cat) => {
                  const ui = PLATFORM_UI[cat] || { icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50' };
                  return (
                    <button 
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className={`${ui.bg} p-2.5 rounded-xl`}>
                        <ui.icon className={ui.color} size={18} />
                      </div>
                      <span className="font-bold text-sm text-slate-700">{cat}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Service Selector */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">2. Select Service Type</label>
            <select 
              disabled={!selectedCategory}
              className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              value={selectedService?.id || ""}
              onChange={(e) => setSelectedService(filteredServices.find(s => String(s.id) === String(e.target.value)))}
            >
              <option value="">Choose a service...</option>
              {filteredServices.map((s) => (<option key={s.id} value={s.id}>{s.name} - ${s.price}</option>))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">3. Target URL / Link</label>
            <div className="relative">
              <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text" 
                value={link} 
                onChange={(e) => setLink(e.target.value)} 
                className="w-full pl-14 pr-5 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 transition-all outline-none font-bold placeholder:font-medium" 
                placeholder="https://..." 
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
               4. Quantity {isFixedProduct && <span className="text-emerald-600 italic">(Subscription)</span>}
            </label>
            <input 
              type="number" 
              value={quantity} 
              disabled={isFixedProduct}
              className={`w-full p-5 rounded-2xl border-2 border-transparent outline-none font-black text-xl ${isFixedProduct ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 focus:border-emerald-500'}`} 
              onChange={(e) => setQuantity(Number(e.target.value))} 
            />
          </div>

          {!showGateways ? (
            <button 
              onClick={() => (selectedService && link && quantity > 0) ? setShowGateways(true) : alert("Please complete the form")}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all flex justify-center items-center gap-3 shadow-xl active:scale-95"
            >
              Confirm & Continue <ArrowRight size={20} />
            </button>
          ) : (
            <div className="pt-4 animate-in slide-in-from-bottom-6 duration-500 space-y-6">
              <div className="text-center">
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-widest">Select Payment Method</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {PAYMENT_GATEWAYS.map((gt) => (
                  <button 
                    key={gt.id}
                    onClick={() => handleGatewayPayment(gt.id)}
                    className="flex flex-col items-center justify-center p-6 rounded-[2.5rem] border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                  >
                    <div className={`${gt.color} p-4 rounded-[1.25rem] text-white mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                      <gt.icon size={26} />
                    </div>
                    <span className="font-black text-[10px] text-slate-600 uppercase tracking-widest">{gt.name}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowGateways(false)} className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors">← Edit Order Info</button>
            </div>
          )}
        </div>

        {/* Live Preview Sidebar */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-[3rem] shadow-2xl sticky top-28 border border-white/5">
             {selectedCategory ? (
                <div className="space-y-10">
                  <div className="flex items-center gap-5">
                    <div className={`w-20 h-20 ${PLATFORM_UI[selectedCategory]?.bg || 'bg-emerald-500'} rounded-[1.8rem] flex items-center justify-center shadow-2xl`}>
                      {(() => {
                        const Icon = PLATFORM_UI[selectedCategory]?.icon || Tag;
                        return <Icon className={PLATFORM_UI[selectedCategory]?.color || 'text-white'} size={40} />;
                      })()}
                    </div>
                    <div>
                      <h3 className="text-3xl font-black leading-none italic uppercase tracking-tighter">{selectedCategory}</h3>
                      <div className="flex items-center gap-2 mt-3">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                         <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Live Summary</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-10 border-t border-slate-800">
                    <div className="space-y-2">
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Service Selected</p>
                      <p className="font-bold text-lg leading-tight uppercase italic">{selectedService ? selectedService.name : "..."}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Unit Rate</p>
                        <p className="text-2xl font-black mt-1 tracking-tighter">${selectedService?.price || "0"}</p>
                      </div>
                      <div className="bg-emerald-500/10 p-5 rounded-3xl border border-emerald-500/20">
                        <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest">Est. Total</p>
                        <p className="text-2xl font-black text-emerald-500 mt-1 tracking-tighter">${calculateTotal().toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-center shadow-xl shadow-emerald-900/20">
                    <p className="text-emerald-200 text-[10px] font-black uppercase tracking-widest mb-2">Final Checkout Amount</p>
                    <p className="text-5xl font-black tracking-tighter italic">${calculateTotal().toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="h-[450px] flex flex-col items-center justify-center text-slate-600 space-y-6 text-center">
                  <div className="w-24 h-24 bg-slate-800 rounded-[2rem] flex items-center justify-center animate-bounce">
                    <Zap size={40} className="text-slate-700" />
                  </div>
                  <div className="px-6">
                    <p className="font-black text-xl text-slate-300 uppercase italic">Waiting for Input</p>
                    <p className="text-sm font-medium mt-2 leading-relaxed opacity-50">Select a category and service to generate your order invoice.</p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
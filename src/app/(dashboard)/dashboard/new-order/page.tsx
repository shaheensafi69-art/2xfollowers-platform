"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Tag, Box, CreditCard, Globe, Wallet, ShieldCheck, ArrowRight } from 'lucide-react';

const CATEGORY_MAP: { [key: string]: string } = {
  "TikTok": "TikTok", "CapCut": "CapCut", "Adobe Creative": "Adobe",
  "Linkedin": "Linkedin", "Telegram": "Telegram", "ChatGPT": "ChatGPT",
  "Claude AI": "Claude", "Grok Ai": "Grok", "Gemini": "Gemini",
  "Perplexity": "Perplexity", "Twitter": "Twitter", "Whatsapp": "Whatsapp",
  "Midjourney": "Midjourney", "NordVPN": "NordVPN", "HMA": "HMA",
  "ExpressVPN": "ExpressVPN", "FaceBook": "Facebook", "Instagram": "Instagram",
  "YouTube": "YouTube", "ElevenLabs AI": "ElevenLabs", "Surfshark VPN": "Surfshark",
  "HBO MAX": "HBO", "Udemy": "Udemy", "Grammarly": "Grammarly",
  "QuillBot": "QuillBot", "Windows": "Windows", "Microsoft": "Microsoft"
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

  useEffect(() => {
    setQuantity(isFixedProduct ? 1 : 0);
    setShowGateways(false);
  }, [selectedService, isFixedProduct]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
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
    // اینجا کلیدها و منطق API هر درگاه وصل می‌شود
    console.log(`Connecting to ${gatewayId} for $${calculateTotal()}`);
    
    // شبیه‌سازی پرداخت و ثبت سفارش
    setTimeout(() => {
      alert(`Redirecting to ${gatewayId} payment gateway...`);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <h2 className="text-4xl font-black text-slate-900 tracking-tight">Place New Order</h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-3 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-400 uppercase tracking-widest">1. Select Platform</label>
            <select className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 transition-all outline-none font-bold text-slate-700" value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)}>
              <option value="">Choose a category...</option>
              {Object.keys(CATEGORY_MAP).map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-400 uppercase tracking-widest">2. Select Service</label>
            <select 
              disabled={!selectedCategory}
              className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 disabled:opacity-50"
              value={selectedService?.id || ""}
              onChange={(e) => setSelectedService(filteredServices.find(s => String(s.id) === String(e.target.value)))}
            >
              <option value="">Choose a service...</option>
              {filteredServices.map((s) => (<option key={s.id} value={s.id}>{s.name} - ${s.price}</option>))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-400 uppercase tracking-widest">3. Order Details</label>
            <input type="text" value={link} onChange={(e) => setLink(e.target.value)} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 transition-all outline-none font-bold" placeholder="Enter link or username..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-400 uppercase tracking-widest">
               4. Quantity {isFixedProduct && <span className="text-emerald-600">(Fixed Subscription)</span>}
            </label>
            <input 
              type="number" 
              value={quantity} 
              disabled={isFixedProduct}
              className={`w-full p-5 rounded-2xl border-2 border-transparent outline-none font-bold ${isFixedProduct ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 focus:border-emerald-500'}`} 
              onChange={(e) => setQuantity(Number(e.target.value))} 
            />
          </div>

          {!showGateways ? (
            <button 
              onClick={() => (selectedService && link && quantity > 0) ? setShowGateways(true) : alert("Please fill all fields")}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition-all flex justify-center items-center gap-3 shadow-xl shadow-slate-200"
            >
              Continue to Payment <ArrowRight size={20} />
            </button>
          ) : (
            <div className="pt-4 animate-in slide-in-from-bottom-4 duration-500">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest block mb-4 text-center text-emerald-600">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-4">
                {PAYMENT_GATEWAYS.map((gt) => (
                  <button 
                    key={gt.id}
                    onClick={() => handleGatewayPayment(gt.id)}
                    disabled={isSubmitting}
                    className="flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                  >
                    <div className={`${gt.color} p-3 rounded-2xl text-white mb-3 group-hover:scale-110 transition-transform`}>
                      <gt.icon size={24} />
                    </div>
                    <span className="font-black text-xs text-slate-700 uppercase tracking-wider">{gt.name}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowGateways(false)} className="w-full mt-6 text-slate-400 font-bold text-sm hover:text-slate-600">Back to edit order</button>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl sticky top-8">
             {selectedCategory ? (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Tag size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black leading-none">{selectedCategory}</h3>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">Premium Service</p>
                    </div>
                  </div>

                  <div className="space-y-6 pt-8 border-t border-slate-800">
                    <div>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Service Name</p>
                      <p className="font-bold text-lg leading-snug">{selectedService ? selectedService.name : "..."}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Rate</p>
                        <p className="text-xl font-black mt-1">${selectedService?.price || "0"}</p>
                      </div>
                      <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                        <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest">Final Total</p>
                        <p className="text-xl font-black text-emerald-500 mt-1">${calculateTotal().toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-[2rem] text-center">
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Total to Pay</p>
                    <p className="text-4xl font-black">${calculateTotal().toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-slate-600 space-y-6">
                  <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
                    <Box size={40} />
                  </div>
                  <p className="font-black text-center text-lg px-10">Configure your order to see the live preview.</p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
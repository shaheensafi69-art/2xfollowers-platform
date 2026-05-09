"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Instagram, Facebook, Youtube, Twitter, Music, MessageCircle, Bot, 
  Video, ShieldCheck, BookOpen, FileText, Monitor, Layers, Cpu, Zap, 
  LayoutGrid, Loader2, ArrowUpRight 
} from 'lucide-react';

const PLATFORM_CONFIG: { [key: string]: { icon: any, color: string, bg: string } } = {
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
  'Microsoft': { icon: Monitor, color: 'text-blue-600', bg: 'bg-blue-50' },
};

export default function ServicesPage() {
  const supabase = createClient();
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      // خواندن مستقیم قیمت‌ها از دیتابیس (بدون دستکاری در کوئری برای حفظ دقت)
      const { data } = await supabase.from('smm_services').select('*').order('price', { ascending: true });
      setServices(data || []);
      setFilteredServices(data || []);
      setLoading(false);
    }
    fetchServices();
  }, [supabase]);

  const filterServices = (platform: string) => {
    setActiveTab(platform);
    if (platform === 'All') {
      setFilteredServices(services);
    } else {
      setFilteredServices(services.filter(s => s.name.toLowerCase().includes(platform.toLowerCase())));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
          <span className="text-emerald-600">2X</span> Premium Services
        </h2>
        <p className="text-slate-500 font-medium text-lg px-1">
          High-performance growth solutions. Prices displayed for <span className="text-slate-900 font-bold underline">10,000 units</span>.
        </p>
      </div>

      {/* Tabs Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <button 
          onClick={() => filterServices('All')}
          className={`flex flex-col items-center justify-center p-6 gap-3 transition-all ${
            activeTab === 'All' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <LayoutGrid size={24} />
          <span className="font-black text-[10px] uppercase tracking-widest text-center">All Services</span>
        </button>

        {Object.keys(PLATFORM_CONFIG).map((platform) => {
          const { icon: Icon, color, bg } = PLATFORM_CONFIG[platform];
          const isActive = activeTab === platform;
          return (
            <button 
              key={platform}
              onClick={() => filterServices(platform)}
              className={`flex flex-col items-center justify-center p-5 gap-3 transition-all ${
                isActive ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${isActive ? 'bg-white/20' : bg}`}>
                <Icon size={22} className={isActive ? 'text-white' : color} />
              </div>
              <span className="font-black text-[10px] uppercase tracking-widest text-center">{platform}</span>
            </button>
          );
        })}
      </div>

      {/* Services List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-slate-400 text-xs uppercase tracking-[0.3em]">Service Selection</h3>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 uppercase">
            {filteredServices.length} active offers
          </span>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
            <p className="text-slate-400 font-black tracking-widest uppercase text-xs">Fetching latest market rates...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredServices.map((s) => {
              const platformKey = Object.keys(PLATFORM_CONFIG).find(key => s.name.toLowerCase().includes(key.toLowerCase()));
              const PlatformIcon = platformKey ? PLATFORM_CONFIG[platformKey].icon : Zap;
              const platformColor = platformKey ? PLATFORM_CONFIG[platformKey].color : 'text-emerald-600';
              const platformBg = platformKey ? PLATFORM_CONFIG[platformKey].bg : 'bg-emerald-50';

              const isQuantityService = 
                s.name.toLowerCase().includes('follower') || 
                s.name.toLowerCase().includes('like') || 
                s.name.toLowerCase().includes('view') || 
                s.name.toLowerCase().includes('subscriber') ||
                s.name.toLowerCase().includes('member');

              // --- منطق برآورد در فرانت‌اند ---
              // اگر قیمت دیتابیس برای ۱۰۰۰ عدد باشد، برای نمایش ۱۰ هزار تایی ضرب در ۱۰ می‌کنیم
              const priceFromDB = Number(s.price);
              const estimatedPrice = isQuantityService ? (priceFromDB * 10).toFixed(2) : priceFromDB.toFixed(2);

              return (
                <div 
                  key={s.id} 
                  className="group bg-white p-5 sm:p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-50 hover:border-emerald-200 transition-all duration-500 flex flex-col sm:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-6 w-full">
                    <div className={`flex w-16 h-16 ${platformBg} rounded-[1.5rem] items-center justify-center ${platformColor} group-hover:scale-110 transition-transform duration-500`}>
                      <PlatformIcon size={28} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-black text-slate-800 group-hover:text-emerald-700 transition-colors uppercase italic tracking-tight leading-tight">
                        {s.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">AI-Verified Quality</span>
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">Instant Processing</span>
                        {isQuantityService && (
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">Bulk 10K Package</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-10 w-full sm:w-auto border-t sm:border-t-0 pt-5 sm:pt-0">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">
                        {isQuantityService ? 'Estimate for 10,000' : 'Price'}
                      </span>
                      <div className="flex items-baseline gap-1">
                         <span className="text-3xl font-black text-slate-900 tracking-tighter">${estimatedPrice}</span>
                         {isQuantityService && <span className="text-sm font-bold text-slate-400">/10k</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push(`/dashboard/new-order?serviceId=${s.id}&qty=10000`)}
                      className="flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-xl active:scale-95 group/btn"
                    >
                      ORDER NOW
                      <ArrowUpRight size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Instagram, Facebook, Youtube, Twitter, Music, MessageCircle, Bot, 
  Video, ShieldCheck, BookOpen, FileText, Monitor, ShoppingCart, 
  Gamepad2, Layers, Cpu, Zap, CreditCard, LayoutGrid, Loader2, ArrowUpRight
} from 'lucide-react';

const PLATFORM_CONFIG: { [key: string]: { icon: any, color: string, bg: string } } = {
  'Instagram': { icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
  'TikTok': { icon: Music, color: 'text-slate-900', bg: 'bg-slate-100' },
  'Telegram': { icon: MessageCircle, color: 'text-sky-500', bg: 'bg-sky-50' },
  'YouTube': { icon: Youtube, color: 'text-red-600', bg: 'bg-red-50' },
  'ChatGPT': { icon: Bot, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'Facebook': { icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
  'Twitter': { icon: Twitter, color: 'text-sky-400', bg: 'bg-sky-50' },
  'Netflix': { icon: Monitor, color: 'text-red-700', bg: 'bg-red-50' },
  'VPN Services': { icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  'Adobe': { icon: Layers, color: 'text-red-500', bg: 'bg-red-50' },
  'Windows': { icon: Monitor, color: 'text-blue-500', bg: 'bg-blue-50' },
  'Google': { icon: Cpu, color: 'text-yellow-600', bg: 'bg-yellow-50' },
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
      const { data } = await supabase.from('smm_services').select('*').order('price', { ascending: true });
      setServices(data || []);
      setFilteredServices(data || []);
      setLoading(false);
    }
    fetchServices();
  }, []);

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
        <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">
          <span className="text-emerald-600">2X</span> SERVICES
        </h2>
        <p className="text-slate-500 font-medium text-lg">Professional social and digital solutions.</p>
      </div>

      {/* بخش کتگوری‌ها به صورت گرید جدولی */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-slate-200 border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <button 
          onClick={() => filterServices('All')}
          className={`flex flex-col items-center justify-center p-6 gap-3 transition-all ${
            activeTab === 'All' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <LayoutGrid size={24} />
          <span className="font-bold text-sm uppercase tracking-wider">All</span>
        </button>

        {Object.keys(PLATFORM_CONFIG).map((platform) => {
          const { icon: Icon, color, bg } = PLATFORM_CONFIG[platform];
          const isActive = activeTab === platform;
          return (
            <button 
              key={platform}
              onClick={() => filterServices(platform)}
              className={`flex flex-col items-center justify-center p-6 gap-3 transition-all ${
                isActive ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className={`p-3 rounded-2xl ${isActive ? 'bg-white/20' : bg}`}>
                <Icon size={24} className={isActive ? 'text-white' : color} />
              </div>
              <span className="font-bold text-xs uppercase tracking-widest">{platform}</span>
            </button>
          );
        })}
      </div>

      {/* بخش لیست محصولات زیبا سازی شده */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h3 className="font-black text-slate-400 text-sm uppercase tracking-[0.2em]">Service Catalog</h3>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            {filteredServices.length} Items Available
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-[3rem] border border-slate-100">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
            <p className="text-slate-400 font-bold animate-pulse">Loading Premium Services...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredServices.map((s) => (
              <div 
                key={s.id} 
                className="group bg-white p-4 sm:p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-50 hover:border-emerald-100 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-6 w-full">
                  <div className="hidden sm:flex w-14 h-14 bg-slate-50 rounded-2xl items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Zap size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-slate-800 group-hover:text-emerald-700 transition-colors uppercase italic tracking-tight">
                      {s.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded">High Quality</span>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">Fast Delivery</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Starting from</span>
                    <span className="text-2xl font-black text-slate-900">${s.price}</span>
                  </div>
                  <button 
                    onClick={() => router.push(`/dashboard/new-order?serviceId=${s.id}`)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-lg active:scale-95 group/btn"
                  >
                    ORDER 
                    <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
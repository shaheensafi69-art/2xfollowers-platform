"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Instagram, Facebook, Youtube, Twitter, Music, MessageCircle, Bot, 
  Video, ShieldCheck, BookOpen, FileText, Monitor, ShoppingCart, 
  Gamepad2, Layers, Cpu, Zap, CreditCard, LayoutGrid, Loader2 
} from 'lucide-react';

// لیست کامل دسته‌بندی‌ها
const PLATFORM_CONFIG: { [key: string]: { icon: any, color: string } } = {
  'Instagram': { icon: Instagram, color: 'text-pink-600' },
  'TikTok': { icon: Music, color: 'text-black' },
  'CapCut': { icon: Video, color: 'text-cyan-500' },
  'Adobe': { icon: Layers, color: 'text-red-700' },
  'Linkedin': { icon: BookOpen, color: 'text-blue-700' },
  'Telegram': { icon: MessageCircle, color: 'text-sky-500' },
  'ChatGPT': { icon: Bot, color: 'text-emerald-600' },
  'Claude': { icon: Bot, color: 'text-orange-500' },
  'Grok': { icon: Cpu, color: 'text-gray-800' },
  'Gemini': { icon: Bot, color: 'text-blue-400' },
  'Perplexity': { icon: Zap, color: 'text-indigo-500' },
  'Twitter': { icon: Twitter, color: 'text-sky-400' },
  'Whatsapp': { icon: MessageCircle, color: 'text-green-500' },
  'Midjourney': { icon: Video, color: 'text-purple-600' },
  'NordVPN': { icon: ShieldCheck, color: 'text-red-500' },
  'HMA': { icon: ShieldCheck, color: 'text-red-600' },
  'ExpressVPN': { icon: ShieldCheck, color: 'text-red-500' },
  'Facebook': { icon: Facebook, color: 'text-blue-600' },
  'YouTube': { icon: Youtube, color: 'text-red-600' },
  'ElevenLabs': { icon: Music, color: 'text-indigo-600' },
  'Surfshark': { icon: ShieldCheck, color: 'text-teal-600' },
  'HBO': { icon: Monitor, color: 'text-purple-500' },
  'Udemy': { icon: BookOpen, color: 'text-orange-600' },
  'Grammarly': { icon: FileText, color: 'text-green-500' },
  'QuillBot': { icon: FileText, color: 'text-emerald-500' },
  'Windows': { icon: Monitor, color: 'text-blue-500' },
  'Microsoft': { icon: Monitor, color: 'text-blue-600' },
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
      const { data } = await supabase.from('smm_services').select('*');
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
      // فیلتر کردن بر اساس کلمه کلیدی
      setFilteredServices(services.filter(s => s.name.includes(platform)));
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-slate-900">Services</h2>

      {/* لیست دسته‌بندی‌ها با قابلیت Wrap برای نمایش بهتر در موبایل و دسکتاپ */}
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => filterServices('All')}
          className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${
            activeTab === 'All' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white'
          }`}
        >
          All
        </button>

        {Object.keys(PLATFORM_CONFIG).map((platform) => {
          const { icon: Icon, color } = PLATFORM_CONFIG[platform];
          return (
            <button 
              key={platform}
              onClick={() => filterServices(platform)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold transition-all ${
                activeTab === platform ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white'
              }`}
            >
              <Icon size={18} className={activeTab === platform ? color : 'text-slate-400'} />
              {platform}
            </button>
          );
        })}
      </div>

      {/* جدول سرویس‌ها */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Loading...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-6">Service Name</th>
                <th className="p-6">Price</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6 font-medium text-slate-700">{s.name}</td>
                  <td className="p-6 font-bold text-slate-900">${s.price}</td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => router.push(`/dashboard/new-order?serviceId=${s.id}`)}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
                    >
                      Order
                    </button>
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
"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { LogOut, User, Lock, Save, Loader2, Globe, Phone, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '', // اصلاح نام متغیر متناسب با دیتابیس
    country: '',
    phone: ''
  });

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // فراخوانی دقیق فیلدها از جدول profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, date_of_birth, country, phone')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error.message);
        }

        if (data) {
          setProfile({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            date_of_birth: data.date_of_birth || '', // خواندن مستقیم از دیتابیس
            country: data.country || '',
            phone: data.phone || ''
          });
        }
      }
      setLoading(false);
    }
    getProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        date_of_birth: profile.date_of_birth, // آپدیت فیلد تاریخ تولد اصلی
        country: profile.country,
        phone: profile.phone,
      })
      .eq('id', user.id);

    if (error) {
      alert("Error updating profile: " + error.message);
    } else {
      alert("Profile updated successfully! ✅");
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter">
          <span className="text-emerald-600">MY</span> ACCOUNT
        </h2>
        <p className="text-slate-500 font-medium">Update your personal information and security settings.</p>
      </div>

      {/* بخش پروفایل */}
      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
          <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
            <User size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
            <p className="text-sm text-slate-400">Your public profile details</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* اسم */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
            <input 
              type="text" 
              value={profile.first_name}
              onChange={(e) => setProfile({...profile, first_name: e.target.value})}
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-700"
              placeholder="First Name"
            />
          </div>

          {/* تخلص */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
            <input 
              type="text" 
              value={profile.last_name}
              onChange={(e) => setProfile({...profile, last_name: e.target.value})}
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-700"
              placeholder="Last Name"
            />
          </div>

          {/* تاریخ تولد */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="date" 
                value={profile.date_of_birth}
                onChange={(e) => setProfile({...profile, date_of_birth: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-700"
              />
            </div>
          </div>

          {/* شماره تماس */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="tel" 
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-700"
                placeholder="+93 7xx xxx xxx"
              />
            </div>
          </div>

          {/* کشور */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={profile.country}
                onChange={(e) => setProfile({...profile, country: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-700"
                placeholder="Country Name"
              />
            </div>
          </div>

          {/* ایمیل (غیرقابل تغییر) */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address (Primary)</label>
            <input type="email" disabled value={user?.email || ''} className="w-full p-4 bg-slate-100 rounded-2xl border border-slate-100 text-slate-400 cursor-not-allowed font-medium" />
          </div>
        </div>

        <button 
          onClick={handleUpdateProfile}
          disabled={saving}
          className="w-full sm:w-auto bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition-all active:scale-95"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20}/> Save Profile Settings</>}
        </button>
      </div>

      {/* بخش امنیت و خروج */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-red-50 rounded-2xl text-red-600"><Lock size={24} /></div>
          <div>
            <h3 className="font-bold text-slate-900">Security & Sign Out</h3>
            <p className="text-sm text-slate-400 font-medium">Protect your account data</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full sm:w-auto flex items-center justify-center gap-2 text-red-600 bg-red-50 px-8 py-4 rounded-2xl font-black hover:bg-red-100 transition-all"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
}
"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { LogOut, User, Lock, Save, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({ full_name: '' });

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // گرفتن اطلاعات از جدول profiles (دقت کن جدول profiles باید وجود داشته باشد)
        const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        setProfile({ full_name: data?.full_name || '' });
      }
      setLoading(false);
    }
    getProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setSaving(true);
    await supabase.from('profiles').update({ full_name: profile.full_name }).eq('id', user.id);
    setSaving(false);
    alert("Profile updated successfully!");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login'); // یا هر مسیری که صفحه لاگینت هست
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900">Settings</h2>
        <p className="text-slate-500">Manage your account preferences and profile.</p>
      </div>

      {/* بخش پروفایل */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600"><User size={24} /></div>
            <h3 className="text-xl font-bold">Profile Settings</h3>
        </div>
        
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <input 
                    type="text" 
                    value={profile.full_name}
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-emerald-500"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input type="email" disabled value={user?.email} className="w-full p-4 bg-slate-100 rounded-2xl border border-slate-100 text-slate-500 cursor-not-allowed" />
            </div>
            <button 
                onClick={handleUpdateProfile}
                disabled={saving}
                className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 flex items-center gap-2"
            >
                {saving ? <Loader2 className="animate-spin" /> : <><Save size={20}/> Save Changes</>}
            </button>
        </div>
      </div>

      {/* بخش امنیت و خروج */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-red-100 rounded-2xl text-red-600"><Lock size={24} /></div>
            <h3 className="text-xl font-bold">Security & Account</h3>
        </div>
        <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 bg-red-50 px-6 py-4 rounded-2xl font-bold hover:bg-red-100 transition-colors"
        >
            <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
}
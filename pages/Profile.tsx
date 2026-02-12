
import React from 'react';
import { User } from '@supabase/supabase-js';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  LogOut, 
  Settings, 
  ChevronRight, 
  ShieldCheck, 
  Languages,
  Bell,
  Info
} from 'lucide-react';

interface ProfileProps {
  user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const { t, isRtl, toggleLanguage, lang } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: Info, label: t.about_us_nav, color: 'text-indigo-500', bg: 'bg-indigo-50', path: '/about-us' },
    { icon: Bell, label: lang === 'ar' ? 'التنبيهات' : 'Notifications', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: ShieldCheck, label: lang === 'ar' ? 'الأمان والخصوصية' : 'Security & Privacy', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: Settings, label: lang === 'ar' ? 'إعدادات التطبيق' : 'App Settings', color: 'text-slate-500', bg: 'bg-slate-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg">
            <UserIcon size={20} />
          </div>
          <span className="font-black text-slate-900 text-xl tracking-tight">{t.nav_profile}</span>
        </div>
        
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
          <button onClick={toggleLanguage} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 font-black text-xs">
            <Languages size={18} />
            <span className="hidden sm:inline">{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
          <button onClick={handleLogout} className="p-2.5 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <header className="bg-white px-6 pt-12 pb-12 rounded-b-[3rem] shadow-sm border-b border-slate-100">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <UserIcon size={48} strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white"></div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user.email?.split('@')[0]}</h1>
            <p className="text-slate-400 font-bold text-sm">{user.email}</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 space-y-6 max-w-lg mx-auto">
        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
          <h2 className={`text-xs font-black text-slate-400 uppercase tracking-widest px-2 ${isRtl ? 'text-right' : 'text-left'}`}>{t.account_info}</h2>
          
          <div className="space-y-3">
            <div className={`flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className="text-indigo-600"><Mail size={20} /></div>
              <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.email}</p>
                <p className="text-sm font-bold text-slate-900">{user.email}</p>
              </div>
            </div>

            <div className={`flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className="text-indigo-600"><Calendar size={20} /></div>
              <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.member_since}</p>
                <p className="text-sm font-bold text-slate-900">
                  {new Date(user.created_at).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'en-US')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {menuItems.map((item, idx) => (
            <button 
              key={idx}
              onClick={() => item.path && navigate(item.path)}
              className={`w-full flex items-center justify-between p-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
            >
              <div className={`flex items-center gap-4 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`${item.bg} p-2.5 rounded-xl ${item.color}`}><item.icon size={20} /></div>
                <span className="font-bold text-slate-700">{item.label}</span>
              </div>
              <ChevronRight className={`text-slate-300 group-hover:text-indigo-600 transition-all ${isRtl ? 'rotate-180' : ''}`} size={20} />
            </button>
          ))}
        </section>

        <button 
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-3 p-5 bg-red-50 text-red-600 rounded-[1.5rem] border border-red-100 font-black transition-all hover:bg-red-600 hover:text-white group shadow-sm active:scale-95 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          {t.logout}
        </button>
      </main>
    </div>
  );
};

export default Profile;

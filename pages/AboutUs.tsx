
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  Info, 
  Target, 
  Rocket, 
  ShieldCheck, 
  MapPin, 
  Search, 
  MessageSquareWarning,
  ArrowLeft,
  Languages
} from 'lucide-react';

const AboutUs: React.FC = () => {
  const { t, lang, toggleLanguage, isRtl } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
            <ArrowLeft size={24} className={isRtl ? 'rotate-180' : ''} />
          </button>
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg">
            <Info size={20} />
          </div>
          <span className="font-black text-slate-900 text-xl tracking-tight">{t.about_us_nav}</span>
        </div>
        
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
          <button onClick={toggleLanguage} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 font-black text-xs">
            <Languages size={18} />
            <span className="hidden sm:inline">{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-12">
        {/* Hero Section */}
        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
            {t.about_us_title}
          </h1>
          <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full" />
        </header>

        {/* Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                <Target size={28} />
              </div>
              <h2 className="text-xl font-black text-slate-900">{t.about_us_vision_title}</h2>
            </div>
            <p className="text-slate-600 font-bold leading-relaxed">
              {t.about_us_vision_text}
            </p>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                <Rocket size={28} />
              </div>
              <h2 className="text-xl font-black text-slate-900">{t.about_us_mission_title}</h2>
            </div>
            <p className="text-slate-600 font-bold leading-relaxed">
              {t.about_us_mission_text}
            </p>
          </section>
        </div>

        {/* Why Choose Us Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900">{t.about_us_why_title}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
              <div className="bg-indigo-50 w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto">
                <MapPin size={28} />
              </div>
              <h3 className="font-black text-slate-900">{t.about_us_why_1_title}</h3>
              <p className="text-sm font-bold text-slate-500 leading-relaxed">
                {t.about_us_why_1_text}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
              <div className="bg-indigo-50 w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto">
                <Search size={28} />
              </div>
              <h3 className="font-black text-slate-900">{t.about_us_why_2_title}</h3>
              <p className="text-sm font-bold text-slate-500 leading-relaxed">
                {t.about_us_why_2_text}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
              <div className="bg-indigo-50 w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto">
                <MessageSquareWarning size={28} />
              </div>
              <h3 className="font-black text-slate-900">{t.about_us_why_3_title}</h3>
              <p className="text-sm font-bold text-slate-500 leading-relaxed">
                {t.about_us_why_3_text}
              </p>
            </div>
          </div>
        </section>

        {/* Final Reassurance */}
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white text-center space-y-4 shadow-xl shadow-slate-200">
          <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-xl font-black">{isRtl ? 'تسوق بثقة مع Wassit DZ' : 'Shop with confidence at Wassit DZ'}</h3>
          <p className="text-slate-400 font-bold max-w-lg mx-auto">
            {isRtl 
              ? 'نحن هنا لنكون شريكك الدائم في رحلة تسوقك من العالم، بلمسة محلية وأمان تام.'
              : 'We are here to be your long-term partner in your shopping journey from around the world, with a local touch and total security.'}
          </p>
        </div>
      </main>
    </div>
  );
};

export default AboutUs;

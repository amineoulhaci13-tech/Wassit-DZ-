
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { AuthMode } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  Lock, 
  Mail, 
  Loader2, 
  ArrowRight, 
  AlertCircle, 
  Inbox, 
  ShieldCheck, 
  BadgeCheck, 
  Languages,
  Eye,
  EyeOff,
  UserPlus
} from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState<{ message: string; isConfirmation?: boolean; isCredentialError?: boolean } | null>(null);
  const navigate = useNavigate();
  const { t, lang, toggleLanguage, isRtl } = useLanguage();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShake(false);

    // Trim email to prevent common credential errors from invisible spaces
    const cleanEmail = email.trim();

    try {
      if (mode === 'login') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        
        if (authError) {
          if (authError.message.toLowerCase().includes('email not confirmed')) {
            setError({ 
              message: isRtl ? 'يرجى تأكيد بريدك الإلكتروني أولاً.' : 'Please confirm your email first.',
              isConfirmation: true 
            });
            return;
          }
          if (authError.message.toLowerCase().includes('invalid login credentials')) {
             setError({
                message: t.invalid_credentials_hint,
                isCredentialError: true
             });
             triggerShake();
             return;
          }
          throw authError;
        }
        
        if (data.user?.email === 'amineoulhaci11@gmail.com') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });
        if (signUpError) throw signUpError;
        
        setError({ 
          message: isRtl ? 'تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني.' : 'Account created! Please check your email.',
          isConfirmation: true 
        });
        setMode('login');
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError({ message: err.message || t.error_occurred });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center py-12 px-4 overflow-x-hidden relative">
      
      {/* Language Toggle */}
      <button 
        onClick={toggleLanguage}
        className="fixed top-6 left-6 z-[100] bg-white text-slate-600 p-4 rounded-full shadow-2xl border border-slate-100 hover:scale-110 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-3 font-black text-sm group"
      >
        <Languages size={20} />
        <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
      </button>

      {/* Trust Banner / Header */}
      <div className="w-full max-w-4xl text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          {isRtl ? (
            <>تسوق في <span className="text-orange-500 italic">AliExpress</span> من الجزائر بكل أمان مع <span className="text-indigo-600">Wassit DZ</span></>
          ) : (
            <>Shop safely on <span className="text-orange-500 italic">AliExpress</span> from Algeria with <span className="text-indigo-600">Wassit DZ</span></>
          )}
        </h2>
        <p className="text-slate-500 font-bold text-lg max-w-2xl mx-auto">
          {isRtl ? 'نحن نوفر لك تجربة شراء آمنة، نتحقق من طلباتك ونضمن لك وصولها بجودة عالية.' : 'We provide a secure buying experience, checking your orders to ensure high-quality delivery.'}
        </p>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Login Card */}
        <div className={`w-full max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-10 border border-slate-100 relative overflow-hidden order-2 lg:order-1 transition-transform duration-300 ${shake ? 'animate-shake' : ''}`}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl mb-6 shadow-sm shadow-indigo-100">
              {mode === 'login' ? <Lock size={32} /> : <UserPlus size={32} />}
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'login' ? t.welcome : (isRtl ? 'إنشاء حساب جديد' : 'Create Account')}
            </h1>
          </div>

          {error && (
            <div className={`mb-8 p-5 border rounded-2xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm ${
              error.isConfirmation ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-red-50 border-red-100 text-red-700'
            }`}>
              <div className="flex items-start gap-3">
                {error.isConfirmation ? <Inbox className="shrink-0 mt-0.5" size={18} /> : <AlertCircle className="shrink-0 mt-0.5" size={18} />}
                <span className="font-bold text-sm leading-relaxed">{error.message}</span>
              </div>
              {error.isCredentialError && mode === 'login' && (
                <button 
                   onClick={() => {
                     setMode('register');
                     setError(null);
                   }}
                   className="text-[10px] font-black uppercase tracking-widest bg-red-600 text-white px-4 py-2 rounded-xl self-start hover:bg-red-700 transition-colors shadow-md shadow-red-100"
                >
                   {isRtl ? 'إنشاء حساب الآن' : 'Register Now'}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="group">
              <label className={`block text-sm font-bold text-slate-700 mb-2 px-1 ${isRtl ? 'text-right' : 'text-left'}`}>{t.email}</label>
              <div className="relative">
                <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors`} size={20} />
                <input
                  type="email" 
                  required 
                  disabled={loading}
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-black font-semibold disabled:opacity-50`}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="group">
              <label className={`block text-sm font-bold text-slate-700 mb-2 px-1 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'كلمة المرور' : 'Password'}</label>
              <div className="relative">
                <Lock className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors`} size={20} />
                <input
                  type={showPassword ? "text" : "password"} 
                  required 
                  disabled={loading}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full ${isRtl ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-black font-semibold disabled:opacity-50`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1`}
                  title={showPassword ? t.hide_password : t.show_password}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={22} /> : (
                <>
                  <span className="text-lg">{mode === 'login' ? t.login : (isRtl ? 'تسجيل' : 'Register')}</span>
                  <ArrowRight size={20} className={isRtl ? 'rotate-180' : ''} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-600 font-medium">
              {mode === 'login' ? (isRtl ? "ليس لديك حساب؟" : "No account?") : (isRtl ? "لديك حساب بالفعل؟" : "Have an account?")}{' '}
              <button
                onClick={() => {
                   setMode(mode === 'login' ? 'register' : 'login');
                   setError(null);
                }}
                className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors underline underline-offset-4"
              >
                {mode === 'login' ? (isRtl ? 'سجل الآن' : 'Join Now') : (isRtl ? 'سجل دخولك' : 'Login')}
              </button>
            </p>
          </div>
        </div>

        {/* Trust section */}
        <div className="order-1 lg:order-2 space-y-8 animate-in slide-in-from-left-8 duration-1000">
          <div className="bg-white rounded-[2.5rem] p-8 border-4 border-amber-100 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className={`flex items-center gap-3 mb-8 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="bg-amber-100 p-3 rounded-2xl text-amber-600"><BadgeCheck size={32} /></div>
                <h3 className="text-2xl font-black text-slate-900">{isRtl ? 'لماذا تختارنا؟' : 'Why Choose Us?'}</h3>
              </div>
              <div className="grid gap-8">
                {[
                  { title: isRtl ? 'ضمان الجودة' : 'Quality Assurance', desc: isRtl ? 'نتحقق من كل منتج ونضمن سلامته.' : 'We verify every item and guarantee its safety.' },
                  { title: isRtl ? 'دفع آمن' : 'Safe Payment', desc: isRtl ? 'أموالك في أمان تام حتى الاستلام.' : 'Your money is completely safe until delivery.' }
                ].map((item, i) => (
                  <div key={i} className={`flex gap-5 group/item ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="shrink-0 w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover/item:bg-amber-600 group-hover/item:text-white transition-all"><ShieldCheck size={28} /></div>
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <h4 className="text-lg font-black text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-slate-500 font-bold text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default Login;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { AuthMode } from '../types';
import { 
  Lock, 
  Mail, 
  Loader2, 
  ArrowRight, 
  AlertCircle, 
  Inbox, 
  ShieldCheck, 
  BadgeCheck, 
  Truck, 
  Wallet 
} from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; isConfirmation?: boolean } | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (authError) {
          if (authError.message.toLowerCase().includes('email not confirmed')) {
            setError({ 
              message: 'يرجى تأكيد بريدك الإلكتروني أولاً. لقد أرسلنا رابط التفعيل إلى صندوق الوارد الخاص بك.',
              isConfirmation: true 
            });
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
          email,
          password,
        });
        if (signUpError) throw signUpError;
        
        setError({ 
          message: 'تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب قبل تسجيل الدخول.',
          isConfirmation: true 
        });
        setMode('login');
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError({ message: 'خطأ في الاتصال: تعذر الوصول إلى الخادم. يرجى التأكد من اتصال الإنترنت.' });
      } else if (err.message.toLowerCase().includes('invalid login credentials')) {
        setError({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى أو إنشاء حساب جديد إذا لم يكن لديك حساب.' });
      } else {
        setError({ message: err.message || 'حدث خطأ غير متوقع أثناء العملية' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center py-12 px-4 overflow-x-hidden" dir="rtl">
      {/* Trust Banner / Header */}
      <div className="w-full max-w-4xl text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          تسوق في <span className="text-orange-500 italic">AliExpress</span> من الجزائر بكل أمان مع <span className="text-indigo-600">Wassit DZ</span>
        </h2>
        <p className="text-slate-500 font-bold text-lg max-w-2xl mx-auto">
          نحن نوفر لك تجربة شراء آمنة، نتحقق من طلباتك ونضمن لك وصولها بجودة عالية.
        </p>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Login Card */}
        <div className="w-full max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-10 border border-slate-100 relative overflow-hidden order-2 lg:order-1">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl mb-6 shadow-sm shadow-indigo-100">
              <Lock size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'login' ? 'مرحباً بك مجدداً' : 'إنشاء حساب جديد'}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              {mode === 'login' ? 'سجل دخولك للمتابعة' : 'انضم إلينا اليوم لتقديم طلباتك'}
            </p>
          </div>

          {error && (
            <div className={`mb-8 p-4 border rounded-2xl flex items-start gap-3 animate-shake shadow-sm ${
              error.isConfirmation ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-red-50 border-red-100 text-red-700'
            }`}>
              {error.isConfirmation ? <Inbox className="shrink-0 mt-0.5" size={18} /> : <AlertCircle className="shrink-0 mt-0.5" size={18} />}
              <span className="font-semibold leading-relaxed text-right">{error.message}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-2 px-1 text-right">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-black font-semibold placeholder:text-slate-300 text-left"
                  placeholder="name@example.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-2 px-1 text-right">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-black font-semibold placeholder:text-slate-300 text-left"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-200 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>
                  <span className="text-lg">{mode === 'login' ? 'دخول' : 'تسجيل'}</span>
                  <ArrowRight size={20} className="rotate-180" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-600 font-medium">
              {mode === 'login' ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}{' '}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                }}
                className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors underline underline-offset-4"
              >
                {mode === 'login' ? 'سجل الآن' : 'سجل دخولك'}
              </button>
            </p>
          </div>
        </div>

        {/* Trust/Golden Guarantee Section */}
        <div className="order-1 lg:order-2 space-y-8 animate-in slide-in-from-left-8 duration-1000">
          <div className="bg-white rounded-[2.5rem] p-8 border-4 border-amber-100 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-50 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                  <BadgeCheck size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">لماذا تختار Wassit DZ؟</h3>
              </div>

              <div className="grid gap-8">
                <div className="flex gap-5 group/item">
                  <div className="shrink-0 w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center group-hover/item:scale-110 group-hover/item:bg-amber-600 group-hover/item:text-white transition-all duration-300">
                    <ShieldCheck size={28} />
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-black text-slate-900 mb-1">ضمان الجودة الذهبي</h4>
                    <p className="text-slate-500 font-bold text-sm leading-relaxed">
                      فريقنا يتحقق من كل منتج فور وصوله لمخازننا في الصين وقبل إرساله للجزائر لضمان مطابقته للمواصفات.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 group/item">
                  <div className="shrink-0 w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center group-hover/item:scale-110 group-hover/item:bg-amber-600 group-hover/item:text-white transition-all duration-300">
                    <Wallet size={28} />
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-black text-slate-900 mb-1">أموالك في أمان تام</h4>
                    <p className="text-slate-500 font-bold text-sm leading-relaxed">
                      نظام "الدفع المعلق": لا يتم تحويل الأموال للبائع إلا بعد تأكدنا من جودة المنتج وحالة الشحن.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 group/item">
                  <div className="shrink-0 w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center group-hover/item:scale-110 group-hover/item:bg-amber-600 group-hover/item:text-white transition-all duration-300">
                    <Truck size={28} />
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-black text-slate-900 mb-1">تتبع ذكي ومستمر</h4>
                    <p className="text-slate-500 font-bold text-sm leading-relaxed">
                      من الصين حتى باب منزلك، نوفر لك تحديثات دقيقة ومستمرة لموقع شحنتك عبر رقم تتبع دولي.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-5 bg-slate-900 rounded-3xl border border-slate-800 text-center">
                 <p className="text-amber-400 font-black text-sm uppercase tracking-widest mb-1">Wassit DZ Security</p>
                 <p className="text-white font-bold text-xs opacity-80">نحن وسيطك الموثوق في عالم التجارة الإلكترونية</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-20 py-8 border-t border-slate-200 w-full max-w-4xl text-center">
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Wassit DZ Logistics • Secure Algeria Delivery</p>
      </footer>
    </div>
  );
};

export default Login;

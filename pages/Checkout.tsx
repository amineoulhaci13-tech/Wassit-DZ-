
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { useLanguage } from '../context/LanguageContext';
import { Order } from '../types';
import { 
  CreditCard, 
  ChevronRight, 
  CheckCircle2, 
  Upload, 
  Loader2, 
  Copy, 
  PartyPopper,
  ArrowLeft,
  AlertCircle,
  Banknote,
  Languages,
  LogOut
} from 'lucide-react';

interface CheckoutProps {
  user: User;
}

const Checkout: React.FC<CheckoutProps> = ({ user }) => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { t, lang, toggleLanguage, isRtl } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const ACCOUNT_RIP = '00799999004290770859';

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order for checkout:", err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
      setStatus({ type: null, message: '' });
    }
  };

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    setStatus({ type: 'success', message: msg });
    setTimeout(() => setStatus({ type: null, message: '' }), 2000);
  };

  const handleConfirmPayment = async () => {
    if (!proofFile || !order) {
      setStatus({ type: 'error', message: lang === 'ar' ? 'يرجى اختيار ملف الوصل أولاً' : 'Please upload payment proof' });
      return;
    }

    setUploading(true);
    setStatus({ type: null, message: '' });

    try {
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${user.id}/payment_${order.id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('order-assets')
        .upload(filePath, proofFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('order-assets')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          payment_proof_url: publicUrl,
          status: 'Paid',
          total_price_dzd: Number(order.total_price_dzd)
        })
        .eq('id', order.id);

      if (updateError) {
        throw new Error(`Error updating: ${updateError.message}`);
      }

      setStatus({ 
        type: 'success', 
        message: lang === 'ar' ? 'تم استلام طلبك بنجاح! جاري المراجعة' : 'Payment confirmed! Review in progress'
      });

      setTimeout(() => {
        setSuccess(true);
        setTimeout(() => {
          navigate('/history');
        }, 3000);
      }, 2000);

    } catch (err: any) {
      console.error("Detailed Submission Error:", err);
      setStatus({ 
        type: 'error', 
        message: err.message || t.error_occurred
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="font-bold text-slate-500">{t.loading}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-500">
           <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-100">
              <PartyPopper size={48} />
           </div>
           <h2 className="text-3xl font-black text-slate-900 mb-4">{lang === 'ar' ? 'تم استلام طلبك!' : 'Order Received!'}</h2>
           <p className="text-slate-600 font-bold leading-relaxed mb-8">
             {lang === 'ar' ? 'شكراً لثقتك بـ Wassit DZ. سيتم مراجعة طلبك خلال 24 ساعة.' : 'Thank you for choosing Wassit DZ. Your order will be reviewed within 24 hours.'}
           </p>
           <div className="flex flex-col gap-3">
             <Link 
               to="/history" 
               className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-10 py-5 rounded-[1.8rem] transition-all shadow-xl active:scale-95"
             >
               {t.history}
               <ChevronRight className={isRtl ? 'rotate-180' : ''} size={20} />
             </Link>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
            <ArrowLeft size={24} className={isRtl ? 'rotate-180' : ''} />
          </button>
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg">
            <CreditCard size={22} />
          </div>
          <span className="font-black text-slate-900 text-2xl tracking-tight hidden sm:inline">{lang === 'ar' ? 'إكمال الدفع' : 'Checkout'}</span>
        </div>
        
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
          <button onClick={toggleLanguage} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 font-black text-xs">
            <Languages size={18} />
            <span className="hidden sm:inline">{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
          <button onClick={() => supabase.auth.signOut()} className="p-2.5 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 md:p-12">
        {status.type && (
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] mb-8 p-6 rounded-[2rem] flex items-center gap-4 border-2 animate-in slide-in-from-top-4 duration-500 shadow-xl ${
            status.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-red-600 border-red-500 text-white'
          }`} dir={isRtl ? 'rtl' : 'ltr'}>
            {status.type === 'success' ? <CheckCircle2 className="shrink-0" size={28} /> : <AlertCircle className="shrink-0" size={28} />}
            <span className="text-lg font-black">{status.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
            <header>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{lang === 'ar' ? 'تعليمات الدفع' : 'Payment Instructions'}</h1>
              <p className="text-slate-500 font-medium text-lg italic">{lang === 'ar' ? 'يرجى تحويل المبلغ الإجمالي لإكمال الطلب' : 'Please transfer the total amount to complete your order'}</p>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-8">
              <div className="w-full bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Banknote size={80} />
                </div>
                <div className="relative z-10">
                  <p className="text-indigo-100 font-black text-xs uppercase tracking-[0.2em] mb-2">{t.total_due}</p>
                  <div className="flex items-center justify-center gap-4">
                    <h2 className="text-5xl font-black tracking-tighter">
                      {order?.total_price_dzd?.toLocaleString()} <span className="text-xl opacity-70">{t.currency}</span>
                    </h2>
                    <button 
                      onClick={() => copyToClipboard(order?.total_price_dzd?.toString() || '', lang === 'ar' ? 'تم نسخ المبلغ' : 'Amount copied')}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-all active:scale-90"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{lang === 'ar' ? 'رقم الحساب (RIP/CCP)' : 'Account Number (RIP/CCP)'}</label>
                <div className={`w-full flex items-center justify-between bg-slate-50 border border-slate-100 p-6 rounded-3xl group ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                  <span className="text-xl md:text-2xl font-black font-mono tracking-wider text-slate-800 flex-1">{ACCOUNT_RIP}</span>
                  <button 
                    onClick={() => copyToClipboard(ACCOUNT_RIP, lang === 'ar' ? 'تم نسخ رقم الحساب' : 'Account copied')}
                    className="text-slate-300 hover:text-indigo-600 p-3 bg-white rounded-2xl shadow-sm transition-all active:scale-90"
                  >
                    <Copy size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className={`bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
              <label className="block text-sm font-black text-slate-700 mb-4 px-1">{lang === 'ar' ? 'إثبات الدفع (الوصل)' : 'Payment Proof (Receipt)'}</label>
              
              <label
                htmlFor="proof-upload"
                className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-[2rem] transition-all cursor-pointer group relative overflow-hidden ${
                  proofFile ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-indigo-400'
                }`}
              >
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  {proofFile ? (
                    <CheckCircle2 className="w-16 h-16 mb-4 text-emerald-500" />
                  ) : (
                    <Upload className="w-12 h-12 mb-4 text-slate-300 group-hover:text-indigo-600 transition-all group-hover:-translate-y-1" />
                  )}
                  <p className={`text-sm font-black transition-colors px-6 ${proofFile ? 'text-emerald-700' : 'text-slate-600 group-hover:text-indigo-600'}`}>
                    {proofFile ? proofFile.name : (lang === 'ar' ? 'ارفع وصل الدفع' : 'Upload Receipt')}
                  </p>
                </div>
                <input id="proof-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>

              <button
                onClick={handleConfirmPayment}
                disabled={uploading || !proofFile}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[1.8rem] flex items-center justify-center gap-3 transition-all disabled:opacity-40 shadow-xl active:scale-[0.98]"
              >
                {uploading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <span className="text-lg tracking-tight flex items-center gap-2">
                    {lang === 'ar' ? 'تأكيد إرسال الوصل' : 'Confirm Payment'}
                    <CheckCircle2 size={20} />
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
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
  Banknote
} from 'lucide-react';

interface CheckoutProps {
  user: User;
}

const Checkout: React.FC<CheckoutProps> = ({ user }) => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
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
      setStatus({ type: 'error', message: 'يرجى اختيار ملف الوصل أولاً' });
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
        throw new Error(`خطأ في تحديث البيانات: ${updateError.message}`);
      }

      setStatus({ 
        type: 'success', 
        message: 'تم استلام طلبك بنجاح! جاري المراجعة' 
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
        message: err.message || 'حدث خطأ غير متوقع أثناء إرسال الوصل'
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="font-bold text-slate-500">جاري تحميل بيانات الدفع...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-right" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-500">
           <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-100">
              <PartyPopper size={48} />
           </div>
           <h2 className="text-3xl font-black text-slate-900 mb-4">تم استلام طلبك!</h2>
           <p className="text-slate-600 font-bold leading-relaxed mb-8">
             شكراً لثقتك بـ <span className="text-indigo-600">Wassit DZ</span>. سيتم مراجعة طلبك خلال <span className="text-indigo-600">24 ساعة</span>.
           </p>
           <div className="flex flex-col gap-3">
             <Link 
               to="/history" 
               className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-10 py-5 rounded-[1.8rem] transition-all shadow-xl shadow-indigo-100 active:scale-95"
             >
               مشاهدة سجل الطلبات
               <ChevronRight className="rotate-180" size={20} />
             </Link>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">جاري توجيهك الآن...</p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
            <ArrowLeft size={24} className="rotate-180" />
          </Link>
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg">
            <CreditCard size={22} />
          </div>
          <span className="font-black text-slate-900 text-2xl tracking-tight hidden sm:inline">إكمال الدفع</span>
        </div>
        
        <div className="flex items-center gap-4 text-right">
          <div className="hidden md:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">المبلغ المطلوب</p>
            <p className="text-indigo-600 font-black text-lg">{order?.total_price_dzd?.toLocaleString()} DZD</p>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 md:p-12">
        {status.type && (
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] mb-8 p-6 rounded-[2rem] flex items-center gap-4 border-2 animate-in slide-in-from-top-4 duration-500 shadow-xl ${
            status.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-red-600 border-red-500 text-white'
          }`} dir="rtl">
            {status.type === 'success' ? <CheckCircle2 className="shrink-0" size={28} /> : <AlertCircle className="shrink-0" size={28} />}
            <span className="text-lg font-black">{status.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8" dir="rtl">
            <header>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">تعليمات الدفع</h1>
              <p className="text-slate-500 font-medium text-lg italic">يرجى تحويل المبلغ الإجمالي لإكمال الطلب</p>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-8">
              
              {/* Amount Display Card */}
              <div className="w-full bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Banknote size={80} />
                </div>
                <div className="relative z-10">
                  <p className="text-indigo-100 font-black text-xs uppercase tracking-[0.2em] mb-2">المبلغ المطلوب دفعه</p>
                  <div className="flex items-center justify-center gap-4">
                    <h2 className="text-5xl font-black tracking-tighter">
                      {order?.total_price_dzd?.toLocaleString()} <span className="text-xl opacity-70">DZD</span>
                    </h2>
                    <button 
                      onClick={() => copyToClipboard(order?.total_price_dzd?.toString() || '', 'تم نسخ المبلغ')}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-all active:scale-90"
                      title="نسخ المبلغ"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">رقم الحساب (RIP/CCP)</label>
                <div className="w-full flex items-center justify-between bg-slate-50 border border-slate-100 p-6 rounded-3xl hover:border-indigo-200 transition-colors group">
                  <span className="text-xl md:text-2xl font-black font-mono tracking-wider text-slate-800 flex-1">{ACCOUNT_RIP}</span>
                  <button 
                    onClick={() => copyToClipboard(ACCOUNT_RIP, 'تم نسخ رقم الحساب')}
                    className="text-slate-300 hover:text-indigo-600 p-3 bg-white rounded-2xl shadow-sm transition-all active:scale-90"
                    title="نسخ الرقم"
                  >
                    <Copy size={24} />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 text-amber-600 bg-amber-50 px-6 py-4 rounded-2xl text-xs font-bold border border-amber-100 leading-relaxed">
                <AlertCircle size={20} className="shrink-0" />
                تأكد من تحويل المبلغ الموضح أعلاه بدقة لتفادي أي تأخير في معالجة طلبك.
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm text-right" dir="rtl">
              <label className="block text-sm font-black text-slate-700 mb-4 px-1">إثبات الدفع (الوصل)</label>
              
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
                    {proofFile ? proofFile.name : 'ارفع وصل الدفع (الوصل أو Screenshot)'}
                  </p>
                </div>
                <input id="proof-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>

              <button
                onClick={handleConfirmPayment}
                disabled={uploading || !proofFile}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[1.8rem] flex items-center justify-center gap-3 transition-all disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed shadow-xl shadow-indigo-100 active:scale-[0.98] group"
              >
                {uploading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <span className="text-lg tracking-tight flex items-center gap-2">
                    تأكيد إرسال الوصل
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


import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { 
  LifeBuoy, 
  X, 
  Send, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  MessageSquareWarning
} from 'lucide-react';

interface ComplaintCenterProps {
  user: User;
}

const ComplaintCenter: React.FC<ComplaintCenterProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) {
      setStatus({ type: 'error', text: 'يرجى كتابة تفاصيل المشكلة' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, text: '' });

    try {
      let proofUrl = '';

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `complaints/${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('order-assets')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('order-assets')
          .getPublicUrl(fileName);
        
        proofUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('complaints')
        .insert([{
          user_id: user.id,
          message,
          proof_url: proofUrl
        }]);

      if (insertError) throw insertError;

      setStatus({ type: 'success', text: 'تم إرسال شكواك، سنرد عليك في أقرب وقت' });
      setMessage('');
      setFile(null);
      
      setTimeout(() => {
        setIsOpen(false);
        setStatus({ type: null, text: '' });
      }, 3000);

    } catch (err: any) {
      console.error("Complaint Error:", err);
      setStatus({ type: 'error', text: 'حدث خطأ أثناء إرسال الشكوى. يرجى المحاولة لاحقاً' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-[100] bg-red-600 text-white p-3.5 sm:p-4 rounded-full shadow-2xl hover:scale-110 hover:bg-red-700 active:scale-95 transition-all flex items-center gap-2 sm:gap-3 font-black text-xs sm:text-sm group"
        dir="rtl"
        aria-label="مركز الشكاوى"
      >
        <LifeBuoy size={20} className="sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap">
          مركز الشكاوى
        </span>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" dir="rtl">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-50 p-2.5 rounded-2xl text-red-600">
                  <MessageSquareWarning size={24} />
                </div>
                <h2 className="text-xl font-black text-slate-900">مركز الشكاوى والبلاغات</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {status.type && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border ${
                  status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                }`}>
                  {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {status.text}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-black text-slate-700 px-1">تفاصيل المشكلة</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب تفاصيل مشكلتك هنا بوضوح..."
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-black font-bold h-40 resize-none placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black text-slate-700 px-1">رفع إثبات (اختياري)</label>
                <label className={`flex items-center justify-center w-full p-6 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
                  file ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-red-400'
                }`}>
                  <div className="flex flex-col items-center text-center">
                    {file ? <CheckCircle2 className="text-emerald-500 mb-2" size={24} /> : <Upload className="text-slate-300 mb-2" size={24} />}
                    <span className={`text-xs font-black ${file ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {file ? file.name : 'رفع صورة أو لقطة شاشة'}
                    </span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-xl active:scale-95"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  <>
                    <span>إرسال الشكوى</span>
                    <Send size={18} className="rotate-180" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ComplaintCenter;

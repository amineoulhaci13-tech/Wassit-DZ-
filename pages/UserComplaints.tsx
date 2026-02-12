
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  MessageSquareWarning, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  X,
  Maximize2,
  Info,
  Languages,
  LogOut,
  Plus,
  Send,
  Upload
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';

interface UserComplaintsProps { user: User; }

const UserComplaints: React.FC<UserComplaintsProps> = ({ user }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // New Complaint Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  const navigate = useNavigate();
  const { t, lang, toggleLanguage, isRtl } = useLanguage();

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (err) {
      console.error('Error fetching user complaints:', err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    setSubmitting(true);
    setFormStatus({ type: null, text: '' });

    try {
      let proofUrl = '';
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `complaints/${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('order-assets').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('order-assets').getPublicUrl(fileName);
        proofUrl = publicUrl;
      }

      const { error: insertError } = await supabase.from('complaints').insert([{
        user_id: user.id,
        message,
        proof_url: proofUrl,
        status: 'Pending'
      }]);

      if (insertError) throw insertError;

      setFormStatus({ type: 'success', text: t.complaint_success });
      setMessage('');
      setFile(null);
      
      // Refresh list and close form after a short delay
      setTimeout(() => {
        setIsFormOpen(false);
        setFormStatus({ type: null, text: '' });
        fetchComplaints();
      }, 2000);

    } catch (err: any) {
      setFormStatus({ type: 'error', text: t.error_occurred });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status: ComplaintStatus) => {
    switch (status) {
      case 'Pending': 
        return { label: lang === 'ar' ? 'قيد المراجعة' : 'Pending', icon: <Clock size={14} />, color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'Resolved': 
        return { label: lang === 'ar' ? 'تم الحل' : 'Resolved', icon: <CheckCircle2 size={14} />, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'Rejected': 
        return { label: lang === 'ar' ? 'مرفوضة' : 'Rejected', icon: <AlertCircle size={14} />, color: 'bg-red-100 text-red-700 border-red-200' };
      default: 
        return { label: 'Unknown', icon: <Info size={14} />, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className="bg-red-600 p-2.5 rounded-2xl text-white shadow-lg">
            <MessageSquareWarning size={22} />
          </div>
          <span className="font-black text-slate-900 text-xl tracking-tight">{t.nav_complaints}</span>
        </div>
        
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center justify-center w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-md active:scale-95"
            aria-label={t.new_complaint}
          >
            <Plus size={20} />
          </button>
          <button onClick={toggleLanguage} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
            <Languages size={18} />
          </button>
        </div>
      </nav>

      {previewImage && (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setPreviewImage(null)}>
           <X className="absolute top-6 right-6 text-white cursor-pointer" size={32} />
           <img src={previewImage} className="max-w-full max-h-full rounded-3xl shadow-2xl" alt="Proof Preview" />
        </div>
      )}

      {/* Form Slide-up Drawer */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300">
            {/* Drawer Handle for Mobile */}
            <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>
            
            <div className={`px-6 py-4 border-b border-slate-50 flex items-center justify-between ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="bg-red-50 p-2.5 rounded-2xl text-red-600"><Plus size={24} /></div>
                <h2 className="text-xl font-black text-slate-900">{t.new_complaint}</h2>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmitComplaint} className="p-8 space-y-6 overflow-y-auto max-h-[80vh] sm:max-h-none">
              {formStatus.type && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border animate-in fade-in duration-300 ${
                  formStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                }`} dir={isRtl ? 'rtl' : 'ltr'}>
                  {formStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {formStatus.text}
                </div>
              )}

              <div className={`space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                <label className="block text-sm font-black text-slate-700 px-1">{t.complaint_desc}</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.placeholder_complaint}
                  className={`w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-black font-bold h-40 resize-none ${isRtl ? 'text-right' : 'text-left'}`}
                />
              </div>

              <div className={`space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                <label className="block text-sm font-black text-slate-700 px-1">{t.attach_proof}</label>
                <label className={`flex items-center justify-center w-full p-6 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
                  file ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-red-400'
                }`}>
                  <div className="flex flex-col items-center text-center">
                    {file ? <CheckCircle2 className="text-emerald-500 mb-2" size={24} /> : <Upload className="text-slate-300 mb-2" size={24} />}
                    <span className={`text-xs font-black ${file ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {file ? file.name : (isRtl ? 'رفع صورة' : 'Upload Image')}
                    </span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || !message}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-xl active:scale-95"
              >
                {submitting ? <Loader2 className="animate-spin" size={22} /> : (
                  <>
                    <span>{t.send_complaint}</span>
                    <Send size={18} className={isRtl ? 'rotate-180' : ''} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto p-6 md:p-12">
        <header className={`mb-10 ${isRtl ? 'text-right' : 'text-left'}`}>
          <h1 className="text-4xl font-black text-slate-900 mb-2">{t.complaints}</h1>
          <p className="text-slate-500 font-medium italic text-lg leading-relaxed">
            {lang === 'ar' ? 'هنا يمكنك متابعة حالة الشكاوى التي قمت بتقديمها.' : 'Track the status of your submitted complaints here.'}
          </p>
        </header>

        {loading && complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-slate-200">
            <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
            <p className="text-slate-500 font-black">{t.loading}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Integrated New Complaint Action Card */}
            <button 
              onClick={() => setIsFormOpen(true)}
              className={`w-full p-8 bg-red-50/50 border-2 border-dashed border-red-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 transition-all hover:bg-red-50 hover:border-red-400 group active:scale-[0.98] ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}
            >
              <div className="bg-white p-4 rounded-2xl text-red-600 shadow-sm group-hover:scale-110 transition-transform">
                <Plus size={32} strokeWidth={3} />
              </div>
              <div className={`text-center ${isRtl ? 'md:text-right' : 'md:text-left'}`}>
                <h3 className="text-lg font-black text-red-800">{t.new_complaint}</h3>
                <p className="text-red-600 font-bold text-sm opacity-70">{t.complaint_cta}</p>
              </div>
            </button>

            {complaints.length > 0 ? (
              <div className="space-y-6">
                {complaints.map((c) => {
                  const status = getStatusConfig(c.status);
                  return (
                    <div key={c.id} className={`bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all animate-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row ${isRtl ? 'text-right' : 'text-left'}`}>
                      <div className={`w-full md:w-3 flex items-center justify-center ${status.color.split(' ')[0]}`}></div>
                      <div className="p-8 flex-1" dir={isRtl ? 'rtl' : 'ltr'}>
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                          <div className="flex items-center gap-4">
                            <span className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${status.color}`}>
                              {status.icon} {status.label}
                            </span>
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                              <Calendar size={12} />
                              {new Date(c.created_at).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'en-US')}
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-slate-300">#{c.id.slice(0, 8)}</span>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{lang === 'ar' ? 'مضمون الشكوى' : 'Complaint Content'}</label>
                            <p className="text-lg font-bold text-slate-800 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                              {c.message}
                            </p>
                          </div>

                          {c.admin_notes && (
                            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                              <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">{lang === 'ar' ? 'رد الإدارة' : 'Admin Response'}</label>
                              <p className="text-sm font-bold text-indigo-900 italic">
                                {c.admin_notes}
                              </p>
                            </div>
                          )}

                          {c.proof_url && (
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{lang === 'ar' ? 'المرفقات' : 'Attachments'}</label>
                              <div 
                                className="relative w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer group"
                                onClick={() => setPreviewImage(c.proof_url!)}
                              >
                                <img src={c.proof_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Proof Thumbnail" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Maximize2 className="text-white" size={20} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserComplaints;

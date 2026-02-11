
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquareWarning, 
  ChevronLeft, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  X,
  Maximize2,
  Info
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';

interface UserComplaintsProps { user: User; }

const UserComplaints: React.FC<UserComplaintsProps> = ({ user }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const getStatusConfig = (status: ComplaintStatus) => {
    switch (status) {
      case 'Pending': 
        return { label: 'قيد المراجعة', icon: <Clock size={14} />, color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'Resolved': 
        return { label: 'تم الحل', icon: <CheckCircle2 size={14} />, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'Rejected': 
        return { label: 'مرفوضة', icon: <AlertCircle size={14} />, color: 'bg-red-100 text-red-700 border-red-200' };
      default: 
        return { label: 'غير محدد', icon: <Info size={14} />, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 text-right" dir="rtl">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
            <ChevronLeft size={24} className="rotate-180" />
          </Link>
          <div className="bg-red-600 p-2.5 rounded-2xl text-white shadow-lg">
            <MessageSquareWarning size={22} />
          </div>
          <span className="font-black text-slate-900 text-xl tracking-tight hidden sm:inline">سجل الشكاوى</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">متابعة البلاغات</p>
            <p className="text-slate-900 font-bold text-xs">{user.email}</p>
          </div>
        </div>
      </nav>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setPreviewImage(null)}>
           <X className="absolute top-6 right-6 text-white cursor-pointer" size={32} />
           <img src={previewImage} className="max-w-full max-h-full rounded-3xl shadow-2xl" alt="Proof Preview" />
        </div>
      )}

      <main className="max-w-4xl mx-auto p-6 md:p-12">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2">شكواتي</h1>
          <p className="text-slate-500 font-medium italic text-lg leading-relaxed">
            هنا يمكنك متابعة حالة الشكاوى التي قمت بتقديمها. نحن نهتم بكل تفاصيل مشكلتك.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-slate-200">
            <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
            <p className="text-slate-500 font-black">جاري تحميل بلاغاتك...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center">
            <div className="bg-slate-50 p-10 rounded-full mb-8 text-slate-200">
              <MessageSquareWarning size={80} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">ليس لديك أي شكاوى حالياً</h3>
            <p className="text-slate-500 font-bold max-w-sm">
              يسعدنا أنك لا تواجه أي مشاكل! إذا واجهتك مشكلة مستقبلاً يمكنك الضغط على زر "مركز الشكاوى" في الأسفل.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {complaints.map((c) => {
              const status = getStatusConfig(c.status);
              return (
                <div key={c.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all animate-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row">
                  {/* Status Sidebar */}
                  <div className={`w-full md:w-3 flex items-center justify-center ${status.color.split(' ')[0]}`}></div>
                  
                  <div className="p-8 flex-1">
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <span className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                          <Calendar size={12} />
                          {new Date(c.created_at).toLocaleDateString('ar-DZ')}
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-300">#{c.id.slice(0, 8)}</span>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">رسالة الشكوى</label>
                        <p className="text-lg font-bold text-slate-800 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                          {c.message}
                        </p>
                      </div>

                      {c.admin_notes && (
                        <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                          <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">رد الإدارة</label>
                          <p className="text-sm font-bold text-indigo-900 italic">
                            {c.admin_notes}
                          </p>
                        </div>
                      )}

                      {c.proof_url && (
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">الصورة المرفقة</label>
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
        )}

        <footer className="mt-20 py-8 text-center">
           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Wassit DZ Complaint Tracking</p>
        </footer>
      </main>
    </div>
  );
};

export default UserComplaints;

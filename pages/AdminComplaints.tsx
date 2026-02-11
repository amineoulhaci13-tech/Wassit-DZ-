
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  RefreshCcw, 
  Loader2, 
  Save, 
  MessageSquareWarning, 
  Calendar, 
  X, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft,
  User as UserIcon,
  ExternalLink
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';

interface AdminComplaintsProps { user: User; }

const AdminComplaints: React.FC<AdminComplaintsProps> = ({ user }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Resolved' | 'Rejected'>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
  const [localStatus, setLocalStatus] = useState<Record<string, ComplaintStatus>>({});

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      // Ensuring we fetch ALL complaints from the table without any filters
      const { data: complaintsData, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Admin Complaints fetched from Supabase:', complaintsData);

      // Enhance complaints with user details from the orders table
      const enriched = await Promise.all((complaintsData || []).map(async (c) => {
        try {
          const { data: userData } = await supabase
            .from('orders')
            .select('user_email, phone_number')
            .eq('user_id', c.user_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...c,
            user_email: userData?.user_email || 'مستخدم غير معروف',
            user_phone: userData?.phone_number || ''
          };
        } catch (e) {
          return {
            ...c,
            user_email: 'مستخدم غير معروف',
            user_phone: ''
          };
        }
      }));

      setComplaints(enriched);
      
      const notes: Record<string, string> = {};
      const statuses: Record<string, ComplaintStatus> = {};
      enriched.forEach(c => {
        notes[c.id] = c.admin_notes || '';
        statuses[c.id] = c.status;
      });
      setLocalNotes(notes);
      setLocalStatus(statuses);
    } catch (err) {
      console.error('Admin Fetch Complaints Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleSaveUpdate = async (id: string) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('complaints')
      .update({ 
        status: localStatus[id],
        admin_notes: localNotes[id]
      })
      .eq('id', id);

    if (!error) {
      showToast('تم حفظ التغييرات بنجاح');
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: localStatus[id], admin_notes: localNotes[id] } : c));
    } else {
      console.error("Complaint Update error:", error);
    }
    setUpdatingId(null);
  };

  const showToast = (m: string) => { 
    setSuccessMsg(m); 
    setTimeout(() => setSuccessMsg(null), 3000); 
  };

  const formatWhatsApp = (p: string) => p ? `https://wa.me/${p.replace(/\D/g, '').replace(/^0/, '213')}` : null;

  const filtered = complaints.filter(c => {
    if (filter === 'All') return true;
    return c.status === filter;
  });

  const getStatusStyle = (s: ComplaintStatus) => {
    switch(s) {
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200 label:قيد المراجعة';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200 label:تم الحل';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200 label:مرفوضة';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 label:غير محدد';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 text-right" dir="rtl">
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
            <ChevronLeft size={24} className="rotate-180" />
          </Link>
          <div className="bg-red-600 p-2.5 rounded-2xl text-white shadow-lg"><MessageSquareWarning size={22} /></div>
          <div><h1 className="font-black text-slate-900 text-xl tracking-tight leading-none">إدارة الشكاوى</h1></div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchComplaints} className="p-2 text-slate-400 hover:text-indigo-600"><RefreshCcw size={20} className={loading ? 'animate-spin' : ''}/></button>
          <button onClick={() => supabase.auth.signOut()} className="text-slate-600 hover:text-red-600 font-bold text-sm bg-slate-100 px-4 py-2 rounded-xl transition-all">خروج</button>
        </div>
      </nav>

      {successMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-8 py-3 rounded-2xl shadow-2xl font-black animate-in slide-in-from-top-4">
          {successMsg}
        </div>
      )}
      
      {previewImage && (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setPreviewImage(null)}>
           <X className="absolute top-6 right-6 text-white cursor-pointer" size={32} />
           <img src={previewImage} className="max-w-full max-h-full rounded-3xl shadow-2xl border-4 border-white/10" alt="Full Preview" />
        </div>
      )}

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">إدارة كافة بلاغات الزبائن ({complaints.length})</h2>
          
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            {(['All', 'Pending', 'Resolved', 'Rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap ${
                  filter === f ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {f === 'All' ? 'الكل' : f === 'Pending' ? 'قيد المراجعة' : f === 'Resolved' ? 'تم الحل' : 'مرفوضة'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {loading && complaints.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-slate-200">
              <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
              <p className="font-bold text-slate-400">جاري تحميل الشكاوى...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
               <MessageSquareWarning size={64} className="mx-auto text-slate-200 mb-6" />
               <h3 className="text-xl font-black text-slate-400">لا توجد شكاوى حالياً</h3>
            </div>
          ) : (
            filtered.map(c => {
              const currentSt = getStatusStyle(c.status).split(' label:');
              const whatsapp = formatWhatsApp(c.user_phone || '');

              return (
                <div key={c.id} className={`bg-white rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all flex flex-col overflow-hidden border-r-8 animate-in slide-in-from-bottom-4 duration-500 ${
                  c.status === 'Pending' ? 'border-r-amber-400' : c.status === 'Resolved' ? 'border-r-emerald-400' : 'border-r-red-400'
                }`}>
                  {/* Header */}
                  <div className="p-8 border-b border-slate-50 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <span className={`px-5 py-2 rounded-full text-[11px] font-black border ${currentSt[0]}`}>{currentSt[1]}</span>
                      <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold"><Calendar size={14} /> {new Date(c.created_at).toLocaleString('ar-DZ')}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">صاحب الشكوى</p>
                        <p className="text-slate-900 font-bold text-xs">{c.user_email}</p>
                      </div>
                      <div className="bg-slate-100 p-2.5 rounded-2xl text-slate-400"><UserIcon size={20} /></div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-8 space-y-8 flex-1">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest">مضمون الشكوى</label>
                      <p className="text-xl font-bold text-slate-800 leading-relaxed bg-red-50/20 p-6 rounded-[2rem] border border-red-100/50">
                        {c.message}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      {/* Proof Image */}
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">المرفقات / الإثبات</label>
                        {c.proof_url ? (
                          <div className="cursor-pointer group relative rounded-[2rem] overflow-hidden aspect-video border-2 border-slate-100" onClick={() => setPreviewImage(c.proof_url!)}>
                            <img src={c.proof_url} className="w-full h-full object-cover group-hover:scale-105 transition-all group-hover:brightness-50" alt="Proof" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="bg-white text-slate-900 px-4 py-2 rounded-xl font-black text-xs">عرض كامل</span>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center text-slate-300 font-bold text-xs">لا يوجد إثبات</div>
                        )}
                      </div>

                      {/* Notes and WhatsApp */}
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">ملاحظات الإدارة</label>
                          <textarea
                            value={localNotes[c.id] || ''}
                            onChange={(e) => setLocalNotes(p => ({...p, [c.id]: e.target.value}))}
                            placeholder="اكتب ملاحظات المعالجة هنا..."
                            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
                          />
                        </div>

                        {whatsapp && (
                          <a 
                            href={whatsapp} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                          >
                            <MessageCircle size={20} />
                            تواصل عبر واتساب
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-8 bg-slate-50 border-t border-slate-100">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex items-center gap-3 flex-1 w-full overflow-x-auto">
                        <label className="text-xs font-black text-slate-400 whitespace-nowrap">الحالة:</label>
                        <div className="flex gap-2">
                          {(['Pending', 'Resolved', 'Rejected'] as ComplaintStatus[]).map(statusOption => (
                            <button
                              key={statusOption}
                              onClick={() => setLocalStatus(p => ({...p, [c.id]: statusOption}))}
                              className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all border whitespace-nowrap ${
                                localStatus[c.id] === statusOption 
                                  ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                                  : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                              }`}
                            >
                              {statusOption === 'Pending' ? 'مراجعة' : statusOption === 'Resolved' ? 'تم الحل' : 'مرفوضة'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={() => handleSaveUpdate(c.id)}
                        disabled={updatingId === c.id}
                        className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-red-100 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {updatingId === c.id ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        حفظ التعديلات
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminComplaints;

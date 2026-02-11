
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { Order, OrderStatus } from '../types';
import { 
  ShieldAlert, LogOut, ShoppingBag, Search, ExternalLink, RefreshCcw, CheckCircle2, 
  Loader2, Truck, Save, Check, FileText, Image as ImageIcon, MapPin, Phone, 
  MessageCircle, Calendar, Maximize2, X, MessageSquareWarning
} from 'lucide-react';

interface AdminProps { user: User; }

const Admin: React.FC<AdminProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Ensuring we fetch ALL orders without any user filters
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log('Admin Orders fetched from Supabase:', data);
      
      setOrders(data || []);
      const inputs: Record<string, string> = {};
      data?.forEach(order => inputs[order.id] = order.tracking_number || '');
      setTrackingInputs(inputs);
    } catch (err) {
      console.error('Admin Fetch Orders Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const channel = supabase.channel('admin-ch').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  const handleStatusChange = async (id: string, s: OrderStatus) => {
    setUpdatingId(id);
    const { error } = await supabase.from('orders').update({ status: s }).eq('id', id);
    if (!error) showToast('تم تحديث الحالة');
    setUpdatingId(null);
  };

  const handleTrackingUpdate = async (id: string) => {
    setUpdatingId(id);
    const { error } = await supabase.from('orders').update({ tracking_number: trackingInputs[id], status: trackingInputs[id] ? 'Shipped' : undefined }).eq('id', id);
    if (!error) showToast('تم حفظ التتبع');
    setUpdatingId(null);
  };

  const showToast = (m: string) => { setSuccessMsg(m); setTimeout(() => setSuccessMsg(null), 3000); };
  const formatWhatsApp = (p: string) => `https://wa.me/${p.replace(/\D/g, '').replace(/^0/, '213')}`;

  const filtered = orders.filter(o => o.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) || o.wilaya?.includes(searchTerm) || o.phone_number?.includes(searchTerm));

  const getStatusStyle = (s: OrderStatus) => {
    switch(s) {
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200 label:إنتظار';
      case 'Paid': return 'bg-blue-50 text-blue-700 border-blue-200 label:مدفوع';
      case 'Purchased': return 'bg-purple-50 text-purple-700 border-purple-200 label:تم الشراء';
      case 'Shipped': return 'bg-emerald-50 text-emerald-700 border-emerald-200 label:تم الشحن';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 label:' + s;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 text-right" dir="rtl">
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-lg"><ShieldAlert size={22} /></div>
          <div><h1 className="font-black text-slate-900 text-xl tracking-tight leading-none">إدارة Wassit DZ</h1></div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/admin/complaints" className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-black text-xs hover:bg-red-100 transition-colors">
            <MessageSquareWarning size={16} />
            إدارة الشكاوى
          </Link>
          <button onClick={fetchOrders} className="p-2 text-slate-400 hover:text-indigo-600"><RefreshCcw size={20} className={loading ? 'animate-spin' : ''}/></button>
          <button onClick={() => supabase.auth.signOut()} className="text-slate-600 hover:text-red-600 font-bold text-sm bg-slate-100 px-4 py-2 rounded-xl transition-all">خروج</button>
        </div>
      </nav>

      {successMsg && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-8 py-3 rounded-2xl shadow-2xl font-black">{successMsg}</div>}
      
      {previewImage && (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setPreviewImage(null)}>
           <X className="absolute top-6 right-6 text-white cursor-pointer" size={32} />
           <img src={previewImage} className="max-w-full max-h-full rounded-xl shadow-2xl" />
        </div>
      )}

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">إدارة الطلبات ({orders.length})</h2>
          <div className="relative w-full md:w-96">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="بحث..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && orders.length === 0 ? <Loader2 className="animate-spin mx-auto col-span-full" size={48} /> : filtered.map(o => {
            const st = getStatusStyle(o.status).split(' label:');
            return (
              <div key={o.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-start">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${st[0]}`}>{st[1]}</span>
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold"><Calendar size={12} /> {new Date(o.created_at).toLocaleDateString('ar-DZ')}</div>
                </div>
                <div className="p-6 bg-slate-50/50 space-y-4 text-right">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-slate-700 flex items-center gap-2"><MapPin size={16} className="text-indigo-600"/>{o.wilaya}</span>
                    <a href={formatWhatsApp(o.phone_number)} target="_blank" className="bg-emerald-500 text-white p-2 px-4 rounded-xl text-[10px] font-black flex items-center gap-2"><MessageCircle size={14}/> تواصل</a>
                  </div>
                  <p className="font-bold text-xs text-slate-500 truncate">{o.user_email}</p>
                </div>
                <div className="p-6 space-y-6 flex-1">
                   <div className="flex gap-4 items-center">
                      <img src={o.screenshot_url} className="w-16 h-16 rounded-2xl object-cover cursor-pointer hover:scale-105 transition-transform" onClick={() => setPreviewImage(o.screenshot_url)}/>
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-black text-slate-400">المنتج:</span><a href={o.product_url} target="_blank" className="text-indigo-600"><ExternalLink size={14} /></a></div>
                         <p className="text-xs font-bold text-slate-900 truncate">{o.color} • {o.size}</p>
                      </div>
                   </div>
                   <div className="bg-slate-900 rounded-2xl p-4 text-white flex justify-between items-center shadow-lg">
                      <span className="text-[10px] font-black text-indigo-400">السعر الإجمالي</span>
                      <span className="text-lg font-black">{o.total_price_dzd?.toLocaleString()} دج</span>
                   </div>
                   {o.payment_proof_url ? (
                     <div className="cursor-pointer group" onClick={() => setPreviewImage(o.payment_proof_url!)}>
                       <img src={o.payment_proof_url} className="w-full h-24 object-cover rounded-2xl border border-emerald-100 group-hover:brightness-75 transition-all" />
                       <p className="text-[10px] font-black text-center mt-2 text-emerald-600">عرض وصل الدفع</p>
                     </div>
                   ) : <div className="h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-center items-center justify-center text-[10px] text-slate-400 font-bold">لم يرفع الوصل</div>}
                </div>
                <div className="p-6 pt-0 space-y-4 mt-auto">
                   <div className="flex gap-2">
                     <input type="text" value={trackingInputs[o.id] || ''} onChange={e => setTrackingInputs(p => ({...p, [o.id]: e.target.value}))} className="flex-1 bg-slate-50 border rounded-xl px-4 py-2 text-xs font-black outline-none font-mono" placeholder="رقم التتبع" />
                     <button onClick={() => handleTrackingUpdate(o.id)} className="bg-indigo-600 text-white p-2 rounded-xl"><Save size={18}/></button>
                   </div>
                   <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value as OrderStatus)} className="w-full bg-white border rounded-xl px-4 py-2.5 text-xs font-black outline-none cursor-pointer">
                      <option value="Pending">إنتظار</option>
                      <option value="Paid">مدفوع</option>
                      <option value="Purchased">تم الشراء</option>
                      <option value="Shipped">تم الشحن</option>
                   </select>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Admin;

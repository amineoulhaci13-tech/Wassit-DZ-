
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { Order, OrderStatus } from '../types';
import { 
  ShieldAlert, 
  LogOut, 
  ShoppingBag, 
  Search, 
  ExternalLink, 
  RefreshCcw,
  CheckCircle2,
  Loader2,
  Truck,
  Save,
  Check,
  FileText,
  Image as ImageIcon,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  DollarSign,
  Maximize2,
  X
} from 'lucide-react';

interface AdminProps {
  user: User;
}

const Admin: React.FC<AdminProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      
      const inputs: Record<string, string> = {};
      data?.forEach(order => {
        inputs[order.id] = order.tracking_number || '';
      });
      setTrackingInputs(inputs);
    } catch (err: any) {
      console.error('Admin Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('admin-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      showToast('تم تحديث الحالة');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTrackingUpdate = async (orderId: string) => {
    const trackingNum = trackingInputs[orderId];
    setUpdatingId(orderId);
    try {
      const { error } = await supabase.from('orders').update({ 
        tracking_number: trackingNum,
        status: trackingNum ? 'Shipped' : undefined
      }).eq('id', orderId);
      if (error) throw error;
      showToast('تم حفظ رقم التتبع');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const filteredOrders = orders.filter(order => 
    order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.wilaya?.includes(searchTerm) ||
    order.phone_number?.includes(searchTerm)
  );

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'إنتظار' };
      case 'Paid': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'مدفوع' };
      case 'Purchased': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'تم الشراء' };
      case 'Shipped': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'تم الشحن' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: status };
    }
  };

  const formatWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '').replace(/^0/, '213');
    return `https://wa.me/${cleaned}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 text-right" dir="rtl">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-lg">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-xl tracking-tight">لوحة الإدارة</h1>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none mt-1">Wassit DZ Control Panel</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={fetchOrders} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-bold text-sm bg-slate-100 px-4 py-2 rounded-xl transition-all">
            <LogOut size={18} />
            <span className="hidden md:inline">خروج</span>
          </button>
        </div>
      </nav>

      {successMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4">
          <div className="bg-emerald-600 text-white px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-black">
            <Check size={20} />
            {successMsg}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={32} />
          </button>
          <img src={previewImage} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95" />
        </div>
      )}

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        {/* Search & Stats Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="text-right">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">إدارة الطلبات</h2>
            <p className="text-slate-500 font-bold">توجد حالياً {orders.length} طلبات مسجلة في المنصة.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ابحث بالبريد، الولاية، أو الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all font-bold text-sm"
            />
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && orders.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center gap-4 text-slate-400">
              <Loader2 className="animate-spin" size={48} />
              <p className="font-black text-xl">جاري تحميل البيانات...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
               <ShoppingBag size={64} className="mx-auto text-slate-200 mb-4" />
               <p className="text-xl font-black text-slate-400">لا توجد طلبات مطابقة للبحث</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const status = getStatusConfig(order.status);
              return (
                <div key={order.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col group overflow-hidden">
                  {/* Card Header */}
                  <div className="p-6 border-b border-slate-50">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${status.bg} ${status.text} ${status.border}`}>
                        {status.label}
                      </span>
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                        <Calendar size={12} />
                        {new Date(order.created_at).toLocaleDateString('ar-DZ')}
                      </div>
                    </div>
                    <h3 className="text-slate-900 font-black text-sm truncate" title={order.user_email}>
                      {order.user_email}
                    </h3>
                  </div>

                  {/* Customer Info Section */}
                  <div className="p-6 bg-slate-50/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                          <MapPin size={16} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{order.wilaya}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <a 
                          href={formatWhatsApp(order.phone_number)} 
                          target="_blank" 
                          rel="noreferrer"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-xl transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 text-[10px] font-black px-3"
                         >
                           <MessageCircle size={14} />
                           تواصل
                         </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-200 p-2 rounded-xl text-slate-500">
                        <Phone size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-900 font-mono tracking-wider">{order.phone_number}</span>
                    </div>
                  </div>

                  {/* Product Details Section */}
                  <div className="p-6 space-y-6 flex-1">
                    <div className="flex gap-4 items-start">
                      <div className="relative group/img cursor-pointer" onClick={() => setPreviewImage(order.screenshot_url)}>
                        <img src={order.screenshot_url} alt="Prod" className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                          <Maximize2 size={16} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] font-black text-slate-400 uppercase">المنتج:</span>
                           <a href={order.product_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline"><ExternalLink size={14} /></a>
                         </div>
                         <p className="text-xs font-bold text-slate-900 truncate">{order.color} • {order.size}</p>
                      </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">السعر الإجمالي (دج)</span>
                        <span className="text-xl font-black tracking-tight">{order.total_price_dzd?.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Receipt Section */}
                    <div className="pt-4 border-t border-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">وصل الدفع (الوصل)</p>
                      {order.payment_proof_url ? (
                        <div className="relative group/receipt cursor-pointer" onClick={() => setPreviewImage(order.payment_proof_url!)}>
                          <img src={order.payment_proof_url} alt="Receipt" className="w-full h-24 object-cover rounded-2xl border border-emerald-100 shadow-sm" />
                          <div className="absolute inset-0 bg-emerald-600/10 group-hover/receipt:bg-emerald-600/30 flex items-center justify-center rounded-2xl transition-all">
                             <div className="bg-white/90 backdrop-blur-sm p-2 rounded-xl text-emerald-600 shadow-sm">
                               <FileText size={20} />
                             </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 text-slate-400">
                           <ImageIcon size={24} className="opacity-20" />
                           <span className="text-[10px] font-bold">لم يتم رفع الوصل بعد</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="p-6 pt-0 mt-auto space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase mr-1">تحديث رقم التتبع</label>
                       <div className="flex gap-2">
                          <input 
                            type="text"
                            value={trackingInputs[order.id] || ''}
                            onChange={(e) => setTrackingInputs(p => ({ ...p, [order.id]: e.target.value }))}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-wider"
                            placeholder="Tracking Number"
                          />
                          <button 
                            onClick={() => handleTrackingUpdate(order.id)}
                            disabled={updatingId === order.id}
                            className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                          >
                            <Save size={18} />
                          </button>
                       </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        disabled={updatingId === order.id}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black outline-none cursor-pointer hover:border-indigo-500 transition-colors"
                      >
                        <option value="Pending">حالة الطلب: إنتظار</option>
                        <option value="Paid">حالة الطلب: مدفوع</option>
                        <option value="Purchased">حالة الطلب: تم الشراء</option>
                        <option value="Shipped">حالة الطلب: تم الشحن</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <footer className="text-center py-12 border-t border-slate-200">
         <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Wassit DZ Administrator Panel • Secure Logistics Control</p>
      </footer>
    </div>
  );
};

export default Admin;

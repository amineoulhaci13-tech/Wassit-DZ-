
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { useLanguage } from '../context/LanguageContext';
import { Order, OrderStatus } from '../types';
import { 
  ShoppingBag, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Package, 
  ExternalLink, 
  Plus, 
  Calendar,
  Loader2,
  Languages,
  Info,
  Hash,
  ArrowRight
} from 'lucide-react';

interface OrdersHistoryProps {
  user: User;
}

const OrdersHistory: React.FC<OrdersHistoryProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, lang, toggleLanguage, isRtl } = useLanguage();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': 
        return { label: lang === 'ar' ? 'قيد الانتظار' : 'Pending', icon: <Clock size={14} />, color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'Paid': 
        return { label: lang === 'ar' ? 'تم الدفع' : 'Paid', icon: <CheckCircle2 size={14} />, color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'Purchased': 
        return { label: lang === 'ar' ? 'تم الشراء' : 'Purchased', icon: <Package size={14} />, color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'Shipped': 
        return { label: lang === 'ar' ? 'تم الشحن' : 'Shipped', icon: <Truck size={14} />, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      default: 
        return { label: status, icon: <Clock size={14} />, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg">
            <ShoppingBag size={20} />
          </div>
          <span className="font-black text-slate-900 text-xl tracking-tight">{t.nav_orders}</span>
        </div>
        
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
          <button onClick={toggleLanguage} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 font-black text-xs">
            <Languages size={18} />
            <span className="hidden sm:inline">{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
          <button onClick={handleLogout} className="p-2.5 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <header className={`mb-10 flex flex-col md:flex-row justify-between items-center gap-6 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">{t.history}</h1>
            <p className="text-slate-500 font-medium italic">{lang === 'ar' ? 'استعرض جميع الطلبات التي قمت بتقديمها وحالاتها الحالية.' : 'Review all your past orders and their current status.'}</p>
          </div>
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3.5 rounded-2xl transition-all shadow-lg active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} />
            {lang === 'ar' ? 'إضافة طلب جديد' : 'New Order'}
          </Link>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
            <p className="text-slate-500 font-bold">{t.loading}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="bg-slate-50 p-8 rounded-full mb-6">
              <ShoppingBag size={64} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">{lang === 'ar' ? 'لا توجد طلبات بعد!' : 'No orders yet!'}</h3>
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl active:scale-95"
            >
              {lang === 'ar' ? 'اطلب الآن' : 'Order Now'}
              <ArrowRight size={20} className={isRtl ? 'rotate-180' : ''} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => {
              const status = getStatusConfig(order.status);
              const displayTotal = order.total_price_dzd || (order.price_dzd + (order.commission_dzd || 0));
              
              return (
                <div key={order.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img src={order.screenshot_url} alt="Product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4">
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md shadow-sm ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                    <a href={order.product_url} target="_blank" rel="noreferrer" className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-xl text-slate-900 hover:bg-indigo-600 hover:text-white transition-all shadow-lg">
                      <ExternalLink size={18} />
                    </a>
                  </div>

                  <div className="p-6 flex flex-col flex-1" dir={isRtl ? 'rtl' : 'ltr'}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={14} />
                        <span className="text-xs font-bold">{formatDate(order.created_at)}</span>
                      </div>
                      <div className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">#{order.id.slice(0, 5)}</div>
                    </div>

                    <div className="space-y-3 mb-4 flex-1">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-500">{t.color}:</span>
                        <span className="text-sm font-black text-slate-900">{order.color}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-500">{t.size}:</span>
                        <span className="text-sm font-black text-slate-900">{order.size}</span>
                      </div>
                      
                      <div className="pt-2">
                        {order.tracking_number ? (
                          <a 
                            href={`https://t.17track.net/en#nums=${order.tracking_number}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-col p-4 bg-indigo-600 text-white rounded-2xl border border-indigo-700 shadow-lg animate-in zoom-in-95 duration-300 hover:bg-indigo-700 transition-all group/track"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2 opacity-80">
                                <Hash size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ar' ? 'رقم التتبع' : 'Tracking Num'}</span>
                              </div>
                              <ExternalLink size={12} className="opacity-60 group-hover/track:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-lg font-black tracking-wider font-mono">{order.tracking_number}</span>
                          </a>
                        ) : (
                          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                            <Info size={16} className="shrink-0 text-slate-300" />
                            <span className="text-[11px] font-bold leading-tight">{lang === 'ar' ? 'سيظهر رقم التتبع فور معالجة الطلب' : 'Tracking available soon'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-auto">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase mb-1">
                             {t.total_due} <Info size={10} className="text-indigo-400" />
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900">{displayTotal.toLocaleString()}</span>
                            <span className="text-xs font-black text-indigo-600">{t.currency}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersHistory;
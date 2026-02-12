
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  LogOut, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Package, 
  RefreshCcw, 
  ExternalLink,
  History,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Wallet,
  Languages
} from 'lucide-react';
import OrderForm from '../components/OrderForm';
import { Order, OrderStatus } from '../types';

interface DashboardProps { user: User; }

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, lang, toggleLanguage, isRtl } = useLanguage();

  const fetchUserOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return <Clock size={14} className="text-amber-500" />;
      case 'Paid': return <CheckCircle2 size={14} className="text-blue-500" />;
      case 'Purchased': return <Package size={14} className="text-purple-500" />;
      case 'Shipped': return <Truck size={14} className="text-emerald-500" />;
      default: return <Clock size={14} />;
    }
  };

  const getStatusBg = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 border-amber-100 text-amber-700';
      case 'Paid': return 'bg-blue-50 border-blue-100 text-blue-700';
      case 'Purchased': return 'bg-purple-50 border-purple-100 text-purple-700';
      case 'Shipped': return 'bg-emerald-50 border-emerald-100 text-emerald-700';
      default: return 'bg-slate-50 border-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg">
            <PlusCircle size={22} />
          </div>
          <span className="font-black text-slate-900 text-xl tracking-tight">Wassit DZ</span>
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
        <header className={`mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{isRtl ? 'تسوق بكل أمان' : 'Shop Securely'}</h1>
            <p className="text-slate-500 font-medium text-lg italic">{isRtl ? 'اطلب منتجك من AliExpress وسنتولى نحن ضمان وصوله وجودته.' : 'Order from AliExpress and we will guarantee delivery and quality.'}</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-3 rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className={`px-4 ${isRtl ? 'text-right' : 'text-left'}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t.welcome}</p>
              <p className="text-slate-900 font-bold text-sm">{user.email}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { title: t.terms_link, icon: ShieldCheck, color: 'border-r-amber-400', bg: 'bg-amber-50', text: 'amber-600' },
            { title: t.payment_details, icon: Wallet, color: 'border-r-indigo-400', bg: 'bg-indigo-50', text: 'indigo-600' },
            { title: lang === 'ar' ? 'توصيل سريع' : 'Fast Shipping', icon: Truck, color: 'border-r-emerald-400', bg: 'bg-emerald-50', text: 'emerald-600' }
          ].map((item, idx) => (
            <div key={idx} className={`bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 border-r-4 ${item.color} ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`${item.bg} p-3 rounded-2xl text-${item.text}`}><item.icon size={24} /></div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <h4 className="font-black text-slate-900 text-sm">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <section className="lg:col-span-7">
            <OrderForm user={user} onSuccess={fetchUserOrders} />
          </section>

          <section className="lg:col-span-5 space-y-6">
            <div className={`flex items-center justify-between mb-2 px-1 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`flex items-center gap-2 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                <ShoppingBag size={20} className="text-indigo-600" />
                <h2 className="text-xl font-black text-slate-900">{isRtl ? 'أحدث الطلبات' : 'Recent Orders'}</h2>
              </div>
              <Link to="/history" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                {isRtl ? 'عرض الكل' : 'View All'} <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''} />
              </Link>
            </div>

            <div className="space-y-4">
              {loading && orders.length === 0 ? (
                <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 flex flex-col items-center gap-3 text-slate-400">
                  <RefreshCcw className="animate-spin" size={32} />
                  <p className="font-bold">{t.loading}</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center gap-3 text-slate-400 text-center">
                  <ShoppingBag size={48} className="opacity-10 mb-2" />
                  <p className="font-bold text-slate-400">{isRtl ? 'لا توجد طلبات سابقة' : 'No orders found'}</p>
                </div>
              ) : (
                <>
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                      <div className={`flex gap-4 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                        <img src={order.screenshot_url} alt="Product" className="w-16 h-16 rounded-2xl object-cover border border-slate-100 flex-shrink-0" />
                        <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                          <div className={`flex justify-between items-start mb-1 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1 ${getStatusBg(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                            <p className="text-[10px] font-bold text-slate-400 font-mono">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <h4 className="font-bold text-slate-900 truncate text-sm mb-1">{order.color} • {order.size}</h4>
                          <div className={`flex justify-between items-end ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                             <p className="font-black text-indigo-600 text-base">{order.price_dzd.toLocaleString()} <span className="text-[10px]">DZD</span></p>
                             <a href={order.product_url} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-indigo-600 transition-colors">
                               <ExternalLink size={14} />
                             </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link to="/history" className="flex items-center justify-center w-full py-4 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-600 font-black text-xs transition-all gap-2">
                    {isRtl ? 'عرض كامل السجل' : 'Full History'} <History size={16} />
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
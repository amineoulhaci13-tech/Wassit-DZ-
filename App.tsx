
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import OrdersHistory from './pages/OrdersHistory';
import Checkout from './pages/Checkout';
import { ShieldAlert, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(!isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (err) {
        console.error("Auth Init Error:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-500 font-bold">Wassit DZ Loading...</p>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4" dir="rtl">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl text-center border border-red-100">
          <ShieldAlert className="text-red-500 mx-auto mb-6" size={48} />
          <h2 className="text-2xl font-black text-slate-900 mb-4">خطأ في الإعدادات</h2>
          <p className="text-slate-500 font-bold">يرجى ضبط مفاتيح Supabase في ملف .env للمتابعة.</p>
        </div>
      </div>
    );
  }

  const isAdmin = session?.user?.email === 'amineoulhaci11@gmail.com';

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={session ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} /> : <Login />} />
        <Route path="/login" element={session ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} /> : <Login />} />
        <Route path="/dashboard" element={session ? <Dashboard user={session.user} /> : <Navigate to="/login" />} />
        <Route path="/history" element={session ? <OrdersHistory user={session.user} /> : <Navigate to="/login" />} />
        <Route path="/checkout/:orderId" element={session ? <Checkout user={session.user} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isAdmin ? <Admin user={session.user} /> : <Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;

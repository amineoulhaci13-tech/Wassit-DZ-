
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import OrdersHistory from './pages/OrdersHistory';
import Checkout from './pages/Checkout';
import { ShieldAlert } from 'lucide-react';

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
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
      } catch (err: any) {
        console.error("Supabase Auth Initialization Error:", err);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-medium">جاري تهيئة التطبيق...</p>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 font-sans text-right" dir="rtl">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-red-100 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-red-50 text-red-600 rounded-2xl mb-6 mx-auto">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">خطأ في الإعدادات</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            لم يتم ضبط مفاتيح Supabase بشكل صحيح. يرجى التأكد من توفر SUPABASE_URL و SUPABASE_ANON_KEY.
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = session?.user?.email === 'amineoulhaci11@gmail.com';

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/" 
          element={session ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} /> : <Login />} 
        />
        <Route 
          path="/login" 
          element={session ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} /> : <Login />} 
        />
        <Route 
          path="/dashboard" 
          element={session ? <Dashboard user={session.user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/history" 
          element={session ? <OrdersHistory user={session.user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/checkout/:orderId" 
          element={session ? <Checkout user={session.user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin" 
          element={isAdmin ? <Admin user={session.user} /> : <Navigate to="/dashboard" />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;

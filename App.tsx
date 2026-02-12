
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { useLanguage } from './context/LanguageContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import AdminComplaints from './pages/AdminComplaints';
import UserComplaints from './pages/UserComplaints';
import OrdersHistory from './pages/OrdersHistory';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import AboutUs from './pages/AboutUs';
import BottomNav from './components/BottomNav';
import { ShieldAlert, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(!isSupabaseConfigured());
  const { t } = useLanguage();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (error.message.includes('Refresh Token Not Found') || error.status === 400) {
            await supabase.auth.signOut();
            setSession(null);
          }
        } else {
          setSession(session);
        }
      } catch (err) {
        console.error("Unexpected Auth Init Error:", err);
        await supabase.auth.signOut().catch(() => {});
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      if (event === 'SIGNED_OUT') {
        setSession(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-500 font-bold">{t.loading}</p>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl text-center border border-red-100">
          <ShieldAlert className="text-red-500 mx-auto mb-6" size={48} />
          <h2 className="text-2xl font-black text-slate-900 mb-4">Configuration Error</h2>
          <p className="text-slate-500 font-bold">Please configure Supabase keys in your environment.</p>
        </div>
      </div>
    );
  }

  const isAdmin = session?.user?.email === 'amineoulhaci11@gmail.com';
  const isAuth = !!session;

  return (
    <HashRouter>
      <div className={`${isAuth && !isAdmin ? "pb-20 md:pb-0" : ""}`}>
        <Routes>
          <Route path="/" element={session ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} /> : <Login />} />
          <Route path="/login" element={session ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} /> : <Login />} />
          <Route path="/dashboard" element={session ? <Dashboard user={session.user} /> : <Navigate to="/login" />} />
          <Route path="/history" element={session ? <OrdersHistory user={session.user} /> : <Navigate to="/login" />} />
          <Route path="/my-complaints" element={session ? <UserComplaints user={session.user} /> : <Navigate to="/login" />} />
          <Route path="/checkout/:orderId" element={session ? <Checkout user={session.user} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={session ? <Profile user={session.user} /> : <Navigate to="/login" />} />
          <Route path="/about-us" element={session ? <AboutUs /> : <Navigate to="/login" />} />
          <Route path="/admin" element={isAdmin ? <Admin user={session.user} /> : <Navigate to="/dashboard" />} />
          <Route path="/admin/complaints" element={isAdmin ? <AdminComplaints user={session.user} /> : <Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        {isAuth && !isAdmin && <BottomNav />}
      </div>
    </HashRouter>
  );
};

export default App;

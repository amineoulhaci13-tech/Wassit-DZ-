
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  PlusCircle, 
  ShoppingBag, 
  MessageSquareWarning, 
  User 
} from 'lucide-react';

const BottomNav: React.FC = () => {
  const { t, isRtl } = useLanguage();

  const navItems = [
    {
      to: '/dashboard',
      label: t.nav_home,
      icon: PlusCircle,
    },
    {
      to: '/history',
      label: t.nav_orders,
      icon: ShoppingBag,
    },
    {
      to: '/my-complaints',
      label: t.nav_complaints,
      icon: MessageSquareWarning,
    },
    {
      to: '/profile',
      label: t.nav_profile,
      icon: User,
    },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] z-50 px-4 pb-safe md:hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-md mx-auto flex items-center justify-between py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-300 relative
              ${isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`
                  transition-transform duration-300 
                  ${isActive ? '-translate-y-1 scale-110' : ''}
                `}>
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-black tracking-tight ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -top-1 w-1 h-1 bg-indigo-600 rounded-full animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;

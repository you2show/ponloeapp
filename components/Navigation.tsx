import { HugeiconsIcon } from '@hugeicons/react';
import { 
  DashboardSquare03Icon, 
  UserGroupIcon, 
  LibraryIcon, 
  SalahTimeIcon, 
  Quran01Icon, 
  RamadhanMonthIcon,
  Settings01Icon
} from '@hugeicons/core-free-icons';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ViewMode } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedLogo } from './AnimatedLogo';

interface NavigationProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView }) => {
  const { t } = useLanguage();
  const { profile, user } = useAuth();
  const [isHidden, setIsHidden] = React.useState(false);

  const isOwner = 
    profile?.username === 'ponloe' || 
    profile?.social_telegram?.includes('1276188382') ||
    user?.email === 'tg1276188382@ponloe.com';
  
  const isAdmin = isOwner || profile?.role === 'admin';

  React.useEffect(() => {
    const handleToggle = (e: any) => {
      setIsHidden(e.detail);
    };
    window.addEventListener('hide-mobile-nav', handleToggle);
    return () => window.removeEventListener('hide-mobile-nav', handleToggle);
  }, []);

  const getPathFromView = (view: ViewMode): string => {
    switch (view) {
      case ViewMode.HOME: return '/';
      case ViewMode.COMMUNITY: return '/community';
      case ViewMode.QURAN: return '/quran';
      case ViewMode.LIBRARY: return '/library';
      case ViewMode.PRAYER: return '/prayer';
      case ViewMode.CALENDAR: return '/calendar';
      case ViewMode.PROFILE: return '/profile';
      default: return '/';
    }
  };

  const desktopNavItems = [
    { mode: ViewMode.HOME, icon: DashboardSquare03Icon, label: t('nav.home'), path: '/' },
    { mode: ViewMode.COMMUNITY, icon: UserGroupIcon, label: t('nav.community'), path: '/community' },
    { mode: ViewMode.QURAN, icon: Quran01Icon, label: t('nav.quran'), path: '/quran' },
    { mode: ViewMode.LIBRARY, icon: LibraryIcon, label: t('nav.library'), path: '/library' },
    { mode: ViewMode.PRAYER, icon: SalahTimeIcon, label: t('nav.prayer'), path: '/prayer' },
    { mode: ViewMode.CALENDAR, icon: RamadhanMonthIcon, label: t('nav.calendar'), path: '/calendar' },
  ];

  const mobileNavItems = [
    { mode: ViewMode.HOME, icon: DashboardSquare03Icon, label: t('nav.home'), path: '/' },
    { mode: ViewMode.COMMUNITY, icon: UserGroupIcon, label: t('nav.community'), path: '/community' },
    { mode: ViewMode.QURAN, icon: Quran01Icon, label: t('nav.quran'), path: '/quran', isCenter: true },
    { mode: ViewMode.PRAYER, icon: SalahTimeIcon, label: t('nav.prayer'), path: '/prayer' },
    { mode: ViewMode.LIBRARY, icon: LibraryIcon, label: t('nav.library'), path: '/library' },
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col w-20 h-screen fixed left-0 top-0 bg-white border-r border-gray-200 z-40 items-center py-6 dark:bg-slate-900 dark:border-slate-800">
        <div className="mb-8 w-12 h-12 shrink-0 cursor-default select-none flex items-center justify-center">
          <AnimatedLogo className="w-10 h-10 drop-shadow-sm" loopInterval={7000} />
        </div>
        
        <nav className="flex-1 w-full px-2 space-y-2 flex flex-col items-center">
          {desktopNavItems.map((item) => (
            <NavLink
              key={item.mode}
              to={item.path}
              className={({ isActive }) => `w-full flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-600 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className="w-6 h-6" />
              <span className="text-[10px] font-bold text-center leading-tight font-khmer">{item.label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `w-full flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-600 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} className="w-6 h-6" />
              <span className="text-[10px] font-bold text-center leading-tight font-khmer">Admin</span>
            </NavLink>
          )}
        </nav>
      </aside>

      <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-transform duration-300 dark:bg-slate-900 dark:border-slate-800 dark:shadow-[0_-4px_20_rgba(0,0,0,0.2)] ${isHidden ? 'translate-y-full' : 'translate-y-0'}`}>
        <div className="flex justify-between items-end px-4 py-2">
          {mobileNavItems.map((item) => {
            if (item.isCenter) {
               return (
                 <NavLink
                   key={item.mode}
                   to={item.path!}
                   className={({ isActive }) => `relative -top-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 transition-transform active:scale-95 dark:shadow-emerald-900/20 ${
                     isActive 
                       ? 'bg-emerald-600 text-white ring-4 ring-emerald-50 dark:ring-slate-900' 
                       : 'bg-emerald-500 text-white'
                   }`}
                 >
                   <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className="w-7 h-7" />
                 </NavLink>
               )
            }
            
            return (
              <NavLink
                key={item.mode}
                to={item.path!}
                className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl min-w-[55px] transition-colors ${
                  isActive 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                {({ isActive }) => (
                  <>
                    <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className={`w-6 h-6 ${isActive ? 'fill-emerald-100 dark:fill-emerald-900/50' : ''}`} />
                    <span className="text-[10px] font-bold text-center leading-tight whitespace-nowrap font-khmer">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </>
  );
};

import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Menu01Icon, 
  Cancel01Icon, 
  UserMultipleIcon, 
  Settings01Icon,
  SparklesIcon,
  Logout01Icon,
  Moon01Icon,
  Sun01Icon,
  Home01Icon,
  Edit02Icon,
  ArrowUpRight01Icon,
  Shield01Icon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminProtection } from '@/hooks/useAdminProtection';

export const AdminLayout: React.FC = () => {
  const { isAdmin, isOwner, user, loading } = useAdminProtection();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const menuItems = [
    { path: '/admin', icon: Home01Icon, label: 'Dashboard', exact: true },
    { path: '/admin/content', icon: Edit02Icon, label: 'Content Management' },
    { path: '/admin/users', icon: UserMultipleIcon, label: 'User Management' },
    { path: '/admin/verification', icon: Shield01Icon, label: 'Verification Requests' },
    { path: '/admin/analytics', icon: ArrowUpRight01Icon, label: 'Analytics' },
    { path: '/admin/ai-assistant', icon: SparklesIcon, label: 'AI Assistant' },
    { path: '/admin/settings', icon: Settings01Icon, label: 'Settings' },
  ];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-screen transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } ${theme === 'dark' ? 'bg-slate-900 border-r border-slate-800' : 'bg-white border-r border-gray-200'} overflow-hidden`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <h1 className="text-2xl font-bold font-khmer text-emerald-600">Ponloe Admin</h1>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path, item.exact)
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : theme === 'dark'
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className="w-5 h-5" />
              <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-slate-800 space-y-2">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <HugeiconsIcon icon={theme === 'dark' ? Sun01Icon : Moon01Icon} strokeWidth={1.5} className="w-5 h-5" />
            <span className="font-bold text-sm">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.5} className="w-5 h-5" />
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className={`sticky top-0 z-30 border-b ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-gray-200'
        } shadow-sm`}>
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-slate-800 text-slate-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <HugeiconsIcon 
                icon={sidebarOpen ? Cancel01Icon : Menu01Icon} 
                strokeWidth={1.5} 
                className="w-6 h-6" 
              />
            </button>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold">{user?.user_metadata?.full_name || user?.email}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

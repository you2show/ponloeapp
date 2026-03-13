import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  SecurityIcon, 
  ViewIcon, 
  UserGroupIcon, 
  LockIcon, 
  ArrowLeft01Icon,
  CheckmarkCircle01Icon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';

interface PrivacySettingsProps {
  onBack: () => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user, profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    is_public: true,
    show_activity: true,
    show_bookmarks: false,
    allow_messages: true
  });

  useEffect(() => {
    if (profile?.privacy_settings) {
      setSettings(profile.privacy_settings);
    }
  }, [profile]);

  const handleToggle = async (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    if (user) {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ privacy_settings: newSettings })
        .eq('id', user.id);
      
      if (error) {
        showToast('Error updating privacy settings', 'error');
        setSettings(settings); // Rollback
      } else {
        await refreshProfile();
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className={`p-2 rounded-xl transition-colors ${
            theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-400'
          }`}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold font-khmer">ឯកជនភាព និងសុវត្ថិភាព</h2>
      </div>

      <div className={`rounded-3xl border shadow-sm overflow-hidden ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
      }`}>
        <div className="p-5 space-y-6">
          {/* Profile Visibility */}
          <div className="flex items-center justify-between gap-6">
            <div className="flex gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                theme === 'dark' ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <HugeiconsIcon icon={ViewIcon} strokeWidth={1.5} className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-khmer">គណនីសាធារណៈ</h4>
                <p className="text-xs text-gray-500 mt-1 font-khmer">អនុញ្ញាតឱ្យអ្នកដទៃមើលឃើញប្រវត្តិរូបរបស់អ្នក</p>
              </div>
            </div>
            <button 
              onClick={() => handleToggle('is_public')}
              className={`w-14 h-8 rounded-full transition-all relative ${
                settings.is_public ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-700'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all ${
                settings.is_public ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Activity Status */}
          <div className="flex items-center justify-between gap-6">
            <div className="flex gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                theme === 'dark' ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'
              }`}>
                <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-khmer">បង្ហាញសកម្មភាព</h4>
                <p className="text-xs text-gray-500 mt-1 font-khmer">អនុញ្ញាតឱ្យអ្នកដទៃដឹងថាអ្នកកំពុងអនឡាញ</p>
              </div>
            </div>
            <button 
              onClick={() => handleToggle('show_activity')}
              className={`w-14 h-8 rounded-full transition-all relative ${
                settings.show_activity ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-700'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all ${
                settings.show_activity ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Bookmarks Visibility */}
          <div className="flex items-center justify-between gap-6">
            <div className="flex gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                theme === 'dark' ? 'bg-slate-800 text-purple-400' : 'bg-purple-50 text-purple-600'
              }`}>
                <HugeiconsIcon icon={LockIcon} strokeWidth={1.5} className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm font-khmer">បង្ហាញចំណាំ</h4>
                <p className="text-xs text-gray-500 mt-1 font-khmer">អនុញ្ញាតឱ្យអ្នកដទៃមើលឃើញអ្វីដែលអ្នកបានរក្សាទុក</p>
              </div>
            </div>
            <button 
              onClick={() => handleToggle('show_bookmarks')}
              className={`w-14 h-8 rounded-full transition-all relative ${
                settings.show_bookmarks ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-700'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all ${
                settings.show_bookmarks ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-[2rem] border flex gap-4 ${
        theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-gray-50 border-gray-100 text-gray-500'
      }`}>
        <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={1.5} className="w-5 h-5 shrink-0 text-emerald-500" />
        <p className="text-xs font-khmer leading-relaxed">
          ទិន្នន័យរបស់អ្នកត្រូវបានការពារដោយបច្ចេកវិទ្យាទំនើបបំផុត។ យើងមិនដែលចែករំលែកព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នកជាមួយភាគីទីបីឡើយ។
        </p>
      </div>
    </div>
  );
};

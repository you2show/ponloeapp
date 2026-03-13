import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon, 
  Copy01Icon, 
  CheckmarkCircle02Icon,
  Facebook01Icon,
  TelegramIcon,
  TwitterIcon,
  Share01Icon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
  userId: string;
  displayName: string;
}

export const ShareProfileModal: React.FC<ShareProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  username, 
  userId,
  displayName
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  // Generate the share link
  const baseUrl = 'ponloe.app';
  const shareUrl = username ? `${baseUrl}/@${username}` : `${baseUrl}/profile?id=${userId}`;
  const fullUrl = `https://${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    showToast(t('share.linkCopied') || 'តំណភ្ជាប់ត្រូវបានចម្លង!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: 'Telegram',
      icon: TelegramIcon,
      color: 'bg-[#229ED9]',
      onClick: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(`Check out ${displayName}'s profile on Ponloe!`)}`, '_blank')
    },
    {
      name: 'Facebook',
      icon: Facebook01Icon,
      color: 'bg-[#1877F2]',
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`, '_blank')
    },
    {
      name: 'Twitter',
      icon: TwitterIcon,
      color: 'bg-[#1DA1F2]',
      onClick: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(`Check out ${displayName}'s profile on Ponloe!`)}`, '_blank')
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white text-gray-900'
            }`}
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="w-6 h-6 opacity-50" />
            </button>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center mb-4">
                <HugeiconsIcon icon={Share01Icon} className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold font-khmer">{t('share.profileTitle') || 'ចែករំលែក Profile'}</h3>
              <p className="text-sm opacity-60 mt-1 font-khmer">{displayName}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.onClick}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`w-14 h-14 ${option.color} text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                    <HugeiconsIcon icon={option.icon} className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold opacity-60">{option.name}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">
                {t('share.copyLink') || 'ចម្លងតំណភ្ជាប់'}
              </p>
              <div className={`flex items-center gap-2 p-2 pl-4 rounded-2xl border ${
                theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-100'
              }`}>
                <span className="flex-1 text-xs truncate opacity-60 font-mono">{shareUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className={`p-2.5 rounded-xl transition-all flex items-center gap-2 ${
                    copied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20'
                  }`}
                >
                  <HugeiconsIcon icon={copied ? CheckmarkCircle02Icon : Copy01Icon} className="w-4 h-4" />
                  <span className="text-xs font-bold">{copied ? (t('share.copied') || 'ចម្លងរួច') : (t('share.copy') || 'ចម្លង')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

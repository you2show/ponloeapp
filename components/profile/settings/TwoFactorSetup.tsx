import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  SecurityIcon, 
  ArrowLeft01Icon, 
  TelegramIcon, 
  CheckmarkCircle01Icon,
  Copy01Icon,
  Tick01Icon,
  InformationCircleIcon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface TwoFactorSetupProps {
  onBack: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const setupCode = user?.id?.slice(0, 8).toUpperCase() || 'ERROR';
  const botUsername = 'PonloeAuthBot';

  const handleCopy = () => {
    navigator.clipboard.writeText(setupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('បានចម្លងកូដរួចរាល់', 'success');
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
        <h2 className="text-xl font-bold font-khmer">រៀបចំការផ្ទៀងផ្ទាត់ ២ ជាន់</h2>
      </div>

      <div className={`p-5 rounded-3xl border shadow-sm ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
      }`}>
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
            <HugeiconsIcon icon={TelegramIcon} strokeWidth={1.5} className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-khmer mb-2">ភ្ជាប់ជាមួយ Telegram</h3>
            <p className="text-sm text-gray-500 font-khmer leading-relaxed max-w-xs mx-auto">
              ប្រើប្រាស់ Telegram ដើម្បីទទួលបានកូដផ្ទៀងផ្ទាត់រាល់ពេលដែលអ្នកចូលប្រើប្រាស់គណនី។
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">1</div>
            <div>
              <h4 className="font-bold text-sm font-khmer">ស្វែងរក Bot របស់យើង</h4>
              <p className="text-xs text-gray-500 mt-1 font-khmer">ស្វែងរក <span className="font-bold text-blue-500">@{botUsername}</span> នៅក្នុង Telegram ឬចុចប៊ូតុងខាងក្រោម។</p>
              <a 
                href={`https://t.me/${botUsername}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all"
              >
                <HugeiconsIcon icon={TelegramIcon} strokeWidth={1.5} className="w-4 h-4" />
                បើក Telegram
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">2</div>
            <div className="flex-1">
              <h4 className="font-bold text-sm font-khmer">ផ្ញើកូដភ្ជាប់គណនី</h4>
              <p className="text-xs text-gray-500 mt-1 font-khmer">ផ្ញើកូដខាងក្រោមទៅកាន់ Bot ដើម្បីភ្ជាប់គណនីរបស់អ្នក។</p>
              <div className={`mt-3 p-4 rounded-2xl border flex items-center justify-between ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <span className="font-mono font-bold text-lg tracking-wider">{setupCode}</span>
                <button 
                  onClick={handleCopy}
                  className={`p-2 rounded-lg transition-all ${
                    copied ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} strokeWidth={1.5} className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">3</div>
            <div>
              <h4 className="font-bold text-sm font-khmer">ទទួលបានការបញ្ជាក់</h4>
              <p className="text-xs text-gray-500 mt-1 font-khmer">បន្ទាប់ពីផ្ញើកូដរួច អ្នកនឹងទទួលបានសារបញ្ជាក់ពី Bot។ បន្ទាប់មកអ្នកអាចបើកមុខងារ 2FA បាន។</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-[2rem] border flex gap-4 ${
        theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-amber-50 border-amber-100 text-amber-700'
      }`}>
        <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={1.5} className="w-5 h-5 shrink-0" />
        <p className="text-xs font-khmer leading-relaxed">
          ចំណាំ៖ ការផ្ទៀងផ្ទាត់ ២ ជាន់នឹងជួយបង្កើនសុវត្ថិភាពគណនីរបស់អ្នកពីការលួចចូលប្រើប្រាស់ដោយគ្មានការអនុញ្ញាត។
        </p>
      </div>
    </div>
  );
};

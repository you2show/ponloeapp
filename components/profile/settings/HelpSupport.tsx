import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  HelpCircleIcon, 
  ArrowLeft01Icon, 
  Message01Icon, 
  InformationCircleIcon,
  BookOpen01Icon,
  TelegramIcon,
  Mail01Icon,
  Globe02Icon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface HelpSupportProps {
  onBack: () => void;
}

export const HelpSupport: React.FC<HelpSupportProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const supportChannels = [
    {
      icon: TelegramIcon,
      title: 'Telegram Support',
      description: 'ឆាតទៅកាន់ក្រុមការងារតាមរយៈ Telegram',
      link: 'https://t.me/ponloe_support',
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-500/10'
    },
    {
      icon: Mail01Icon,
      title: 'Email Support',
      description: 'ផ្ញើអ៊ីមែលមកកាន់ support@ponloe.org',
      link: 'mailto:support@ponloe.org',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10'
    },
    {
      icon: Globe02Icon,
      title: 'Official Website',
      description: 'ចូលទៅកាន់គេហទំព័រផ្លូវការរបស់យើង',
      link: 'https://ponloe.org',
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-500/10'
    }
  ];

  const faqs = [
    {
      question: 'តើធ្វើដូចម្តេចដើម្បីផ្ទៀងផ្ទាត់គណនី?',
      answer: 'អ្នកអាចផ្ទៀងផ្ទាត់គណនីបានដោយភ្ជាប់ជាមួយ Telegram Bot របស់យើង និងបំពេញព័ត៌មានចាំបាច់។'
    },
    {
      question: 'តើខ្ញុំអាចផ្លាស់ប្តូរឈ្មោះអ្នកប្រើប្រាស់បានទេ?',
      answer: 'បាទ/ចាស អ្នកអាចផ្លាស់ប្តូរបាននៅក្នុងផ្នែក "កែសម្រួលប្រវត្តិរូប"។'
    },
    {
      question: 'តើទិន្នន័យរបស់ខ្ញុំមានសុវត្ថិភាពដែរឬទេ?',
      answer: 'យើងប្រើប្រាស់បច្ចេកវិទ្យា End-to-End Encryption ដើម្បីការពារទិន្នន័យឯកជនរបស់អ្នក។'
    }
  ];

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
        <h2 className="text-xl font-bold font-khmer">ជំនួយ និងការគាំទ្រ</h2>
      </div>

      {/* Support Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {supportChannels.map((channel, idx) => (
          <a 
            key={idx}
            href={channel.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-5 rounded-3xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-sm'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${channel.bg} ${channel.color}`}>
              <HugeiconsIcon icon={channel.icon} strokeWidth={1.5} className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm mb-1">{channel.title}</h4>
            <p className="text-xs text-gray-500 font-khmer leading-relaxed">{channel.description}</p>
          </a>
        ))}
      </div>

      {/* FAQs */}
      <div className={`rounded-3xl border shadow-sm overflow-hidden ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
      }`}>
        <div className={`px-5 py-4 border-b flex items-center gap-3 ${
          theme === 'dark' ? 'bg-slate-800/50 border-slate-800' : 'bg-gray-50/50 border-gray-100'
        }`}>
          <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={1.5} className="w-5 h-5 text-emerald-500" />
          <h3 className="text-sm font-bold font-khmer">សំណួរដែលសួរញឹកញាប់ (FAQ)</h3>
        </div>
        <div className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-gray-100'}`}>
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-5">
              <h4 className="font-bold text-sm font-khmer mb-2 text-gray-900 dark:text-white">{faq.question}</h4>
              <p className="text-xs text-gray-500 font-khmer leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className={`p-5 rounded-3xl border ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
            <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Ponloe.org</h3>
            <p className="text-xs text-gray-500">Version 1.0.0 (Stable)</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-400 font-khmer leading-relaxed">
          ពន្លឺ (Ponloe) គឺជាបណ្តាញសង្គមចំណេះដឹងដែលផ្តោតលើការចែករំលែក និងការសិក្សាស្រាវជ្រាវអំពីសាសនាឥស្លាម និងចំណេះដឹងទូទៅ។ យើងប្តេជ្ញាផ្តល់ជូននូវបទពិសោធន៍ដ៏ល្អបំផុតសម្រាប់អ្នកប្រើប្រាស់គ្រប់រូប។
        </p>
      </div>
    </div>
  );
};

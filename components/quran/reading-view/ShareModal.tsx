import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Facebook01Icon, SentIcon, Link01Icon, MoreHorizontalIcon, Tick01Icon } from '@hugeicons/core-free-icons';
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

import { Ayah } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayah: Ayah | null;
  linkCopied: boolean;
  onShareAction: (action: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  ayah,
  linkCopied,
  onShareAction,
}) => {
  const { theme } = useTheme();
  if (!isOpen || !ayah) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-sm rounded-3xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-200 ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
        <button onClick={onClose} className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
        </button>
        <div className="text-center mb-6 mt-2">
          <h3 className={`text-lg font-bold font-khmer mb-1 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>ចែករំលែក</h3>
          <p className={`text-sm font-khmer ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>អាយ៉ាត់ទី {ayah.verse_key.split(':')[1]}</p>
        </div>
        
        <div className={`rounded-2xl p-4 mb-6 relative overflow-hidden border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <p className={`text-right font-amiri-quran text-xl leading-loose mb-3 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`} dir="rtl">
            <span dangerouslySetInnerHTML={{ __html: ayah.text_arabic }} />
          </p>
          <p className={`text-sm font-khmer leading-relaxed mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            {ayah.translations?.[0]?.text?.replace(/<[^>]*>?/gm, '')}
          </p>
          <div className={`text-sm italic ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
            The Prophet ﷺ said:<br/>
            <span className={`font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>'Convey from me, even if it is one verse.'</span><br/>
            (Bukhari 3461)
          </div>
        </div>
        <div className="flex justify-center gap-6 mb-4">
          <button onClick={() => onShareAction('facebook')} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center transition-transform group-hover:scale-110 shadow-md">
              <HugeiconsIcon icon={Facebook01Icon} strokeWidth={1.5} className="w-6 h-6 fill-white text-white" />
            </div>
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Facebook</span>
          </button>
          <button onClick={() => onShareAction('telegram')} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full bg-[#229ED9] flex items-center justify-center transition-transform group-hover:scale-110 shadow-md">
              <HugeiconsIcon icon={SentIcon} strokeWidth={1.5} className="w-5 h-5 fill-white text-white ml-0.5" />
            </div>
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Telegram</span>
          </button>
          <button onClick={() => onShareAction('copy')} className="flex flex-col items-center gap-2 group">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-md ${theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-white text-gray-900 border border-gray-100'}`}>
              {linkCopied ? <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-6 h-6 text-emerald-500" /> : <HugeiconsIcon icon={Link01Icon} strokeWidth={1.5} className="w-6 h-6" />}
            </div>
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{linkCopied ? 'Copied' : 'Copy link'}</span>
          </button>
          <button onClick={() => onShareAction('more')} className="flex flex-col items-center gap-2 group">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-md ${theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-gray-100 text-gray-700'}`}>
              <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.5} className="w-6 h-6" />
            </div>
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>More</span>
          </button>
        </div>
      </div>
    </div>
  );
};

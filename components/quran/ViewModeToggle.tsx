import { HugeiconsIcon } from '@hugeicons/react';
import { BookOpen01Icon, TextSquareIcon } from '@hugeicons/core-free-icons';
import React from 'react';

import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

interface ViewModeToggleProps {
  viewMode: 'verse-by-verse' | 'reading';
  setViewMode: (mode: 'verse-by-verse' | 'reading') => void;
  readingMode: 'arabic' | 'translation';
  setReadingMode: (mode: 'arabic' | 'translation') => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  setViewMode,
  readingMode,
  setReadingMode
}) => {
  const { theme } = useTheme();
  
  const activeTab = viewMode === 'verse-by-verse' ? 'verse-by-verse' : readingMode;

  return (
    <div className={`border rounded-full p-1.5 flex items-center shadow-sm relative overflow-hidden ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700/80' : 'bg-slate-50 border-slate-200/60'}`}>
      
      {/* Verse by Verse Tab */}
      <button
          onClick={() => setViewMode('verse-by-verse')}
          className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
              activeTab === 'verse-by-verse' 
              ? (theme === 'dark' ? 'text-white' : 'text-slate-800') 
              : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')
          }`}
          title="Verse by Verse"
      >
          {activeTab === 'verse-by-verse' && (
            <motion.div
              layoutId="viewModePill"
              className={`absolute inset-0 rounded-full shadow-sm ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'}`}
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 relative z-10">
            <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z"/>
            <path d="M11 7L17 7"/>
            <path d="M7 7L8 7"/>
            <path d="M7 12L8 12"/>
            <path d="M7 17L8 17"/>
            <path d="M11 12L17 12"/>
            <path d="M11 17L17 17"/>
          </svg>
          <span className="hidden lg:inline relative z-10">Verse by Verse</span>
      </button>

      <AnimatePresence mode="popLayout">
        {viewMode === 'verse-by-verse' ? (
          <motion.button
              key="reading-btn"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                  setViewMode('reading');
                  setReadingMode('arabic');
              }}
              className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                  theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Reading"
          >
              <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-4 h-4 relative z-10" />
              <span className="hidden lg:inline relative z-10">Reading</span>
          </motion.button>
        ) : (
          <motion.div 
            key="reading-modes"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            {/* Arabic Tab */}
            <button
                onClick={() => {
                    setViewMode('reading');
                    setReadingMode('arabic');
                }}
                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                    activeTab === 'arabic' 
                    ? (theme === 'dark' ? 'text-white' : 'text-slate-800') 
                    : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')
                }`}
                title="Arabic"
            >
                {activeTab === 'arabic' && (
                  <motion.div
                    layoutId="viewModePill"
                    className={`absolute inset-0 rounded-full shadow-sm ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'}`}
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="font-tajawal text-lg leading-none relative z-10 flex items-center justify-center w-5 h-5 -translate-y-[2px]">ع</span>
                <span className="hidden lg:inline relative z-10">Arabic</span>
            </button>

            {/* Translation Tab */}
            <button
                onClick={() => {
                    setViewMode('reading');
                    setReadingMode('translation');
                }}
                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                    activeTab === 'translation' 
                    ? (theme === 'dark' ? 'text-white' : 'text-slate-800') 
                    : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')
                }`}
                title="Translation"
            >
                {activeTab === 'translation' && (
                  <motion.div
                    layoutId="viewModePill"
                    className={`absolute inset-0 rounded-full shadow-sm ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'}`}
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <HugeiconsIcon icon={TextSquareIcon} strokeWidth={1.5} className="w-4 h-4 relative z-10" />
                <span className="hidden lg:inline relative z-10">Translation</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

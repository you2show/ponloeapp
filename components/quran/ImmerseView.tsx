import React, { useState, useEffect, useRef } from 'react';
import { LanguageCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, PreviousIcon, NextIcon, PlayIcon, PauseIcon, TextIcon, BookOpen01Icon, Settings01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons';

import { useTheme } from '@/contexts/ThemeContext';
import { Ayah, Surah, QuranSettings } from './types';

interface ImmerseViewProps {
  surah: Surah;
  verses: Ayah[];
  currentIndex: number;
  isPlaying: boolean;
  onClose: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  settings: QuranSettings;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const ImmerseView = ({
  surah, verses, currentIndex, isPlaying, onClose,
  onPlayPause, onNext, onPrev, settings, audioRef
}: ImmerseViewProps) => {
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTafsir, setShowTafsir] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const { theme } = useTheme();

  const currentAyah = verses[currentIndex] || verses[0];

  // Sync Audio Progress
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [audioRef, currentIndex]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio && duration) {
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      audio.currentTime = newTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={`fixed inset-0 md:left-20 z-[100] flex flex-col animate-in slide-in-from-bottom duration-500 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-white text-gray-900'}`}>
      
      {/* Background Ambience (Optional Gradient) */}
      <div className={`absolute inset-0 opacity-50 z-0 pointer-events-none ${theme === 'dark' ? 'bg-gradient-to-br from-emerald-950 to-slate-950' : 'bg-gradient-to-br from-emerald-50 to-teal-100'}`} />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-6 mt-safe">
        <button onClick={onClose} className={`p-2 -ml-2 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100/50'}`}>
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.5} className="w-8 h-8" />
        </button>
        <div className="text-center">
          <span className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>កំពុងចាក់</span>
          <h2 className={`font-bold font-khmer text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{surah.name_khmer}</h2>
        </div>
        <button className={`p-2 -mr-2 transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}>
          <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-8 overflow-y-auto no-scrollbar">
        
        {/* Ayah Display Container */}
        <div className="w-full max-w-2xl mx-auto text-center space-y-8 my-auto">
          
          {/* Arabic Text */}
          <div 
            className={`${settings.fontClass} leading-[2.5] tracking-wide transition-all duration-500 flex flex-row flex-wrap justify-center items-center`}
            style={{ 
              fontSize: '42px', 
              direction: 'rtl',
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}
          >
            {currentAyah.words && currentAyah.words.length > 0 ? (
              currentAyah.words.map((word, wIdx) => {
                let scriptText = '';
                let customFontFamily = undefined;
                
                if (settings.arabicScript === 'v2') {
                    scriptText = word.code_v2 || word.text_uthmani || word.text_imlaei || '';
                    if (word.page_number) {
                        customFontFamily = `p${word.page_number}-v2`;
                    }
                } else {
                    const scriptKey = `text_${settings.arabicScript}`;
                    // @ts-ignore
                    scriptText = word[scriptKey] || word.text_uthmani || word.text_imlaei || '';
                }
                
                return (
                  <span 
                    key={wIdx}
                    className={`mx-1.5 mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}
                    style={{ fontFamily: customFontFamily }}
                    title={customFontFamily}
                    dangerouslySetInnerHTML={{ __html: scriptText }}
                  />
                );
              })
            ) : settings.arabicScript === 'v2' && currentAyah.words ? (
              <span className={theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}>
                {currentAyah.words.map((w, wIdx) => {
                  const pageNum = w.page_number || currentAyah.page_number;
                  const fontFamily = pageNum && w.code_v2 ? `p${pageNum}-v2` : undefined;
                  return (
                    <span key={wIdx} style={{ fontFamily }} title={fontFamily} className="mx-1.5" dangerouslySetInnerHTML={{ __html: w.code_v2 || w.text_uthmani || '' }} />
                  );
                })}
              </span>
            ) : (
              <span className={theme === 'dark' ? 'text-slate-100' : 'text-gray-900'} dangerouslySetInnerHTML={{ __html: currentAyah.text_arabic }} />
            )}
          </div>

          {/* Translation Area */}
          {showTranslation && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className={`font-khmer text-lg leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                {currentAyah.translations?.[0]?.text}
              </p>
            </div>
          )}

          {/* Tafsir Area (Scrollable if long) */}
          {showTafsir && currentAyah.tafsir && (
            <div className={`backdrop-blur-md rounded-2xl p-6 border shadow-sm text-left max-h-60 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white/60 border-gray-100/50'}`}>
              <div className={`flex items-center gap-2 mb-3 font-bold text-xs uppercase tracking-wider sticky top-0 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-4 h-4" /> ការអធិប្បាយ
              </div>
              <p className={`font-khmer text-base leading-loose ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                {currentAyah.tafsir.text}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Controls Footer */}
      <div className={`relative z-10 backdrop-blur-lg border-t pb-8 pt-6 px-6 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-gray-100'}`}>
        <div className="max-w-xl mx-auto w-full">
          
          {/* Toggles Row */}
          <div className="flex justify-between items-center mb-8 px-4">
             <button 
               onClick={() => setShowTranslation(!showTranslation)}
               className={`flex flex-col items-center gap-1 transition-colors ${showTranslation ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600') : (theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600')}`}
             >
               <HugeiconsIcon icon={LanguageCircleIcon} strokeWidth={1.5} className="w-6 h-6" />
               <span className="text-[10px] font-bold">បកប្រែ</span>
             </button>
 
             <div className="flex flex-col items-center">
                <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Ayah {currentAyah.verse_number}</span>
                <span className={`text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>នៃ {surah.verses_count}</span>
             </div>
 
             <button 
               onClick={() => setShowTafsir(!showTafsir)}
               className={`flex flex-col items-center gap-1 transition-colors ${showTafsir ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600') : (theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600')}`}
             >
               <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-6 h-6" />
               <span className="text-[10px] font-bold">Tafsir</span>
             </button>
          </div>
 
          {/* Progress Bar */}
          <div className="mb-6 space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={progress || 0}
              onChange={handleSeek}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-500 transition-all ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'}`}
            />
            <div className={`flex justify-between text-xs font-medium font-mono px-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
 
          {/* Playback Controls */}
          <div className="flex items-center justify-between px-2">
            <button onClick={onPrev} className={`p-4 transition-colors active:scale-90 transform ${theme === 'dark' ? 'text-slate-300 hover:text-emerald-400' : 'text-gray-800 hover:text-emerald-600'}`}>
              <HugeiconsIcon icon={PreviousIcon} strokeWidth={1.5} className="w-8 h-8 fill-current" />
            </button>
 
            <button
              onClick={onPlayPause}
              className={`w-20 h-20 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 hover:bg-emerald-500 transition-all active:scale-95 ${theme === 'dark' ? 'shadow-emerald-900/20' : 'shadow-emerald-200'}`}
            >
              {isPlaying ? (
                <HugeiconsIcon icon={PauseIcon} strokeWidth={1.5} className="w-8 h-8 fill-current" />
              ) : (
                <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} className="w-8 h-8 ml-1 fill-current" />
              )}
            </button>
 
            <button onClick={onNext} className={`p-4 transition-colors active:scale-90 transform ${theme === 'dark' ? 'text-slate-300 hover:text-emerald-400' : 'text-gray-800 hover:text-emerald-600'}`}>
              <HugeiconsIcon icon={NextIcon} strokeWidth={1.5} className="w-8 h-8 fill-current" />
            </button>
          </div>
 
        </div>
      </div>
    </div>
  );
};

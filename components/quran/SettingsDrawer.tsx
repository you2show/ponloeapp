import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, TextIcon, VolumeHighIcon, Globe02Icon, Tick01Icon, ReloadIcon, ComputerIcon, CleanIcon, UserIcon, DashboardSpeed01Icon } from '@hugeicons/core-free-icons';
import { motion, AnimatePresence } from 'motion/react';

import { useTheme } from '@/contexts/ThemeContext';
import { QuranSettings, ArabicScriptType, DEFAULT_SETTINGS } from './types';
import { RECITERS } from './api';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: QuranSettings;
  onSettingsChange: (newSettings: QuranSettings) => void;
}

export const SettingsDrawer = ({ 
  isOpen, onClose, settings, onSettingsChange 
}: SettingsDrawerProps) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'display' | 'audio' | 'font'>('display');

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const updateSetting = <K extends keyof QuranSettings>(key: K, value: QuranSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleFontChange = (script: ArabicScriptType, fontClass: string) => {
    onSettingsChange({ ...settings, arabicScript: script, fontClass: fontClass });
  };

  const handleReset = () => {
    onSettingsChange(DEFAULT_SETTINGS);
    setShowResetConfirm(false);
  };

  const fontOptions: { label: string; script: ArabicScriptType; fontClass: string }[] = [
      { label: 'Uthmani', script: 'uthmani', fontClass: 'font-me-quran-volt' },
      { label: 'Madinah (v2)', script: 'v2', fontClass: 'font-v2' },
      { label: 'Uthman Naskh', script: 'uthmani', fontClass: 'font-uthman-naskh' },
      { label: 'Uthman Hafs', script: 'uthmani', fontClass: 'font-uthman-hafs' },
      { label: 'IndoPak', script: 'indopak', fontClass: 'font-pdms' },
      { label: 'Tajweed', script: 'uthmani_tajweed', fontClass: 'font-v4-tajweed' },
      { label: 'Amiri Quran', script: 'uthmani', fontClass: 'font-amiri-quran' },
      { label: 'Scheherazade', script: 'uthmani', fontClass: 'font-scheherazade' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`relative w-full max-w-sm h-full shadow-2xl overflow-y-auto flex flex-col ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-gray-900'}`}
          >
            
            {/* Reset Confirmation Overlay */}
            <AnimatePresence>
              {showResetConfirm && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`absolute inset-0 z-50 flex items-center justify-center p-6 ${theme === 'dark' ? 'bg-slate-900/90' : 'bg-white/90'}`}
                >
                  <div className={`p-6 rounded-2xl border shadow-xl text-center space-y-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                      <HugeiconsIcon icon={ReloadIcon} strokeWidth={1.5} className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold font-khmer text-lg">កំណត់ការកំណត់ឡើងវិញ?</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>តើអ្នកចង់កំណត់ការកំណត់ទាំងអស់ទៅជាដើមវិញទេ?</p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setShowResetConfirm(false)}
                        className={`flex-1 py-2.5 rounded-xl font-bold font-khmer text-sm transition-colors ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                      >
                        បោះបង់
                      </button>
                      <button 
                        onClick={handleReset}
                        className="flex-1 py-2.5 rounded-xl font-bold font-khmer text-sm bg-red-600 hover:bg-red-500 text-white transition-colors"
                      >
                        យល់ព្រម
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`px-4 py-3 border-b flex items-center justify-between sticky top-0 backdrop-blur z-20 ${theme === 'dark' ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-gray-100'}`}>
          <div className={`flex p-1 rounded-xl w-full mr-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}>
            <button 
              onClick={() => setActiveTab('display')}
              className={`flex-1 py-1.5 text-xs font-bold font-khmer rounded-lg transition-all ${activeTab === 'display' ? (theme === 'dark' ? 'bg-slate-700 text-emerald-400 shadow-sm' : 'bg-white text-emerald-600 shadow-sm') : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700')}`}
            >
              ការបង្ហាញ
            </button>
            <button 
              onClick={() => setActiveTab('font')}
              className={`flex-1 py-1.5 text-xs font-bold font-khmer rounded-lg transition-all ${activeTab === 'font' ? (theme === 'dark' ? 'bg-slate-700 text-emerald-400 shadow-sm' : 'bg-white text-emerald-600 shadow-sm') : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700')}`}
            >
              អក្សរ
            </button>
            <button 
              onClick={() => setActiveTab('audio')}
              className={`flex-1 py-1.5 text-xs font-bold font-khmer rounded-lg transition-all ${activeTab === 'audio' ? (theme === 'dark' ? 'bg-slate-700 text-emerald-400 shadow-sm' : 'bg-white text-emerald-600 shadow-sm') : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700')}`}
            >
              សំឡេង
            </button>
          </div>
          <button onClick={onClose} className={`p-2 transition-colors rounded-full shrink-0 ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}>
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-8 overflow-y-auto pb-24">
          
          {activeTab === 'display' && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className={`rounded-2xl p-2 border space-y-1 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-800' : 'bg-gray-50/80 border-gray-100'}`}>
                  <label className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group ${theme === 'dark' ? 'hover:bg-slate-800 hover:shadow-sm' : 'hover:bg-white hover:shadow-sm'}`}>
                      <div className="flex flex-col">
                          <span className={`font-bold font-khmer text-sm transition-colors ${theme === 'dark' ? 'text-slate-200 group-hover:text-emerald-400' : 'text-gray-900 group-hover:text-emerald-700'}`}>បង្ហាញការបកប្រែ</span>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.showTranslation} onChange={(e) => updateSetting('showTranslation', e.target.checked)} className="sr-only peer" />
                          <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${theme === 'dark' ? 'bg-slate-700 peer-checked:bg-emerald-600' : 'bg-gray-200 peer-checked:bg-emerald-600'}`}></div>
                      </div>
                  </label>

                  <label className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group ${theme === 'dark' ? 'hover:bg-slate-800 hover:shadow-sm' : 'hover:bg-white hover:shadow-sm'}`}>
                      <div className="flex flex-col">
                          <span className={`font-bold font-khmer text-sm transition-colors ${theme === 'dark' ? 'text-slate-200 group-hover:text-emerald-400' : 'text-gray-900 group-hover:text-emerald-700'}`}>បង្ហាញការអធិប្បាយ (Tafsir)</span>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.showTafsirInline} onChange={(e) => updateSetting('showTafsirInline', e.target.checked)} className="sr-only peer" />
                          <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${theme === 'dark' ? 'bg-slate-700 peer-checked:bg-emerald-600' : 'bg-gray-200 peer-checked:bg-emerald-600'}`}></div>
                      </div>
                  </label>

                  {/* Word Highlight Toggle */}
                  <label className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group ${theme === 'dark' ? 'hover:bg-slate-800 hover:shadow-sm' : 'hover:bg-white hover:shadow-sm'}`}>
                      <div className="flex flex-col">
                          <span className={`font-bold font-khmer text-sm transition-colors ${theme === 'dark' ? 'text-slate-200 group-hover:text-emerald-400' : 'text-gray-900 group-hover:text-emerald-700'}`}>បង្ហាញពណ៌លើពាក្យតាមសំឡេង</span>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.wordHighlighting} onChange={(e) => updateSetting('wordHighlighting', e.target.checked)} className="sr-only peer" />
                          <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${theme === 'dark' ? 'bg-slate-700 peer-checked:bg-emerald-600' : 'bg-gray-200 peer-checked:bg-emerald-600'}`}></div>
                      </div>
                  </label>

                  {/* Word by Word Translation Toggle */}
                  <label className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group ${theme === 'dark' ? 'hover:bg-slate-800 hover:shadow-sm' : 'hover:bg-white hover:shadow-sm'}`}>
                      <div className="flex flex-col">
                          <span className={`font-bold font-khmer text-sm transition-colors ${theme === 'dark' ? 'text-slate-200 group-hover:text-emerald-400' : 'text-gray-900 group-hover:text-emerald-700'}`}>បង្ហាញការបកប្រែពាក្យនីមួយៗ</span>
                          <span className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Word-by-Word Translation</span>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.showWordByWord} onChange={(e) => updateSetting('showWordByWord', e.target.checked)} className="sr-only peer" />
                          <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${theme === 'dark' ? 'bg-slate-700 peer-checked:bg-emerald-600' : 'bg-gray-200 peer-checked:bg-emerald-600'}`}></div>
                      </div>
                  </label>

                  {/* Tajweed Toggle */}
                  <label className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group ${theme === 'dark' ? 'hover:bg-slate-800 hover:shadow-sm' : 'hover:bg-white hover:shadow-sm'}`}>
                      <div className="flex flex-col">
                          <span className={`font-bold font-khmer text-sm transition-colors ${theme === 'dark' ? 'text-slate-200 group-hover:text-emerald-400' : 'text-gray-900 group-hover:text-emerald-700'}`}>ពណ៌ចំណាំច្បាប់អាន</span>
                          <span className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Tajweed Color Coding</span>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.showTajweed} onChange={(e) => updateSetting('showTajweed', e.target.checked)} className="sr-only peer" />
                          <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${theme === 'dark' ? 'bg-slate-700 peer-checked:bg-emerald-600' : 'bg-gray-200 peer-checked:bg-emerald-600'}`}></div>
                      </div>
                  </label>
              </div>
            </section>
          )}

          {activeTab === 'audio' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
              {/* Reciter Section */}
              <section>
                <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    <HugeiconsIcon icon={VolumeHighIcon} strokeWidth={1.5} className="w-4 h-4" /> អ្នកសូត្រ (Reciter)
                </div>
                
                <div className={`rounded-2xl p-2 border space-y-1 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-800' : 'bg-gray-50/80 border-gray-100'}`}>
                    <label className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group ${theme === 'dark' ? 'hover:bg-slate-800 hover:shadow-sm' : 'hover:bg-white hover:shadow-sm'}`}>
                        <div className="flex flex-col">
                            <span className={`font-bold font-khmer text-sm transition-colors ${theme === 'dark' ? 'text-slate-200 group-hover:text-emerald-400' : 'text-gray-900 group-hover:text-emerald-700'}`}>ចាក់អាយ៉ាត់បន្ទាប់ដោយស្វ័យប្រវត្តិ</span>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.autoPlayNext} onChange={(e) => updateSetting('autoPlayNext', e.target.checked)} className="sr-only peer" />
                            <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${theme === 'dark' ? 'bg-slate-700 peer-checked:bg-emerald-600' : 'bg-gray-200 peer-checked:bg-emerald-600'}`}></div>
                        </div>
                    </label>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2">
                    {RECITERS.map(r => (
                        <button 
                            key={r.id}
                            onClick={() => updateSetting('reciterId', r.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${settings.reciterId === r.id ? (theme === 'dark' ? 'bg-emerald-900/30 border-emerald-500 ring-1 ring-emerald-500' : 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200') : (theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-emerald-500/50' : 'bg-white border-gray-100 hover:border-emerald-200')}`}
                        >
                            <img referrerPolicy="no-referrer" src={r.image || undefined} className={`w-10 h-10 rounded-full object-cover shadow-sm ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'}`} alt={r.name} />
                            <div className="flex-1 text-left">
                                <p className={`text-sm font-bold ${settings.reciterId === r.id ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-800') : (theme === 'dark' ? 'text-slate-300' : 'text-gray-700')}`}>{r.name}</p>
                            </div>
                            {settings.reciterId === r.id && <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"><HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-3 h-3 text-white" /></div>}
                        </button>
                    ))}
                </div>
              </section>

              <section>
                <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-violet-400' : 'text-violet-600'}`}>
                    <HugeiconsIcon icon={CleanIcon} strokeWidth={1.5} className="w-4 h-4" /> សំឡេង AI (Tafsir Reader)
                </div>
                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => updateSetting('ttsVoice', 'Fenrir')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${settings.ttsVoice === 'Fenrir' ? (theme === 'dark' ? 'bg-violet-900/30 border-violet-500' : 'bg-violet-50 border-violet-500') : (theme === 'dark' ? 'bg-slate-700 border-transparent' : 'bg-white border-transparent')}`}>
                        <HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className={`w-6 h-6 mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`} /> <span className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>ប្រុស</span>
                      </button>
                      <button onClick={() => updateSetting('ttsVoice', 'Kore')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${settings.ttsVoice === 'Kore' ? (theme === 'dark' ? 'bg-pink-900/30 border-pink-500' : 'bg-pink-50 border-pink-500') : (theme === 'dark' ? 'bg-slate-700 border-transparent' : 'bg-white border-transparent')}`}>
                        <HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className={`w-6 h-6 mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`} /> <span className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>ស្រី</span>
                      </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'font' && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Font Size Sliders */}
              <div className={`space-y-6 mb-6 p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                  {/* Arabic Font Size */}
                  <div>
                      <div className="flex justify-between items-center mb-2">
                          <label className={`text-sm font-bold font-khmer ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>ទំហំអក្សរអារ៉ាប់</label>
                          <span className={`text-xs font-mono px-2 py-1 rounded ${theme === 'dark' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>{settings.arabicFontSize}px</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>A</span>
                          <input 
                              type="range" 
                              min="20" 
                              max="60" 
                              step="2"
                              value={settings.arabicFontSize} 
                              onChange={(e) => updateSetting('arabicFontSize', parseInt(e.target.value))}
                              className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-600 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}
                          />
                          <span className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>A</span>
                      </div>
                  </div>

                  {/* Translation Font Size */}
                  <div>
                      <div className="flex justify-between items-center mb-2">
                          <label className={`text-sm font-bold font-khmer ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>ទំហំអក្សរបកប្រែ</label>
                          <span className={`text-xs font-mono px-2 py-1 rounded ${theme === 'dark' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>{settings.translationFontSize}px</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>A</span>
                          <input 
                              type="range" 
                              min="14" 
                              max="30" 
                              step="1"
                              value={settings.translationFontSize} 
                              onChange={(e) => updateSetting('translationFontSize', parseInt(e.target.value))}
                              className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-600 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}
                          />
                          <span className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>A</span>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 gap-2 mb-4">
                  {fontOptions.map((s, idx) => (
                      <button key={idx} onClick={() => handleFontChange(s.script, s.fontClass)} className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${settings.fontClass === s.fontClass ? (theme === 'dark' ? 'border-emerald-500 bg-emerald-900/20' : 'border-emerald-500 bg-emerald-50') : (theme === 'dark' ? 'bg-slate-800 border-transparent' : 'bg-gray-50 border-transparent')}`}>
                          <span className={`font-medium text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>{s.label}</span>
                          <span className={`${s.fontClass} text-2xl`} style={{ color: settings.fontClass === s.fontClass ? (theme === 'dark' ? '#34d399' : '#064e3b') : (theme === 'dark' ? '#f8fafc' : '#000000') }}>الله</span>
                      </button>
                  ))}
              </div>
            </section>
          )}
        </div>

        <div className={`p-4 border-t sticky bottom-0 z-20 backdrop-blur-sm ${theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
            <button onClick={() => setShowResetConfirm(true)} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-sm font-bold font-khmer ${theme === 'dark' ? 'border-slate-700 text-slate-500 hover:text-red-400 hover:bg-red-900/20' : 'border-gray-200 text-gray-500 hover:text-red-500 hover:bg-red-50'}`}>
                <HugeiconsIcon icon={ReloadIcon} strokeWidth={1.5} className="w-4 h-4" /> កំណត់ដើមវិញ (Reset)
            </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>

  );
};

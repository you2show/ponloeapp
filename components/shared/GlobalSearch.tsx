import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, Cancel01Icon, BookOpen01Icon, UserGroupIcon, LibraryIcon, SparklesIcon, Loading02Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { GoogleGenAI } from "@google/genai";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'quran' | 'community' | 'library' | 'smart';
  link: string;
  metadata?: any;
}

export const GlobalSearch: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [smartAnswer, setSmartAnswer] = useState<string | null>(null);
  const [isSmartSearching, setIsSmartSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
      setResults([]);
      setSmartAnswer(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      setSmartAnswer(null);
      return;
    }

    setIsSearching(true);
    
    try {
      const searchResults: SearchResult[] = [];

      // 1. Search Quran (Mocking local search for now, ideally would use a pre-fetched index or API)
      // In a real app, we'd query a local index or Supabase
      const { data: surahs } = await supabase
        .from('surahs') // Assuming a surahs table exists or we use a static list
        .select('*')
        .or(`name_simple.ilike.%${val}%,name_arabic.ilike.%${val}%`)
        .limit(3);

      if (surahs) {
        surahs.forEach(s => {
          searchResults.push({
            id: `quran-${s.id}`,
            title: s.name_simple,
            description: `Surah ${s.id} • ${s.revelation_place}`,
            type: 'quran',
            link: `/quran?surah=${s.id}`,
            metadata: { surahId: s.id }
          });
        });
      }

      // 2. Search Community Posts
      const { data: posts } = await supabase
        .from('posts')
        .select('id, content, type')
        .ilike('content', `%${val}%`)
        .limit(3);

      if (posts) {
        posts.forEach(p => {
          searchResults.push({
            id: `post-${p.id}`,
            title: p.type === 'text' ? 'Community Post' : 'Media Post',
            description: p.content.substring(0, 60) + '...',
            type: 'community',
            link: `/community?post=${p.id}`
          });
        });
      }

      setResults(searchResults);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSmartSearch = async () => {
    if (!query || query.length < 3) return;
    
    setIsSmartSearching(true);
    setSmartAnswer(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an Islamic knowledge assistant for the Ponloe app. 
        The user is searching for: "${query}". 
        Provide a concise, helpful answer (max 3 sentences) based on Islamic teachings. 
        If it's a specific Quranic topic, mention relevant Surahs. 
        Keep the tone respectful and informative.`,
      });

      setSmartAnswer(response.text);
    } catch (err) {
      console.error('Smart search error:', err);
      setSmartAnswer("Sorry, I couldn't process your smart search right now.");
    } finally {
      setIsSmartSearching(false);
    }
  };

  const handleResultClick = (link: string) => {
    navigate(link);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800"
          >
            {/* Search Input */}
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-4">
              <HugeiconsIcon icon={Search01Icon} className="w-6 h-6 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder={t('search.placeholder') || "Search Quran, Community, Knowledge..."}
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
                className="flex-1 bg-transparent border-none outline-none text-lg font-khmer text-gray-900 dark:text-white placeholder:text-gray-400"
              />
              {isSearching && <HugeiconsIcon icon={Loading02Icon} className="w-5 h-5 text-emerald-500 animate-spin" />}
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
              {query.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HugeiconsIcon icon={Search01Icon} className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-khmer text-sm">បញ្ចូលពាក្យដើម្បីស្វែងរក</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {['Quran', 'Prayer', 'Zakat', 'Hadith'].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => handleSearch(tag)}
                        className="px-4 py-2 bg-gray-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full text-xs font-medium transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Smart Search Suggestion */}
                  {query.length >= 3 && !smartAnswer && !isSmartSearching && (
                    <button 
                      onClick={handleSmartSearch}
                      className="w-full p-4 flex items-center gap-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-2xl transition-all group text-left"
                    >
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                        <HugeiconsIcon icon={SparklesIcon} className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-emerald-600">Smart Search with AI</p>
                        <p className="text-xs text-emerald-600/70">Ask about "{query}"</p>
                      </div>
                      <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}

                  {/* AI Smart Answer */}
                  {isSmartSearching && (
                    <div className="p-4 flex items-start gap-4 animate-pulse">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                        <HugeiconsIcon icon={Loading02Icon} className="w-5 h-5 animate-spin" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-full"></div>
                        <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-5/6"></div>
                      </div>
                    </div>
                  )}

                  {smartAnswer && (
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30 mb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">AI Insight</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-emerald-100 leading-relaxed font-khmer">
                        {smartAnswer}
                      </p>
                    </div>
                  )}

                  {/* Regular Results */}
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result.link)}
                      className="w-full p-3 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all group text-left"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        result.type === 'quran' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                        result.type === 'community' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' :
                        'bg-gray-100 text-gray-600 dark:bg-slate-800'
                      }`}>
                        {result.type === 'quran' ? <HugeiconsIcon icon={BookOpen01Icon} className="w-5 h-5" /> :
                         result.type === 'community' ? <HugeiconsIcon icon={UserGroupIcon} className="w-5 h-5" /> :
                         <HugeiconsIcon icon={LibraryIcon} className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{result.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{result.description}</p>
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        {result.type}
                      </div>
                    </button>
                  ))}

                  {query.length > 0 && results.length === 0 && !isSearching && !isSmartSearching && (
                    <div className="p-8 text-center text-gray-500 text-sm font-khmer">
                      រកមិនឃើញលទ្ធផលសម្រាប់ "{query}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-[10px] font-sans shadow-sm">ESC</kbd>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Close</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-[10px] font-sans shadow-sm">ENTER</kbd>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Smart Search</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-400 font-bold">POWERED BY</span>
                <span className="text-[10px] font-bold text-emerald-600">PONLOE AI</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

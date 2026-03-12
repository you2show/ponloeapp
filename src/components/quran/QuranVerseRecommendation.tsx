import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Quran01Icon, RefreshIcon, Share01Icon, Copy01Icon } from '@hugeicons/core-free-icons';
import { recommendQuranVerse } from '@/services/geminiService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const QuranVerseRecommendation: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [mood, setMood] = useState('peaceful');
  const [verse, setVerse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const moods = [
    { id: 'peaceful', label: 'Peaceful', emoji: '😌' },
    { id: 'anxious', label: 'Anxious', emoji: '😟' },
    { id: 'grateful', label: 'Grateful', emoji: '🙏' },
    { id: 'sad', label: 'Sad', emoji: '😢' },
    { id: 'hopeful', label: 'Hopeful', emoji: '✨' },
  ];

  const fetchVerse = async (selectedMood: string) => {
    setLoading(true);
    try {
      const result = await recommendQuranVerse(selectedMood);
      if (result) {
        setVerse(result);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerse(mood);
  }, []);

  const handleMoodChange = (newMood: string) => {
    setMood(newMood);
    fetchVerse(newMood);
  };

  const copyToClipboard = () => {
    if (!verse) return;
    const text = `${verse.arabic}\n\n${verse.translation}\n\n${verse.khmer}\n\n(${verse.reference})`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!', 'success');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      showToast('Failed to copy', 'error');
    });
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="text-lg font-bold font-khmer text-gray-900 dark:text-white">
          {t('home.verseForYou') || 'អាយ៉ាត់សម្រាប់អ្នក'}
        </h3>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {moods.map((m) => (
            <button
              key={m.id}
              onClick={() => handleMoodChange(m.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                mood === m.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="relative overflow-hidden border-emerald-100 dark:border-emerald-900/30">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <HugeiconsIcon icon={Quran01Icon} size={80} className="text-emerald-600" />
        </div>
        
        <CardContent className="p-6 md:p-8">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded-lg w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-lg w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-lg w-5/6 mx-auto"></div>
            </div>
          ) : verse ? (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <p className="text-2xl md:text-3xl font-arabic leading-loose text-emerald-700 dark:text-emerald-400 dir-rtl">
                  {verse.arabic}
                </p>
                <Badge variant="primary" className="font-sans">
                  {verse.reference}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm md:text-base font-khmer leading-relaxed text-gray-700 dark:text-slate-300 italic">
                  "{verse.khmer}"
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-500">
                  {verse.translation}
                </p>
              </div>

              <div className="flex justify-center gap-4 pt-2">
                <button 
                  onClick={() => fetchVerse(mood)}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
                  title="Refresh"
                >
                  <HugeiconsIcon icon={RefreshIcon} strokeWidth={1.5} className="w-5 h-5" />
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
                  title="Copy"
                >
                  <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.5} className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
                  title="Share"
                >
                  <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-slate-400">
              <p>Failed to load recommendation. Please try again.</p>
              <button 
                onClick={() => fetchVerse(mood)}
                className="mt-4 text-emerald-600 font-bold hover:underline"
              >
                Retry
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

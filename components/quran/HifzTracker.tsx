import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Brain01Icon, 
  PlusSignIcon, 
  Target01Icon, 
  Calendar01Icon, 
  CheckmarkCircle01Icon, 
  Clock01Icon, 
  ArrowRight01Icon, 
  Delete01Icon,
  BookOpen01Icon,
  FavouriteIcon,
  StatusIcon,
  Settings01Icon,
  Cancel01Icon,
  MoreHorizontalIcon
} from '@hugeicons/core-free-icons';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/contexts/ThemeContext';
import { Surah, HifzEntry, HifzGoal } from './types';

interface HifzTrackerProps {
  surahs: Surah[];
  onSelectSurah: (surah: Surah) => void;
}

export const HifzTracker: React.FC<HifzTrackerProps> = ({ surahs, onSelectSurah }) => {
  const { theme } = useTheme();
  const [entries, setEntries] = useState<HifzEntry[]>([]);
  const [goal, setGoal] = useState<HifzGoal>({ dailyAyahs: 5 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  // Form state
  const [selectedSurahId, setSelectedSurahId] = useState<number>(1);
  const [ayahStart, setAyahStart] = useState<number>(1);
  const [ayahEnd, setAyahEnd] = useState<number>(1);
  const [status, setStatus] = useState<'new' | 'reviewing' | 'memorized'>('new');

  useEffect(() => {
    const savedEntries = localStorage.getItem('ponloe_hifz_entries');
    const savedGoal = localStorage.getItem('ponloe_hifz_goal');
    
    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedGoal) setGoal(JSON.parse(savedGoal));
  }, []);

  const saveEntries = (newEntries: HifzEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('ponloe_hifz_entries', JSON.stringify(newEntries));
  };

  const handleAddEntry = () => {
    const newEntry: HifzEntry = {
      id: crypto.randomUUID(),
      surahId: selectedSurahId,
      ayahStart,
      ayahEnd,
      status,
      lastReviewed: new Date().toISOString(),
      timesReviewed: 0,
      strength: status === 'memorized' ? 100 : status === 'reviewing' ? 50 : 10,
    };
    
    saveEntries([newEntry, ...entries]);
    setShowAddModal(false);
    // Reset form
    setAyahStart(1);
    setAyahEnd(1);
    setStatus('new');
  };

  const handleDeleteEntry = (id: string) => {
    saveEntries(entries.filter(e => e.id !== id));
  };

  const handleUpdateStatus = (id: string, newStatus: 'new' | 'reviewing' | 'memorized') => {
    saveEntries(entries.map(e => e.id === id ? { 
      ...e, 
      status: newStatus, 
      lastReviewed: new Date().toISOString(),
      strength: newStatus === 'memorized' ? 100 : newStatus === 'reviewing' ? 60 : 20
    } : e));
  };

  const totalAyahs = entries.reduce((acc, curr) => acc + (curr.ayahEnd - curr.ayahStart + 1), 0);
  const memorizedAyahs = entries
    .filter(e => e.status === 'memorized')
    .reduce((acc, curr) => acc + (curr.ayahEnd - curr.ayahStart + 1), 0);
  
  const progressPercent = Math.round((memorizedAyahs / 6236) * 100); // 6236 total ayahs in Quran

  // Mock data for chart - in real app, we'd derive this from history
  const chartData = [
    { name: 'Mon', ayahs: 12 },
    { name: 'Tue', ayahs: 18 },
    { name: 'Wed', ayahs: 15 },
    { name: 'Thu', ayahs: 22 },
    { name: 'Fri', ayahs: 30 },
    { name: 'Sat', ayahs: 25 },
    { name: 'Sun', ayahs: totalAyahs % 100 },
  ];

  const getSurahName = (id: number) => {
    return surahs.find(s => s.id === id)?.name_khmer || 'Unknown Surah';
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-3xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <HugeiconsIcon icon={Brain01Icon} strokeWidth={1.5} className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-sm font-khmer ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>សរុបទន្ទេញបាន</p>
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{totalAyahs} <span className="text-sm font-normal text-slate-500">Ayahs</span></h3>
            </div>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-1000" 
              style={{ width: `${Math.min(100, (totalAyahs / 6236) * 100)}%` }}
            />
          </div>
          <p className="text-xs mt-2 text-slate-500 font-khmer">{progressPercent}% នៃគម្ពីរគូរអានទាំងមូល</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-3xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
              <HugeiconsIcon icon={Target01Icon} strokeWidth={1.5} className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-sm font-khmer ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>គោលដៅថ្ងៃនេះ</p>
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{goal.dailyAyahs} <span className="text-sm font-normal text-slate-500">Ayahs</span></h3>
            </div>
          </div>
          <button 
            onClick={() => setShowGoalModal(true)}
            className={`w-full py-2 rounded-xl text-xs font-khmer font-medium transition-colors ${theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            កំណត់គោលដៅឡើងវិញ
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-3xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.5} className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-sm font-khmer ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>ការពិនិត្យឡើងវិញ</p>
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{entries.filter(e => e.status === 'reviewing').length} <span className="text-sm font-normal text-slate-500">Portions</span></h3>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-khmer">ចាំបាច់ត្រូវពិនិត្យឡើងវិញដើម្បីកុំឱ្យភ្លេច</p>
        </motion.div>
      </div>

      {/* Progress Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <h4 className={`font-bold font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>វឌ្ឍនភាពប្រចាំសប្តាហ៍</h4>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Ayahs</span>
              </div>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAyahs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: theme === 'dark' ? '#64748b' : '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: theme === 'dark' ? '#64748b' : '#94a3b8' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="ayahs" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAyahs)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full p-6 rounded-3xl bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="w-6 h-6" />
            </div>
            <span className="font-bold font-khmer">បន្ថែមការទន្ទេញថ្មី</span>
          </button>

          <div className={`p-6 rounded-3xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
            <h4 className={`font-bold font-khmer mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>សមិទ្ធផល</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>អ្នកចាប់ផ្តើមដំបូង</p>
                  <p className="text-[10px] text-slate-500 font-khmer">ទន្ទេញបាន ១០ Ayahs ដំបូង</p>
                </div>
              </div>
              <div className="flex items-center gap-3 opacity-40 grayscale">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={StatusIcon} strokeWidth={1.5} className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>អ្នកតស៊ូ</p>
                  <p className="text-[10px] text-slate-500 font-khmer">រក្សា Streak បាន ៧ ថ្ងៃ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className={`text-lg font-bold font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>បញ្ជីទន្ទេញរបស់អ្នក</h4>
          <div className={`text-xs font-khmer ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
            សរុប {entries.length} ចំណុច
          </div>
        </div>

        {entries.length === 0 ? (
          <div className={`p-12 rounded-3xl border border-dashed text-center ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
            <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.5} className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className={`font-khmer ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>មិនទាន់មានទិន្នន័យទន្ទេញនៅឡើយទេ</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-emerald-500 font-khmer text-sm font-medium hover:underline"
            >
              ចាប់ផ្តើមបន្ថែមឥឡូវនេះ
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entries.map((entry) => (
              <motion.div 
                layout
                key={entry.id}
                className={`p-5 rounded-3xl border shadow-sm group relative ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      entry.status === 'memorized' ? 'bg-emerald-500/10 text-emerald-500' :
                      entry.status === 'reviewing' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {entry.surahId}
                    </div>
                    <div>
                      <h5 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{getSurahName(entry.surahId)}</h5>
                      <p className="text-xs text-slate-500">Ayah {entry.ayahStart} - {entry.ayahEnd}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <HugeiconsIcon icon={Delete01Icon} strokeWidth={1.5} className="w-4 h-4" />
                    </button>
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      entry.status === 'memorized' ? 'bg-emerald-500/10 text-emerald-500' :
                      entry.status === 'reviewing' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {entry.status}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-khmer">
                    <span>កម្រិតនៃការចងចាំ</span>
                    <span>{entry.strength}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        entry.strength > 80 ? 'bg-emerald-500' :
                        entry.strength > 50 ? 'bg-amber-500' :
                        'bg-blue-500'
                      }`} 
                      style={{ width: `${entry.strength}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-khmer">
                      <HugeiconsIcon icon={Clock01Icon} strokeWidth={1.5} className="w-3 h-3" />
                      ពិនិត្យចុងក្រោយ៖ {new Date(entry.lastReviewed).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.status !== 'memorized' && (
                        <button 
                          onClick={() => handleUpdateStatus(entry.id, 'memorized')}
                          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                          title="Mark as Memorized"
                        >
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={1.5} className="w-4 h-4" />
                        </button>
                      )}
                      {entry.status !== 'reviewing' && (
                        <button 
                          onClick={() => handleUpdateStatus(entry.id, 'reviewing')}
                          className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                          title="Mark for Review"
                        >
                          <HugeiconsIcon icon={Clock01Icon} strokeWidth={1.5} className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-lg rounded-[32px] p-8 shadow-2xl ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className={`text-2xl font-bold font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>បន្ថែមការទន្ទេញថ្មី</h3>
                <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-400 hover:bg-gray-100'}`}>
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium font-khmer mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>ជ្រើសរើសជំពូក (Surah)</label>
                  <select 
                    value={selectedSurahId}
                    onChange={(e) => setSelectedSurahId(Number(e.target.value))}
                    className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-khmer ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  >
                    {surahs.map(s => (
                      <option key={s.id} value={s.id}>{s.id}. {s.name_khmer} ({s.name_simple})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium font-khmer mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>ចាប់ពី Ayah</label>
                    <input 
                      type="number" 
                      min="1"
                      value={ayahStart}
                      onChange={(e) => setAyahStart(Number(e.target.value))}
                      className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium font-khmer mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>រហូតដល់ Ayah</label>
                    <input 
                      type="number" 
                      min={ayahStart}
                      value={ayahEnd}
                      onChange={(e) => setAyahEnd(Number(e.target.value))}
                      className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium font-khmer mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>ស្ថានភាពបច្ចុប្បន្ន</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['new', 'reviewing', 'memorized'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                          status === s 
                            ? (s === 'memorized' ? 'bg-emerald-500 border-emerald-500 text-white' : s === 'reviewing' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-blue-500 border-blue-500 text-white')
                            : (theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400')
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleAddEntry}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold font-khmer shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all mt-4"
                >
                  រក្សាទុក
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Goal Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGoalModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-sm rounded-[32px] p-8 shadow-2xl ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>កំណត់គោលដៅ</h3>
                <button onClick={() => setShowGoalModal(false)} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-400 hover:bg-gray-100'}`}>
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium font-khmer mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>ចំនួន Ayahs ក្នុងមួយថ្ងៃ</label>
                  <input 
                    type="number" 
                    min="1"
                    value={goal.dailyAyahs}
                    onChange={(e) => setGoal({ ...goal, dailyAyahs: Number(e.target.value) })}
                    className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-center text-2xl font-bold ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>

                <button 
                  onClick={() => {
                    localStorage.setItem('ponloe_hifz_goal', JSON.stringify(goal));
                    setShowGoalModal(false);
                  }}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold font-khmer shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all"
                >
                  រក្សាទុកគោលដៅ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

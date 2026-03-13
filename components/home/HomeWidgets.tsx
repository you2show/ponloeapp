import { HugeiconsIcon } from '@hugeicons/react';
import { CleanIcon, BookOpen01Icon, HelpCircleIcon, Image01Icon, UserIcon, ArrowRight01Icon, PlayCircleIcon, HeadphonesIcon, LibraryIcon, UserGroupIcon, Location01Icon, Notification01Icon, Settings01Icon, Moon01Icon, Calendar01Icon, Compass01Icon, Wallet01Icon, ArrowUpRight01Icon, FavouriteIcon, MoreHorizontalIcon, QuoteDownIcon, Sun01Icon, Share01Icon, Calculator01Icon, ClipboardIcon, Baby01Icon, Cancel01Icon, SecurityCheckIcon, ScrollIcon, DragDropIcon, Restaurant01Icon, Quran01Icon, DuaIcon, PlayListIcon, TasbihIcon, CompassIcon, SalahIcon, Gps01Icon, DirectionRight02Icon, Ramadhan01Icon, WuduIcon, AlignSelectionIcon, HajiIcon, SujoodIcon, StatusIcon, Ramadhan02Icon, Image03Icon, AllahIcon, Search01Icon } from '@hugeicons/core-free-icons';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ViewMode } from '@/types';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useWeather } from '@/hooks/useWeather';
import { LOCATION_DATA } from '../prayer/data';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AuthModal } from '../auth/AuthModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { MosqueSilhouette } from './MosqueSilhouette';
import { LocationSelectionModal } from './LocationSelectionModal';
import { getAvatarUrl, getDisplayName } from '@/utils/user';

import { NotificationBell } from '../community/NotificationPanel';

interface WidgetProps {
  setView: (view: ViewMode) => void; // This can be removed if all navigation is handled by react-router
}

export const DailyDuaCard: React.FC = () => {
  const { theme } = useTheme();
  const [duaIndex, setDuaIndex] = useState(0);

  const DUAS = [
    {
      arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      khmer: "ឱម្ចាស់របស់យើង! សូមប្រទានដល់ពួកយើងនូវសេចក្តីល្អនៅក្នុងលោកិយនេះ និងសេចក្តីល្អនៅក្នុងលោកិយខាងមុខ ហើយសូមការពារពួកយើងពីទារុណកម្មនៃភ្លើងនរក។",
      reference: "Surah Al-Baqarah 2:201"
    },
    {
      arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ",
      khmer: "ឱម្ចាស់របស់ខ្ញុំ! សូមធ្វើឱ្យខ្ញុំក្លាយជាអ្នកដែលខ្ជាប់ខ្ជួនក្នុងការថ្វាយបង្គំសឡាត និងកូនចៅរបស់ខ្ញុំផងដែរ។ ឱម្ចាស់របស់យើង! សូមទទួលយកការបួងសួងរបស់ខ្ញុំ។",
      reference: "Surah Ibrahim 14:40"
    },
    {
      arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ",
      khmer: "ឱម្ចាស់របស់យើង! សូមកុំឱ្យចិត្តរបស់យើងងាកចេញពីផ្លូវត្រូវ បន្ទាប់ពីទ្រង់បានណែនាំយើង ហើយសូមប្រទានក្តីមេត្តាករុណាពីទ្រង់ដល់យើង។ ពិតប្រាកដណាស់ ទ្រង់គឺជាអ្នកប្រទានដ៏ខ្ពង់ខ្ពស់បំផុត។",
      reference: "Surah Ali 'Imran 3:8"
    }
  ];

  useEffect(() => {
    // Select dua based on day of the year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    setDuaIndex(day % DUAS.length);
  }, []);

  const currentDua = DUAS[duaIndex];

  return (
    <div className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden group ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <HugeiconsIcon icon={DuaIcon} size={80} strokeWidth={1} />
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
          <HugeiconsIcon icon={DuaIcon} size={20} strokeWidth={1.5} />
        </div>
        <h3 className={`font-bold font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>ឌូអាប្រចាំថ្ងៃ</h3>
      </div>

      <div className="space-y-4">
        <p className={`text-right text-xl md:text-2xl font-uthman leading-loose ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`} dir="rtl">
          {currentDua.arabic}
        </p>
        <p className={`text-sm font-khmer leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
          {currentDua.khmer}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{currentDua.reference}</span>
          <button className={`text-xs font-khmer font-medium transition-colors ${theme === 'dark' ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}>
            មើលឌូអាផ្សេងទៀត
          </button>
        </div>
      </div>
    </div>
  );
};

export const Header: React.FC<WidgetProps> = ({ setView }) => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const { theme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const displayEmailOrName = getDisplayName(user, profile, 'គណនី Telegram');

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent('open-global-search'));
  };

  return (
    <>
    <div className="flex justify-between items-center mb-6 pt-2">
       <div className="flex items-center gap-3">
          <div 
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] cursor-pointer hover:scale-105 transition-transform"
            onClick={handleProfileClick}
          >
             <div className="w-full h-full rounded-full border-2 overflow-hidden flex items-center justify-center text-emerald-600 border-white bg-gray-100 dark:border-slate-800 dark:bg-slate-800">
                {user ? (
                  <img referrerPolicy="no-referrer" src={getAvatarUrl(user, profile, 'គណនី Telegram')} alt="User" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                ) : (
                  <HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className="w-6 h-6" />
                )}
             </div>
          </div>
          <div onClick={() => !user && setShowAuthModal(true)} className={!user ? "cursor-pointer" : ""}>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('home.greeting')}</p>
             <h2 className="text-base font-bold font-khmer text-gray-800 dark:text-white">
               {user ? displayEmailOrName : t('home.loginPrompt')}
             </h2>
          </div>
       </div>
       <div className="flex items-center gap-2">
          <button 
            onClick={handleOpenSearch}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-emerald-600 hover:border-emerald-100 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-emerald-400"
          >
            <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="w-5 h-5" />
          </button>
          <NotificationBell />
       </div>
    </div>
    <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

const Cloud = ({ className, opacity = 1, style }: { className?: string, opacity?: number, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 40" className={className} style={{ opacity, ...style }} xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M 20 30 a 10 10 0 0 1 0 -20 a 15 15 0 0 1 25 -5 a 15 15 0 0 1 25 5 a 10 10 0 0 1 0 20 z" />
  </svg>
);

const Tree = ({ className, fill, trunkFill = "#4a3f35" }: { className?: string, fill?: string, trunkFill?: string }) => (
  <svg viewBox="0 0 100 120" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Trunk */}
    <path d="M45,120 L45,60 L55,60 L55,120 Z" fill={trunkFill} />
    <path d="M50,80 L35,50 L40,48 L50,75 Z" fill={trunkFill} />
    <path d="M50,70 L65,45 L60,43 L50,65 Z" fill={trunkFill} />
    
    {/* Leaves */}
    <circle cx="50" cy="35" r="35" fill={fill} opacity="0.95" />
    <circle cx="30" cy="55" r="25" fill={fill} opacity="0.9" />
    <circle cx="70" cy="55" r="25" fill={fill} opacity="0.9" />
    <circle cx="50" cy="20" r="20" fill="#ffffff" opacity="0.1" /> {/* Highlight */}
    <circle cx="50" cy="50" r="20" fill="#000000" opacity="0.1" /> {/* Shadow */}
  </svg>
);

const Bird = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.94 8.77c-1.84-.6-3.8-.2-5.45.97-1.4 1-2.9 1-4.3 0-1.65-1.17-3.6-1.57-5.45-.97-1.3.43-2.3 1.6-3.1 2.86.8-1.2 2.1-2 3.5-2 1.8 0 3.5.8 4.8 2.1 1.3-1.3 3-2.1 4.8-2.1 1.4 0 2.7.8 3.5 2-.8-1.26-1.8-2.43-3.1-2.86z"/>
  </svg>
);

export const SmartPrayerCard: React.FC<WidgetProps> = ({ setView }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    
    // Read location from localStorage
    const [locConfig, setLocConfig] = useState<any>({ province: 'phnom-penh', districtIndex: 0, communeIndex: 0, customLat: undefined, customLon: undefined, name: undefined });
    const [showLocationModal, setShowLocationModal] = useState(false);
    
    useEffect(() => {
      const savedLoc = localStorage.getItem('prayerLocation');
      if (savedLoc) {
        try {
          const parsed = JSON.parse(savedLoc);
          if (parsed.type === 'auto') {
            setLocConfig({ customLat: parsed.lat, customLon: parsed.lon, name: parsed.name });
          } else if (parsed.type === 'manual') {
            setLocConfig({ province: parsed.province || 'phnom-penh', districtIndex: parseInt(parsed.districtIndex || '0'), communeIndex: parseInt(parsed.communeIndex || '0') });
          }
        } catch (e) {}
      }
    }, []);

    const lat = locConfig.customLat || LOCATION_DATA[locConfig.province]?.districts?.[locConfig.districtIndex]?.lat;
    const lon = locConfig.customLon || LOCATION_DATA[locConfig.province]?.districts?.[locConfig.districtIndex]?.lon;

    const { todayData, nextPrayer, loading: prayerLoading } = usePrayerTimes(locConfig.province, locConfig.districtIndex, locConfig.communeIndex, locConfig.customLat, locConfig.customLon);
    const { weather, loading: weatherLoading } = useWeather(lat, lon);
    const loading = prayerLoading || weatherLoading;

    const [progress, setProgress] = useState(0);
    const [isDay, setIsDay] = useState(true);
    const [timeString, setTimeString] = useState('');

    const locationName = locConfig.customLat 
        ? (locConfig.name || 'ទីតាំងបច្ចុប្បន្ន') 
        : (LOCATION_DATA[locConfig.province]?.districts?.[locConfig.districtIndex]?.name || 'ភ្នំពេញ');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTimeString(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
            
            if (!todayData?.timings) return;

            const parseTime = (t: string) => {
                const [h, m] = t.split(':').map(Number);
                return h * 60 + m;
            };

            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const sunrise = parseTime(todayData.timings.Sunrise || "06:00");
            const maghrib = parseTime(todayData.timings.Maghrib || "18:00");

            let p = 0;
            let day = true;

            if (currentMinutes >= sunrise && currentMinutes < maghrib) {
                // Day Time
                day = true;
                const totalDay = maghrib - sunrise;
                const elapsed = currentMinutes - sunrise;
                p = (elapsed / totalDay) * 100;
            } else {
                // Night Time
                day = false;
                const totalNight = (24 * 60 - maghrib) + sunrise;
                let elapsed = 0;
                if (currentMinutes >= maghrib) {
                    elapsed = currentMinutes - maghrib;
                } else {
                    elapsed = (24 * 60 - maghrib) + currentMinutes;
                }
                p = (elapsed / totalNight) * 100;
            }

            setProgress(Math.min(Math.max(p, 0), 100));
            setIsDay(day);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [todayData]);

    const hijriDate = todayData ? `${todayData.date.hijri.day} ${todayData.date.hijri.month.ar}` : '...';

    const getThemeColors = () => {
        if (loading) return { skyCenter: '#1e293b', skyMiddle: '#0f172a', skyEdge: '#020617', backHill: '#1e293b', frontHill: '#0f172a', tree: '#020617', cloud: '#ffffff', cloudOpacity: 0.1 };
        
        if (isDay) {
            if (progress < 20) {
                // Dawn (Sunrise)
                return { 
                    skyCenter: '#fef08a', // yellow-200
                    skyMiddle: '#fb923c', // orange-400
                    skyEdge: '#9d174d', // pink-800
                    backHill: '#d946ef', // Fuchsia
                    frontHill: '#9333ea', // Purple
                    tree: '#7e22ce',
                    cloud: '#ffe4e6',
                    cloudOpacity: 0.6
                };
            } else if (progress < 80) {
                // Day
                return { 
                    skyCenter: '#ffffff', // white
                    skyMiddle: '#7dd3fc', // sky-300
                    skyEdge: '#0284c7', // sky-600
                    backHill: '#34d399', // Emerald 400
                    frontHill: '#10b981', // Emerald 500
                    tree: '#059669',
                    cloud: '#ffffff',
                    cloudOpacity: 0.8
                };
            } else {
                // Dusk (Sunset)
                return { 
                    skyCenter: '#fde047', // yellow-300
                    skyMiddle: '#f43f5e', // rose-500
                    skyEdge: '#4f46e5', // indigo-600
                    backHill: '#7c3aed', // Violet
                    frontHill: '#c026d3', // Fuchsia
                    tree: '#a21caf',
                    cloud: '#fce7f3',
                    cloudOpacity: 0.7
                };
            }
        } else {
            // Night
            return { 
                skyCenter: '#0f172a', // slate-900
                skyMiddle: '#020617', // slate-950
                skyEdge: '#000000', // black
                backHill: '#1e293b',
                frontHill: '#0f172a',
                tree: '#020617',
                cloud: '#ffffff',
                cloudOpacity: 0.1
            };
        }
    };

    const theme = getThemeColors();

    return (
      <div 
        className="mb-8 rounded-3xl p-5 md:p-6 relative overflow-hidden shadow-lg shadow-emerald-200/50 cursor-pointer group hover:shadow-xl transition-all duration-300 dark:shadow-emerald-900/20"
        onClick={() => navigate('/prayer')}
      >
        <div 
          className="absolute inset-0 transition-colors duration-1000"
          style={{ 
            background: `radial-gradient(circle at 50% 0%, ${theme.skyCenter}, ${theme.skyMiddle} 70%, ${theme.skyEdge} 100%)`
          }}
        ></div>

        {/* Animated Sun/Moon */}
        <div 
          className="absolute top-0 left-0 w-full h-full transition-transform duration-1000 ease-in-out"
          style={{ transform: `rotate(${progress * 1.8}deg)` }}
        >
          <div 
            className={`absolute top-[10%] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full transition-all duration-1000 ${isDay ? 'bg-yellow-300 shadow-[0_0_20px_5px_rgba(253,224,71,0.5)]' : 'bg-slate-300 shadow-[0_0_20px_5px_rgba(203,213,225,0.3)]'}`}
          >
            {!isDay && <HugeiconsIcon icon={Moon01Icon} className="w-5 h-5 text-slate-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>}
          </div>
        </div>

        {/* Scenery */}
        <div className="absolute inset-0 overflow-hidden">
            <Cloud className="absolute top-[15%] left-[10%] w-20 text-white" opacity={theme.cloudOpacity} style={{ transition: 'color 1s, opacity 1s' }} />
            <Cloud className="absolute top-[25%] left-[70%] w-24 text-white" opacity={theme.cloudOpacity * 0.8} style={{ transition: 'color 1s, opacity 1s' }} />
            <Cloud className="absolute top-[5%] left-[40%] w-16 text-white" opacity={theme.cloudOpacity * 0.6} style={{ transition: 'color 1s, opacity 1s' }} />
            
            <MosqueSilhouette className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-auto text-black opacity-10" />
            
            <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/10 to-transparent"></div>

            <div 
              className="absolute bottom-0 left-0 w-full h-1/2 transition-colors duration-1000"
              style={{ backgroundColor: theme.backHill, clipPath: 'polygon(0 100%, 100% 100%, 100% 30%, 70% 60%, 30% 40%, 0 70%)' }}
            ></div>
            <div 
              className="absolute bottom-0 left-0 w-full h-1/3 transition-colors duration-1000"
              style={{ backgroundColor: theme.frontHill, clipPath: 'polygon(0 100%, 100% 100%, 100% 60%, 80% 40%, 20% 80%, 0 50%)' }}
            ></div>
            
            <Tree className="absolute bottom-0 left-[5%] w-24 h-24" fill={theme.tree} />
            <Tree className="absolute bottom-0 right-[10%] w-20 h-20" fill={theme.tree} />

            <Bird className="absolute top-[20%] left-[20%] w-4 h-4 text-white opacity-50 animate-fly-1" />
            <Bird className="absolute top-[25%] left-[30%] w-3 h-3 text-white opacity-40 animate-fly-2" />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-48 md:h-56 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold opacity-80">{hijriDate}</p>
              <p className="text-lg font-bold font-khmer">{locationName}</p>
              <div 
                className="flex items-center gap-1 text-xs font-bold opacity-80 cursor-pointer hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); setShowLocationModal(true); }}
              >
                <HugeiconsIcon icon={Location01Icon} strokeWidth={2} className="w-3 h-3" />
                <span>{t('home.changeLocation')}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold opacity-80">{weather ? `${weather.temperature}°C` : '...'}</p>
              <p className="text-lg font-bold">{timeString}</p>
            </div>
          </div>

          <div className="text-center">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-white/20 rounded-full w-24 mx-auto mb-2"></div>
                <div className="h-8 bg-white/20 rounded-full w-32 mx-auto"></div>
              </div>
            ) : (
              <>
                <p className="text-sm font-bold opacity-80">{t('home.nextPrayer')}: {nextPrayer?.name}</p>
                <p className="text-3xl font-bold tracking-wider">{nextPrayer?.time}</p>
              </>
            )}
          </div>
        </div>
        <LocationSelectionModal 
          isOpen={showLocationModal} 
          onClose={() => setShowLocationModal(false)} 
          locConfig={locConfig}
          onSelect={(loc) => {
            localStorage.setItem('prayerLocation', JSON.stringify(loc));
            if (loc.type === 'auto') {
              setLocConfig({ customLat: loc.lat, customLon: loc.lon, name: loc.name });
            } else {
              setLocConfig({ province: loc.province, districtIndex: loc.districtIndex, communeIndex: loc.communeIndex });
            }
            setShowLocationModal(false);
          }}
        />
      </div>
    );
};

export const DailyInspiration: React.FC<WidgetProps> = ({ setView }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  return (
    <div className="mb-8 cursor-pointer" onClick={() => navigate('/hadith')}>
       <div className="flex justify-between items-center mb-3 px-1">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={QuoteDownIcon} strokeWidth={1.5} className="w-4 h-4 text-orange-500 fill-current" />
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('inspiration.title')}</h3>
          </div>
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-4 h-4 text-gray-400" />
       </div>
       <div className="rounded-2xl p-5 md:p-6 border relative overflow-hidden group hover:shadow-md transition-all bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100 dark:bg-slate-900 dark:bg-none dark:border-slate-800">
          <div className="relative z-10">
             <p className="font-khmer leading-loose text-sm md:text-base mb-3 text-gray-800 dark:text-slate-200">
                {t('inspiration.quote')}
             </p>
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-1 rounded shadow-sm bg-white text-orange-600 dark:bg-slate-800 dark:text-orange-400">{t('inspiration.source')}</span>
                <button className="transition-colors p-1.5 rounded-full text-gray-400 hover:text-orange-600 bg-white/50 hover:bg-white dark:text-slate-500 dark:hover:text-orange-400 dark:bg-slate-800">
                   <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-4 h-4" />
                </button>
             </div>
          </div>
          <HugeiconsIcon icon={QuoteDownIcon} strokeWidth={1.5} className="absolute -top-2 -left-2 w-16 h-16 opacity-20 transform rotate-180 text-orange-200 dark:text-slate-700" />
       </div>
    </div>
  );
};

export const ServiceGrid: React.FC<WidgetProps> = ({ setView }) => {
    const { t } = useLanguage();
    const [showAll, setShowAll] = useState(false);
    const navigate = useNavigate();
    
    const services = [
      { id: 'quran', icon: Quran01Icon, label: t('services.quran'), color: 'text-emerald-600', bg: 'bg-emerald-50', darkBg: 'bg-emerald-500/10', path: '/quran' },
      { id: 'dua', icon: DuaIcon, label: t('services.dua'), color: 'text-blue-600', bg: 'bg-blue-50', darkBg: 'bg-blue-500/10', path: '/hisnul-muslim' },
      { id: 'hadith', icon: ScrollIcon, label: t('services.hadith'), color: 'text-teal-600', bg: 'bg-teal-50', darkBg: 'bg-teal-500/10', path: '/hadith' },
      { id: 'faq', icon: HelpCircleIcon, label: t('services.faq'), color: 'text-indigo-600', bg: 'bg-indigo-50', darkBg: 'bg-indigo-500/10', path: '/faq' },
      { id: 'listen', icon: HeadphonesIcon, label: t('services.listen'), color: 'text-rose-600', bg: 'bg-rose-50', darkBg: 'bg-rose-500/10', path: '/listen' },
      { id: 'watch', icon: PlayListIcon, label: t('services.watch'), color: 'text-orange-600', bg: 'bg-orange-50', darkBg: 'bg-orange-500/10', path: '/watch' },
      { id: 'zakat', icon: Calculator01Icon, label: t('services.zakat'), color: 'text-green-600', bg: 'bg-green-50', darkBg: 'bg-green-500/10', path: '/zakat' },
      { id: 'tasbih', icon: TasbihIcon, label: t('services.tasbih'), color: 'text-violet-600', bg: 'bg-violet-50', darkBg: 'bg-violet-500/10', path: '/tasbih' },
      { id: 'halal', icon: Restaurant01Icon, label: t('services.halal'), color: 'text-amber-600', bg: 'bg-amber-50', darkBg: 'bg-amber-500/10', path: '/halal' },
      { id: 'qibla', icon: CompassIcon, label: t('services.qibla'), color: 'text-cyan-600', bg: 'bg-cyan-50', darkBg: 'bg-cyan-500/10', path: '/qibla' },
      { id: 'names', icon: Baby01Icon, label: t('services.names'), color: 'text-pink-600', bg: 'bg-pink-50', darkBg: 'bg-pink-500/10', path: '/names' },
      { id: 'allah_names', icon: AllahIcon, label: 'ព្រះនាម', color: 'text-emerald-600', bg: 'bg-emerald-50', darkBg: 'bg-emerald-500/10', path: '/allah-names' },
      { id: 'qada', icon: SalahIcon, label: t('services.qada'), color: 'text-slate-600', bg: 'bg-slate-100', darkBg: 'bg-slate-500/10', path: '/qada' },
      { id: 'frames', icon: StatusIcon, label: t('services.frames'), color: 'text-purple-600', bg: 'bg-purple-50', darkBg: 'bg-purple-500/10', path: '/frames' },
      { id: 'start_here', icon: DirectionRight02Icon, label: t('services.start_here'), color: 'text-sky-600', bg: 'bg-sky-50', darkBg: 'bg-sky-500/10', path: '/start' },
      { id: 'gallery', icon: Image03Icon, label: 'រូបភាព', color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', darkBg: 'bg-fuchsia-500/10', path: '/gallery' },
      { id: 'wudu', icon: WuduIcon, label: t('services.wudu'), color: 'text-blue-500', bg: 'bg-blue-50', darkBg: 'bg-blue-500/10', path: '/wudu' },
      { id: 'basic_knowledge', icon: Ramadhan01Icon, label: t('services.basic_knowledge'), color: 'text-indigo-500', bg: 'bg-indigo-50', darkBg: 'bg-indigo-500/10', path: '/basic-knowledge' },
      { id: 'umrah', icon: HajiIcon, label: 'អុំរ៉ោះ', color: 'text-emerald-500', bg: 'bg-emerald-50', darkBg: 'bg-emerald-500/10', path: '/umrah' },
      { id: 'fasting_guide', icon: Ramadhan02Icon, label: 'ច្បាប់នៃការបួស', color: 'text-rose-500', bg: 'bg-rose-50', darkBg: 'bg-rose-500/10', path: '/fasting' },
      { id: 'salat_guide', icon: SujoodIcon, label: 'អំពីសឡាត', color: 'text-blue-600', bg: 'bg-blue-50', darkBg: 'bg-blue-500/10', path: '/salat' },
    ];

    const displayedServices = services.slice(0, 7);

    return (
      <div className="mb-8">
         <h3 className="text-lg font-bold mb-4 font-khmer px-1 text-gray-900 dark:text-white">{t('services.title')}</h3>
         <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-6 gap-x-4 md:gap-x-6">
            {displayedServices.map((item) => (
               <button 
                  key={item.id} 
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-2 group"
               >
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-200 border ${item.bg} border-gray-50/50 dark:${item.darkBg} dark:border-slate-800`}>
                     <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className={`w-6 h-6 md:w-7 md:h-7 ${item.color}`} />
                  </div>
                  <span className="text-[11px] md:text-xs font-bold font-khmer whitespace-nowrap text-gray-700 dark:text-slate-400">{item.label}</span>
               </button>
            ))}
            
            <button 
               onClick={() => setShowAll(true)}
               className="flex flex-col items-center gap-2 group md:hidden"
            >
               <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-200 border bg-gray-100 border-gray-200 dark:bg-slate-800 dark:border-slate-700">
                  <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.5} className="w-6 h-6 text-gray-600" />
               </div>
               <span className="text-[11px] font-bold font-khmer whitespace-nowrap text-gray-700 dark:text-slate-400">{t('services.more')}</span>
            </button>
            
            {services.slice(7).map((item) => (
               <button 
                  key={item.id} 
                  onClick={() => navigate(item.path)}
                  className="hidden md:flex flex-col items-center gap-2 group"
               >
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-200 border ${item.bg} border-gray-50/50 dark:${item.darkBg} dark:border-slate-800`}>
                     <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className={`w-6 h-6 md:w-7 md:h-7 ${item.color}`} />
                  </div>
                  <span className="text-[11px] md:text-xs font-bold font-khmer whitespace-nowrap text-gray-700 dark:text-slate-400">{item.label}</span>
               </button>
            ))}
         </div>

         {showAll && (
            <div className="fixed inset-0 z-[100] md:hidden flex flex-col animate-in slide-in-from-bottom-full duration-300 bg-white dark:bg-slate-950">
               <div className="px-4 py-4 border-b flex items-center justify-between sticky top-0 z-10 bg-white border-gray-100 dark:bg-slate-950 dark:border-slate-800">
                  <h2 className="text-xl font-bold font-khmer text-gray-900 dark:text-white">{t('services.allFeatures')}</h2>
                  <button 
                     onClick={() => setShowAll(false)}
                     className="p-2 rounded-full transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                  >
                     <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-4 gap-y-8 gap-x-4">
                     {services.map((item) => (
                        <button 
                           key={`popup-${item.id}`} 
                           onClick={() => {
                              navigate(item.path);
                              setShowAll(false);
                           }}
                           className="flex flex-col items-center gap-2 group"
                        >
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm active:scale-95 transition-all duration-200 border ${item.bg} border-gray-50/50 dark:${item.darkBg} dark:border-slate-800`}>
                              <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className={`w-6 h-6 ${item.color}`} />
                           </div>
                           <span className="text-[11px] font-bold font-khmer whitespace-nowrap text-gray-700 dark:text-slate-400">{item.label}</span>
                        </button>
                     ))}
                  </div>
               </div>
            </div>
         )}
      </div>
    );
  };

export const DiscoverSection: React.FC<WidgetProps> = ({ setView }) => {
     const { t } = useLanguage();
     const navigate = useNavigate();
     return (
     <div className="mb-24">
        <div className="flex justify-between items-center mb-4 px-1">
           <h3 className="text-lg font-bold font-khmer text-gray-900 dark:text-white">{t('discover.title')}</h3>
           <span className="text-xs font-bold text-emerald-600 cursor-pointer hover:underline">{t('common.seeAll')}</span>
        </div>
        
        <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible no-scrollbar pb-4 md:pb-0 -mx-5 px-5 md:mx-0 md:px-0">
           
           <div 
              onClick={() => navigate('/listen')}
              className="min-w-[240px] md:min-w-0 h-36 md:h-44 rounded-2xl overflow-hidden relative group cursor-pointer shadow-md hover:shadow-lg transition-all"
           >
              <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=400&auto=format&fit=crop" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Listen" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex flex-col justify-end p-4">
                 <div className="flex items-center gap-2 mb-1">
                    <HugeiconsIcon icon={HeadphonesIcon} strokeWidth={1.5} className="w-4 h-4 text-blue-300" />
                    <span className="text-[10px] font-bold text-blue-200 uppercase">Audio</span>
                 </div>
                 <h4 className="text-white font-khmer font-bold leading-tight">{t('discover.listen.title')}</h4>
              </div>
           </div>

           <div 
              onClick={() => navigate('/watch')}
              className="min-w-[240px] md:min-w-0 h-36 md:h-44 rounded-2xl overflow-hidden relative group cursor-pointer shadow-md hover:shadow-lg transition-all"
           >
              <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=400&auto=format&fit=crop" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Watch" />
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 to-transparent flex flex-col justify-end p-4">
                 <div className="flex items-center gap-2 mb-1">
                    <HugeiconsIcon icon={PlayCircleIcon} strokeWidth={1.5} className="w-4 h-4 text-red-300" />
                    <span className="text-[10px] font-bold text-red-200 uppercase">Video</span>
                 </div>
                 <h4 className="text-white font-khmer font-bold leading-tight">{t('discover.watch.title')}</h4>
              </div>
           </div>

           <div 
              onClick={() => navigate('/faq')}
              className="min-w-[240px] md:min-w-0 h-36 md:h-44 rounded-2xl overflow-hidden relative group cursor-pointer shadow-md hover:shadow-lg transition-all"
           >
              <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=400&auto=format&fit=crop" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="FAQ" />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent flex flex-col justify-end p-4">
                 <div className="flex items-center gap-2 mb-1">
                    <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={1.5} className="w-4 h-4 text-indigo-300" />
                    <span className="text-[10px] font-bold text-indigo-200 uppercase">Q&A</span>
                 </div>
                 <h4 className="text-white font-khmer font-bold leading-tight">{t('discover.faq.title')}</h4>
              </div>
           </div>

        </div>
     </div>
  );
};

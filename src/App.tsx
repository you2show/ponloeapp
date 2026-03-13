import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ViewMode } from '@/types';
import { Navigation } from '@/components/Navigation';
import { Header, SmartPrayerCard, DailyInspiration, ServiceGrid, DiscoverSection, DailyDuaCard } from '@/components/home/HomeWidgets';
import { QuranVerseRecommendation } from '@/components/quran/QuranVerseRecommendation';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import { Player } from '@/components/listen/Player';
import { GlobalSearch } from '@/components/shared/GlobalSearch';
import { ChatWidget } from '@/src/components/chat/ChatWidget';

import { AnimatedLogo } from '@/components/AnimatedLogo';

// Lazy load all views to improve initial load time
const FrameEditor = lazy(() => import('@/components/frames').then(m => ({ default: m.FrameEditor })));
const PrayerTimesView = lazy(() => import('@/components/prayer').then(m => ({ default: m.PrayerTimesView })));
const AllahNamesView = lazy(() => import('@/components/allah-names').then(m => ({ default: m.AllahNamesView })));
const HalalFinderView = lazy(() => import('@/components/halal').then(m => ({ default: m.HalalFinderView })));
const Hadith40View = lazy(() => import('@/components/hadith').then(m => ({ default: m.Hadith40View })));
const BasicHadithView = lazy(() => import('@/components/hadith').then(m => ({ default: m.BasicHadithView })));
const HisnulMuslimView = lazy(() => import('@/components/hisnul-muslim').then(m => ({ default: m.HisnulMuslimView })));
const MuslimCalendarView = lazy(() => import('@/components/calendar').then(m => ({ default: m.MuslimCalendarView })));
const QiblaFinderView = lazy(() => import('@/components/qibla').then(m => ({ default: m.QiblaFinderView })));
const QuranView = lazy(() => import('@/components/quran').then(m => ({ default: m.QuranView })));
const FAQView = lazy(() => import('@/components/faq').then(m => ({ default: m.FAQView })));
const StartHereView = lazy(() => import('@/components/start-here').then(m => ({ default: m.StartHereView })));
const WatchView = lazy(() => import('@/components/watch').then(m => ({ default: m.WatchView })));
const ListenView = lazy(() => import('@/components/listen').then(m => ({ default: m.ListenView })));
const LibraryView = lazy(() => import('@/components/library/LibraryView').then(m => ({ default: m.LibraryView })));
const PostersView = lazy(() => import('@/components/posters').then(m => ({ default: m.PostersView })));
const FeedView = lazy(() => import('@/components/community/FeedView').then(m => ({ default: m.FeedView })));
const ZakatView = lazy(() => import('@/components/zakat').then(m => ({ default: m.ZakatView })));
const TasbihView = lazy(() => import('@/components/tasbih').then(m => ({ default: m.TasbihView })));
const QadaView = lazy(() => import('@/components/qada').then(m => ({ default: m.QadaView })));
const MuslimNamesView = lazy(() => import('@/components/names').then(m => ({ default: m.MuslimNamesView })));
const WuduView = lazy(() => import('@/components/wudu/WuduView').then(m => ({ default: m.WuduView })));
const BasicKnowledgeView = lazy(() => import('@/components/basic-knowledge/BasicKnowledgeView').then(m => ({ default: m.BasicKnowledgeView })));
const FiqhView = lazy(() => import('@/components/fiqh/FiqhView').then(m => ({ default: m.FiqhView })));
const AqeedaView = lazy(() => import('@/components/aqeeda/AqeedaView').then(m => ({ default: m.AqeedaView })));
const TafseerView = lazy(() => import('@/components/tafseer/TafseerView').then(m => ({ default: m.TafseerView })));
const AdabView = lazy(() => import('@/components/adab').then(m => ({ default: m.AdabView })));
const MoralityView = lazy(() => import('@/components/morality').then(m => ({ default: m.MoralityView })));
const AdeiahView = lazy(() => import('@/components/adeiah').then(m => ({ default: m.AdeiahView })));
const MiscView = lazy(() => import('@/components/misc').then(m => ({ default: m.MiscView })));
const SeeraView = lazy(() => import('@/components/seera').then(m => ({ default: m.SeeraView })));
const UmrahView = lazy(() => import('@/components/umrah').then(m => ({ default: m.UmrahView })));
const FastingGuideView = lazy(() => import('@/components/fasting').then(m => ({ default: m.FastingGuideView })));
const SalatGuideView = lazy(() => import('@/components/salat-guide').then(m => ({ default: m.SalatGuideView })));
const GalleryView = lazy(() => import('@/components/community/gallery/GalleryView').then(m => ({ default: m.GalleryView })));
const ProfileView = lazy(() => import('@/components/profile/ProfileView').then(m => ({ default: m.ProfileView })));
const ResetPasswordView = lazy(() => import('@/components/auth/ResetPasswordView').then(m => ({ default: m.ResetPasswordView })));
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('@/components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ContentManagement = lazy(() => import('@/components/admin/ContentManagement').then(m => ({ default: m.ContentManagement })));
const UserManagement = lazy(() => import('@/components/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const Analytics = lazy(() => import('@/components/admin/Analytics').then(m => ({ default: m.Analytics })));
const AdminSettings = lazy(() => import('@/components/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AIContentAssistant = lazy(() => import('@/components/admin/AIContentAssistant').then(m => ({ default: m.AIContentAssistant })));
const AdvancedReports = lazy(() => import('@/components/admin/AdvancedReports').then(m => ({ default: m.AdvancedReports })));
const PollsManagement = lazy(() => import('@/components/admin/PollsManagement').then(m => ({ default: m.PollsManagement })));
const VerificationRequests = lazy(() => import('@/components/admin/VerificationRequests').then(m => ({ default: m.VerificationRequests })));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full min-h-[50vh]">
    <AnimatedLogo size={100} className="drop-shadow-lg" />
  </div>
);

const HomeView: React.FC<{ setView: (view: ViewMode) => void }> = ({ setView }) => {
  const { t } = useLanguage();
  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      <Header setView={setView} />
      <SmartPrayerCard setView={setView} />
      <DailyDuaCard />
      <QuranVerseRecommendation />
      <ServiceGrid setView={setView} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DailyInspiration setView={setView} />
        <div className="hidden lg:block p-6 rounded-2xl border shadow-sm h-fit bg-white border-gray-100 dark:bg-slate-900 dark:border-slate-800">
          <h3 className="font-bold mb-4 font-khmer text-gray-900 dark:text-white">{t('events.title')}</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg font-bold text-center w-12 shrink-0">
                <span className="block text-xs uppercase">Mar</span>
                <span className="block text-lg">12</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 dark:text-slate-200">{t('events.ramadan')}</h4>
                <p className="text-xs text-gray-500">{t('events.daysLeft')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DiscoverSection setView={setView} />
    </div>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileNavHidden, setIsMobileNavHidden] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { t } = useLanguage();

  // Map path to ViewMode for Navigation component
  const getViewFromPath = (path: string): ViewMode => {
    switch (path) {
      case '/': return ViewMode.HOME;
      case '/start': return ViewMode.START_HERE;
      case '/frames': return ViewMode.FRAMES;
      case '/prayer': return ViewMode.PRAYER;
      case '/allah-names': return ViewMode.ALLAH_NAMES;
      case '/halal': return ViewMode.HALAL;
      case '/hadith': return ViewMode.HADITH;
      case '/hisnul-muslim': return ViewMode.HISNUL_MUSLIM;
      case '/calendar': return ViewMode.CALENDAR;
      case '/qibla': return ViewMode.QIBLA;
      case '/quran': return ViewMode.QURAN;
      case '/faq': return ViewMode.FAQ;
      case '/watch': return ViewMode.WATCH;
      case '/listen': return ViewMode.LISTEN;
      case '/library': return ViewMode.LIBRARY;
      case '/posters': return ViewMode.POSTERS;
      case '/community': return ViewMode.COMMUNITY;
      case '/zakat': return ViewMode.ZAKAT;
      case '/tasbih': return ViewMode.TASBIH;
      case '/qada': return ViewMode.QADA;
      case '/names': return ViewMode.NAMES;
      case '/wudu': return ViewMode.WUDU;
      case '/basic-knowledge': return ViewMode.BASIC_KNOWLEDGE;
      case '/fiqh': return ViewMode.FIQH;
      case '/aqeeda': return ViewMode.AQEEDA;
      case '/tafseer': return ViewMode.TAFSEER;
      case '/basic-hadith': return ViewMode.BASIC_HADITH;
      case '/adab': return ViewMode.ADAB;
      case '/morality': return ViewMode.MORALITY;
      case '/adeiah': return ViewMode.ADEIAH;
      case '/misc': return ViewMode.MISC;
      case '/seera': return ViewMode.SEERA;
      case '/umrah': return ViewMode.UMRAH;
      case '/fasting': return ViewMode.FASTING_GUIDE;
      case '/salat': return ViewMode.SALAT_GUIDE;
      case '/gallery': return ViewMode.GALLERY;
      case '/profile': return ViewMode.PROFILE;
      default: return ViewMode.HOME;
    }
  };

  const getPathFromView = (view: ViewMode): string => {
    switch (view) {
      case ViewMode.HOME: return '/';
      case ViewMode.START_HERE: return '/start';
      case ViewMode.FRAMES: return '/frames';
      case ViewMode.PRAYER: return '/prayer';
      case ViewMode.ALLAH_NAMES: return '/allah-names';
      case ViewMode.HALAL: return '/halal';
      case ViewMode.HADITH: return '/hadith';
      case ViewMode.HISNUL_MUSLIM: return '/hisnul-muslim';
      case ViewMode.CALENDAR: return '/calendar';
      case ViewMode.QIBLA: return '/qibla';
      case ViewMode.QURAN: return '/quran';
      case ViewMode.FAQ: return '/faq';
      case ViewMode.WATCH: return '/watch';
      case ViewMode.LISTEN: return '/listen';
      case ViewMode.LIBRARY: return '/library';
      case ViewMode.POSTERS: return '/posters';
      case ViewMode.COMMUNITY: return '/community';
      case ViewMode.ZAKAT: return '/zakat';
      case ViewMode.TASBIH: return '/tasbih';
      case ViewMode.QADA: return '/qada';
      case ViewMode.NAMES: return '/names';
      case ViewMode.WUDU: return '/wudu';
      case ViewMode.BASIC_KNOWLEDGE: return '/basic-knowledge';
      case ViewMode.FIQH: return '/fiqh';
      case ViewMode.AQEEDA: return '/aqeeda';
      case ViewMode.TAFSEER: return '/tafseer';
      case ViewMode.BASIC_HADITH: return '/basic-hadith';
      case ViewMode.ADAB: return '/adab';
      case ViewMode.MORALITY: return '/morality';
      case ViewMode.ADEIAH: return '/adeiah';
      case ViewMode.MISC: return '/misc';
      case ViewMode.SEERA: return '/seera';
      case ViewMode.UMRAH: return '/umrah';
      case ViewMode.FASTING_GUIDE: return '/fasting';
      case ViewMode.SALAT_GUIDE: return '/salat';
      case ViewMode.GALLERY: return '/gallery';
      case ViewMode.PROFILE: return '/profile';
      default: return '/';
    }
  };

  const currentView = getViewFromPath(location.pathname);
  const setView = (view: ViewMode) => navigate(getPathFromView(view));

  useEffect(() => {
    const handleNavigateToQuran = () => {
      setView(ViewMode.QURAN);
    };
    window.addEventListener('navigate-to-quran', handleNavigateToQuran);

    const handleHideNav = (e: any) => {
      setIsMobileNavHidden(e.detail);
    };
    window.addEventListener('hide-mobile-nav', handleHideNav);

    const handleOpenSearch = () => {
      setIsSearchOpen(true);
    };
    window.addEventListener('open-global-search', handleOpenSearch);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('navigate-to-quran', handleNavigateToQuran);
      window.removeEventListener('hide-mobile-nav', handleHideNav);
      window.removeEventListener('open-global-search', handleOpenSearch);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const isFullHeightView = currentView === ViewMode.QURAN || currentView === ViewMode.LIBRARY;

  return (
    <AuthProvider>
      <ChatProvider>
        <AudioPlayerProvider>
          <div className="min-h-screen flex flex-col md:flex-row font-khmer transition-colors duration-300 bg-[#f8fafc] text-gray-900 dark:bg-slate-950 dark:text-white">
            <Navigation 
              currentView={currentView} 
              setView={setView} 
            />

            <main className={`flex-1 md:ml-20 ${
              isFullHeightView
                ? `${isMobileNavHidden ? 'h-screen' : 'h-[calc(100vh-80px)]'} md:h-screen overflow-hidden` 
                : 'min-h-screen pb-20 md:pb-8'
            }`}>
              
              {currentView !== ViewMode.HOME && 
               ![ViewMode.PRAYER, ViewMode.QURAN, ViewMode.START_HERE, ViewMode.CALENDAR, ViewMode.QIBLA, ViewMode.WATCH, ViewMode.LISTEN, ViewMode.LIBRARY, ViewMode.POSTERS, ViewMode.COMMUNITY, ViewMode.ZAKAT, ViewMode.TASBIH, ViewMode.QADA, ViewMode.NAMES, ViewMode.FAQ, ViewMode.HADITH, ViewMode.PROFILE, ViewMode.WUDU, ViewMode.BASIC_KNOWLEDGE, ViewMode.FIQH, ViewMode.AQEEDA, ViewMode.TAFSEER, ViewMode.BASIC_HADITH, ViewMode.ADAB, ViewMode.MORALITY, ViewMode.ADEIAH, ViewMode.MISC, ViewMode.SEERA, ViewMode.UMRAH, ViewMode.FASTING_GUIDE, ViewMode.SALAT_GUIDE, ViewMode.GALLERY].includes(currentView) && (
                <header className="sticky top-0 z-30 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between bg-white/80 border-gray-100 dark:bg-slate-900/80 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold font-khmer-title text-gray-900 dark:text-white">
                       {t('app.title')}
                    </h2>
                  </div>
                </header>
              )}

              <div className="h-full">
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<HomeView setView={setView} />} />
                    <Route path="/start" element={<StartHereView />} />
                    <Route path="/frames" element={<FrameEditor />} />
                    <Route path="/prayer" element={<PrayerTimesView />} />
                    <Route path="/allah-names" element={<AllahNamesView />} />
                    <Route path="/halal" element={<HalalFinderView />} />
                    <Route path="/hadith" element={<Hadith40View />} />
                    <Route path="/hisnul-muslim" element={<HisnulMuslimView />} />
                    <Route path="/calendar" element={<MuslimCalendarView />} />
                    <Route path="/qibla" element={<QiblaFinderView />} />
                    <Route path="/quran" element={<QuranView />} />
                    <Route path="/faq" element={<FAQView />} />
                    <Route path="/watch" element={<WatchView />} />
                    <Route path="/listen" element={<ListenView />} />
                    <Route path="/library" element={<LibraryView />} />
                    <Route path="/posters" element={<PostersView />} />
                    <Route path="/community" element={<FeedView />} />
                    <Route path="/zakat" element={<ZakatView />} />
                    <Route path="/tasbih" element={<TasbihView />} />
                    <Route path="/qada" element={<QadaView />} />
                    <Route path="/names" element={<MuslimNamesView />} />
                    <Route path="/wudu" element={<WuduView setView={setView} />} />
                    <Route path="/basic-knowledge" element={<BasicKnowledgeView setView={setView} />} />
                    <Route path="/fiqh" element={<FiqhView setView={setView} />} />
                    <Route path="/aqeeda" element={<AqeedaView setView={setView} />} />
                    <Route path="/tafseer" element={<TafseerView setView={setView} />} />
                    <Route path="/basic-hadith" element={<BasicHadithView setView={setView} />} />
                    <Route path="/adab" element={<AdabView setView={setView} />} />
                    <Route path="/morality" element={<MoralityView setView={setView} />} />
                    <Route path="/adeiah" element={<AdeiahView setView={setView} />} />
                    <Route path="/misc" element={<MiscView setView={setView} />} />
                    <Route path="/seera" element={<SeeraView setView={setView} />} />
                    <Route path="/umrah" element={<UmrahView setView={setView} />} />
                    <Route path="/fasting" element={<FastingGuideView setView={setView} />} />
                    <Route path="/salat" element={<SalatGuideView setView={setView} />} />
                    <Route path="/gallery" element={<GalleryView />} />
                    <Route path="/profile" element={<ProfileView />} />
                    <Route path="/reset-password" element={<ResetPasswordView />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="content" element={<ContentManagement />} />
                      <Route path="users" element={<UserManagement />} />
                      <Route path="verification" element={<VerificationRequests />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="ai-assistant" element={<AIContentAssistant />} />
                      <Route path="reports" element={<AdvancedReports />} />
                      <Route path="polls" element={<PollsManagement />} />
                    </Route>
                  </Routes>
                </Suspense>
              </div>
            </main>

            {currentView !== ViewMode.QURAN && <Player />}
            
            <GlobalSearch 
              isOpen={isSearchOpen} 
              onClose={() => setIsSearchOpen(false)} 
            />
            
            <ChatWidget />
          </div>
        </AudioPlayerProvider>
      </ChatProvider>
    </AuthProvider>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // Debug font loading with FontFace API
    const fontsToLoad = [
      { name: 'KFGQPC Uthman Taha Naskh', url: '/UthmanicHafs1Ver18.woff2' },
      { name: 'p483-v2', url: 'https://static.quran.com/fonts/quran/hafs/v2/ttf/p483.ttf' }
    ];

    fontsToLoad.forEach(font => {
      const fontFace = new FontFace(font.name, `url(${font.url})`);
      fontFace.load().then((loadedFace) => {
        document.fonts.add(loadedFace);
        console.log(`Font "${font.name}" loaded successfully via FontFace API`);
      }).catch(err => {
        console.error(`Failed to load font "${font.name}" from ${font.url}:`, err);
      });
    });

    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        const fontsToCheck = ['KFGQPC Uthman Taha Naskh', 'p483-v2'];
        fontsToCheck.forEach(font => {
          const isLoaded = document.fonts.check(`12px "${font}"`);
          console.log(`Font "${font}" status (document.fonts.check): ${isLoaded ? 'Loaded' : 'Not Loaded'}`);
        });
      });
    }
  }, []);

  return (
    <ThemeProvider>
      {/* Hidden test element to force font loading and verify rendering */}
      <div style={{ position: 'absolute', top: -1000, left: -1000, opacity: 0, pointerEvents: 'none' }}>
        <span style={{ fontFamily: 'p483-v2' }}>test</span>
        <span style={{ fontFamily: 'KFGQPC Uthman Taha Naskh' }}>بسم الله</span>
      </div>
      <LanguageProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;

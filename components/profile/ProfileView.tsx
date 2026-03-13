import { HugeiconsIcon } from '@hugeicons/react';
import { 
  UserIcon, 
  Settings01Icon, 
  Logout01Icon, 
  Message01Icon, 
  BookOpen01Icon, 
  LibraryIcon, 
  ArrowRight01Icon, 
  Edit02Icon, 
  Notification01Icon, 
  SecurityIcon, 
  HelpCircleIcon, 
  Cancel01Icon, 
  InformationCircleIcon, 
  FavouriteIcon, 
  Camera02Icon, 
  Image01Icon,
  TelegramIcon,
  Facebook01Icon,
  YoutubeIcon,
  TiktokIcon,
  InstagramIcon,
  Mail01Icon,
  Globe02Icon,
  Loading02Icon,
  SparklesIcon,
  FireIcon,
  StarIcon,
  Share01Icon,
  MoreHorizontalIcon,
  Sun01Icon,
  Moon01Icon,
  Shield01Icon
} from '@hugeicons/core-free-icons';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAvatarUrl } from '@/utils/user';
import { useTheme } from '@/contexts/ThemeContext';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/supabase';
import { AuthModal } from '../auth/AuthModal';
import { EditProfileModal } from './EditProfileModal';
import { VerificationRequestModal } from './VerificationRequestModal';
import { MyQuranView } from './MyQuranView';
import { SavedPostsView } from './SavedPostsView';
import { MyPostsView } from './MyPostsView';
import { VerifiedBadge } from '../shared/VerifiedBadge';
import { useToast } from '@/contexts/ToastContext';
import { LoginActivity } from './settings/LoginActivity';
import { ActivityLog } from './settings/ActivityLog';
import { PrivacySettings } from './settings/PrivacySettings';
import { HelpSupport } from './settings/HelpSupport';
import { TwoFactorSetup } from './settings/TwoFactorSetup';
import { trackActivity } from '@/src/services/activityService';
import { UserEngagementWidget } from './UserEngagementWidget';
import { FollowListModal } from './FollowListModal';
import { FollowButton } from '../community/feed/FollowButton';
import { ShareProfileModal } from './ShareProfileModal';

export const ProfileView: React.FC = () => {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('id');
  const { user, profile: myProfile, signOut, refreshProfile } = useAuth();
  
  const [targetProfile, setTargetProfile] = useState<any>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'quran' | 'library' | 'settings'>('posts');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isTelegramInfoOpen, setIsTelegramInfoOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAllSocials, setShowAllSocials] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [postCounts, setPostCounts] = useState({ articles: 0, videos: 0, books: 0, audio: 0 });
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPrivacySettingsOpen, setIsPrivacySettingsOpen] = useState(false);
  const [isHelpSupportOpen, setIsHelpSupportOpen] = useState(false);
  const [isTwoFactorSetupOpen, setIsTwoFactorSetupOpen] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkProfile = async () => {
      const currentTargetId = targetId || user?.id;
      
      if (!currentTargetId) {
        setIsOwnProfile(false);
        setTargetProfile(null);
        return;
      }
      
      const own = user?.id === currentTargetId;
      setIsOwnProfile(own);

      if (own && myProfile) {
        setTargetProfile(myProfile);
        fetchPostCounts(user!.id);
        fetchFollowCounts(user!.id);
      } else {
        setLoadingProfile(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentTargetId)
            .single();
          
          if (error) throw error;
          setTargetProfile(data);
          fetchPostCounts(currentTargetId);
          fetchFollowCounts(currentTargetId);
        } catch (err) {
          console.error('Error fetching target profile:', err);
          showToast('មិនអាចរកឃើញ Profile នេះទេ', 'error');
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    checkProfile();
  }, [user, targetId, myProfile]);

  const fetchFollowCounts = async (uid: string) => {
    if (!uid || !supabase) return;
    try {
      const [followersRes, followingRes] = await Promise.all([
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', uid),
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', uid)
      ]);
      
      setFollowCounts({
        followers: followersRes.count || 0,
        following: followingRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
  };

  const fetchPostCounts = async (uid: string) => {
    if (!uid || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('type, extra_data')
        .eq('user_id', uid);
      
      if (error) throw error;
      
      const counts = { articles: 0, videos: 0, books: 0, audio: 0 };
      data?.forEach(post => {
        const type = post.extra_data?.originalType || post.type;
        if (type === 'text' || type === 'article') counts.articles++;
        else if (type === 'video') counts.videos++;
        else if (type === 'book') counts.books++;
        else if (type === 'audio' || type === 'voice') counts.audio++;
      });
      setPostCounts(counts);
    } catch (error) {
      console.error('Error fetching post counts:', error);
    }
  };

  const isTelegramUser = user?.email?.startsWith('tg') && user?.email?.endsWith('@ponloe.com');
  const avatarUrl = getAvatarUrl(isOwnProfile ? user : null, targetProfile);
  const coverUrl = targetProfile?.cover_url;
  const displayName = targetProfile?.full_name || (isOwnProfile ? user?.user_metadata?.full_name : 'អ្នកប្រើប្រាស់');

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <HugeiconsIcon icon={Loading02Icon} className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="font-khmer opacity-60">កំពុងទាញយក Profile...</p>
      </div>
    );
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      let file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/${type}-${Math.random()}.${fileExt}`;

      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: type === 'avatar' ? 512 : 1920,
          useWebWorker: true
        };
        file = await imageCompression(file, options);
      } catch (error) {
        console.error('Error compressing image:', error);
      }

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [type === 'avatar' ? 'avatar_url' : 'cover_url']: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      await refreshProfile();
      showToast('បានផ្លាស់ប្តូរដោយជោគជ័យ!', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const socialLinks = [
    { id: 'fb', icon: Facebook01Icon, url: targetProfile?.social_fb, color: 'text-blue-600', hover: 'hover:text-blue-700' },
    { id: 'tg', icon: TelegramIcon, url: targetProfile?.social_telegram, color: 'text-blue-400', hover: 'hover:text-blue-500' },
    { id: 'yt', icon: YoutubeIcon, url: targetProfile?.social_youtube, color: 'text-red-600', hover: 'hover:text-red-700' },
    { id: 'tt', icon: TiktokIcon, url: targetProfile?.social_tiktok, color: theme === 'dark' ? 'text-white' : 'text-black', hover: 'opacity-80' },
    { id: 'ig', icon: InstagramIcon, url: targetProfile?.social_instagram, color: 'text-pink-600', hover: 'hover:text-pink-700' },
    { id: 'gm', icon: Mail01Icon, url: targetProfile?.social_gmail ? `mailto:${targetProfile.social_gmail}` : null, color: 'text-red-500', hover: 'hover:text-red-600' },
    { id: 'ws', icon: Globe02Icon, url: targetProfile?.social_website, color: 'text-emerald-600', hover: 'hover:text-emerald-700' },
  ].filter(link => link.url);

  const visibleSocials = showAllSocials ? socialLinks : socialLinks.slice(0, 4);
  const hiddenCount = socialLinks.length - 4;
  const hasSocialLinks = socialLinks.length > 0;

  const handleDeleteAccount = async () => {
    if (!user?.email_confirmed_at) {
      showToast('អ្នកត្រូវតែផ្ទៀងផ្ទាត់ Email របស់អ្នកជាមុនសិន ទើបអាចលុបគណនីបាន។', 'error');
      return;
    }

    const confirmed = window.confirm('តើអ្នកពិតជាចង់លុបគណនីនេះមែនទេ? ទិន្នន័យទាំងអស់នឹងត្រូវបាត់បង់ជារៀងរហូត។');
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase.rpc('request_user_deletion');
      if (error && error.message.includes('not found')) {
        await signOut();
        showToast('សំណើលុបគណនីត្រូវបានផ្ញើ។ គណនីរបស់អ្នកនឹងត្រូវលុបក្នុងពេលឆាប់ៗ។', 'success');
      } else if (error) {
        throw error;
      } else {
        await signOut();
        showToast('គណនីត្រូវបានលុបដោយជោគជ័យ។', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'មានបញ្ហាក្នុងការលុបគណនី។', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`min-h-screen font-khmer transition-colors duration-500 ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-gray-900'
    }`}>
      {/* Hero Section with Integrated Cover & Profile */}
      <div className="relative">
        {/* Cover Photo with Gradient Overlay */}
        <div className={`relative h-[25vh] md:h-[30vh] overflow-hidden ${
          theme === 'dark' ? 'bg-slate-900' : 'bg-emerald-600'
        }`}>
          {coverUrl ? (
            <motion.img 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5 }}
              referrerPolicy="no-referrer" 
              src={coverUrl} 
              alt="Cover" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-500 to-emerald-800" />
          )}
          
          {/* Glass Overlay for Cover */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          
          <div className="absolute top-4 right-4 flex gap-2">
            {isOwnProfile && user && (
              <>
                <button 
                  onClick={() => coverInputRef.current?.click()}
                  className="p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-xl transition-all border border-white/10 group"
                >
                  <HugeiconsIcon icon={Camera02Icon} strokeWidth={1.5} className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <input type="file" ref={coverInputRef} onChange={(e) => handleImageUpload(e, 'cover')} accept="image/*" className="hidden" />
              </>
            )}
          </div>
        </div>

        {/* Profile Info Floating Card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-4 space-y-4">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`rounded-[2rem] p-5 border backdrop-blur-2xl shadow-xl relative ${
                  theme === 'dark' 
                    ? 'bg-slate-900/90 border-slate-800 shadow-slate-950/50' 
                    : 'bg-white/90 border-white shadow-emerald-900/10'
                }`}
              >
                {/* Theme Toggle Button */}
                <button 
                  onClick={toggleTheme}
                  className="absolute top-4 right-4 p-2 bg-white text-gray-700 rounded-xl shadow-sm hover:bg-gray-100 transition-all border border-gray-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                >
                  <HugeiconsIcon icon={theme === 'dark' ? Sun01Icon : Moon01Icon} strokeWidth={1.5} className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                  {/* Avatar with Ring */}
                  <div className="relative mb-3">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full p-1 bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 shadow-xl">
                      <div className={`w-full h-full rounded-full border-4 overflow-hidden flex items-center justify-center ${
                        theme === 'dark' ? 'border-slate-900 bg-slate-800' : 'border-white bg-gray-100'
                      }`}>
                        {avatarUrl ? (
                          <img referrerPolicy="no-referrer" src={avatarUrl} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className="w-10 h-10 text-emerald-600" />
                        )}
                      </div>
                    </div>

                    {isOwnProfile && user && (
                      <button 
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-all border-2 border-white dark:border-slate-900"
                      >
                        <HugeiconsIcon icon={Camera02Icon} strokeWidth={1.5} className="w-4 h-4" />
                      </button>
                    )}
                    <input type="file" ref={avatarInputRef} onChange={(e) => handleImageUpload(e, 'avatar')} accept="image/*" className="hidden" />
                  </div>

                  {/* Name & Username */}
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <h2 className={`text-xl font-bold font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {targetProfile ? displayName : t('profile.guestUser')}
                    </h2>
                    {targetProfile?.is_verified && (
                      <VerifiedBadge role={targetProfile.role} className="w-5 h-5" />
                    )}
                  </div>
                  {targetProfile?.username && (
                    <p className="text-emerald-600 font-bold text-xs mb-2">@{targetProfile.username}</p>
                  )}

                  {/* Bio */}
                  {targetProfile?.bio ? (
                    <p className={`text-xs leading-relaxed mb-4 px-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      {targetProfile.bio}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic mb-4">{t('profile.noBio')}</p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 w-full mb-4">
                    <div className="flex gap-2 w-full">
                      {!user ? (
                        <div className="flex gap-2 w-full">
                          <button 
                            onClick={() => setIsAuthModalOpen(true)}
                            className="flex-1 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
                          >
                            {t('profile.login')}
                          </button>
                          <button 
                            onClick={() => setIsShareModalOpen(true)}
                            className={`p-2.5 rounded-xl border transition-all ${
                              theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-gray-200 text-gray-700'
                            }`}
                          >
                            <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-4 h-4" />
                          </button>
                        </div>
                      ) : isOwnProfile ? (
                        <>
                          <button 
                            onClick={() => setIsEditProfileOpen(true)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-bold text-sm rounded-xl transition-all border ${
                              theme === 'dark' 
                                ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' 
                                : 'bg-slate-50 border-gray-200 text-gray-700 hover:bg-white hover:shadow-sm'
                            }`}
                          >
                            <HugeiconsIcon icon={Edit02Icon} strokeWidth={1.5} className="w-4 h-4" />
                            {t('profile.edit')}
                          </button>
                          <button 
                            onClick={() => setIsShareModalOpen(true)}
                            className={`p-2.5 rounded-xl border transition-all ${
                              theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-gray-200 text-gray-700'
                            }`}
                          >
                            <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="flex gap-2 w-full">
                          <div className="flex-1">
                            <FollowButton targetUserId={targetProfile?.id} />
                          </div>
                          <button 
                            onClick={() => setIsShareModalOpen(true)}
                            className={`p-2.5 rounded-xl border transition-all ${
                              theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-gray-200 text-gray-700'
                            }`}
                          >
                            <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    {isOwnProfile && user && !targetProfile?.is_verified && (
                      <button 
                        onClick={() => setIsVerificationModalOpen(true)}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 font-bold text-sm rounded-xl transition-all border ${
                          theme === 'dark' 
                            ? 'bg-emerald-900/20 border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/40' 
                            : 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <HugeiconsIcon icon={Shield01Icon} strokeWidth={1.5} className="w-4 h-4" />
                        ស្នើសុំការផ្ទៀងផ្ទាត់ (Verify Identity)
                      </button>
                    )}
                  </div>

                  {/* Social Links */}
                  {hasSocialLinks && (
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {visibleSocials.map((social, index) => (
                        <motion.a 
                          whileHover={{ y: -2 }}
                          key={index} 
                          href={social.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`p-2 rounded-xl transition-all ${
                            theme === 'dark' ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-800' : 'bg-gray-50 text-gray-600 hover:bg-white hover:shadow-sm'
                          }`}
                        >
                          <HugeiconsIcon icon={social.icon} strokeWidth={1.5} className="w-4 h-4" />
                        </motion.a>
                      ))}
                      {hiddenCount > 0 && (
                        <button 
                          onClick={() => setShowAllSocials(!showAllSocials)}
                          className={`p-2 rounded-xl font-bold text-xs transition-all ${
                            theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {showAllSocials ? <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4" /> : `+${hiddenCount}`}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div 
                      onClick={() => {
                        setFollowModalType('followers');
                        setShowFollowModal(true);
                      }}
                      className={`p-2 rounded-2xl border cursor-pointer transition-colors ${theme === 'dark' ? 'bg-slate-800/30 border-slate-800 hover:bg-slate-800/50' : 'bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50'}`}
                    >
                      <p className="text-xl font-bold text-emerald-600">{followCounts.followers}</p>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{t('profile.followers')}</p>
                    </div>
                    <div 
                      onClick={() => {
                        setFollowModalType('following');
                        setShowFollowModal(true);
                      }}
                      className={`p-2 rounded-2xl border cursor-pointer transition-colors ${theme === 'dark' ? 'bg-slate-800/30 border-slate-800 hover:bg-slate-800/50' : 'bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50'}`}
                    >
                      <p className="text-xl font-bold text-emerald-600">{followCounts.following}</p>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{t('profile.following')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Engagement Widget Integrated */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <UserEngagementWidget userId={targetProfile?.id} />
              </motion.div>
            </div>

            {/* Right Column: Tabs & Content */}
            <div className="lg:col-span-8 space-y-4">
              {/* Tab Navigation - Modern Pill Style */}
              <div className={`p-1 rounded-2xl border backdrop-blur-xl sticky top-4 z-30 flex gap-1 ${
                theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-white shadow-lg shadow-emerald-900/5'
              }`}>
                {[
                  { id: 'posts', icon: Message01Icon, label: t('profile.myPost') },
                  { id: 'saved', icon: FavouriteIcon, label: t('profile.saved'), hide: !isOwnProfile },
                  { id: 'quran', icon: BookOpen01Icon, label: t('profile.myQuran') },
                  { id: 'library', icon: LibraryIcon, label: t('profile.myLibrary') },
                  { id: 'settings', icon: Settings01Icon, label: t('profile.settings'), hide: !isOwnProfile },
                ].filter(tab => !tab.hide).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      activeTab === tab.id 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <HugeiconsIcon icon={tab.icon} strokeWidth={1.5} className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-[500px]"
                >
                  {activeTab === 'posts' && <MyPostsView userId={targetProfile?.id} />}
                  {activeTab === 'saved' && <SavedPostsView />}
                  {activeTab === 'quran' && <MyQuranView />}
                  {activeTab === 'library' && (
                    <div className={`flex flex-col items-center justify-center py-32 rounded-[3rem] border border-dashed ${
                      theme === 'dark' ? 'bg-slate-900/30 border-slate-800 text-slate-600' : 'bg-white border-gray-200 text-gray-400'
                    }`}>
                      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                        <HugeiconsIcon icon={LibraryIcon} strokeWidth={1.5} className="w-10 h-10 opacity-40" />
                      </div>
                      <p className="font-bold text-lg">{t('profile.noLibrary')}</p>
                      <p className="text-sm opacity-60 mt-2">{t('profile.noLibraryDesc') || 'Explore our library to add books here.'}</p>
                    </div>
                  )}
                  {activeTab === 'settings' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {isPrivacySettingsOpen ? (
                        <PrivacySettings onBack={() => setIsPrivacySettingsOpen(false)} />
                      ) : isHelpSupportOpen ? (
                        <HelpSupport onBack={() => setIsHelpSupportOpen(false)} />
                      ) : isTwoFactorSetupOpen ? (
                        <TwoFactorSetup onBack={() => setIsTwoFactorSetupOpen(false)} />
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Language Selection */}
                          <div className={`rounded-3xl p-4 border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                              <HugeiconsIcon icon={Globe02Icon} className="text-emerald-600 w-5 h-5" />
                              {t('profile.language')}
                            </h3>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setLanguage('km')}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                                  language === 'km' 
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                                    : (theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-gray-50 border-gray-200 text-gray-600')
                                }`}
                              >
                                {t('profile.khmer')}
                              </button>
                              <button 
                                onClick={() => setLanguage('en')}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                                  language === 'en' 
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                                    : (theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-gray-50 border-gray-200 text-gray-600')
                                }`}
                              >
                                {t('profile.english')}
                              </button>
                            </div>
                          </div>

                          {/* Security Quick Actions */}
                          <div className={`rounded-3xl p-4 border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                              <HugeiconsIcon icon={SecurityIcon} className="text-emerald-600 w-5 h-5" />
                              {t('profile.security')}
                            </h3>
                            <div className="space-y-3">
                              <button 
                                onClick={() => setIsTwoFactorSetupOpen(true)}
                                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                                  theme === 'dark' ? 'bg-slate-800/50 border-slate-800 hover:bg-slate-800' : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-sm'
                                }`}
                              >
                                <div className="text-left">
                                  <p className="font-bold text-xs">2FA Authentication</p>
                                  <p className="text-[10px] text-gray-500">{myProfile?.two_factor_enabled ? 'Enabled' : 'Disabled'}</p>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${myProfile?.two_factor_enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                  <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-all ${myProfile?.two_factor_enabled ? 'left-6' : 'left-1'}`} />
                                </div>
                              </button>
                            </div>
                          </div>

                          {/* Activity Log & Login Activity */}
                          <div className="md:col-span-2">
                            <div className={`rounded-3xl p-4 border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                              <h3 className="text-base font-bold mb-4">សកម្មភាព និងសុវត្ថិភាព</h3>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <LoginActivity />
                                <ActivityLog />
                              </div>
                            </div>
                          </div>

                          {/* Other Settings */}
                          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {[
                              { icon: SecurityIcon, label: t('profile.privacySecurity'), onClick: () => setIsPrivacySettingsOpen(true) },
                              { icon: HelpCircleIcon, label: t('profile.helpSupport'), onClick: () => setIsHelpSupportOpen(true) },
                              { icon: Notification01Icon, label: t('profile.notifications'), onClick: () => {} },
                            ].map((item, i) => (
                              <button 
                                key={i}
                                onClick={item.onClick}
                                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all group ${
                                  theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-gray-100 hover:shadow-md hover:shadow-emerald-900/5'
                                }`}
                              >
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-xs">{item.label}</span>
                              </button>
                            ))}
                          </div>

                          {/* Danger Zone */}
                          <div className="md:col-span-2">
                            <div className={`rounded-3xl p-4 border border-red-100 dark:border-red-900/20 ${theme === 'dark' ? 'bg-red-950/5' : 'bg-red-50/30'}`}>
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                  <h3 className="text-base font-bold text-red-600 mb-1">តំបន់គ្រោះថ្នាក់</h3>
                                  <p className="text-xs text-gray-500 max-w-md">ការលុបគណនីនឹងលុបទិន្នន័យទាំងអស់របស់អ្នកជារៀងរហូត។ សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ។</p>
                                </div>
                                <button 
                                  onClick={handleDeleteAccount}
                                  disabled={isDeleting}
                                  className="px-5 py-2.5 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition-all shadow-md shadow-red-600/20 flex items-center gap-2"
                                >
                                  {isDeleting ? <HugeiconsIcon icon={Loading02Icon} className="animate-spin w-4 h-4" /> : <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />}
                                  លុបគណនី
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Logout */}
                          <div className="md:col-span-2">
                            <button 
                              onClick={() => signOut()}
                              className="w-full py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md"
                            >
                              <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.5} className="w-5 h-5" /> 
                              {t('profile.logout')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {previewImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4" 
            onClick={() => setPreviewImage(null)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-8 h-8" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              referrerPolicy="no-referrer" 
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
      <VerificationRequestModal isOpen={isVerificationModalOpen} onClose={() => setIsVerificationModalOpen(false)} />
      
      <ShareProfileModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        username={targetProfile?.username}
        userId={targetProfile?.id}
        displayName={displayName}
      />
      
      {showFollowModal && targetProfile && (
        <FollowListModal 
          userId={targetProfile.id} 
          type={followModalType} 
          onClose={() => setShowFollowModal(false)} 
        />
      )}

      {/* Telegram Info Modal */}
      {isTelegramInfoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className={`rounded-[3rem] max-w-sm w-full p-10 shadow-2xl relative ${
            theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'
          }`}>
            <button onClick={() => setIsTelegramInfoOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600">
              <HugeiconsIcon icon={Cancel01Icon} />
            </button>
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mb-8">
              <HugeiconsIcon icon={TelegramIcon} strokeWidth={1.5} className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-khmer">{t('telegram.title')}</h3>
            <div className="space-y-4 text-sm opacity-70 leading-relaxed font-khmer">
              <p>{t('telegram.desc1')}</p>
              <p>{t('telegram.desc2')}</p>
            </div>
            <button 
              onClick={() => setIsTelegramInfoOpen(false)}
              className="w-full mt-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
            >
              {t('telegram.ok')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

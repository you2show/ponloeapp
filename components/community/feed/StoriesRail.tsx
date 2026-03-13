import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Cancel01Icon, ArrowLeft01Icon, ArrowRight01Icon, ViewIcon, Loading03Icon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

import { MOCK_USER } from '../shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { getAvatarUrl, getAvatarFallback } from '@/utils/user';

interface Story {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  image: string;
  caption?: string;
  created_at: string;
}

interface StoryGroup {
  userId: string;
  userName: string;
  userAvatar: string;
  stories: Story[];
  hasUnviewed: boolean;
}

export const StoriesRail: React.FC = () => {
  const { user, profile } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const STORY_DURATION = 5000; // 5 seconds per story
  const MAX_STORIES_PER_USER = 10;

  const activeGroupIndexRef = useRef(activeGroupIndex);
  const activeStoryIndexRef = useRef(activeStoryIndex);
  const storyGroupsRef = useRef(storyGroups);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    activeGroupIndexRef.current = activeGroupIndex;
    activeStoryIndexRef.current = activeStoryIndex;
    storyGroupsRef.current = storyGroups;
    isPausedRef.current = isPaused;
  }, [activeGroupIndex, activeStoryIndex, storyGroups, isPaused]);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    if (!supabase) {
      setStoryGroups([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          media_url,
          caption,
          created_at,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const groups: StoryGroup[] = [];
        data.forEach((s: any) => {
          const userId = s.profiles?.id;
          const existing = groups.find(g => g.userId === userId);
          const story: Story = {
            id: s.id,
            user: {
              id: userId,
              name: s.profiles?.full_name || 'Unknown',
              avatar: getAvatarFallback(s.profiles?.avatar_url, s.profiles?.full_name),
            },
            image: s.media_url,
            caption: s.caption,
            created_at: s.created_at,
          };

          if (existing) {
            existing.stories.push(story);
          } else {
            groups.push({
              userId,
              userName: s.profiles?.full_name || 'Unknown',
              userAvatar: getAvatarFallback(s.profiles?.avatar_url, s.profiles?.full_name),
              stories: [story],
              hasUnviewed: true,
            });
          }
        });
        setStoryGroups(groups);
      } else {
        setStoryGroups([]);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStoryGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const openStory = (groupIndex: number) => {
    setActiveGroupIndex(groupIndex);
    setActiveStoryIndex(0);
    setProgress(0);
    setIsPaused(false);
  };

  const closeStory = () => {
    setActiveGroupIndex(null);
    setActiveStoryIndex(0);
    setProgress(0);
    setIsPaused(false);
    if (progressInterval.current) clearInterval(progressInterval.current);
  };

  const nextStory = useCallback(() => {
    const gIndex = activeGroupIndexRef.current;
    const sIndex = activeStoryIndexRef.current;
    const groups = storyGroupsRef.current;

    if (gIndex === null) return;
    const group = groups[gIndex];
    
    if (sIndex < group.stories.length - 1) {
      setActiveStoryIndex(sIndex + 1);
      setProgress(0);
    } else if (gIndex < groups.length - 1) {
      setActiveGroupIndex(gIndex + 1);
      setActiveStoryIndex(0);
      setProgress(0);
    } else {
      closeStory();
    }
  }, []);

  const prevStory = useCallback(() => {
    const gIndex = activeGroupIndexRef.current;
    const sIndex = activeStoryIndexRef.current;
    const groups = storyGroupsRef.current;

    if (gIndex === null) return;
    if (sIndex > 0) {
      setActiveStoryIndex(sIndex - 1);
      setProgress(0);
    } else if (gIndex > 0) {
      const prevGroup = groups[gIndex - 1];
      setActiveGroupIndex(gIndex - 1);
      setActiveStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
    }
  }, []);

  const startProgress = useCallback(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    const step = 100 / (STORY_DURATION / 50);
    progressInterval.current = setInterval(() => {
      if (isPausedRef.current) return;
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + step;
      });
    }, 50);
  }, [nextStory]);

  useEffect(() => {
    if (activeGroupIndex !== null) {
      startProgress();
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [activeGroupIndex, activeStoryIndex, startProgress]);

  const pauseStory = () => setIsPaused(true);
  const resumeStory = () => setIsPaused(false);

  const handleCreateStoryClick = async () => {
    if (!user) {
      showToast('សូមចូលប្រើប្រាស់ជាមុនសិន', 'info');
      return;
    }

    // Check story limit
    try {
      const { count, error } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      if (count && count >= MAX_STORIES_PER_USER) {
        showToast(`អ្នកអាចបង្ហោះរឿងបានត្រឹមតែ ${MAX_STORIES_PER_USER} ប៉ុណ្ណោះក្នុងរយៈពេល 24 ម៉ោង`, 'error');
        return;
      }

      fileInputRef.current?.click();
    } catch (error) {
      console.error('Error checking story limit:', error);
      fileInputRef.current?.click(); // Allow anyway if check fails
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      showToast('សូមជ្រើសរើសតែរូបភាពប៉ុណ្ណោះ', 'error');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('រូបភាពធំពេក (អតិបរមា 5MB)', 'error');
      return;
    }

    await uploadStory(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadStory = async (file: File) => {
    setIsUploading(true);
    try {
      // 1. Upload to server
      const formData = new FormData();
      formData.append('image', file);

      const uploadRes = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Failed to upload image');
      const uploadData = await uploadRes.json();
      
      if (!uploadData.success) throw new Error(uploadData.error || 'Upload failed');

      const imageUrl = uploadData.type === 'r2' ? uploadData.url : `/api/image/${uploadData.fileId}`;

      // 2. Save to Supabase
      const { error } = await supabase
        .from('stories')
        .insert({
          user_id: user?.id,
          media_url: imageUrl,
          media_type: 'image',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });

      if (error) throw error;

      showToast('បានបង្ហោះរឿងដោយជោគជ័យ', 'success');
      fetchStories(); // Refresh stories
    } catch (error) {
      console.error('Error creating story:', error);
      showToast('មានបញ្ហាក្នុងការបង្ហោះរឿង', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const avatarUrl = getAvatarUrl(user, profile);

  const renderStoryViewer = () => {
    if (activeGroupIndex === null || !storyGroups[activeGroupIndex]) return null;

    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center animate-in fade-in duration-200">
        {/* Background blur for better aesthetics */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl"
          style={{ backgroundImage: `url(${storyGroups[activeGroupIndex].stories[activeStoryIndex].image})` }}
        />
        
        <div className="relative w-full h-full max-w-md mx-auto flex flex-col bg-black overflow-hidden shadow-2xl">
          {/* Progress Bars */}
          <div className="absolute top-0 left-0 right-0 z-30 px-2 pt-3 flex gap-1 bg-gradient-to-b from-black/60 to-transparent pb-4">
            {storyGroups[activeGroupIndex].stories.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-75 ease-linear"
                  style={{ 
                    width: idx < activeStoryIndex ? '100%' : idx === activeStoryIndex ? `${progress}%` : '0%' 
                  }}
                ></div>
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-6 left-0 right-0 z-30 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden">
                <img 
                  src={storyGroups[activeGroupIndex].userAvatar || undefined}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="drop-shadow-md">
                <p className="text-white text-sm font-bold">{storyGroups[activeGroupIndex].userName}</p>
                <p className="text-white/80 text-[11px]">
                  {new Date(storyGroups[activeGroupIndex].stories[activeStoryIndex].created_at).toLocaleString('km-KH')}
                </p>
              </div>
            </div>
            <button 
              onClick={closeStory}
              className="p-2 text-white/80 hover:text-white rounded-full transition-colors"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="w-6 h-6 drop-shadow-md" />
            </button>
          </div>

          {/* Story Image */}
          <div className="flex-1 w-full h-full flex items-center justify-center relative">
            <img 
              src={storyGroups[activeGroupIndex].stories[activeStoryIndex].image || undefined}
              alt="Story"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
            />
            
            {/* Caption */}
            {storyGroups[activeGroupIndex].stories[activeStoryIndex].caption && (
              <div className="absolute bottom-20 left-0 right-0 px-6 text-center z-20">
                <p className="text-white text-sm font-khmer bg-black/60 backdrop-blur-md rounded-xl px-4 py-3 inline-block shadow-lg max-w-full break-words">
                  {storyGroups[activeGroupIndex].stories[activeStoryIndex].caption}
                </p>
              </div>
            )}
          </div>

          {/* Navigation Areas */}
          <div 
            className="absolute left-0 top-16 bottom-16 w-1/3 z-20 cursor-pointer"
            onClick={prevStory}
            onTouchStart={pauseStory}
            onTouchEnd={resumeStory}
            onMouseDown={pauseStory}
            onMouseUp={resumeStory}
            onMouseLeave={resumeStory}
          ></div>
          <div 
            className="absolute right-0 top-16 bottom-16 w-2/3 z-20 cursor-pointer"
            onClick={nextStory}
            onTouchStart={pauseStory}
            onTouchEnd={resumeStory}
            onMouseDown={pauseStory}
            onMouseUp={resumeStory}
            onMouseLeave={resumeStory}
          ></div>
        </div>

        {/* Desktop Navigation Buttons */}
        <button 
          onClick={(e) => { e.stopPropagation(); prevStory(); }}
          className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-30 backdrop-blur-md border border-white/20"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="w-8 h-8" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); nextStory(); }}
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-30 backdrop-blur-md border border-white/20"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="w-8 h-8" />
        </button>
      </div>,
      document.body
    );
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-4 mb-4 relative overflow-hidden">
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {/* Create Story Button - Facebook Style */}
          <div 
            onClick={handleCreateStoryClick}
            className="flex-shrink-0 w-28 h-48 relative rounded-xl overflow-hidden cursor-pointer group shadow-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex flex-col"
          >
            <div className="h-[65%] w-full overflow-hidden">
              <img 
                src={avatarUrl} 
                className="w-full h-full object-cover transition-transform duration-500" 
                alt="Me" 
                referrerPolicy="no-referrer" 
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="h-[35%] w-full flex flex-col items-center justify-end pb-3 relative bg-gray-50 dark:bg-slate-800">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white border-4 border-white dark:border-slate-800 shadow-sm">
                {isUploading ? (
                  <HugeiconsIcon icon={Loading03Icon} strokeWidth={1.5} className="w-5 h-5 animate-spin" />
                ) : (
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2.5} className="w-6 h-6" />
                )}
              </div>
              <span className="text-gray-900 dark:text-white text-xs font-bold font-khmer mt-2">
                {isUploading ? 'កំពុងបង្ហោះ...' : 'បង្កើតរឿង'}
              </span>
            </div>
          </div>

          {/* Story Items */}
          {loading ? (
            // Skeleton loading
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-28 h-48 rounded-xl bg-gray-200 dark:bg-slate-800 animate-pulse"></div>
            ))
          ) : (
            storyGroups.map((group, groupIdx) => (
              <div 
                key={group.userId} 
                className="flex-shrink-0 w-28 h-48 relative rounded-xl overflow-hidden cursor-pointer group shadow-sm"
                onClick={() => openStory(groupIdx)}
              >
                <img 
                  src={group.stories[0].image || undefined} 
                  className="w-full h-full object-cover transition-transform duration-500" 
                  alt={group.userName} 
                  referrerPolicy="no-referrer" 
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                <div className={`absolute top-3 left-3 w-8 h-8 rounded-full border-[2.5px] ${group.hasUnviewed ? 'border-blue-500' : 'border-gray-300'} p-0.5 z-10 bg-transparent`}>
                  <img 
                    src={group.userAvatar || undefined} 
                    className="w-full h-full rounded-full object-cover" 
                    alt="avatar" 
                    referrerPolicy="no-referrer" 
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="absolute bottom-3 left-2 right-2 text-white">
                  <p className="text-xs font-bold truncate drop-shadow-md">{group.userName}</p>
                </div>
                {group.stories.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {group.stories.length}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {renderStoryViewer()}
    </>
  );
};


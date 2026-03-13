import { HugeiconsIcon } from '@hugeicons/react';
import { 
  MoreHorizontalIcon, 
  Tick01Icon, 
  Share01Icon, 
  Comment01Icon, 
  ThumbsUpIcon,
  Image01Icon,
  PlayCircleIcon,
  FavouriteIcon,
  Flag01Icon,
  Delete02Icon,
  PencilEdit01Icon,
  Bookmark01Icon,
  Calendar01Icon,
  Location01Icon,
  ChartBarLineIcon,
  BookOpen01Icon,
  Store01Icon,
  CharityIcon,
  LibraryIcon
} from '@hugeicons/core-free-icons';

import React, { useState, useRef, useEffect } from 'react';
import { Post } from '../shared';
import { PostFooter } from './post-card/PostFooter';
import { PostMedia } from './post-card/PostMedia';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { mediaService } from '@/src/services/mediaService';
import { trackActivity } from '@/src/services/activityService';

import { SimpleAudioPlayer } from '../shared/SimpleAudioPlayer';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';

interface PostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id === post.user.id;

  useEffect(() => {
    console.log(`Rendering PostCard for post ID: ${post.id}`, {
      type: post.type,
      originalType: post.originalType,
      images: post.images,
      audioData: post.audioData,
      extra_data: post.extra_data
    });
  }, [post]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      checkIfSaved();
      trackActivity('view_post', { post_id: post.id, post_type: post.type }, user.id);
    }
  }, [user, post.id]);

  const checkIfSaved = async () => {
    if (!user || !supabase) return;
    try {
      const { data } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();
      setIsSaved(!!data);
    } catch (e) {}
  };

  const handleSave = async () => {
    if (!user) {
      showToast('សូមចូលគណនីដើម្បីរក្សាទុក', 'error');
      return;
    }
    try {
      if (isSaved) {
        await supabase.from('saved_posts').delete().eq('post_id', post.id).eq('user_id', user.id);
        setIsSaved(false);
        trackActivity('unsave_post', { post_id: post.id }, user.id);
      } else {
        await supabase.from('saved_posts').insert({ post_id: post.id, user_id: user.id });
        setIsSaved(true);
        trackActivity('save_post', { post_id: post.id }, user.id);
        
        // Proactively cache media for offline use
        if (post.images && post.images.length > 0) {
            post.images.forEach(img => {
                const url = typeof img === 'string' ? img : img.url;
                mediaService.cacheMedia(url);
            });
        }
        
        const audioTracks = post.audioData?.tracks || post.extra_data?.audioData?.tracks;
        if (audioTracks && audioTracks.length > 0) {
            audioTracks.forEach((track: any) => {
                mediaService.cacheMedia(track.url);
            });
        }
      }
    } catch (e) {
      console.error('Error saving post:', e);
    }
    setShowMenu(false);
  };

  return (
    <div className="rounded-xl border shadow-sm mb-4 transition-colors duration-300 bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              referrerPolicy="no-referrer" 
              src={post.user.avatar} 
              alt={post.user.name} 
              className="w-10 h-10 rounded-full object-cover border border-gray-100" 
              loading="lazy"
              decoding="async"
            />
            {post.user.isVerified && (
              <div className="absolute -right-1 -bottom-1 bg-white dark:bg-slate-900 rounded-full p-0.5">
                <VerifiedBadge role={post.user.role} className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1">
              <h3 className="font-bold text-sm hover:underline cursor-pointer text-gray-900 dark:text-white">
                {post.user.name}
              </h3>
              {post.user.role === 'admin' && (
                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Admin</span>
              )}
              
              {/* Feeling Display */}
              {(() => {
                  const feeling = post.feeling || post.extra_data?.feeling;
                  if (!feeling) return null;
                  return (
                    <span className="text-xs font-normal text-gray-500 dark:text-slate-400">
                       កំពុងមានអារម្មណ៍ {feeling.emoji} {feeling.name}
                    </span>
                  );
              })()}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span>{post.timestamp}</span>
                
                {/* Location Display */}
                {(() => {
                    const location = post.location || post.extra_data?.location;
                    if (!location) return null;
                    return (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-0.5">
                          <HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-3 h-3" />
                          <span>{location}</span>
                        </div>
                      </>
                    );
                })()}
            </div>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full transition-colors hover:bg-gray-100 text-gray-500 dark:hover:bg-slate-800 dark:text-slate-400"
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.5} className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 bg-white border-gray-100 text-gray-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
              <div className="p-2 space-y-1">
                <button 
                  onClick={handleSave}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-khmer rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  <HugeiconsIcon icon={Bookmark01Icon} strokeWidth={1.5} className={`w-5 h-5 ${isSaved ? 'text-emerald-500 fill-emerald-500' : ''}`} />
                  <span>{isSaved ? 'ដកចេញពីការរក្សាទុក' : 'រក្សាទុកការបង្ហោះ'}</span>
                </button>
                
                {isOwner && (
                  <>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-khmer rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-slate-700">
                      <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={1.5} className="w-5 h-5" />
                      <span>កែប្រែការបង្ហោះ</span>
                    </button>
                    <button 
                      onClick={() => {
                        if(window.confirm('តើអ្នកប្រាកដជាចង់លុបការបង្ហោះនេះមែនទេ?')) {
                          onDelete?.(post.id);
                        }
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-khmer rounded-xl transition-colors hover:bg-red-50 text-red-600 dark:hover:bg-red-900/30 dark:text-red-400"
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} className="w-5 h-5" />
                      <span>លុបការបង្ហោះ</span>
                    </button>
                  </>
                )}
                
                {!isOwner && (
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-khmer rounded-xl transition-colors hover:bg-red-50 text-red-600 dark:hover:bg-red-900/30 dark:text-red-400">
                    <HugeiconsIcon icon={Flag01Icon} strokeWidth={1.5} className="w-5 h-5" />
                    <span>រាយការណ៍ការបង្ហោះ</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-[15px] leading-relaxed font-khmer whitespace-pre-wrap text-gray-800 dark:text-slate-200">
          {post.content}
        </p>
        
        {/* Event Data rendering */}
        {(() => {
          const eventData = (post as any).eventData || (post as any).extra_data?.eventData;
          
          if (!eventData) {
              if (post.type === 'event' || post.extra_data?.originalType === 'event') {
                  return (
                      <div className="p-4 border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                          មានបញ្ហាក្នុងការបង្ហាញទិន្នន័យព្រឹត្តិការណ៍ (Event data missing)
                      </div>
                  );
              }
              return null;
          }
          
          return (
            <div className="mt-4 rounded-xl overflow-hidden border border-orange-100 bg-orange-50/50 dark:border-slate-700 dark:bg-slate-800/50">
              {eventData?.coverImage && (
                <div className="w-full h-48 relative">
                  <img 
                    src={eventData.coverImage} 
                    alt="Event Cover" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
              <div className="p-4">
                <h4 className="font-bold text-lg mb-2 text-orange-900 dark:text-white">
                  {eventData?.name || 'ព្រឹត្តិការណ៍'}
                </h4>
                <div className="space-y-2">
                  {(eventData?.date || eventData?.time) && (
                    <div className="flex items-center gap-2 text-sm text-orange-800 dark:text-slate-300">
                      <HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.5} className="w-4 h-4" />
                      <span>
                        {eventData?.date} {eventData?.time && `ម៉ោង ${eventData.time}`}
                      </span>
                    </div>
                  )}
                  {eventData?.location && (
                    <div className="flex items-center gap-2 text-sm text-orange-800 dark:text-slate-300">
                      <HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-4 h-4" />
                      <span>{eventData.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Poll Data rendering */}
        {(() => {
          const pollOptions = post.pollOptions || post.extra_data?.pollOptions;
          if (!pollOptions || pollOptions.length === 0) return null;
          
          const totalVotes = post.totalVotes || post.extra_data?.totalVotes || 0;
          
          return (
            <div className="mt-4 space-y-3 p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 dark:border-slate-700 dark:bg-slate-800/30">
              <div className="flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-400">
                <HugeiconsIcon icon={ChartBarLineIcon} strokeWidth={2} className="w-5 h-5" />
                <span className="font-bold">ការស្ទង់មតិ</span>
              </div>
              {pollOptions.map((option: any) => {
                const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                return (
                  <div key={option.id} className="relative">
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="font-medium text-gray-700 dark:text-slate-200">{option.text}</span>
                      <span className="text-gray-500 dark:text-slate-400">{percentage}% ({option.votes})</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="text-[10px] text-gray-400 dark:text-slate-500 text-right mt-2">
                សរុប: {totalVotes} សំឡេង
              </div>
            </div>
          );
        })()}

        {/* Quran Data rendering */}
        {(() => {
          const quranData = post.quranData || post.extra_data?.quranData;
          if (!quranData) return null;
          
          return (
            <div className="mt-4 p-5 rounded-xl border border-blue-100 bg-blue-50/30 dark:border-slate-700 dark:bg-slate-800/30">
              <div className="flex items-center gap-2 mb-4 text-blue-700 dark:text-blue-400">
                <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={2} className="w-5 h-5" />
                <span className="font-bold">អាយ៉ាត់គម្ពីរកូរអាន</span>
              </div>
              <div className="text-right mb-4">
                <p className="text-2xl font-arabic leading-loose text-gray-900 dark:text-white" dir="rtl">
                  {quranData.arabicText}
                </p>
              </div>
              <div className="border-t border-blue-100 dark:border-slate-700 pt-3">
                <p className="text-sm text-gray-700 dark:text-slate-300 italic leading-relaxed">
                  "{quranData.translation}"
                </p>
                <div className="mt-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {quranData.surahName} : {quranData.ayahNumber}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Dua Data rendering */}
        {(() => {
          const duaData = post.duaData || post.extra_data?.duaData;
          if (!duaData) return null;
          
          return (
            <div className="mt-4 p-5 rounded-xl border border-purple-100 bg-purple-50/30 dark:border-slate-700 dark:bg-slate-800/30">
              <div className="flex items-center gap-2 mb-4 text-purple-700 dark:text-purple-400">
                <HugeiconsIcon icon={CharityIcon} strokeWidth={2} className="w-5 h-5" />
                <span className="font-bold">ឌូអា (Dua)</span>
              </div>
              <div className="text-center mb-4">
                <p className="text-xl font-arabic leading-loose text-gray-900 dark:text-white" dir="rtl">
                  {duaData.arabic}
                </p>
              </div>
              <div className="border-t border-purple-100 dark:border-slate-700 pt-3 text-center">
                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed font-khmer">
                  {duaData.khmer}
                </p>
              </div>
            </div>
          );
        })()}

        {/* Market Data rendering */}
        {(() => {
          const marketData = post.marketData || post.extra_data?.marketData;
          if (!marketData) return null;
          
          return (
            <div className="mt-4 p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 dark:border-slate-700 dark:bg-slate-800/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <HugeiconsIcon icon={Store01Icon} strokeWidth={2} className="w-5 h-5" />
                  <span className="font-bold">ទំនិញសម្រាប់លក់</span>
                </div>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {marketData.price}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-md bg-white dark:bg-slate-700 text-[10px] font-medium text-gray-500 dark:text-slate-400 border border-gray-100 dark:border-slate-600">
                  ប្រភេទ: {marketData.category}
                </span>
                <span className="px-2 py-1 rounded-md bg-white dark:bg-slate-700 text-[10px] font-medium text-gray-500 dark:text-slate-400 border border-gray-100 dark:border-slate-600">
                  ទីតាំង: {marketData.location}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Book Data rendering */}
        {(() => {
          const bookData = post.bookData || post.extra_data?.bookData;
          if (!bookData) return null;
          
          return (
            <div className="mt-4 p-4 rounded-xl border border-amber-100 bg-amber-50/30 dark:border-slate-700 dark:bg-slate-800/30 flex gap-4">
              {bookData.coverPreview && (
                <div className="w-24 h-32 shrink-0 rounded-lg overflow-hidden shadow-md border border-amber-200 dark:border-slate-600">
                  <img src={bookData.coverPreview} alt={bookData.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-white line-clamp-2">{bookData.title}</h4>
                  <p className="text-xs text-amber-700 dark:text-slate-400 mt-1">អ្នកនិពន្ធ: {bookData.author}</p>
                </div>
                {bookData.pdfLink && (
                  <a 
                    href={bookData.pdfLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    <HugeiconsIcon icon={LibraryIcon} strokeWidth={2} className="w-4 h-4" />
                    <span>អានសៀវភៅ</span>
                  </a>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Media */}
      <div className="media-container">
      {(post.type === 'audio' || post.type === 'voice' || post.originalType === 'audio' || post.originalType === 'voice' || post.extra_data?.originalType === 'audio' || post.extra_data?.originalType === 'voice') ? (
          (post.audioData?.tracks && post.audioData.tracks.length > 0) ? (
            <div className="px-4 py-3 rounded-xl mx-4 mb-3 border bg-gray-50 border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                {(() => {
                  const playlist = post.audioData.tracks.map(t => ({
                      id: t.id,
                      url: t.url,
                      title: t.title,
                      artist: t.artist,
                      cover: t.cover,
                      speakerName: t.artist
                  }));
                  return post.audioData.tracks.map((track, index) => (
                    <div key={track.id || index} className={index > 0 ? "mt-3 pt-3 border-t border-gray-200 dark:border-slate-700" : ""}>
                      <SimpleAudioPlayer 
                        url={track.url} 
                        title={track.title}
                        artist={track.artist}
                        cover={track.cover}
                        id={track.id}
                        playlist={playlist}
                        index={index}
                      />
                    </div>
                  ));
                })()}
            </div>
          ) : (post.extra_data?.audioData?.tracks && post.extra_data.audioData.tracks.length > 0) ? (
            <div className="px-4 py-3 rounded-xl mx-4 mb-3 border bg-gray-50 border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                {(() => {
                  const playlist = post.extra_data.audioData.tracks.map((t: any) => ({
                      id: t.id,
                      url: t.url,
                      title: t.title,
                      artist: t.artist,
                      cover: t.cover,
                      speakerName: t.artist
                  }));
                  return post.extra_data.audioData.tracks.map((track: any, index: number) => (
                    <div key={track.id || index} className={index > 0 ? "mt-3 pt-3 border-t border-gray-200 dark:border-slate-700" : ""}>
                      <SimpleAudioPlayer 
                        url={track.url} 
                        title={track.title}
                        artist={track.artist}
                        cover={track.cover}
                        id={track.id}
                        playlist={playlist}
                        index={index}
                      />
                    </div>
                  ));
                })()}
            </div>
          ) : (post.images && post.images.length > 0 && (post.type === 'audio' || post.type === 'voice')) ? (
            // Fallback for audio posts where images might actually be the audio URLs (legacy/buggy data)
            <div className="px-4 py-3 rounded-xl mx-4 mb-3 border bg-gray-50 border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                {(() => {
                  const playlist = post.images.map((image, index) => ({
                      id: typeof image === 'string' ? image : image.id || image.url,
                      url: typeof image === 'string' ? image : image.url,
                      title: post.audioData?.tracks?.[index]?.title || post.extra_data?.audioData?.tracks?.[index]?.title || `Audio ${index + 1}`,
                      artist: post.audioData?.tracks?.[index]?.artist || post.extra_data?.audioData?.tracks?.[index]?.artist || 'Unknown Artist',
                      cover: post.audioData?.tracks?.[index]?.cover || post.extra_data?.audioData?.tracks?.[index]?.cover,
                      speakerName: post.audioData?.tracks?.[index]?.artist || post.extra_data?.audioData?.tracks?.[index]?.artist || 'Unknown Artist'
                  }));
                  return post.images.map((image, index) => (
                    <div key={index} className={index > 0 ? "mt-3 pt-3 border-t border-gray-200 dark:border-slate-700" : ""}>
                      <SimpleAudioPlayer 
                        url={typeof image === 'string' ? image : image.url} 
                        title={post.audioData?.tracks?.[index]?.title || post.extra_data?.audioData?.tracks?.[index]?.title || `Audio ${index + 1}`}
                        artist={post.audioData?.tracks?.[index]?.artist || post.extra_data?.audioData?.tracks?.[index]?.artist || 'Unknown Artist'}
                        cover={post.audioData?.tracks?.[index]?.cover || post.extra_data?.audioData?.tracks?.[index]?.cover}
                        id={typeof image === 'string' ? image : image.id || image.url}
                        playlist={playlist}
                        index={index}
                      />
                    </div>
                  ));
                })()}
            </div>
          ) : (post.images && post.images.length > 0) ? (
            // If it's an audio post but has images, render them as media
            <div className="mt-2 border-y border-gray-50 dark:border-slate-800">
              <PostMedia images={post.images} layout={post.imageLayout} post={post} />
            </div>
          ) : null
      ) : (
          post.images && post.images.length > 0 && (
            <div className="mt-2 border-y border-gray-50 dark:border-slate-800">
              <PostMedia images={post.images} layout={post.imageLayout} post={post} />
            </div>
          )
      )}
      </div>

      {/* Footer Actions */}
      <PostFooter post={post} />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Loading02Icon, UserIcon, Calendar01Icon } from '@hugeicons/core-free-icons';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';
import { FollowButton } from '@/components/community/feed/FollowButton';

interface FollowListModalProps {
  userId: string;
  type: 'followers' | 'following';
  onClose: () => void;
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  role: string;
  is_verified: boolean;
  follow_date?: string;
}

export const FollowListModal: React.FC<FollowListModalProps> = ({ userId, type, onClose }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [userId, type]);

  const fetchUsers = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      let query;
      if (type === 'followers') {
        // Fetch people who follow the user
        query = supabase
          .from('follows')
          .select(`
            follower_id,
            created_at,
            profiles!follows_follower_id_fkey (
              id,
              full_name,
              avatar_url,
              role,
              is_verified
            )
          `)
          .eq('following_id', userId);
      } else {
        // Fetch people the user is following
        query = supabase
          .from('follows')
          .select(`
            following_id,
            created_at,
            profiles!follows_following_id_fkey (
              id,
              full_name,
              avatar_url,
              role,
              is_verified
            )
          `)
          .eq('follower_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const formattedUsers = data.map((item: any) => ({
          ...item.profiles,
          follow_date: new Date(item.created_at).toLocaleDateString('km-KH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        })).filter(u => u.id);
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (targetId: string) => {
    navigate(`/profile?id=${targetId}`);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[80vh] overflow-hidden ${
          theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'}`}>
          <h2 className={`font-bold font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {type === 'followers' ? 'អ្នកតាមដាន' : 'កំពុងតាមដាន'}
          </h2>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <HugeiconsIcon icon={Loading02Icon} className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
              <p className={`text-sm font-khmer ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                កំពុងទាញយកទិន្នន័យ...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
              }`}>
                <HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className={`w-8 h-8 ${
                  theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                }`} />
              </div>
              <p className={`font-khmer ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                មិនទាន់មាន{type === 'followers' ? 'អ្នកតាមដាន' : 'អ្នកដែលកំពុងតាមដាន'}ទេ
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => handleUserClick(u.id)}
                  >
                    <div className="relative">
                      <img 
                        src={u.avatar_url || 'https://ui-avatars.com/api/?name=User&background=random'} 
                        alt={u.full_name} 
                        className={`w-10 h-10 rounded-full object-cover border transition-transform group-hover:scale-105 ${
                          theme === 'dark' ? 'border-slate-700' : 'border-gray-100'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                      {u.is_verified && (
                        <div className={`absolute -bottom-1 -right-1 rounded-full p-0.5 ${
                          theme === 'dark' ? 'bg-slate-900' : 'bg-white'
                        }`}>
                          <VerifiedBadge role={u.role} className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm font-khmer group-hover:text-emerald-600 transition-colors ${
                        theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                      }`}>
                        {u.full_name}
                      </h4>
                      <div className="flex items-center gap-2">
                        {u.role === 'admin' && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                            Admin
                          </span>
                        )}
                        <span className={`text-[10px] flex items-center gap-1 ${
                          theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                        }`}>
                          <HugeiconsIcon icon={Calendar01Icon} className="w-3 h-3" />
                          {u.follow_date}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <FollowButton 
                    targetUserId={u.id} 
                    followBack={type === 'followers'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

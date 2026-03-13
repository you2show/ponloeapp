import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  SparklesIcon,
  FireIcon,
  StarIcon,
  ArrowUpRight01Icon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getUserGamificationStats, updateDailyStreak } from '@/services/gamificationService';

interface UserEngagementWidgetProps {
  userId?: string;
}

export const UserEngagementWidget: React.FC<UserEngagementWidgetProps> = ({ userId }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      loadStats();
    }
  }, [targetUserId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Only update daily streak if it's the current user's profile
      if (targetUserId === user?.id) {
        await updateDailyStreak(targetUserId);
      }
      const data = await getUserGamificationStats(targetUserId);
      setStats(data);
    } catch (error) {
      console.error('Error loading engagement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return null;
  }

  const progressPercent = (stats.points.total_points % 500) / 5;

  return (
    <div className="space-y-4">
      {/* Points & Streak Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-3xl border ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.5} className="w-5 h-5 text-emerald-600" />
            <p className="text-xl font-bold text-emerald-600">{stats.points.total_points}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <span>Level {stats.points.level}</span>
              <span>{stats.points.total_points % 500}/500</span>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
            }`}>
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-3xl border ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <HugeiconsIcon icon={FireIcon} strokeWidth={1.5} className="w-5 h-5 text-orange-500" />
            <p className="text-xl font-bold text-orange-500">{stats.streak.current_streak}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Daily Streak</p>
            <p className="text-[10px] text-gray-400">Best: {stats.streak.longest_streak} days</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      {stats.badges && stats.badges.length > 0 && (
        <div className={`p-4 rounded-3xl border ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <HugeiconsIcon icon={StarIcon} strokeWidth={1.5} className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm">Badges ({stats.badges.length})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.badges.slice(0, 4).map((badge: any, index: number) => (
              <div
                key={index}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all hover:scale-110 ${
                  theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'
                }`}
                title={badge.name}
              >
                {badge.icon}
              </div>
            ))}
            {stats.badges.length > 4 && (
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold ${
                theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-gray-50 text-gray-500'
              }`}>
                +{stats.badges.length - 4}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserGamificationStats, Badge } from '@/services/gamificationService';
import { Trophy, Flame, Star, Award } from 'lucide-react';

export const UserEngagementWidget: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getUserGamificationStats(user.id).then(data => {
        setStats(data);
        setLoading(false);
      }).catch(err => {
        console.error('Failed to fetch gamification stats: ', err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user || loading || !stats) return null;

  const { points, streak, badges } = stats;
  const progress = Math.min(100, (points.total_points / points.next_level_points) * 100);

  return (
    <div className="mb-8 p-6 rounded-2xl border shadow-sm bg-white border-gray-100 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg font-khmer text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          សមិទ្ធផលរបស់អ្នក
        </h3>
        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400">
          Level {points.level}
        </span>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500 dark:text-slate-400">ពិន្ទុ: {points.total_points}</span>
          <span className="text-gray-500 dark:text-slate-400">បន្ទាប់: {points.next_level_points}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-slate-800">
          <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center dark:bg-orange-900/30">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-orange-600/80 font-bold uppercase tracking-wider dark:text-orange-400/80">Streak</p>
            <p className="text-lg font-bold text-orange-700 dark:text-orange-400">{streak.current_streak} ថ្ងៃ</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
            <Star className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-blue-600/80 font-bold uppercase tracking-wider dark:text-blue-400/80">ល្អបំផុត</p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{streak.longest_streak} ថ្ងៃ</p>
          </div>
        </div>
      </div>

      {badges && badges.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider dark:text-slate-400">មេដាយរបស់អ្នក</h4>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge: Badge) => (
              <div key={badge.id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full dark:bg-slate-800 dark:border-slate-700" title={badge.description}>
                <span className="text-base">{badge.icon}</span>
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

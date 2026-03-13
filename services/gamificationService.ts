import { supabase } from '@/lib/supabase';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'achievement' | 'milestone' | 'special';
  requirement: number;
}

export interface UserStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

export interface UserPoints {
  userId: string;
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
}

export interface UserBadge {
  userId: string;
  badgeId: string;
  earnedAt: string;
}

/**
 * Badge definitions
 */
export const BADGES: Badge[] = [
  {
    id: 'first_post',
    name: 'First Post',
    description: 'Create your first post',
    icon: '📝',
    category: 'achievement',
    requirement: 1,
  },
  {
    id: 'ten_posts',
    name: 'Content Creator',
    description: 'Create 10 posts',
    icon: '✍️',
    category: 'milestone',
    requirement: 10,
  },
  {
    id: 'fifty_posts',
    name: 'Prolific Writer',
    description: 'Create 50 posts',
    icon: '📚',
    category: 'milestone',
    requirement: 50,
  },
  {
    id: 'hundred_likes',
    name: 'Popular',
    description: 'Receive 100 likes',
    icon: '👍',
    category: 'achievement',
    requirement: 100,
  },
  {
    id: 'seven_day_streak',
    name: '7-Day Streak',
    description: 'Maintain a 7-day activity streak',
    icon: '🔥',
    category: 'milestone',
    requirement: 7,
  },
  {
    id: 'thirty_day_streak',
    name: 'Month Master',
    description: 'Maintain a 30-day activity streak',
    icon: '⭐',
    category: 'special',
    requirement: 30,
  },
  {
    id: 'community_helper',
    name: 'Community Helper',
    description: 'Help 10 community members',
    icon: '🤝',
    category: 'achievement',
    requirement: 10,
  },
  {
    id: 'quran_reader',
    name: 'Quran Reader',
    description: 'Read 10 Quranic verses',
    icon: '📖',
    category: 'achievement',
    requirement: 10,
  },
];

/**
 * Award points for user action
 */
export const awardPoints = async (
  userId: string,
  action: 'post_created' | 'comment_created' | 'like_given' | 'post_liked' | 'daily_login',
  amount?: number
): Promise<UserPoints | null> => {
  try {
    const pointsMap = {
      post_created: 50,
      comment_created: 10,
      like_given: 5,
      post_liked: 10,
      daily_login: 5,
    };

    const points = amount || pointsMap[action];

    // Get current points
    const { data: currentData } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    const totalPoints = (currentData?.total_points || 0) + points;
    const level = Math.floor(totalPoints / 500) + 1;
    const nextLevelPoints = level * 500;

    // Update or insert points
    const { data, error } = await supabase
      .from('user_points')
      .upsert({
        user_id: userId,
        total_points: totalPoints,
        level,
        next_level_points: nextLevelPoints,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return {
      userId: data.user_id,
      totalPoints: data.total_points,
      level: data.level,
      nextLevelPoints: data.next_level_points,
    };
  } catch (error) {
    console.error('Error awarding points:', error);
    return null;
  }
};

/**
 * Check and award badges
 */
export const checkAndAwardBadges = async (userId: string): Promise<Badge[]> => {
  try {
    const earnedBadges: Badge[] = [];

    // Get user stats
    const { data: userStats } = await supabase
      .from('user_behavior_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!userStats) return [];

    // Get already earned badges
    const { data: existingBadges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    const existingBadgeIds = new Set(existingBadges?.map(b => b.badge_id) || []);

    // Check each badge
    for (const badge of BADGES) {
      if (existingBadgeIds.has(badge.id)) continue;

      let shouldAward = false;

      switch (badge.id) {
        case 'first_post':
          shouldAward = userStats.posts_created >= 1;
          break;
        case 'ten_posts':
          shouldAward = userStats.posts_created >= 10;
          break;
        case 'fifty_posts':
          shouldAward = userStats.posts_created >= 50;
          break;
        case 'hundred_likes':
          shouldAward = userStats.likes_received >= 100;
          break;
        case 'community_helper':
          shouldAward = userStats.comments_created >= 10;
          break;
        case 'quran_reader':
          shouldAward = userStats.quran_verses_read >= 10;
          break;
      }

      if (shouldAward) {
        // Award badge
        await supabase.from('user_badges').insert({
          user_id: userId,
          badge_id: badge.id,
          earned_at: new Date().toISOString(),
        });

        earnedBadges.push(badge);
      }
    }

    return earnedBadges;
  } catch (error) {
    console.error('Error checking badges:', error);
    return [];
  }
};

/**
 * Update daily streak
 */
export const updateDailyStreak = async (userId: string): Promise<UserStreak | null> => {
  try {
    // Get current streak
    const { data: currentStreak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    const today = new Date().toISOString().split('T')[0];
    const lastActivityDate = currentStreak?.last_activity_date?.split('T')[0];

    let newCurrentStreak = currentStreak?.current_streak || 0;
    let longestStreak = currentStreak?.longest_streak || 0;

    if (lastActivityDate === today) {
      // Already logged in today
      return {
        userId,
        currentStreak: newCurrentStreak,
        longestStreak,
        lastActivityDate: currentStreak.last_activity_date,
      };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActivityDate === yesterdayStr) {
      // Continue streak
      newCurrentStreak++;
    } else {
      // Reset streak
      newCurrentStreak = 1;
    }

    longestStreak = Math.max(newCurrentStreak, longestStreak);

    // Update streak
    const { data, error } = await supabase
      .from('user_streaks')
      .upsert({
        user_id: userId,
        current_streak: newCurrentStreak,
        longest_streak: longestStreak,
        last_activity_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return {
      userId: data.user_id,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastActivityDate: data.last_activity_date,
    };
  } catch (error) {
    console.error('Error updating streak:', error);
    return null;
  }
};

/**
 * Get user gamification stats
 */
export const getUserGamificationStats = async (userId: string): Promise<any> => {
  try {
    const [points, streak, badges] = await Promise.all([
      supabase.from('user_points').select('*').eq('user_id', userId).single(),
      supabase.from('user_streaks').select('*').eq('user_id', userId).single(),
      supabase.from('user_badges').select('badge_id').eq('user_id', userId),
    ]);

    return {
      points: points.data || { total_points: 0, level: 1, next_level_points: 500 },
      streak: streak.data || { current_streak: 0, longest_streak: 0 },
      badges: badges.data?.map(b => BADGES.find(badge => badge.id === b.badge_id)) || [],
    };
  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    return {
      points: { total_points: 0, level: 1, next_level_points: 500 },
      streak: { current_streak: 0, longest_streak: 0 },
      badges: [],
    };
  }
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (limit: number = 50): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('user_points')
      .select('user_id, total_points, level')
      .order('total_points', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

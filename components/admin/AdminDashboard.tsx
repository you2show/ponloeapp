import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  UserMultipleIcon, 
  Message01Icon, 
  ArrowUpRight01Icon,
  ArrowDownLeft01Icon,
  Edit02Icon,
  File01Icon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  activeUsers: number;
  userGrowth: number;
  postGrowth: number;
}

interface RecentUser {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  avatar_url: string;
}

export const AdminDashboard: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    activeUsers: 0,
    userGrowth: 12,
    postGrowth: 8,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentUsers();
  }, []);

  const fetchRecentUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setRecentUsers(data as any[]);
    } catch (error) {
      console.error('Error fetching recent users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard stats...');

      // Fetch users count
      const { count: usersCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (userError) console.error('Error fetching user count:', userError);

      // Fetch posts count
      const { count: postsCount, error: postError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });
      
      if (postError) console.error('Error fetching post count:', postError);

      // Fetch comments count
      const { count: commentsCount, error: commentError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });
      
      if (commentError) {
        console.warn('Error fetching comment count (table might not exist):', commentError);
      }

      console.log('Stats fetched:', { usersCount, postsCount, commentsCount });

      setStats(prev => ({
        ...prev,
        totalUsers: usersCount || 0,
        totalPosts: postsCount || 0,
        totalComments: commentsCount || 0,
        activeUsers: Math.floor((usersCount || 0) * 0.7),
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    growth, 
    isPositive 
  }: { 
    icon: any; 
    label: string; 
    value: number; 
    growth: number;
    isPositive: boolean;
  }) => (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
              {label}
            </p>
            <p className="text-3xl font-bold mt-2">
              {loading ? '...' : value.toLocaleString()}
            </p>
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <HugeiconsIcon 
                icon={isPositive ? ArrowUpRight01Icon : ArrowDownLeft01Icon} 
                strokeWidth={2} 
                className="w-4 h-4" 
              />
              <span>{Math.abs(growth)}% from last month</span>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-emerald-900/20 text-emerald-400'
              : 'bg-emerald-50 text-emerald-600'
          }`}>
            <HugeiconsIcon icon={Icon} strokeWidth={1.5} className="w-8 h-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-khmer">Dashboard</h1>
        <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
          Welcome back! Here's what's happening with Ponloe.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={UserMultipleIcon}
          label="Total Users"
          value={stats.totalUsers}
          growth={stats.userGrowth}
          isPositive={true}
        />
        <StatCard
          icon={File01Icon}
          label="Total Posts"
          value={stats.totalPosts}
          growth={stats.postGrowth}
          isPositive={true}
        />
        <StatCard
          icon={Message01Icon}
          label="Active Users"
          value={stats.activeUsers}
          growth={5}
          isPositive={true}
        />
        <StatCard
          icon={ArrowUpRight01Icon}
          label="Engagement Rate"
          value={68}
          growth={3}
          isPositive={true}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <h3 className="text-lg font-bold">Recent Posts</h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark'
                      ? 'border-slate-800 hover:bg-slate-800/50'
                      : 'border-gray-200 hover:bg-gray-50'
                  } transition-colors cursor-pointer`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold">Post Title {i}</h4>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        Posted by User {i} • 2 hours ago
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      theme === 'dark'
                        ? 'bg-emerald-900/30 text-emerald-400'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      Published
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="border-b flex flex-row items-center justify-between">
            <h3 className="text-lg font-bold">Recent Users</h3>
            <button 
              onClick={() => navigate('/admin/users')}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              View All
            </button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center overflow-hidden">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-emerald-600 font-bold">{u.full_name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{u.full_name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500 truncate">{new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No recent users</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

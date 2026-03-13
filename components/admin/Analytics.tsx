import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ChartLineData01Icon,
  PieChart01Icon,
  Download01Icon,
  ArrowUpRight01Icon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export const Analytics: React.FC = () => {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const chartData = {
    users: [120, 150, 180, 200, 220, 250, 280],
    posts: [45, 52, 48, 65, 72, 85, 95],
    engagement: [65, 68, 70, 72, 75, 78, 80],
  };

  const StatBox = ({ 
    label, 
    value, 
    icon: Icon,
    color = 'emerald'
  }: { 
    label: string; 
    value: string | number;
    icon: any;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
              {label}
            </p>
            <p className="text-2xl font-bold mt-2">{value}</p>
          </div>
          <div className={`p-4 rounded-lg ${
            theme === 'dark'
              ? `bg-${color}-900/20 text-${color}-400`
              : `bg-${color}-50 text-${color}-600`
          }`}>
            <HugeiconsIcon icon={Icon} strokeWidth={1.5} className="w-8 h-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-khmer">Analytics</h1>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            Platform performance and user engagement metrics.
          </p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                timeRange === range
                  ? 'bg-emerald-600 text-white'
                  : theme === 'dark'
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox label="Total Users" value="2,450" icon={ArrowUpRight01Icon} />
        <StatBox label="Active Users" value="1,680" icon={ChartLineData01Icon} color="blue" />
        <StatBox label="Total Posts" value="8,920" icon={PieChart01Icon} color="purple" />
        <StatBox label="Avg. Engagement" value="78%" icon={ArrowUpRight01Icon} color="orange" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader className="border-b flex items-center justify-between">
            <h3 className="text-lg font-bold">User Growth</h3>
            <button className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-slate-800 text-slate-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}>
              <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {chartData.users.map((value, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm font-bold w-12">Day {index + 1}</span>
                  <div className="flex-1 bg-gray-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${(value / 300) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold w-12 text-right">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Post Activity Chart */}
        <Card>
          <CardHeader className="border-b flex items-center justify-between">
            <h3 className="text-lg font-bold">Post Activity</h3>
            <button className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-slate-800 text-slate-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}>
              <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {chartData.posts.map((value, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm font-bold w-12">Day {index + 1}</span>
                  <div className="flex-1 bg-gray-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${(value / 100) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold w-12 text-right">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader className="border-b">
          <h3 className="text-lg font-bold">Engagement Over Time</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {chartData.engagement.map((value, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-sm font-bold w-20">Week {index + 1}</span>
                <div className="flex-1 bg-gray-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all"
                    style={{ width: `${value}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold w-12 text-right">{value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Content */}
      <Card>
        <CardHeader className="border-b">
          <h3 className="text-lg font-bold">Top Performing Posts</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[
              { title: 'Introduction to Quran', views: 2450, likes: 380 },
              { title: 'Daily Islamic Wisdom', views: 1820, likes: 290 },
              { title: 'Prayer Times Guide', views: 1650, likes: 245 },
              { title: 'Ramadan Preparation', views: 1420, likes: 210 },
              { title: 'Islamic History', views: 1180, likes: 175 },
            ].map((post, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  theme === 'dark'
                    ? 'border-slate-800 hover:bg-slate-800/50'
                    : 'border-gray-200 hover:bg-gray-50'
                } transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold">{post.title}</p>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      {post.views.toLocaleString()} views • {post.likes.toLocaleString()} likes
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">
                      {((post.likes / post.views) * 100).toFixed(1)}% engagement
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

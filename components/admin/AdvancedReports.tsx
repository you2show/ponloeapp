import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Download01Icon,
  ChartLineData01Icon,
  PieChart01Icon,
  Calendar01Icon,
  FilterIcon,
  Refresh01Icon,
  ArrowUpRight01Icon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { 
  getReportMetrics, 
  getContentPerformanceData, 
  getUserBehaviorData,
  exportReportAsCSV,
  getCategoryPerformance
} from '@/services/reportingService';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'user' | 'content' | 'engagement' | 'retention';
  lastGenerated: string;
}

export const AdvancedReports: React.FC = () => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [activeReport, setActiveReport] = useState<'overview' | 'content' | 'users' | 'cohort'>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [contentData, setContentData] = useState<any[]>([]);
  const [userData, setUserData] = useState<any[]>([]);

  useEffect(() => {
    loadReportData();
  }, [activeReport, dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      if (activeReport === 'overview') {
        const data = await getReportMetrics();
        setMetrics(data);
      } else if (activeReport === 'content') {
        const data = await getContentPerformanceData(50);
        setContentData(data);
      } else if (activeReport === 'users') {
        const data = await getUserBehaviorData(50);
        setUserData(data);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
      showToast('Failed to load report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      showToast('No data to export', 'warning');
      return;
    }

    const headers = Object.keys(data[0]);
    exportReportAsCSV(data, headers, filename);
    showToast('Report exported successfully!', 'success');
  };

  const ReportTab = ({ 
    id, 
    label, 
    icon: Icon 
  }: { 
    id: string; 
    label: string; 
    icon: any;
  }) => (
    <button
      onClick={() => setActiveReport(id as any)}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all font-bold ${
        activeReport === id
          ? 'bg-emerald-600 text-white'
          : theme === 'dark'
          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <HugeiconsIcon icon={Icon} strokeWidth={1.5} className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-khmer">Advanced Reports</h1>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            Comprehensive analytics and insights for platform management
          </p>
        </div>
        <button
          onClick={loadReportData}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            theme === 'dark'
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
        >
          <HugeiconsIcon icon={Refresh01Icon} strokeWidth={1.5} className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <ReportTab id="overview" label="Overview" icon={ArrowUpRight01Icon} />
        <ReportTab id="content" label="Content Performance" icon={ChartLineData01Icon} />
        <ReportTab id="users" label="User Behavior" icon={PieChart01Icon} />
        <ReportTab id="cohort" label="Cohort Analysis" icon={Calendar01Icon} />
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-500" />
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  dateRange === range
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
        </CardContent>
      </Card>

      {/* Overview Report */}
      {activeReport === 'overview' && (
        <div className="space-y-6">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Loading report data...</p>
              </CardContent>
            </Card>
          ) : metrics ? (
            <>
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      Total Users
                    </p>
                    <p className="text-3xl font-bold mt-2">{metrics.totalUsers.toLocaleString()}</p>
                    <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                      +{metrics.newUsersThisMonth} this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      Active Users
                    </p>
                    <p className="text-3xl font-bold mt-2">{metrics.activeUsers.toLocaleString()}</p>
                    <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                      {((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)}% of total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      Total Posts
                    </p>
                    <p className="text-3xl font-bold mt-2">{metrics.totalPosts.toLocaleString()}</p>
                    <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                      {(metrics.totalPosts / Math.max(metrics.totalUsers, 1)).toFixed(1)} per user
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      Total Comments
                    </p>
                    <p className="text-3xl font-bold mt-2">{metrics.totalComments.toLocaleString()}</p>
                    <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                      {(metrics.totalComments / Math.max(metrics.totalPosts, 1)).toFixed(1)} per post
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      Avg. Engagement Rate
                    </p>
                    <p className="text-3xl font-bold mt-2">{metrics.averageEngagementRate.toFixed(1)}%</p>
                    <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                      Likes + Comments / Views
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      Top Post Views
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {metrics.topPost?.views.toLocaleString() || 'N/A'}
                    </p>
                    <p className={`text-xs mt-2 line-clamp-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                      {metrics.topPost?.title || 'No posts'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Post & User */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {metrics.topPost && (
                  <Card>
                    <CardHeader className="border-b">
                      <h3 className="font-bold">Top Performing Post</h3>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                      <div>
                        <p className="font-bold text-lg">{metrics.topPost.title}</p>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                          {new Date(metrics.topPost.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                            Views
                          </p>
                          <p className="text-2xl font-bold">{metrics.topPost.views.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                            Engagement
                          </p>
                          <p className="text-2xl font-bold">{metrics.topPost.engagementRate.toFixed(1)}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {metrics.topUser && (
                  <Card>
                    <CardHeader className="border-b">
                      <h3 className="font-bold">Most Active User</h3>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                      <div>
                        <p className="font-bold text-lg">{metrics.topUser.userName}</p>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                          Last active: {new Date(metrics.topUser.lastActive).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                            Posts
                          </p>
                          <p className="text-xl font-bold">{metrics.topUser.postsCreated}</p>
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                            Comments
                          </p>
                          <p className="text-xl font-bold">{metrics.topUser.commentsCreated}</p>
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                            Likes
                          </p>
                          <p className="text-xl font-bold">{metrics.topUser.likesGiven}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Content Performance Report */}
      {activeReport === 'content' && (
        <Card>
          <CardHeader className="border-b flex items-center justify-between">
            <h3 className="font-bold">Content Performance</h3>
            <button
              onClick={() => handleExportCSV(contentData, 'content-performance.csv')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-4 h-4" />
              Export CSV
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-gray-50'}`}>
                    <th className="px-6 py-4 text-left text-sm font-bold">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Views</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Likes</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Comments</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Engagement</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : contentData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No content data available
                      </td>
                    </tr>
                  ) : (
                    contentData.map((post, index) => (
                      <tr 
                        key={index}
                        className={`border-b transition-colors ${
                          theme === 'dark'
                            ? 'border-slate-800 hover:bg-slate-800/50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4 font-bold max-w-xs truncate">{post.title}</td>
                        <td className="px-6 py-4 text-sm">{post.views.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">{post.likes.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">{post.comments.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                          {post.engagementRate.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Behavior Report */}
      {activeReport === 'users' && (
        <Card>
          <CardHeader className="border-b flex items-center justify-between">
            <h3 className="font-bold">User Behavior Analytics</h3>
            <button
              onClick={() => handleExportCSV(userData, 'user-behavior.csv')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} className="w-4 h-4" />
              Export CSV
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-gray-50'}`}>
                    <th className="px-6 py-4 text-left text-sm font-bold">User</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Posts</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Comments</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Likes</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Time Spent</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : userData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No user data available
                      </td>
                    </tr>
                  ) : (
                    userData.map((user, index) => (
                      <tr 
                        key={index}
                        className={`border-b transition-colors ${
                          theme === 'dark'
                            ? 'border-slate-800 hover:bg-slate-800/50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4 font-bold">{user.userName}</td>
                        <td className="px-6 py-4 text-sm">{user.postsCreated}</td>
                        <td className="px-6 py-4 text-sm">{user.commentsCreated}</td>
                        <td className="px-6 py-4 text-sm">{user.likesGiven}</td>
                        <td className="px-6 py-4 text-sm">
                          {Math.round(user.timeSpent / 60)} min
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(user.lastActive).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cohort Analysis */}
      {activeReport === 'cohort' && (
        <Card>
          <CardHeader className="border-b">
            <h3 className="font-bold">Cohort Analysis</h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                Cohort analysis data will be displayed here
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  PieChart01Icon,
  Add01Icon,
  Delete01Icon,
  ViewIcon,
  CheckmarkCircle01Icon,
  Loading01Icon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { getActivePolls, createPoll, deletePoll, getPollStatistics } from '@/services/pollService';

interface Poll {
  id: string;
  title: string;
  description: string;
  category: string;
  options: any[];
  totalVotes: number;
  expiresAt: string;
  isActive: boolean;
}

export const PollsManagement: React.FC = () => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general' as const,
    options: ['', ''],
    expiresIn: 7,
    allowMultiple: false,
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pollsData, statsData] = await Promise.all([
        getActivePolls(50),
        getPollStatistics(),
      ]);
      setPolls(pollsData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load polls', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async () => {
    if (!formData.title.trim()) {
      showToast('Poll title is required', 'warning');
      return;
    }

    const validOptions = formData.options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      showToast('At least 2 options are required', 'warning');
      return;
    }

    try {
      setCreating(true);
      const newPoll = await createPoll(
        formData.title,
        formData.description,
        validOptions,
        formData.category,
        formData.expiresIn,
        formData.allowMultiple
      );

      if (newPoll) {
        showToast('Poll created successfully!', 'success');
        setFormData({
          title: '',
          description: '',
          category: 'general',
          options: ['', ''],
          expiresIn: 7,
          allowMultiple: false,
        });
        setShowCreateForm(false);
        loadData();
      } else {
        showToast('Failed to create poll', 'error');
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      showToast('Error creating poll', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!window.confirm('Are you sure you want to delete this poll?')) return;

    try {
      const success = await deletePoll(pollId);
      if (success) {
        showToast('Poll deleted successfully!', 'success');
        loadData();
      } else {
        showToast('Failed to delete poll', 'error');
      }
    } catch (error) {
      console.error('Error deleting poll:', error);
      showToast('Error deleting poll', 'error');
    }
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ''],
    });
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index),
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  const getTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff < 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-khmer">Polls Management</h1>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            Create and manage community polls and surveys
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
        >
          <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-5 h-5" />
          Create Poll
        </button>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                Total Polls
              </p>
              <p className="text-3xl font-bold mt-2">{statistics.totalPolls}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                Active Polls
              </p>
              <p className="text-3xl font-bold mt-2 text-emerald-600">{statistics.activePolls}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                Total Votes
              </p>
              <p className="text-3xl font-bold mt-2">{statistics.totalVotes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                Avg Votes/Poll
              </p>
              <p className="text-3xl font-bold mt-2">{statistics.averageVotesPerPoll}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Poll Form */}
      {showCreateForm && (
        <Card>
          <CardHeader className="border-b">
            <h3 className="font-bold">Create New Poll</h3>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Poll Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter poll title"
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
                } focus:outline-none`}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter poll description"
                rows={3}
                className={`w-full px-4 py-2 rounded-lg border transition-colors resize-none ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
                } focus:outline-none`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
                  } focus:outline-none`}
                >
                  <option value="general">General</option>
                  <option value="islamic">Islamic</option>
                  <option value="community">Community</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Expires In (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.expiresIn}
                  onChange={(e) => setFormData({ ...formData, expiresIn: parseInt(e.target.value) })}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
                  } focus:outline-none`}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowMultiple}
                  onChange={(e) => setFormData({ ...formData, allowMultiple: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-bold">Allow multiple selections</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Poll Options</label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
                      } focus:outline-none`}
                    />
                    {formData.options.length > 2 && (
                      <button
                        onClick={() => removeOption(index)}
                        className={`px-3 py-2 rounded-lg transition-all ${
                          theme === 'dark'
                            ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400'
                            : 'bg-red-50 hover:bg-red-100 text-red-600'
                        }`}
                      >
                        <HugeiconsIcon icon={Delete01Icon} strokeWidth={1.5} className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addOption}
                className={`mt-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                + Add Option
              </button>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleCreatePoll}
                disabled={creating}
                className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all ${
                  creating
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {creating ? (
                  <>
                    <HugeiconsIcon icon={Loading01Icon} strokeWidth={1.5} className="w-4 h-4 animate-spin inline mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Poll'
                )}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                Cancel
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Polls List */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <HugeiconsIcon icon={Loading01Icon} strokeWidth={1.5} className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
              Loading polls...
            </p>
          </CardContent>
        </Card>
      ) : polls.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <HugeiconsIcon icon={PieChart01Icon} strokeWidth={1.5} className="w-8 h-8 text-gray-300 dark:text-slate-700 mx-auto" />
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
              No polls created yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <Card key={poll.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{poll.title}</h3>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      {poll.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className={`p-2 rounded-lg transition-all ${
                        theme === 'dark'
                          ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                      }`}
                      title="View Results"
                    >
                      <HugeiconsIcon icon={ViewIcon} strokeWidth={1.5} className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePoll(poll.id)}
                      className={`p-2 rounded-lg transition-all ${
                        theme === 'dark'
                          ? 'hover:bg-red-900/20 text-red-400 hover:text-red-300'
                          : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                      }`}
                      title="Delete Poll"
                    >
                      <HugeiconsIcon icon={Delete01Icon} strokeWidth={1.5} className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      Options
                    </p>
                    <p className="text-lg font-bold mt-1">{poll.options.length}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      Votes
                    </p>
                    <p className="text-lg font-bold mt-1">{poll.totalVotes}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      Status
                    </p>
                    <p className="text-lg font-bold mt-1 text-emerald-600">
                      {getTimeRemaining(poll.expiresAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

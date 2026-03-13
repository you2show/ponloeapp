import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  PieChart01Icon,
  CheckmarkCircle01Icon,
  Loading01Icon,
  ArrowUpRight01Icon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { getActivePolls, voteOnPoll, hasUserVoted } from '@/services/pollService';

interface PollWithVoteStatus {
  id: string;
  title: string;
  description: string;
  category: string;
  options: any[];
  totalVotes: number;
  expiresAt: string;
  hasVoted: boolean;
  allowMultiple: boolean;
}

export const CommunityPollsWidget: React.FC = () => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [polls, setPolls] = useState<PollWithVoteStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [votingPollId, setVotingPollId] = useState<string | null>(null);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      setLoading(true);
      const activePolls = await getActivePolls(5);
      
      const pollsWithVoteStatus = await Promise.all(
        activePolls.map(async (poll) => ({
          ...poll,
          hasVoted: user ? await hasUserVoted(poll.id) : false,
        }))
      );

      setPolls(pollsWithVoteStatus);
    } catch (error) {
      console.error('Error loading polls:', error);
      showToast('Failed to load polls', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string) => {
    if (!user) {
      showToast('Please log in to vote', 'warning');
      return;
    }

    if (selectedOptions.size === 0) {
      showToast('Please select at least one option', 'warning');
      return;
    }

    try {
      setVotingPollId(pollId);
      const success = await voteOnPoll(pollId, Array.from(selectedOptions));

      if (success) {
        showToast('Vote submitted successfully!', 'success');
        setSelectedOptions(new Set());
        setSelectedPollId(null);
        loadPolls();
      } else {
        showToast('Failed to submit vote', 'error');
      }
    } catch (error) {
      console.error('Error voting:', error);
      showToast('Error submitting vote', 'error');
    } finally {
      setVotingPollId(null);
    }
  };

  const toggleOption = (optionId: string, allowMultiple: boolean) => {
    const newSelected = new Set(selectedOptions);
    
    if (!allowMultiple) {
      newSelected.clear();
    }

    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      newSelected.add(optionId);
    }

    setSelectedOptions(newSelected);
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <HugeiconsIcon icon={Loading01Icon} strokeWidth={1.5} className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            Loading community polls...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (polls.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <HugeiconsIcon icon={PieChart01Icon} strokeWidth={1.5} className="w-8 h-8 text-gray-300 dark:text-slate-700 mx-auto" />
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            No active polls at the moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <HugeiconsIcon icon={PieChart01Icon} strokeWidth={1.5} className="w-6 h-6 text-emerald-600" />
        <h2 className="text-2xl font-bold font-khmer">Community Polls</h2>
      </div>

      {polls.map((poll) => (
        <Card key={poll.id}>
          <CardHeader className="border-b pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{poll.title}</h3>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                  {poll.description}
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                theme === 'dark'
                  ? 'bg-emerald-900/30 text-emerald-400'
                  : 'bg-emerald-50 text-emerald-600'
              }`}>
                {getTimeRemaining(poll.expiresAt)}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {poll.hasVoted ? (
              // Show results if user has already voted
              <div className="space-y-3">
                {poll.options.map((option) => (
                  <div key={option.id}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold">{option.text}</p>
                      <span className="text-xs font-bold text-emerald-600">
                        {option.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${
                      theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'
                    }`}>
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                        style={{ width: `${option.percentage}%` }}
                      ></div>
                    </div>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                      {option.votes} votes
                    </p>
                  </div>
                ))}
              </div>
            ) : selectedPollId === poll.id ? (
              // Show voting options
              <div className="space-y-3">
                {poll.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => toggleOption(option.id, poll.allowMultiple)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedOptions.has(option.id)
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                        : `border-gray-200 dark:border-slate-800 ${
                            theme === 'dark'
                              ? 'hover:bg-slate-800'
                              : 'hover:bg-gray-50'
                          }`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        selectedOptions.has(option.id)
                          ? 'border-emerald-600 bg-emerald-600'
                          : `border-gray-300 dark:border-slate-600 ${
                              theme === 'dark'
                                ? 'bg-slate-800'
                                : 'bg-white'
                            }`
                      }`}>
                        {selectedOptions.has(option.id) && (
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="font-bold">{option.text}</span>
                    </div>
                  </button>
                ))}

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => handleVote(poll.id)}
                    disabled={votingPollId === poll.id}
                    className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all ${
                      votingPollId === poll.id
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {votingPollId === poll.id ? (
                      <>
                        <HugeiconsIcon icon={Loading01Icon} strokeWidth={1.5} className="w-4 h-4 animate-spin inline mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Vote'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPollId(null);
                      setSelectedOptions(new Set());
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Show vote button
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                    {poll.totalVotes} votes
                  </p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                    {poll.allowMultiple ? 'Multiple choices allowed' : 'Single choice'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPollId(poll.id)}
                  className="px-4 py-2 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
                >
                  Vote Now
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* View All Polls Link */}
      {polls.length > 0 && (
        <button className={`w-full p-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
          theme === 'dark'
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }`}>
          <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={1.5} className="w-5 h-5" />
          View All Polls
        </button>
      )}
    </div>
  );
};

import { supabase } from '@/lib/supabase';

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  category: 'general' | 'islamic' | 'community' | 'feedback';
  options: PollOption[];
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  totalVotes: number;
  allowMultiple: boolean;
}

export interface UserPollVote {
  userId: string;
  pollId: string;
  optionIds: string[];
  votedAt: string;
}

/**
 * Create a new poll
 */
export const createPoll = async (
  title: string,
  description: string,
  options: string[],
  category: 'general' | 'islamic' | 'community' | 'feedback' = 'general',
  expiresIn: number = 7, // days
  allowMultiple: boolean = false
): Promise<Poll | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresIn);

    // Create poll
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .insert({
        title,
        description,
        category,
        created_by: user.id,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true,
        allow_multiple: allowMultiple,
      })
      .select()
      .single();

    if (pollError) throw pollError;

    // Create options
    const pollOptions = options.map((text) => ({
      poll_id: pollData.id,
      text,
      votes: 0,
    }));

    const { data: optionsData, error: optionsError } = await supabase
      .from('poll_options')
      .insert(pollOptions)
      .select();

    if (optionsError) throw optionsError;

    return {
      id: pollData.id,
      title: pollData.title,
      description: pollData.description,
      category: pollData.category,
      options: optionsData.map((opt: any) => ({
        id: opt.id,
        pollId: opt.poll_id,
        text: opt.text,
        votes: opt.votes || 0,
        percentage: 0,
      })),
      createdBy: pollData.created_by,
      createdAt: pollData.created_at,
      expiresAt: pollData.expires_at,
      isActive: pollData.is_active,
      totalVotes: 0,
      allowMultiple: pollData.allow_multiple,
    };
  } catch (error) {
    console.error('Error creating poll:', error);
    return null;
  }
};

/**
 * Get active polls
 */
export const getActivePolls = async (limit: number = 10): Promise<Poll[]> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options(*)
      `)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data?.map((poll: any) => {
      const totalVotes = poll.poll_options.reduce((sum: number, opt: any) => sum + (opt.votes || 0), 0);
      return {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        category: poll.category,
        options: poll.poll_options.map((opt: any) => ({
          id: opt.id,
          pollId: opt.poll_id,
          text: opt.text,
          votes: opt.votes || 0,
          percentage: totalVotes > 0 ? ((opt.votes || 0) / totalVotes) * 100 : 0,
        })),
        createdBy: poll.created_by,
        createdAt: poll.created_at,
        expiresAt: poll.expires_at,
        isActive: poll.is_active,
        totalVotes,
        allowMultiple: poll.allow_multiple,
      };
    }) || [];
  } catch (error) {
    console.error('Error fetching active polls:', error);
    return [];
  }
};

/**
 * Get poll by ID
 */
export const getPollById = async (pollId: string): Promise<Poll | null> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options(*)
      `)
      .eq('id', pollId)
      .single();

    if (error) throw error;

    const totalVotes = data.poll_options.reduce((sum: number, opt: any) => sum + (opt.votes || 0), 0);

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      options: data.poll_options.map((opt: any) => ({
        id: opt.id,
        pollId: opt.poll_id,
        text: opt.text,
        votes: opt.votes || 0,
        percentage: totalVotes > 0 ? ((opt.votes || 0) / totalVotes) * 100 : 0,
      })),
      createdBy: data.created_by,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
      isActive: data.is_active,
      totalVotes,
      allowMultiple: data.allow_multiple,
    };
  } catch (error) {
    console.error('Error fetching poll:', error);
    return null;
  }
};

/**
 * Vote on a poll
 */
export const voteOnPoll = async (
  pollId: string,
  optionIds: string[]
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('user_id', user.id)
      .eq('poll_id', pollId)
      .single();

    if (existingVote) {
      throw new Error('User has already voted on this poll');
    }

    // Record vote
    const { error: voteError } = await supabase
      .from('poll_votes')
      .insert({
        user_id: user.id,
        poll_id: pollId,
        option_ids: optionIds,
        voted_at: new Date().toISOString(),
      });

    if (voteError) throw voteError;

    // Update vote counts
    for (const optionId of optionIds) {
      const { data: option } = await supabase
        .from('poll_options')
        .select('votes')
        .eq('id', optionId)
        .single();

      await supabase
        .from('poll_options')
        .update({ votes: (option?.votes || 0) + 1 })
        .eq('id', optionId);
    }

    return true;
  } catch (error) {
    console.error('Error voting on poll:', error);
    return false;
  }
};

/**
 * Check if user has voted on a poll
 */
export const hasUserVoted = async (pollId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('user_id', user.id)
      .eq('poll_id', pollId)
      .single();

    return !!data;
  } catch (error) {
    return false;
  }
};

/**
 * Get poll results
 */
export const getPollResults = async (pollId: string): Promise<any> => {
  try {
    const poll = await getPollById(pollId);
    if (!poll) return null;

    return {
      poll,
      results: poll.options.map((opt) => ({
        option: opt.text,
        votes: opt.votes,
        percentage: opt.percentage,
      })),
    };
  } catch (error) {
    console.error('Error fetching poll results:', error);
    return null;
  }
};

/**
 * Close a poll
 */
export const closePoll = async (pollId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('polls')
      .update({ is_active: false })
      .eq('id', pollId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error closing poll:', error);
    return false;
  }
};

/**
 * Delete a poll
 */
export const deletePoll = async (pollId: string): Promise<boolean> => {
  try {
    // Delete votes
    await supabase
      .from('poll_votes')
      .delete()
      .eq('poll_id', pollId);

    // Delete options
    await supabase
      .from('poll_options')
      .delete()
      .eq('poll_id', pollId);

    // Delete poll
    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting poll:', error);
    return false;
  }
};

/**
 * Get poll statistics
 */
export const getPollStatistics = async (): Promise<any> => {
  try {
    const { count: totalPolls } = await supabase
      .from('polls')
      .select('*', { count: 'exact', head: true });

    const { count: activePolls } = await supabase
      .from('polls')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: totalVotes } = await supabase
      .from('poll_votes')
      .select('*', { count: 'exact', head: true });

    return {
      totalPolls: totalPolls || 0,
      activePolls: activePolls || 0,
      totalVotes: totalVotes || 0,
      averageVotesPerPoll: totalPolls ? Math.round((totalVotes || 0) / totalPolls) : 0,
    };
  } catch (error) {
    console.error('Error fetching poll statistics:', error);
    return {
      totalPolls: 0,
      activePolls: 0,
      totalVotes: 0,
      averageVotesPerPoll: 0,
    };
  }
};

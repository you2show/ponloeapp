import { supabase } from '@/lib/supabase';

export type ActivityAction = 
  | 'view_quran' 
  | 'save_bookmark' 
  | 'remove_bookmark' 
  | 'add_note' 
  | 'delete_note' 
  | 'view_post' 
  | 'save_post' 
  | 'unsave_post' 
  | 'login' 
  | 'logout' 
  | 'update_profile' 
  | 'change_password' 
  | 'toggle_2fa';

export const trackActivity = async (action: ActivityAction, metadata: any = {}, userId?: string) => {
  try {
    let finalUserId = userId;
    
    if (!finalUserId) {
      const { data: { session } } = await supabase.auth.getSession();
      finalUserId = session?.user?.id;
    }
    
    if (!finalUserId) return;

    // Get client info if possible
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown';
    
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: finalUserId,
        action,
        metadata: {
          ...metadata,
          user_agent: userAgent,
          timestamp: new Date().toISOString()
        }
      });

    if (error) {
      console.error('Error tracking activity:', error);
    }
  } catch (err) {
    console.error('Activity tracking failed:', err);
  }
};

export const getRecentActivity = async (limit = 10) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return [];

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching activity:', err);
    return [];
  }
};

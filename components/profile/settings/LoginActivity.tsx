import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { HugeiconsIcon } from '@hugeicons/react';
import { LaptopIcon, SmartPhone01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

export const LoginActivity: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('login_activity')
      .select('*')
      .eq('user_id', user?.id)
      .order('last_active_at', { ascending: false });
    
    if (data) setSessions(data);
  };

  const handleDeleteSession = async (id: string) => {
    const { error } = await supabase
      .from('login_activity')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setSessions(sessions.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm font-khmer">សកម្មភាពចូលប្រើប្រាស់</h3>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Recent Sessions</span>
      </div>
      <div className="space-y-3">
        {sessions.length === 0 ? (
          <div className="p-6 text-center bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
            <p className="text-xs text-gray-400 font-khmer">មិនមានសកម្មភាពថ្មីៗ</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 group hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 transition-colors shadow-sm">
                <HugeiconsIcon icon={session.device_info?.includes('Mobile') ? SmartPhone01Icon : LaptopIcon} className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{session.device_info || 'Unknown Device'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[10px] text-gray-500 font-medium">Last active: {new Date(session.last_active_at).toLocaleString()}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteSession(session.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                title="Sign out from this device"
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const ActivityLog: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (data) setLogs(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm font-khmer">កំណត់ហេតុសកម្មភាព</h3>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Activity History</span>
      </div>
      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="p-6 text-center bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
            <p className="text-xs text-gray-400 font-khmer">មិនមានកំណត់ហេតុថ្មីៗ</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700/50 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{log.action}</p>
                  <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
                {log.metadata?.ip && (
                  <span className="text-[9px] px-2 py-0.5 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400 rounded-full font-mono">
                    {log.metadata.ip}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

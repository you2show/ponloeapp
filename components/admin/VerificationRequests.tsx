import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Search01Icon,
  FilterIcon,
  EyeIcon,
  Shield01Icon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';

interface VerificationRequest {
  id: string;
  user_id: string;
  requested_role: 'scholar' | 'creator';
  full_name: string;
  graduation_place: string;
  major: string;
  graduation_year: string;
  photo_url: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
    username: string;
  };
}

export const VerificationRequests: React.FC = () => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url, username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data as any);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      showToast('Failed to fetch verification requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, userId: string, newStatus: 'approved' | 'rejected', role: string) => {
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('verification_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (updateError) throw updateError;

      // If approved, update user profile
      if (newStatus === 'approved') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            is_verified: true,
            role: role 
          })
          .eq('id', userId);

        if (profileError) throw profileError;
      }

      showToast(`Request ${newStatus} successfully`, 'success');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error: any) {
      console.error('Error updating status:', error);
      showToast('Failed to update request status', 'error');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-khmer">Verification Requests</h1>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            Review and manage role change and identity verification requests.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            theme === 'dark'
              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <Card className={theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <HugeiconsIcon icon={Search01Icon} className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg outline-none transition-all ${
                theme === 'dark' 
                  ? 'bg-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50' 
                  : 'bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/20'
              }`}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                  statusFilter === status
                    ? 'bg-emerald-600 text-white shadow-md'
                    : theme === 'dark'
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <div className={`inline-flex p-4 rounded-full mb-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}>
              <HugeiconsIcon icon={Shield01Icon} className={`w-8 h-8 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No requests found</h3>
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>
              There are no verification requests matching your filters.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <Card key={req.id} className={`overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img src={req.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${req.full_name}`} alt={req.full_name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{req.full_name}</h3>
                      <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>@{req.profiles?.username}</p>
                    </div>
                  </div>
                  <Badge variant={
                    req.status === 'approved' ? 'success' :
                    req.status === 'rejected' ? 'danger' : 'warning'
                  }>
                    {req.status}
                  </Badge>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>Requested Role:</span>
                    <span className={`font-bold capitalize ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>{req.requested_role}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>Major:</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>{req.major}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>Graduation:</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>{req.graduation_year}</span>
                  </div>
                  
                  <button
                    onClick={() => setSelectedRequest(req)}
                    className={`w-full mt-2 py-2 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all ${
                      theme === 'dark' 
                        ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700' 
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <HugeiconsIcon icon={EyeIcon} className="w-4 h-4" />
                    Review Request
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
            theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'
          }`}>
            <div className="sticky top-0 p-4 border-b flex items-center justify-between bg-inherit z-10 border-gray-100 dark:border-slate-800">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Review Verification Request</h2>
              <button 
                onClick={() => setSelectedRequest(null)}
                className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <HugeiconsIcon icon={Cancel01Icon} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Full Name</label>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.full_name}</p>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Requested Role</label>
                  <p className={`font-medium capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.requested_role}</p>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Graduation Place</label>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.graduation_place}</p>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Major & Year</label>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.major} ({selectedRequest.graduation_year})</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Photo</label>
                  <div className={`rounded-xl overflow-hidden border ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'}`}>
                    <img src={selectedRequest.photo_url} alt="Photo" className="w-full h-auto max-h-64 object-contain bg-black/5" />
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Document (ID/Degree)</label>
                  <div className={`rounded-xl overflow-hidden border ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'}`}>
                    <img src={selectedRequest.document_url} alt="Document" className="w-full h-auto max-h-96 object-contain bg-black/5" />
                  </div>
                </div>
              </div>
            </div>

            {selectedRequest.status === 'pending' && (
              <div className="sticky bottom-0 p-4 border-t flex gap-3 bg-inherit z-10 border-gray-100 dark:border-slate-800">
                <button
                  onClick={() => handleUpdateStatus(selectedRequest.id, selectedRequest.user_id, 'rejected', selectedRequest.requested_role)}
                  className="flex-1 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
                  Reject
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedRequest.id, selectedRequest.user_id, 'approved', selectedRequest.requested_role)}
                  className="flex-1 py-3 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5" />
                  Approve & Verify
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

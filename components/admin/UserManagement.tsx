import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Search01Icon, 
  FilterIcon, 
  UserIcon, 
  MoreVerticalIcon,
  Delete01Icon,
  Edit01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { UserRole } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  email?: string;
  role: UserRole;
  avatar_url: string;
  is_verified: boolean;
}

export const UserManagement: React.FC = () => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleMenu = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setMenuOpenId(menuOpenId === userId ? null : userId);
  };

  const fetchUsers = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client is not initialized');
        showToast('Supabase connection error', 'error');
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log('Fetching users from Supabase...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, role, avatar_url, is_verified')
        .order('id', { ascending: false });

      if (error) {
        console.error('Supabase error fetching users:', error);
        throw error;
      }
      
      console.log('Users fetched successfully:', data?.length);
      setUsers(data as UserProfile[]);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      let errorMessage = error.message || 'Failed to fetch users';
      if (errorMessage === 'Failed to fetch') {
        errorMessage = 'Network error. Please check your connection or disable your adblocker.';
      }
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      showToast(`User role updated to ${newRole}`, 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      showToast('Failed to update role', 'error');
    }
  };

  const handleToggleVerify = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      showToast(currentStatus ? 'User unverified' : 'User verified', 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error toggling verification:', error);
      showToast('Failed to update verification status', 'error');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-khmer">User Management</h1>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            Manage all users, roles, and account statuses on Ponloe.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            theme === 'dark'
              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          } disabled:opacity-50`}
        >
          <div className={loading ? 'animate-spin' : ''}>
            <HugeiconsIcon icon={FilterIcon} strokeWidth={1.5} className="w-5 h-5" />
          </div>
          Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <HugeiconsIcon 
                icon={Search01Icon} 
                strokeWidth={1.5} 
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                }`}
              />
              <input
                type="text"
                placeholder="Search by name, username or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                } focus:outline-none`}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {(['all', 'admin', 'scholar', 'premium', 'general'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all capitalize whitespace-nowrap ${
                    roleFilter === role
                      ? 'bg-emerald-600 text-white'
                      : theme === 'dark'
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-gray-50'}`}>
                  <th className="px-6 py-4 text-sm font-bold">User</th>
                  <th className="px-6 py-4 text-sm font-bold">Role</th>
                  <th className="px-6 py-4 text-sm font-bold">Verified</th>
                  <th className="px-6 py-4 text-sm font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-gray-100'}`}>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        <p className="text-sm text-gray-500">Loading users...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No users found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className={`transition-colors ${
                        theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center overflow-hidden">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className="w-5 h-5 text-emerald-600" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{user.full_name || 'Anonymous'}</span>
                            <span className="text-xs text-gray-500">@{user.username || 'no-username'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={
                            user.role === 'admin' ? 'danger' : 
                            user.role === 'scholar' ? 'warning' : 
                            user.role === 'premium' ? 'success' : 'secondary'
                          }
                          size="sm"
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_verified ? (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="w-4 h-4" />
                            <span className="text-xs font-bold">Verified</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Unverified</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleToggleVerify(user.id, user.is_verified)}
                            title={user.is_verified ? "Unverify User" : "Verify User"}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark' 
                                ? 'hover:bg-slate-700 text-slate-400 hover:text-emerald-400' 
                                : 'hover:bg-emerald-50 text-gray-500 hover:text-emerald-600'
                            }`}
                          >
                            <HugeiconsIcon icon={user.is_verified ? Cancel01Icon : CheckmarkCircle02Icon} strokeWidth={1.5} className="w-4 h-4" />
                          </button>
                          
                          <div className="relative">
                            <button 
                              onClick={(e) => toggleMenu(e, user.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                theme === 'dark' 
                                  ? 'hover:bg-slate-700 text-slate-400' 
                                  : 'hover:bg-gray-100 text-gray-500'
                              }`}
                            >
                              <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={1.5} className="w-4 h-4" />
                            </button>
                            
                            {menuOpenId === user.id && (
                              <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-200 ${
                                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
                              }`}>
                                <p className="text-[10px] font-bold text-gray-400 px-3 py-1 uppercase tracking-wider">Change Role</p>
                                {(['admin', 'scholar', 'premium', 'general'] as UserRole[]).map(role => (
                                  <button
                                    key={role}
                                    onClick={() => {
                                      handleUpdateRole(user.id, role);
                                      setMenuOpenId(null);
                                    }}
                                    disabled={user.role === role}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                                      user.role === role 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    Make {role.charAt(0).toUpperCase() + role.slice(1)}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

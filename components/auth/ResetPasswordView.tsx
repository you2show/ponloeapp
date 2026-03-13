import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { LockPasswordIcon, Loading02Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getPasswordStrength } from '@/utils/auth';

export const ResetPasswordView: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ', 'error');
      return;
    }

    if (strength.score < 2) {
      showToast('សូមប្រើប្រាស់ពាក្យសម្ងាត់ដែលរឹងមាំជាងនេះ', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      showToast('ប្តូរពាក្យសម្ងាត់ជោគជ័យ!', 'success');
      navigate('/');
    } catch (err: any) {
      showToast(err.message || 'មានបញ្ហាក្នុងការប្តូរពាក្យសម្ងាត់', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-gray-900'
    }`}>
      <div className={`w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'
      }`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HugeiconsIcon icon={LockPasswordIcon} strokeWidth={1.5} className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold font-khmer mb-2">ប្តូរពាក្យសម្ងាត់ថ្មី</h2>
          <p className="text-gray-500 text-sm font-khmer">សូមបញ្ចូលពាក្យសម្ងាត់ថ្មីរបស់អ្នកខាងក្រោម</p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 font-khmer">ពាក្យសម្ងាត់ថ្មី</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <HugeiconsIcon icon={LockPasswordIcon} strokeWidth={1.5} className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-2xl outline-none transition-all text-sm border ${
                  theme === 'dark' 
                    ? 'bg-slate-800 border-slate-700 focus:ring-2 focus:ring-emerald-500' 
                    : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-emerald-500'
                }`}
                placeholder="••••••••"
              />
            </div>
            
            {password && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] text-gray-500 font-khmer uppercase tracking-wider">កម្រិតសុវត្ថិភាព: <span className="font-bold text-gray-700 dark:text-slate-300">{strength.label}</span></span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${strength.color}`} 
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 font-khmer">បញ្ជាក់ពាក្យសម្ងាត់</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-2xl outline-none transition-all text-sm border ${
                  theme === 'dark' 
                    ? 'bg-slate-800 border-slate-700 focus:ring-2 focus:ring-emerald-500' 
                    : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-emerald-500'
                }`}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-70 font-khmer"
          >
            {loading ? (
              <HugeiconsIcon icon={Loading02Icon} strokeWidth={1.5} className="w-6 h-6 animate-spin" />
            ) : (
              "រក្សាទុកពាក្យសម្ងាត់"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

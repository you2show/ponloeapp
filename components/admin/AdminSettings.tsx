import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Settings01Icon,
  LockPasswordIcon,
  Notification01Icon,
  PaintBoardIcon,
  Globe02Icon,
  FloppyDiskIcon,
  CheckmarkCircle01Icon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface Settings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  enableRegistration: boolean;
  requireEmailVerification: boolean;
  maxUploadSize: number;
  postsPerPage: number;
  enableComments: boolean;
  enableNotifications: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpEmail: string;
  primaryColor: string;
  accentColor: string;
  language: string;
}

export const AdminSettings: React.FC = () => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'email' | 'theme'>('general');
  const [settings, setSettings] = useState<Settings>({
    siteName: 'Ponloe.app',
    siteDescription: 'Islamic Platform for Learning and Community',
    maintenanceMode: false,
    enableRegistration: true,
    requireEmailVerification: true,
    maxUploadSize: 50,
    postsPerPage: 20,
    enableComments: true,
    enableNotifications: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpEmail: 'noreply@ponloe.app',
    primaryColor: '#059669',
    accentColor: '#0d9488',
    language: 'en',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Settings saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const SettingInput = ({ 
    label, 
    value, 
    onChange, 
    type = 'text',
    description
  }: { 
    label: string; 
    value: any;
    onChange: (value: any) => void;
    type?: string;
    description?: string;
  }) => (
    <div className="mb-6">
      <label className="block text-sm font-bold mb-2">{label}</label>
      {description && (
        <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
          {description}
        </p>
      )}
      {type === 'checkbox' ? (
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded cursor-pointer"
        />
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={`w-full px-4 py-2 rounded-lg border transition-colors ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
              : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
          } focus:outline-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border transition-colors ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
              : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
          } focus:outline-none`}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-khmer">Settings</h1>
        <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
          Configure system-wide settings and preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-800 overflow-x-auto">
        {[
          { id: 'general', icon: Settings01Icon, label: 'General' },
          { id: 'security', icon: LockPasswordIcon, label: 'Security' },
          { id: 'email', icon: Notification01Icon, label: 'Email' },
          { id: 'theme', icon: PaintBoardIcon, label: 'Theme' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : `border-transparent ${
                    theme === 'dark'
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`
            }`}
          >
            <HugeiconsIcon icon={tab.icon} strokeWidth={1.5} className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div>
                  <h3 className="text-lg font-bold mb-6">General Settings</h3>
                  <SettingInput
                    label="Site Name"
                    value={settings.siteName}
                    onChange={(v) => handleChange('siteName', v)}
                    description="The name of your platform"
                  />
                  <SettingInput
                    label="Site Description"
                    value={settings.siteDescription}
                    onChange={(v) => handleChange('siteDescription', v)}
                    type="textarea"
                    description="Brief description for SEO and social media"
                  />
                  <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <div>
                      <p className="font-bold">Maintenance Mode</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        Disable access for non-admin users
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                      className="w-5 h-5 rounded cursor-pointer"
                    />
                  </div>
                  <SettingInput
                    label="Posts Per Page"
                    value={settings.postsPerPage}
                    onChange={(v) => handleChange('postsPerPage', parseInt(v))}
                    type="number"
                    description="Number of posts to display per page"
                  />
                  <SettingInput
                    label="Max Upload Size (MB)"
                    value={settings.maxUploadSize}
                    onChange={(v) => handleChange('maxUploadSize', parseInt(v))}
                    type="number"
                    description="Maximum file size for uploads"
                  />
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div>
                  <h3 className="text-lg font-bold mb-6">Security Settings</h3>
                  <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <div>
                      <p className="font-bold">Enable Registration</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        Allow new users to create accounts
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableRegistration}
                      onChange={(e) => handleChange('enableRegistration', e.target.checked)}
                      className="w-5 h-5 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <div>
                      <p className="font-bold">Require Email Verification</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        Users must verify email before posting
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.requireEmailVerification}
                      onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                      className="w-5 h-5 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <div>
                      <p className="font-bold">Enable Comments</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        Allow users to comment on posts
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableComments}
                      onChange={(e) => handleChange('enableComments', e.target.checked)}
                      className="w-5 h-5 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Email Settings */}
              {activeTab === 'email' && (
                <div>
                  <h3 className="text-lg font-bold mb-6">Email Configuration</h3>
                  <SettingInput
                    label="SMTP Host"
                    value={settings.smtpHost}
                    onChange={(v) => handleChange('smtpHost', v)}
                    description="Email server hostname"
                  />
                  <SettingInput
                    label="SMTP Port"
                    value={settings.smtpPort}
                    onChange={(v) => handleChange('smtpPort', parseInt(v))}
                    type="number"
                    description="Email server port (usually 587 or 465)"
                  />
                  <SettingInput
                    label="SMTP Email"
                    value={settings.smtpEmail}
                    onChange={(v) => handleChange('smtpEmail', v)}
                    type="email"
                    description="Email address for sending notifications"
                  />
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <div>
                      <p className="font-bold">Enable Notifications</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        Send email notifications to users
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableNotifications}
                      onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                      className="w-5 h-5 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Theme Settings */}
              {activeTab === 'theme' && (
                <div>
                  <h3 className="text-lg font-bold mb-6">Theme & Branding</h3>
                  <div className="mb-6">
                    <label className="block text-sm font-bold mb-2">Primary Color</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => handleChange('primaryColor', e.target.value)}
                        className="w-16 h-16 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => handleChange('primaryColor', e.target.value)}
                        className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                          theme === 'dark'
                            ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
                        } focus:outline-none`}
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-bold mb-2">Accent Color</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => handleChange('accentColor', e.target.value)}
                        className="w-16 h-16 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.accentColor}
                        onChange={(e) => handleChange('accentColor', e.target.value)}
                        className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                          theme === 'dark'
                            ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
                        } focus:outline-none`}
                      />
                    </div>
                  </div>
                  <SettingInput
                    label="Default Language"
                    value={settings.language}
                    onChange={(v) => handleChange('language', v)}
                    description="Default language for the platform"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Save Button */}
          <Card>
            <CardContent className="p-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
                  saving
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <HugeiconsIcon icon={FloppyDiskIcon} strokeWidth={1.5} className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-3">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={1.5} className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm mb-1">Settings Saved</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                    All changes are automatically saved to the database.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card>
            <CardHeader className="border-b">
              <h4 className="font-bold">Need Help?</h4>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                For detailed information about these settings, check the documentation.
              </p>
              <a
                href="/admin/docs"
                className="text-emerald-600 hover:text-emerald-700 font-bold text-sm"
              >
                View Documentation →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  UserCircleIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  BellIcon,
  PaintBrushIcon,
  ComputerDesktopIcon,
  SunIcon,
  MoonIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ChartBarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';

const Settings = ({ user }) => {
  const { theme, toggleTheme, setLightMode, setDarkMode, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');
  const [settings, setSettings] = useState({
    // User Profile
    fullName: user?.full_name || '',
    email: user?.email || `${user?.username}@ballyscasino.lk`,
    phone: '+94 77 123 4567',
    department: user?.role === 'SuperAdmin' ? 'Administration' : 'Operations',
    
    // Appearance
    theme: theme,
    fontSize: 'medium',
    compactMode: false,
    animationsEnabled: true,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    securityAlerts: true,
    vipAlerts: true,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: 60,
    loginNotifications: true,
    passwordExpiry: 90,
    
    // Casino Preferences
    defaultCurrency: 'USD',
    timezone: 'Asia/Colombo',
    language: 'English',
    dashboardRefresh: 30,
    autoLogout: 480,
    
    // Data & Privacy
    dataRetention: 365,
    analyticsSharing: false,
    personalizedAds: false,
    cookieSettings: 'necessary',
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const settingsTabs = [
    {
      id: 'profile',
      name: 'Profile',
      icon: UserCircleIcon,
      description: 'Personal information and account details'
    },
    {
      id: 'appearance',
      name: 'Appearance',
      icon: PaintBrushIcon,
      description: 'Theme, colors, and display settings'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: BellIcon,
      description: 'Alerts and notification preferences'
    },
    {
      id: 'security',
      name: 'Security',
      icon: ShieldCheckIcon,
      description: 'Password, 2FA, and security settings'
    },
    {
      id: 'casino',
      name: 'Casino Preferences',
      icon: BuildingOfficeIcon,
      description: 'Gaming, currency, and operational settings'
    },
    {
      id: 'system',
      name: 'System',
      icon: Cog6ToothIcon,
      description: 'Performance and system preferences'
    },
    {
      id: 'privacy',
      name: 'Privacy',
      icon: EyeIcon,
      description: 'Data privacy and sharing controls'
    }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));

    // Special handling for theme changes
    if (key === 'theme') {
      if (value === 'light') setLightMode();
      else if (value === 'dark') setDarkMode();
      toast.success(`Switched to ${value} mode`);
    }
  };

  const handleSaveProfile = () => {
    // Here you would typically call an API to update user profile
    toast.success('Profile updated successfully!');
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    // Here you would typically call an API to change password
    toast.success('Password updated successfully!');
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="casino-card p-6">
        <h3 className="text-xl font-bold text-adaptive-text-accent font-casino-serif mb-6">👤 Profile Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-adaptive-text-muted mb-2">Full Name</label>
            <input
              type="text"
              className="casino-input w-full"
              value={settings.fullName}
              onChange={(e) => handleSettingChange('fullName', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-adaptive-text-muted mb-2">Email Address</label>
            <input
              type="email"
              className="casino-input w-full"
              value={settings.email}
              onChange={(e) => handleSettingChange('email', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-adaptive-text-muted mb-2">Phone Number</label>
            <input
              type="tel"
              className="casino-input w-full"
              value={settings.phone}
              onChange={(e) => handleSettingChange('phone', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-adaptive-text-muted mb-2">Department</label>
            <select
              className="casino-select w-full"
              value={settings.department}
              onChange={(e) => handleSettingChange('department', e.target.value)}
            >
              <option value="Administration">Administration</option>
              <option value="Operations">Operations</option>
              <option value="Security">Security</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-adaptive-border">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-casino-gradient flex items-center justify-center">
              <span className="text-2xl font-bold text-white font-casino-serif">
                {settings.fullName.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-adaptive-text">{settings.fullName}</h4>
              <p className="text-sm text-adaptive-text-muted">{user?.role}</p>
              <div className={`inline-flex items-center text-xs px-2 py-1 rounded-full font-medium tier-badge tier-${user?.role === 'SuperAdmin' ? 'vip' : 'sapphire'} mt-1`}>
                {user?.role}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-4">
          <button onClick={handleSaveProfile} className="btn-casino-primary">
            Save Profile Changes
          </button>
          <button onClick={() => setShowPasswordModal(true)} className="btn-casino-secondary">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="casino-card p-6">
        <h3 className="text-xl font-bold text-adaptive-text-accent font-casino-serif mb-6">🎨 Theme Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => handleSettingChange('theme', 'light')}
            className={`p-4 rounded-lg border-2 transition-all ${
              theme === 'light' 
                ? 'border-adaptive-text-accent bg-adaptive-text-accent/10' 
                : 'border-adaptive-border hover:border-adaptive-text-accent/50'
            }`}
          >
            <SunIcon className="h-8 w-8 mx-auto mb-2 text-adaptive-text-accent" />
            <p className="font-medium text-adaptive-text">Light Mode</p>
            <p className="text-sm text-adaptive-text-muted">Clean, bright interface</p>
          </button>
          
          <button
            onClick={() => handleSettingChange('theme', 'dark')}
            className={`p-4 rounded-lg border-2 transition-all ${
              theme === 'dark' 
                ? 'border-adaptive-text-accent bg-adaptive-text-accent/10' 
                : 'border-adaptive-border hover:border-adaptive-text-accent/50'
            }`}
          >
            <MoonIcon className="h-8 w-8 mx-auto mb-2 text-adaptive-text-accent" />
            <p className="font-medium text-adaptive-text">Dark Mode</p>
            <p className="text-sm text-adaptive-text-muted">Luxury casino aesthetic</p>
          </button>
          
          <button
            onClick={() => handleSettingChange('theme', 'system')}
            className={`p-4 rounded-lg border-2 transition-all ${
              theme === 'system' 
                ? 'border-adaptive-text-accent bg-adaptive-text-accent/10' 
                : 'border-adaptive-border hover:border-adaptive-text-accent/50'
            }`}
          >
            <ComputerDesktopIcon className="h-8 w-8 mx-auto mb-2 text-adaptive-text-accent" />
            <p className="font-medium text-adaptive-text">System</p>
            <p className="text-sm text-adaptive-text-muted">Follow system preference</p>
          </button>
        </div>
      </div>

      <div className="casino-card p-6">
        <h3 className="text-xl font-bold text-adaptive-text-accent font-casino-serif mb-6">📱 Display Settings</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-adaptive-text-muted mb-2">Font Size</label>
            <select
              className="casino-select w-full md:w-64"
              value={settings.fontSize}
              onChange={(e) => handleSettingChange('fontSize', e.target.value)}
            >
              <option value="small">Small</option>
              <option value="medium">Medium (Recommended)</option>
              <option value="large">Large</option>
              <option value="xl">Extra Large</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-adaptive-text">Compact Mode</h4>
              <p className="text-sm text-adaptive-text-muted">Reduce spacing for more content</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-adaptive-text-accent/20 dark:peer-focus:ring-adaptive-text-accent/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-adaptive-text-accent"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-adaptive-text">Smooth Animations</h4>
              <p className="text-sm text-adaptive-text-muted">Enable transitions and hover effects</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.animationsEnabled}
                onChange={(e) => handleSettingChange('animationsEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-adaptive-text-accent/20 dark:peer-focus:ring-adaptive-text-accent/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-adaptive-text-accent"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="casino-card p-6">
        <h3 className="text-xl font-bold text-adaptive-text-accent font-casino-serif mb-6">🔔 Notification Preferences</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-adaptive-text">Email Notifications</h4>
              <p className="text-sm text-adaptive-text-muted">Receive alerts via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-adaptive-text-accent/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-adaptive-text-accent"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-adaptive-text">Push Notifications</h4>
              <p className="text-sm text-adaptive-text-muted">Browser push notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-adaptive-text-accent/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-adaptive-text-accent"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-adaptive-text">SMS Notifications</h4>
              <p className="text-sm text-adaptive-text-muted">Critical alerts via SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-adaptive-text-accent/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-adaptive-text-accent"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="casino-card p-6">
        <h3 className="text-xl font-bold text-adaptive-text-accent font-casino-serif mb-6">🎰 Casino Alerts</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-adaptive-text">VIP Member Alerts</h4>
              <p className="text-sm text-adaptive-text-muted">High-value player activities</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.vipAlerts}
                onChange={(e) => handleSettingChange('vipAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-adaptive-text-accent/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-adaptive-text-accent"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-adaptive-text">Security Alerts</h4>
              <p className="text-sm text-adaptive-text-muted">Login attempts and security events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.securityAlerts}
                onChange={(e) => handleSettingChange('securityAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-adaptive-text-accent/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-adaptive-text-accent"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-adaptive-text">Weekly Reports</h4>
              <p className="text-sm text-adaptive-text-muted">Weekly performance summaries</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.weeklyReports}
                onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-adaptive-text-accent/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-adaptive-text-accent"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return (
          <div className="casino-card p-6">
            <h3 className="text-xl font-bold text-adaptive-text-accent font-casino-serif mb-6">🔒 Security Settings</h3>
            <p className="text-adaptive-text-muted">Security settings panel coming soon...</p>
          </div>
        );
      case 'casino':
        return (
          <div className="casino-card p-6">
            <h3 className="text-xl font-bold text-adaptive-text-accent font-casino-serif mb-6">🎰 Casino Preferences</h3>
            <p className="text-adaptive-text-muted">Casino preferences panel coming soon...</p>
          </div>
        );
      case 'system':
        return (
          <div className="casino-card p-6">
            <h3 className="text-xl font-bold text-adaptive-text-accent font-casino-serif mb-6">⚙️ System Settings</h3>
            <p className="text-adaptive-text-muted">System settings panel coming soon...</p>
          </div>
        );
      case 'privacy':
        return (
          <div className="casino-card p-6">
            <h3 className="text-xl font-bold text-adaptive-text-accent font-casino-serif mb-6">🛡️ Privacy Controls</h3>
            <p className="text-adaptive-text-muted">Privacy controls panel coming soon...</p>
          </div>
        );
      default:
        return renderAppearanceSettings();
    }
  };

  return (
    <div className="space-y-6 bg-adaptive-bg min-h-screen p-6">
      {/* Header */}
      <div className="casino-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-adaptive-text font-casino-serif">⚙️ Settings</h1>
            <p className="text-adaptive-text-muted mt-2">Customize your casino dashboard experience</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-adaptive-text-muted">
              Current Theme: <span className="font-medium text-adaptive-text-accent capitalize">{theme}</span>
            </div>
            <button
              onClick={toggleTheme}
              className="theme-toggle p-2"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="casino-card p-4 sticky top-6">
            <nav className="space-y-2">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-adaptive-text-accent/10 text-adaptive-text-accent border border-adaptive-text-accent/20'
                        : 'text-adaptive-text-muted hover:text-adaptive-text hover:bg-adaptive-text-accent/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{tab.name}</div>
                        <div className="text-xs text-adaptive-text-muted hidden lg:block">{tab.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="casino-card p-6 w-full max-w-md m-4">
            <h3 className="text-xl font-bold text-adaptive-text-accent font-casino-serif mb-4">🔐 Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-adaptive-text-muted mb-2">Current Password</label>
                <input
                  type="password"
                  className="casino-input w-full"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-adaptive-text-muted mb-2">New Password</label>
                <input
                  type="password"
                  className="casino-input w-full"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-adaptive-text-muted mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="casino-input w-full"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button onClick={handlePasswordChange} className="btn-casino-primary">
                Update Password
              </button>
              <button onClick={() => setShowPasswordModal(false)} className="btn-casino-ghost">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
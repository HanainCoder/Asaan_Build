import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { User, Bell, Globe, Moon, Sun, Lock, Github, Eye, EyeOff } from 'lucide-react';

// ── Reusable Toggle ──────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-14 h-7 rounded-full transition-all ${
        value ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 size-6 bg-white rounded-full shadow-md 
                    transition-transform duration-300 ${
                      value ? 'translate-x-7' : 'translate-x-0'
                    }`}
      />
    </button>
  );
}

export function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { user, updateUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
  });

  // ── Provider checks ──────────────────────────────────────
  const isGoogleUser = user?.provider?.includes('google') ?? false;
  const isGithubUser = user?.provider?.includes('github') ?? false;
  const hasPassword  = user?.login_method === 'local';

  // ── Eye toggle state ─────────────────────────────────────
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Profile state ─────────────────────────────────────────
  const [name, setName]                 = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg]     = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Avatar state ──────────────────────────────────────────
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Password state ────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Save name ─────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setProfileMsg({ type: 'error', text: 'Name cannot be empty' });
      return;
    }
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        updateUser({ name: data.user.name });
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setProfileMsg({ type: 'error', text: data.message });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Something went wrong' });
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Avatar upload ─────────────────────────────────────────
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    setAvatarMsg(null);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/user/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        updateUser({ avatar: data.avatar });
        setAvatarMsg({ type: 'success', text: 'Profile photo updated!' });
      } else {
        setAvatarMsg({ type: 'error', text: data.message });
      }
    } catch {
      setAvatarMsg({ type: 'error', text: 'Upload failed' });
    } finally {
      setAvatarLoading(false);
      e.target.value = '';
    }
  };

  // ── Change password ───────────────────────────────────────
  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'All fields are required' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Minimum 8 characters required' });
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordMsg({ type: 'error', text: 'Password must contain at least one uppercase letter' });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: data.message });
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Something went wrong' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">

            <div className="mb-8">
              <h1 className="mb-2">{t('settings')}</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>

            <div className="space-y-6">

              {/* ══ PROFILE ══════════════════════════════════════ */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <User className="size-5 text-gray-600" />
                  <h2>{t('updateProfile')}</h2>
                </div>

                <div className="space-y-4">

                  {/* Avatar + badges */}
                  <div className="flex items-center gap-6 flex-wrap">

                    {/* Avatar with upload overlay */}
                    <div className="relative">
                      <img
                        src={
                          user?.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'default'}`
                        }
                        alt="Profile"
                        className="size-20 rounded-full border-4 border-gray-100 object-cover"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        {avatarLoading ? (
                          <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="text-white text-xs font-medium">Change</span>
                        )}
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={avatarLoading}
                      />
                    </div>

                    {/* Badges + messages */}
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        {isGoogleUser && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-sm rounded-full border border-red-200">
                            🔗 Signed in with Google
                          </span>
                        )}
                        {isGithubUser && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-300">
                            <Github className="size-3.5" />
                            GitHub
                            {user?.github_username && (
                              <span className="text-gray-500">(@{user.github_username})</span>
                            )}
                          </span>
                        )}
                        {!isGoogleUser && !isGithubUser && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full border border-blue-200">
                            ✉️ Email account
                          </span>
                        )}
                      </div>
                      {avatarMsg && (
                        <p className={`text-sm ${avatarMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                          {avatarMsg.type === 'success' ? '✅' : '❌'} {avatarMsg.text}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">Click on photo to change • Max 2MB • JPG, PNG, WebP</p>
                    </div>

                  </div>

                  {/* Name + Email */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-gray-700">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-gray-700">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>
                  </div>

                  {/* Profile message */}
                  {profileMsg && (
                    <p className={`text-sm ${profileMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                      {profileMsg.type === 'success' ? '✅' : '❌'} {profileMsg.text}
                    </p>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={profileLoading}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-60"
                    >
                      {profileLoading ? 'Saving...' : `${t('save')} Changes`}
                    </button>
                  </div>
                </div>
              </div>

              {/* ══ PASSWORD (sirf local users) ══════════════════ */}
              {hasPassword && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <Lock className="size-5 text-gray-600" />
                    <h2>Change Password</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-gray-700">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-gray-700">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block mb-2 text-gray-700">Confirm Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {passwordMsg && (
                      <p className={`text-sm ${passwordMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                        {passwordMsg.type === 'success' ? '✅' : '❌'} {passwordMsg.text}
                      </p>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={handleSavePassword}
                        disabled={passwordLoading}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-60"
                      >
                        {passwordLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ LANGUAGE ════════════════════════════════════ */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="size-5 text-gray-600" />
                  <h2>Language & Region</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-gray-700">Interface Language</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['en', 'ur'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            language === lang
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <p className={language === lang ? 'text-blue-600' : ''}>
                            {lang === 'en' ? 'English' : 'اردو'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {lang === 'en' ? 'English (US)' : 'Urdu'}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p>Right-to-Left (RTL) Support</p>
                      <p className="text-sm text-gray-600">Automatically enabled for Urdu</p>
                    </div>
                    <div
                      className={`size-12 rounded-full ${
                        language === 'ur' ? 'bg-green-500' : 'bg-gray-300'
                      } flex items-center justify-center text-white transition-colors`}
                    >
                      {language === 'ur' ? '✓' : '×'}
                    </div>
                  </div>
                </div>
              </div>

              {/* ══ DARK MODE ═══════════════════════════════════ */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <Moon className="size-5 text-gray-600" />
                  <h2>{t('interfacePreferences')}</h2>
                </div>
                <div
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon className="size-5 text-gray-700" /> : <Sun className="size-5 text-gray-700" />}
                    <div>
                      <p>Dark Mode</p>
                      <p className="text-sm text-gray-600">Use dark theme across the app</p>
                    </div>
                  </div>
                  <Toggle value={darkMode} onChange={() => setDarkMode(!darkMode)} />
                </div>
              </div>

              {/* ══ NOTIFICATIONS ═══════════════════════════════ */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="size-5 text-gray-600" />
                  <h2>{t('notifications')}</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'email',   label: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'push',    label: 'Push Notifications',  desc: 'Receive push notifications' },
                    { key: 'updates', label: 'Product Updates',     desc: 'Get notified about new features' },
                  ].map(({ key, label, desc }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all"
                    >
                      <div>
                        <p>{label}</p>
                        <p className="text-sm text-gray-600">{desc}</p>
                      </div>
                      <Toggle
                        value={notifications[key as keyof typeof notifications]}
                        onChange={() =>
                          setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { User, Bell, Globe, Moon, Sun } from 'lucide-react';

export function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-317">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="mb-2">{t('settings')}</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>

            <div className="space-y-6">
              {/* Profile Settings */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <User className="size-5 text-gray-600" />
                  <h2>{t('updateProfile')}</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <img
                      src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                      alt="Profile"
                      className="size-20 rounded-full border-4 border-gray-100"
                    />
                    <div className="flex-1">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Change Photo
                      </button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-gray-700">Name</label>
                      <input
                        type="text"
                        defaultValue={user?.name}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-gray-700">Email</label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow">
                      {t('save')} Changes
                    </button>
                  </div>
                </div>
              </div>

              {/* Language Settings */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="size-5 text-gray-600" />
                  <h2>Language & Region</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-gray-700">Interface Language</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setLanguage('en')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          language === 'en'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <p className={language === 'en' ? 'text-blue-600' : ''}>
                          English
                        </p>
                        <p className="text-sm text-gray-500">English (US)</p>
                      </button>
                      <button
                        onClick={() => setLanguage('ur')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          language === 'ur'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <p className={language === 'ur' ? 'text-blue-600' : ''}>
                          اردو
                        </p>
                        <p className="text-sm text-gray-500">Urdu</p>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p>Right-to-Left (RTL) Support</p>
                      <p className="text-sm text-gray-600">
                        Automatically enabled for Urdu
                      </p>
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

              {/* Interface Preferences */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
  <div className="flex items-center gap-3 mb-6">
    <Moon className="size-5 text-gray-600" />
    <h2>{t('interfacePreferences')}</h2>
  </div>

  <div className="space-y-4">
    {/* ROW */}
    <div
      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg 
                 hover:bg-gray-100 transition-colors cursor-pointer"
      onClick={() => setDarkMode(!darkMode)}
    >
      <div className="flex items-center gap-3">
        {darkMode ? (
          <Moon className="size-5 text-gray-700" />
        ) : (
          <Sun className="size-5 text-gray-700" />
        )}
        <div>
          <p>Dark Mode</p>
          <p className="text-sm text-gray-600">
            Use dark theme across the app
          </p>
        </div>
      </div>

      {/* TOGGLE BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent double toggle
          setDarkMode(!darkMode);
        }}
        className={`relative w-14 h-7 rounded-full transition-all 
                    ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}
                    hover:brightness-110 active:scale-95`}
      >
        {/* Toggle knob */}
        <div
          className={`absolute top-0.5 left-0.5 size-6 bg-white rounded-full 
                      shadow-md transition-transform duration-300 
                      ${darkMode ? 'translate-x-7' : 'translate-x-0'}
                      hover:scale-105`}
        />
      </button>
    </div>
  </div>
</div>


              {/* Notification Settings */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
  <div className="flex items-center gap-3 mb-6">
    <Bell className="size-5 text-gray-600" />
    <h2>{t('notifications')}</h2>
  </div>

  <div className="space-y-4">

    {/* Email Notifications */}
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-all hover:bg-gray-100 hover:shadow-sm">
      <div>
        <p>Email Notifications</p>
        <p className="text-sm text-gray-600">Receive updates via email</p>
      </div>

      <button
        onClick={() =>
          setNotifications({ ...notifications, email: !notifications.email })
        }
        className={`relative w-14 h-7 rounded-full transition-all 
          ${notifications.email ? 'bg-blue-600' : 'bg-gray-300'} 
          hover:${notifications.email ? 'bg-blue-700' : 'bg-gray-400'}
          hover:shadow-md hover:scale-105
        `}
      >
        <div
          className={`absolute top-0.5 left-0.5 size-6 bg-white rounded-full transition-all
            ${notifications.email ? 'translate-x-7' : 'translate-x-0'} 
            group-hover:scale-110
            hover:scale-110 shadow-sm
          `}
        />
      </button>
    </div>

    {/* Push Notifications */}
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-all hover:bg-gray-100 hover:shadow-sm">
      <div>
        <p>Push Notifications</p>
        <p className="text-sm text-gray-600">Receive push notifications</p>
      </div>

      <button
        onClick={() =>
          setNotifications({ ...notifications, push: !notifications.push })
        }
        className={`relative w-14 h-7 rounded-full transition-all 
          ${notifications.push ? 'bg-blue-600' : 'bg-gray-300'} 
          hover:${notifications.push ? 'bg-blue-700' : 'bg-gray-400'}
          hover:shadow-md hover:scale-105
        `}
      >
        <div
          className={`absolute top-0.5 left-0.5 size-6 bg-white rounded-full transition-all
            ${notifications.push ? 'translate-x-7' : 'translate-x-0'} 
            hover:scale-110 shadow-sm
          `}
        />
      </button>
    </div>

    {/* Product Updates */}
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-all hover:bg-gray-100 hover:shadow-sm">
      <div>
        <p>Product Updates</p>
        <p className="text-sm text-gray-600">Get notified about new features</p>
      </div>

      <button
        onClick={() =>
          setNotifications({
            ...notifications,
            updates: !notifications.updates,
          })
        }
        className={`relative w-14 h-7 rounded-full transition-all 
          ${notifications.updates ? 'bg-blue-600' : 'bg-gray-300'} 
          hover:${notifications.updates ? 'bg-blue-700' : 'bg-gray-400'}
          hover:shadow-md hover:scale-105
        `}
      >
        <div
          className={`absolute top-0.5 left-0.5 size-6 bg-white rounded-full transition-all
            ${notifications.updates ? 'translate-x-7' : 'translate-x-0'} 
            hover:scale-110 shadow-sm
          `}
        />
      </button>
    </div>

  </div>
</div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

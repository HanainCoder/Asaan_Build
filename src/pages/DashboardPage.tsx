import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import {
  FolderKanban,
  TrendingUp,
  Sparkles,
  Clock,
  ArrowRight,
} from 'lucide-react';

export function DashboardPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const recentActivities = [
    { id: 1, action: 'Created E-commerce Store', time: '2 hours ago' },
    { id: 2, action: 'Updated Portfolio Website', time: '5 hours ago' },
    { id: 3, action: 'Generated Restaurant App', time: '1 day ago' },
    { id: 4, action: 'Deployed Blog Platform', time: '2 days ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="mb-2">Welcome back!</h1>
              <p className="text-gray-600">
                Here's what's happening with your projects today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title={t('totalProjects')}
                value="12"
                icon={FolderKanban}
                trend="+3 this month"
                color="blue"
              />
              <StatCard
                title="Active Apps"
                value="8"
                icon={TrendingUp}
                trend="+2 this week"
                color="green"
              />
              <StatCard
                title="Templates Used"
                value="15"
                icon={Sparkles}
                trend="+5 this month"
                color="purple"
              />
              <StatCard
                title="Hours Saved"
                value="47"
                icon={Clock}
                trend="+12 this month"
                color="orange"
              />
              
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2>{t('recentActivity')}</h2>
                  <button className="text-sm text-blue-600 hover:underline">
                    View all
                  </button>
                </div>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                        <Sparkles className="size-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                <h2 className="mb-4 text-white">{t('createNewApp')}</h2>
                <p className="mb-6 text-blue-100">
                  Start building your next application with AI in seconds.
                </p>
                <button
                  onClick={() => navigate('/prompt')}
                  className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2 group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="mt-6 pt-6 border-t border-blue-400">
                  <h3 className="text-sm mb-3 text-blue-100">
                    {t('lastGeneratedApp')}
                  </h3>
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                    <p className="text-sm">E-commerce Store</p>
                    <p className="text-xs text-blue-100 mt-1">Nov 15, 2025</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="mb-6">Project Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    95%
                  </p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    3.2s
                  </p>
                  <p className="text-sm text-gray-600">Avg Generation Time</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    8
                  </p>
                  <p className="text-sm text-gray-600">Active Deployments</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    24/7
                  </p>
                  <p className="text-sm text-gray-600">Uptime</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

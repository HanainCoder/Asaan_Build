import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import  AIJourneyMap  from "../components/AIJourneyMap";


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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 group">
              <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

              <StatCard
                title={t('totalProjects')}
                value="12"
                icon={FolderKanban}
                trend="+3 this month"
                color="blue"
              />
              </div>
              <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <StatCard
                title="Active Apps"
                value="8"
                icon={TrendingUp}
                trend="+2 this week"
                color="green"
              />
              </div>
               <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <StatCard
                title="Templates Used"
                value="15"
                icon={Sparkles}
                trend="+5 this month"
                color="purple"
              />
              </div>
               <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <StatCard
                title="Hours Saved"
                value="47"
                icon={Clock}
                trend="+12 this month"
                color="orange"
              />
              </div>
              
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
                      className="
                      flex items-start gap-4 p-4 rounded-lg cursor-pointer

                      transition-all duration-300
                      hover:bg-gray-50

                       hover:shadow-md
                        hover:scale-[1.02]

                       border border-transparent
                      hover:border-blue-200
                          "
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
                    <p className="text-xs text-blue-100 mt-1">Dec 10, 2025</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200">
  <h2 className="mb-6">Project Overview</h2>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {[
      { value: "95%", label: "Success Rate" },
      { value: "3.2s", label: "Avg Generation Time" },
      { value: "8", label: "Active Deployments" },
      { value: "24/7", label: "Uptime" }
    ].map((item, i) => (
      <div
        key={i}
        className="
          text-center p-4 rounded-lg
          bg-gray-50
          transition-all duration-300
          hover:scale-[1.05]
          hover:shadow-xl
          hover:bg-gray-100
          cursor-pointer
        "
      >
        <p className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {item.value}
        </p>
        <p className="text-sm text-gray-600">{item.label}</p>
      </div>
    ))}
  </div>
</div>

            {/*  nre*/}
            {/* AI Recommendations */}
            <div className="mt-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 text-white">
  <h2 className="mb-4">AI Recommendations</h2>
  <p className="text-purple-200 mb-6">Improve your workflow with smart suggestions.</p>

  <div className="space-y-4">
    {[
      "Try generating a CRM template based on your last app.",
      "Enable auto-deployment for instant previews.",
      "Explore advanced UI themes in your template library.",
    ].map((msg, i) => (
      <div
        key={i}
        className="
          bg-white/10 p-4 rounded-lg backdrop-blur border border-white/20
          transition-all duration-300 ease-out
          hover:scale-[1.03]
          hover:shadow-xl
          hover:bg-white/20
          hover:border-white/40
          cursor-pointer
        "
      >
        <p className="text-white">{msg}</p>
      </div>
    ))}
  </div>
</div>

             {/* section */}
             {/* Minimal Next Steps Section */}
<div className="mt-12 bg-white border border-gray-200 rounded-xl p-8">

  <h2 className="text-xl font-semibold mb-2">Next Steps for You</h2>
  <p className="text-gray-600 mb-8">
    Based on your recent activity, here are quick actions to continue building smoothly.
  </p>

  <div className="grid md:grid-cols-3 gap-6">

    {/* Step 1 */}
    <div className="
  p-5 rounded-xl
  bg-blue-50
  border border-blue-400
  hover:bg-blue-100
  hover:border-blue-300
  shadow-sm hover:shadow-blue-300/40
  transition-all cursor-pointer
">
   
         <p className="text-lg font-semibold text-gray-800 mb-1">Generate New App</p>
      <p className="text-sm text-gray-600">
        Start fresh with a new AI-powered app concept.
      </p>
    </div>

    {/* Step 2 */}
 <div className="
  p-5 rounded-xl
  bg-purple-50
  border border-purple-400
  hover:bg-purple-100
  hover:border-purple-300
  shadow-sm hover:shadow-purple-300/40
  transition-all cursor-pointer
">
      <p className="text-lg font-semibold text-gray-800 mb-1">View Your Templates</p>
      <p className="text-sm text-gray-600">
        Quickly access templates you've used recently.
      </p>
    </div>

    {/* Step 3 */}
    <div className="
  p-5 rounded-xl
  bg-emerald-50
  border border-emerald-300
  hover:bg-emerald-100
  hover:border-emerald-300
  shadow-sm hover:shadow-emerald-300/40
  transition-all cursor-pointer
">

      <p className="text-lg font-semibold text-gray-800 mb-1">Optimize Your Build</p>
      <p className="text-sm text-gray-600">
        Get AI suggestions to improve performance of your apps.
      </p>
    </div>

  </div>
</div>

            


            <AIJourneyMap />
            
          </div>
        </main>
      </div>
    </div>
  );
}

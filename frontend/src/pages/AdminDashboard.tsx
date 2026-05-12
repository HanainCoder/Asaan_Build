import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Menu } from 'lucide-react';


const API = 'http://localhost:5000';

function StatCard({ label, value, today, color }: {
  label: string; value: number; today?: number; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-semibold ${color}`}>{value}</p>
      {today !== undefined && (
        <p className="text-xs text-green-600 mt-1">+{today} today</p>
      )}
    </div>
  );
}

export function AdminDashboard() {
  const navigate  = useNavigate();
  const adminToken = localStorage.getItem('adminToken');
  const adminInfo  = JSON.parse(localStorage.getItem('adminInfo') || '{}');

  const [tab, setTab]           = useState<'overview' | 'users' | 'projects'>('overview');
  const [stats, setStats]       = useState<any>(null);
  const [users, setUsers]       = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  };

  useEffect(() => {
    if (!adminToken) { navigate('/admin'); return; }
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [s, u, p, a] = await Promise.all([
        fetch(`${API}/api/admin/stats`,    { headers }).then(r => r.json()),
        fetch(`${API}/api/admin/users`,    { headers }).then(r => r.json()),
        fetch(`${API}/api/admin/projects`, { headers }).then(r => r.json()),
        fetch(`${API}/api/admin/activity`, { headers }).then(r => r.json()),
      ]);

      if (!s.success) { navigate('/admin'); return; }

      setStats(s);
      setUsers(u.users   || []);
      setProjects(p.projects || []);
      setActivity(a.activity || []);
    } catch {
      navigate('/admin');
    }
    setLoading(false);
  }

  function handleLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin');
  }

  async function deleteUser(id: number) {
    if (!confirm('Delete this user and all their data?')) return;
    const res = await fetch(`${API}/api/admin/user/${id}`, { method: 'DELETE', headers });
    const data = await res.json();
    if (data.success) setUsers(prev => prev.filter(u => u.id !== id));
  }

  async function deleteProject(id: number) {
    if (!confirm('Delete this project?')) return;
    const res = await fetch(`${API}/api/admin/project/${id}`, { method: 'DELETE', headers });
    const data = await res.json();
    if (data.success) setProjects(prev => prev.filter(p => p.id !== id));
  }

  const filteredUsers    = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProjects = projects.filter(p =>
    p.project_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
           <div className="size-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Sparkles className="size-5 text-white" />
                      </div>
          <div>
            <h1 className="font-semibold text-gray-800 text-sm">AsaanBuild Admin</h1>
            <p className="text-xs text-gray-400">Welcome, {adminInfo.name}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-all"
        >
          Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(['overview', 'users', 'projects'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearch(''); }}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400'
              }`}
            >
              {t === 'overview' && '📊 '}
              {t === 'users'    && '👥 '}
              {t === 'projects' && '🗂️ '}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard label="Total Users"     value={stats.totalUsers}     today={stats.todayUsers}    color="text-blue-600" />
              <StatCard label="Total Projects"  value={stats.totalProjects}  today={stats.todayProjects} color="text-purple-600" />
              <StatCard label="Total Versions"  value={stats.totalVersions}                              color="text-green-600" />
              <StatCard label="Templates"       value={stats.totalTemplates}                             color="text-amber-600" />
              <StatCard label="New Users Today" value={stats.todayUsers}                                 color="text-blue-500" />
              <StatCard label="Projects Today"  value={stats.todayProjects}                              color="text-purple-500" />
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-medium text-gray-700 mb-6">Projects Generated — Last 14 Days</h2>
              <div className="flex items-end gap-1.5 h-40">
                {activity.length === 0 && (
                  <p className="text-gray-400 text-sm">No activity yet</p>
                )}
                {activity.map((a, i) => {
                  const max = Math.max(...activity.map(x => Number(x.count)), 1);
                  const pct = (Number(a.count) / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-400">{a.count}</span>
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-purple-500 rounded-t"
                        style={{ height: `${Math.max(pct, 4)}%` }}
                      />
                      <span className="text-xs text-gray-400">
                        {new Date(a.date).getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Users + Recent Projects side by side */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Recent Users */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-medium text-gray-700 mb-4">Recent Users</h2>
                <div className="space-y-3">
                  {users.slice(0, 6).map(u => (
                    <div key={u.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          u.provider === 'google' ? 'bg-red-50 text-red-600' :
                          u.provider === 'github' ? 'bg-gray-100 text-gray-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {u.provider || 'Email'}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{u.total_projects} projects</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Projects */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-medium text-gray-700 mb-4">Recent Projects</h2>
                <div className="space-y-3">
                  {projects.slice(0, 6).map(p => (
                    <div key={p.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm font-medium text-gray-700 truncate">{p.project_name}</p>
                        <p className="text-xs text-gray-400">{p.user_name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-purple-600">{p.total_versions} versions</p>
                        <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-medium text-gray-700">All Users ({users.length})</h2>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b bg-gray-50">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Login Method</th>
                    <th className="px-4 py-3 font-medium">Projects</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">{u.name}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          u.provider === 'google' ? 'bg-red-50 text-red-600' :
                          u.provider === 'github' ? 'bg-gray-100 text-gray-700' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {u.provider || 'Email'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.total_projects}</td>
                      <td className="px-4 py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded hover:border-red-400 transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROJECTS */}
        {tab === 'projects' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-medium text-gray-700">All Projects ({projects.length})</h2>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search project or user..."
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b bg-gray-50">
                    <th className="px-4 py-3 font-medium">Project Name</th>
                    <th className="px-4 py-3 font-medium">Prompt Used</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Versions</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map(p => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700 max-w-[150px] truncate">{p.project_name}</td>
                      <td className="px-4 py-3 text-gray-400 max-w-[180px] truncate" title={p.prompt}>{p.prompt}</td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700">{p.user_name}</p>
                        <p className="text-xs text-gray-400">{p.user_email}</p>
                      </td>
                      <td className="px-4 py-3 text-purple-600 font-medium">{p.total_versions}</td>
                      <td className="px-4 py-3 text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteProject(p.id)}
                          className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded hover:border-red-400 transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
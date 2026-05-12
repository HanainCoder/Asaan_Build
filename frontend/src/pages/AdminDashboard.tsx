import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  FolderKanban,
  Layers3,
  Activity,
  Search,
  LogOut,
  Menu,
  X,
} from 'lucide-react';



const API = 'http://localhost:5000';

// 1. Add these states inside AdminDashboard()


function StatCard({
  label,
  value,
  today,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  today?: number;
  color: string;
  icon: any;
}) {
  return (
    <div
      className="
      relative overflow-hidden
      rounded-3xl
      border border-white/40
      bg-white/80
      backdrop-blur-xl
      p-5 sm:p-6
      shadow-sm
      hover:shadow-2xl
      hover:-translate-y-1
      transition-all duration-300
    "
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 ${color}`}
      />

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{label}</p>

        <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
          <Icon className={`size-5 ${color}`} />
        </div>
      </div>

      <h2 className={`text-3xl sm:text-4xl font-bold ${color}`}>
        {value}
      </h2>

      {today !== undefined && (
        <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
          ↑ {today} today
        </div>
      )}
    </div>
  );
}

export function AdminDashboard() {
  const navigate = useNavigate();

  const adminToken = localStorage.getItem('adminToken');
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');

  const [tab, setTab] = useState<'overview' | 'users' | 'projects' | 'support'>(
  'overview'
);

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<{
  type: 'success' | 'error';
  message: string;
} | null>(null);

const [confirmModal, setConfirmModal] = useState<{
  type: 'user' | 'project';
  id: number;
  message: string;
} | null>(null);

  const [mobileMenu, setMobileMenu] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
const [replyText, setReplyText] = useState<{ [key: number]: string }>({});

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  };

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin');
      return;
    }

    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);

    try {
      const [s, u, p, a,m] = await Promise.all([
        fetch(`${API}/api/admin/stats`, { headers }).then((r) => r.json()),
        fetch(`${API}/api/admin/users`, { headers }).then((r) => r.json()),
        fetch(`${API}/api/admin/projects`, { headers }).then((r) => r.json()),
        fetch(`${API}/api/admin/activity`, { headers }).then((r) => r.json()),
          fetch(`${API}/api/admin/support-messages`, { headers }).then((r) => r.json()), 
      ]);

      if (!s.success) {
        navigate('/admin');
        return;
      }

      setStats(s);
      setUsers(u.users || []);
      setProjects(p.projects || []);
      setActivity(a.activity || []);
      setMessages(m.messages || []);
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

  async function sendReply(id: number) {
  const reply = replyText[id];
  if (!reply?.trim()) return;

  const res = await fetch(`${API}/api/admin/support/${id}/reply`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ reply }),
  });

  const data = await res.json();

  if (data.success) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, admin_reply: reply, status: 'resolved' }
          : m
      )
    );

    setReplyText((prev) => ({ ...prev, [id]: '' }));
  }
}

  // 2. Replace deleteUser() with this
async function deleteUser(id: number) {
  setConfirmModal({
    type: 'user',
    id,
    message: 'Delete this user and all their data?',
  });
}
  

  // 3. Replace deleteProject() with this
async function deleteProject(id: number) {
  setConfirmModal({
    type: 'project',
    id,
    message: 'Delete this project?',
  });
}
// 4. Add this new function
async function handleConfirmDelete() {
  if (!confirmModal) return;

  try {
    const endpoint =
      confirmModal.type === 'user'
        ? `${API}/api/admin/user/${confirmModal.id}`
        : `${API}/api/admin/project/${confirmModal.id}`;

    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers,
    });

    const data = await res.json();

    if (data.success) {
      if (confirmModal.type === 'user') {
        setUsers((prev) =>
          prev.filter((u) => u.id !== confirmModal.id)
        );
      } else {
        setProjects((prev) =>
          prev.filter((p) => p.id !== confirmModal.id)
        );
      }

      setPopup({
        type: 'success',
        message:
          confirmModal.type === 'user'
            ? 'User deleted successfully.'
            : 'Project deleted successfully.',
      });
    } else {
      setPopup({
        type: 'error',
        message: data.message || 'Delete failed.',
      });
    }
  } catch (error) {
    setPopup({
      type: 'error',
      message: 'Server error. Please try again.',
    });
  }

  setConfirmModal(null);
}

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProjects = projects.filter(
    (p) =>
      p.project_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fb] px-4">
        <div className="text-center">
          <div className="size-16 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="size-7 text-white" />
          </div>

          <p className="text-gray-500 text-lg">
            Loading Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">

      {/* NAVBAR */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 m-4">

          <div className="h-20 flex items-center justify-between">

            {/* LEFT */}
            <div className="flex items-center gap-4">

              <div className="size-11 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="size-5 text-white" />
              </div>

              <div>
                <h1 className="font-semibold text-gray-800 text-lg">
                  AsaanBuild 
                </h1>

                <p className="text-xs text-gray-400">
                  Welcome, {adminInfo?.name}
                </p>
              </div>

            </div>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center gap-3">

              {(['overview', 'users', 'projects',  'support'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setSearch('');
                  }}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all
                  ${
                    tab === t
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t === 'overview' && 'Overview'}
                  {t === 'users' && 'Users'}
                  {t === 'projects' && 'Projects'}
                  {t === 'support' && 'Support'}
                </button>
              ))}

            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">

              <div className="hidden lg:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">
                <div className="size-2 rounded-full bg-green-500 animate-pulse" />

                <span className="text-sm text-gray-600">
                  System Active
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="
                hidden md:flex
                items-center gap-2
                px-4 py-2.5
                rounded-2xl
                border border-red-200
                text-red-500
                hover:bg-red-50
                transition-all
                "
              >
                <LogOut className="size-4" />
                Logout
              </button>

              {/* MOBILE MENU BUTTON */}
              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100"
              >
                {mobileMenu ? (
                  <X className="size-6 text-gray-700" />
                ) : (
                  <Menu className="size-6 text-gray-700" />
                )}
              </button>

            </div>

          </div>

          {/* MOBILE MENU */}
          {mobileMenu && (
            <div className="md:hidden pb-5">

              <div className="flex flex-col gap-3">

                {(['overview', 'users', 'projects'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTab(t);
                      setSearch('');
                      setMobileMenu(false);
                    }}
                    className={`w-full px-5 py-3 rounded-2xl text-sm font-medium transition-all
                    ${
                      tab === t
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {t === 'overview' && 'Overview'}
                    {t === 'users' && 'Users'}
                    {t === 'projects' && 'Projects'}
                  </button>
                ))}

                <button
                  onClick={handleLogout}
                  className="
                  w-full flex items-center justify-center gap-2
                  px-4 py-3
                  rounded-2xl
                  border border-red-200
                  text-red-500
                  hover:bg-red-50
                  transition-all
                  "
                >
                  <LogOut className="size-4" />
                  Logout
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* HERO */}
        <div className="mb-8 rounded-[32px] overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 sm:p-8 text-white relative">

          <div className="absolute inset-0 bg-black/10" />

          <div className="relative z-10">

            <h2 className="text-2xl sm:text-4xl font-bold mb-3">
              AsaanBuild Admin Analytics
            </h2>

            <p className="text-blue-100 max-w-2xl text-sm sm:text-base">
              Monitor users, projects, templates, AI generations,
              and overall platform activity in real time.
            </p>

          </div>

        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && stats && (
  <div className="grid lg:grid-cols-3 gap-6">

    {/* LEFT SIDE (2/3 width) */}
    <div className="lg:col-span-2 space-y-6">

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          today={stats.todayUsers}
          color="text-blue-600"
          icon={Users}
        />

        <StatCard
          label="Total Projects"
          value={stats.totalProjects}
          today={stats.todayProjects}
          color="text-purple-600"
          icon={FolderKanban}
        />

        <StatCard
          label="Total Versions"
          value={stats.totalVersions}
          color="text-green-600"
          icon={Layers3}
        />

        <StatCard
          label="Templates"
          value={stats.totalTemplates}
          color="text-amber-600"
          icon={Sparkles}
        />

        <StatCard
          label="New Users Today"
          value={stats.todayUsers}
          color="text-cyan-600"
          icon={Users}
        />

        <StatCard
          label="Projects Today"
          value={stats.todayProjects}
          color="text-pink-600"
          icon={Activity}
        />

      </div>

      {/* RECENT USERS (LEFT) */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 p-6 shadow-sm hover:shadow-xl transition-all">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent Users
          </h2>
          <span className="text-sm text-gray-400">
            {users.length} users
          </span>
        </div>

        <div className="space-y-3">
          {users.slice(0, 6).map((u) => (
            <div
              key={u.id}
              className="group
          flex items-center justify-between
          p-4
          rounded-2xl
          border border-transparent
          bg-white/60
          cursor-pointer
          hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
          hover:border-blue-100
          hover:shadow-lg
          hover:-translate-y-1
          hover:scale-[1.01]
          transition-all duration-300 ease-out"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-700 truncate">
                  {u.name}
                </p>
                <p className="text-sm text-gray-400 truncate">
                  {u.email}
                </p>
              </div>

              <div className="text-right ml-3">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium
                  ${
                    u.provider === 'google'
                      ? 'bg-red-50 text-red-600'
                      : u.provider === 'github'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {u.provider || 'Email'}
                </span>

                <p className="text-xs text-gray-400 mt-1">
                  {u.total_projects} projects
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>

    {/* RIGHT SIDE (1/3 width) */}
    <div className="space-y-6">

      {/* RECENT PROJECTS */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 p-6 shadow-sm hover:shadow-xl transition-all">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent Projects
          </h2>

          <span className="text-sm text-gray-400">
            {projects.length} projects
          </span>
        </div>

        <div className="space-y-3">
          {projects.slice(0, 6).map((p) => (
            <div
              key={p.id}
              className="group
  p-4
  rounded-2xl
  border border-transparent
  bg-white/60
  cursor-pointer
  hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50
  hover:border-purple-100
  hover:shadow-lg
  hover:-translate-y-1
  hover:scale-[1.01]
  transition-all duration-300 ease-out"
            >
              <p className="font-medium text-gray-700 truncate">
                {p.project_name}
              </p>

              <p className="text-sm text-gray-400">
                {p.user_name}
              </p>

              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>{p.total_versions} versions</span>
                <span>
                  {new Date(p.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* OPTIONAL EXTRA BOX */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-3xl p-6 shadow-lg">

        <h3 className="text-lg font-semibold mb-2">
          System Insights
        </h3>

        <p className="text-sm text-blue-100">
          Your platform is performing well. Keep monitoring user growth and project activity.
        </p>

      </div>

    </div>

  </div>
  
)}

        {/* USERS */}
        {tab === 'users' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden">

            <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  All Users
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  {users.length} registered users
                </p>
              </div>

              <div className="relative w-full lg:w-auto">

                <Search className="size-4 text-gray-400 absolute left-4 top-3.5" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or email..."
                  className="
                  w-full lg:w-80
                  bg-gray-100
                  border border-transparent
                  focus:border-blue-500
                  focus:bg-white
                  rounded-xl
                  pl-11
                  pr-4
                  py-3
                  text-sm
                  outline-none
                  transition-all
                  "
                />

              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-sm min-w-[850px]">

                <thead className="bg-gray-50/80">
                  <tr className="text-left text-gray-500">
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Provider</th>
                    <th className="px-6 py-4 font-medium">Projects</th>
                    <th className="px-6 py-4 font-medium">Joined</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-gray-50 hover:bg-blue-50/40 transition-all"
                    >

                      <td className="px-6 py-4 font-medium text-gray-700">
                        {u.name}
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {u.email}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium
                          ${
                            u.provider === 'google'
                              ? 'bg-red-50 text-red-600'
                              : u.provider === 'github'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          {u.provider || 'Email'}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {u.total_projects}
                      </td>

                      <td className="px-6 py-4 text-gray-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">

                        <button
                          onClick={() => deleteUser(u.id)}
                          className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:border-red-400 transition-all"
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
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden">

            <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  All Projects
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  {projects.length} generated projects
                </p>
              </div>

              <div className="relative w-full lg:w-auto">

                <Search className="size-4 text-gray-400 absolute left-4 top-3.5" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search project or user..."
                  className="
                  w-full lg:w-80
                  bg-gray-100
                  border border-transparent
                  focus:border-blue-500
                  focus:bg-white
                  rounded-xl
                  pl-11
                  pr-4
                  py-3
                  text-sm
                  outline-none
                  transition-all
                  "
                />

              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-sm min-w-[1000px]">

                <thead className="bg-gray-50/80">

                  <tr className="text-left text-gray-500">
                    <th className="px-6 py-4 font-medium">Project</th>
                    <th className="px-6 py-4 font-medium">Prompt</th>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Versions</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredProjects.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-50 hover:bg-purple-50/40 transition-all"
                    >

                      <td className="px-6 py-4 font-medium text-gray-700 max-w-[180px] truncate">
                        {p.project_name}
                      </td>

                      <td
                        className="px-6 py-4 text-gray-400 max-w-[220px] truncate"
                        title={p.prompt}
                      >
                        {p.prompt}
                      </td>

                      <td className="px-6 py-4">

                        <p className="text-gray-700">
                          {p.user_name}
                        </p>

                        <p className="text-xs text-gray-400">
                          {p.user_email}
                        </p>

                      </td>

                      <td className="px-6 py-4 text-purple-600 font-medium">
                        {p.total_versions}
                      </td>

                      <td className="px-6 py-4 text-gray-400">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">

                        <button
                          onClick={() => deleteProject(p.id)}
                          className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:border-red-400 transition-all"
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

        {/* support */}
        {tab === 'support' && (
  <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden">

    <div className="p-6 border-b">
      <h2 className="text-xl font-semibold">Support Messages</h2>
      <p className="text-sm text-gray-400">
        {messages.length} messages from users
      </p>
    </div>

    <div className="divide-y">

      {messages.map((m) => (
        <div key={m.id} className="p-5 space-y-3">

          {/* USER INFO */}
          <div className="flex justify-between">
            <div>
              <p className="font-medium text-gray-700">{m.name}</p>
              <p className="text-sm text-gray-400">{m.email}</p>
            </div>

            <span
              className={`text-xs px-3 py-1 rounded-full
              ${m.status === 'resolved'
                ? 'bg-green-50 text-green-600'
                : 'bg-yellow-50 text-yellow-600'
              }`}
            >
              {m.status}
            </span>
          </div>

          {/* MESSAGE */}
          <p className="bg-gray-50 p-3 rounded-xl text-gray-600">
            {m.message}
          </p>

          {/* REPLY */}
          {m.admin_reply ? (
            <div className="bg-blue-50 p-3 rounded-xl text-blue-700 text-sm">
              <b>Reply:</b> {m.admin_reply}
            </div>
          ) : (
            <div className="flex gap-2">

              <input
                value={replyText[m.id] || ''}
                onChange={(e) =>
                  setReplyText({
                    ...replyText,
                    [m.id]: e.target.value,
                  })
                }
                placeholder="Write reply..."
                className="flex-1 px-4 py-2 border rounded-xl text-sm"
              />

              <button
                onClick={() => sendReply(m.id)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow whitespace-nowrap"
              >
                Send
              </button>

            </div>
          )}

        </div>
      ))}

    </div>
  </div>
)}

      </div>
{/* 5. Add this CONFIRMATION MODAL near the bottom of your return(), before the final closing </div> */}

{confirmModal && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Confirm Delete
      </h2>

      <p className="text-gray-600 text-sm mb-6">
        {confirmModal.message}
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => setConfirmModal(null)}
          className="flex-1 px-5 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>

        <button
          onClick={handleConfirmDelete}
          className="flex-1 px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
{/* 6. Keep your existing SUCCESS / ERROR POPUP */}

{popup && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
      <div
        className={`text-lg font-semibold mb-2 ${
          popup.type === 'success'
            ? 'text-green-600'
            : 'text-red-600'
        }`}
      >
        {popup.type === 'success' ? 'Success' : 'Error'}
      </div>

      <p className="text-gray-700 text-sm mb-4">
        {popup.message}
      </p>

      <button
        onClick={() => setPopup(null)}
        className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        OK
      </button>
    </div>
  </div>
)}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { ProjectCard } from '../components/ProjectCard';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Grid, List } from 'lucide-react';

export function ProjectsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth(); //  get logged-in user
  const userId = user?.id;     //  use this for fetching projects

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [projectList, setProjectList] = useState<any[]>([]);
  const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch projects from backend
  useEffect(() => {
    if (!userId) return; // no user logged in yet

    const fetchProjects = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/myProjects?userId=${userId}`);
        const data = await res.json();

        if (data.success) {
          setProjectList(
            data.projects
              .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((p: any) => ({
                ...p,
                name: p.name || 'Untitled Project',
                date: new Date(p.date).toLocaleDateString(),
                thumbnail: p.thumbnail ? `http://localhost:5000/${p.thumbnail}` : '',
                status: p.status || 'Active',
              }))
          );
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };

    fetchProjects();
  }, [userId]); // 👈 re-run when user logs in

  const filteredProjects = projectList.filter((project) =>
    (project.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
  if (deleteProjectId === null) return;

  try {
    const res = await fetch(`http://localhost:5000/api/project/${deleteProjectId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      setProjectList(prev => prev.filter(p => p.id !== deleteProjectId));
      setShowDeleteModal(false);
      setDeleteProjectId(null);
    }
  } catch (err) {
    console.error("Delete failed:", err);
  }
  };

  const handleDuplicate = async (projectId: number) => {
  try {
    const res = await fetch(`http://localhost:5000/api/project/${projectId}/duplicate`, {
      method: "POST",
    });
    const data = await res.json();
    if (data.success) {
      setProjectList(prev => [...prev, {
        ...data.project,
        date: new Date().toLocaleDateString(),
        status: "Active",
        thumbnail: data.project.thumbnail ? `http://localhost:5000/${data.project.thumbnail}` : "",
      }]);
    }
  } catch (err) {
    console.error("Duplicate failed:", err);
  }
};

  const handleRename = async (projectId: number, newName: string) => {
  if (!newName || newName.trim() === "") return;

  try {
    const res = await fetch(`http://localhost:5000/api/project/${projectId}/rename`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newName }),
    });
    const data = await res.json();
    if (data.success) {
      setProjectList(prev =>
        prev.map(p => (p.id === projectId ? { ...p, name: data.newName } : p))
      );
    }
  } catch (err) {
    console.error("Rename failed:", err);
  }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="mb-2">{t('myProjects')}</h1>
                <p className="text-gray-600">Manage and view all your generated projects</p>
              </div>
              <button
                onClick={() => navigate('/prompt')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow whitespace-nowrap"
              >
                {t('createNewApp')}
              </button>
            </div>

            {/* Search & View toggle */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('searchProjects')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid className="size-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="size-5" />
                </button>
              </div>
            </div>

            {/* Projects */}
            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    name={project.name}
                    date={project.date}
                    status={project.status}
                    thumbnail={project.thumbnail || ''}
                    onOpen={() =>
                      navigate(`/code/${project.id}`, {
                      state: { projectId: project.id }
                       })
                     }
                    onRename={(newName) => handleRename(project.id, newName)}
                    onDuplicate={() => handleDuplicate(project.id)}
                    onDelete={() => { setDeleteProjectId(project.id); setShowDeleteModal(true); }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden w-full">
                 <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">Project</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4  text-left">Date Created</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">Status</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredProjects.map((project) => (
                      <tr
                        key={project.id}
                        className="transition-all duration-300 cursor-pointer hover:bg-gray-50 hover:shadow-sm hover:-translate-y-[2px] hover:border-l-4 hover:border-blue-500"
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-2">
                          {project.thumbnail && (
                            <img
                              src={project.thumbnail}
                              alt={project.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          )}
                          <span>{project.name}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600">{project.date}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs ${
                              project.status === 'Active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <button
                            onClick={() =>
  navigate(`/code/${project.id}`, {
    state: { projectId: project.id }
  })
}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {t('open')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}

            {/* Empty state */}
            {filteredProjects.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <p className="text-gray-500 mb-4">No projects found</p>
                <button
                  onClick={() => navigate('/prompt')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  Create Your First Project
                </button>
              </div>
            )}

            {/* Delete modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-lg p-6 w-96">
                  <h2 className="text-xl font-semibold mb-4">Delete Project?</h2>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this project? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 rounded-lg bg-red-600 text-black hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
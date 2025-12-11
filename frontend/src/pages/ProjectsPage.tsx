import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { ProjectCard } from '../components/ProjectCard';
import { projects as initialProjects } from '@/data/templates';
import { Search, Grid, List } from 'lucide-react';

export function ProjectsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // PROJECTS IN STATE
  const [projectList, setProjectList] = useState(initialProjects);

  const filteredProjects = projectList.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  // DELETE CONFIRMATION MODAL

  const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    if (deleteProjectId === null) return;

    setProjectList((prev) => prev.filter((p) => p.id !== deleteProjectId));

    setShowDeleteModal(false);
    setDeleteProjectId(null);
  };

 
  // DUPLICATE
  
  const handleDuplicate = (projectId: number) => {
    setProjectList((prev) => {
      const original = prev.find((p) => p.id === projectId);
      if (!original) return prev;

      const newProject = {
        ...original,
        id: Date.now(),
        name: original.name + " (Copy)",
        date: new Date().toDateString(),
      };

      return [...prev, newProject];
    });
  };


  // RENAME
  
  const handleRename = (projectId: number, newName: string) => {
    if (!newName || newName.trim() === "") return;
    setProjectList((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, name: newName.trim() } : p
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-317">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="w-full">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="mb-2">{t('myProjects')}</h1>
                <p className="text-gray-600">
                  Manage and view all your generated projects
                </p>
              </div>
              <button
                onClick={() => navigate('/prompt')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow whitespace-nowrap"
              >
                {t('createNewApp')}
              </button>
            </div>

            {/* Search */}
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
                  className={`p-2 rounded ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="size-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="size-5" />
                </button>
              </div>
            </div>

            {/* Projects Grid */}
            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    name={project.name}
                    date={project.date}
                    status={project.status}
                    thumbnail={project.thumbnail}
                    onOpen={() => navigate('/dashboard')}
                    onRename={(newName) => handleRename(project.id, newName)}
                    onDuplicate={() => handleDuplicate(project.id)}
                    onDelete={() => {
                      setDeleteProjectId(project.id);
                      setShowDeleteModal(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left">Project Name</th>
                      <th className="px-6 py-4 text-left">Date Created</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredProjects.map((project) => (
                      <tr key={project.id} className="transition-all duration-300 cursor-pointer
             hover:bg-gray-50 hover:shadow-sm hover:-translate-y-[2px]
             hover:border-l-4 hover:border-blue-500">
                        <td className="px-6 py-4">{project.name}</td>
                        <td className="px-6 py-4 text-gray-600">{project.date}</td>
                        <td className="px-6 py-4">
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
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate('/dashboard')}
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

            {/* DELETE confirm MODAL */}
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

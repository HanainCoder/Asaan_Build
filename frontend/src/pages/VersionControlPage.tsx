import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  GitBranch,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function VersionControlPage() {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectVersions, setProjectVersions] = useState<{
    [key: number]: any[];
  }>({});
  const [openProject, setOpenProject] = useState<number | null>(null);
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);

  const token = localStorage.getItem("token");

  // 🔥 Format Date (Pakistani Style)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleString("en-GB", {
      timeZone: "Asia/Karachi",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // 🔥 Load Projects
  useEffect(() => {
    if (!user?.id) return;

    const fetchProjects = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/myProjects?userId=${user.id}`
        );

        const data = await res.json();

        if (data.success) {
          setProjects(data.projects);
        }
      } catch (err) {
        console.error("Error loading projects:", err);
      }
    };

    fetchProjects();
  }, [user]);

  // 🔥 Load Versions
  const handleProjectClick = async (projectId: number) => {
    if (!token) return;

    if (openProject === projectId) {
      setOpenProject(null);
      return;
    }

    setOpenProject(projectId);
    setExpandedVersion(null);

    if (projectVersions[projectId]) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/project/${projectId}/versions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setProjectVersions((prev) => ({
          ...prev,
          [projectId]: data.versions,
        }));
      }
    } catch (err) {
      console.error("Error loading versions:", err);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-317">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">

            {/* 🔥 Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center size-16 
                bg-gradient-to-br from-blue-600 to-purple-600 
                shadow-lg rounded-2xl mb-4">
                <GitBranch className="size-8 text-white" />
              </div>

              <h1 className="text-2xl font-bold mb-2">
                Version Control
              </h1>

              <p className="text-gray-600">
                Click a version to open it in Code Viewer.
              </p>
            </div>

            {/* 🔥 Projects */}
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl border shadow-sm"
                >
                  {/* Project Header */}
                  <div
                    onClick={() => handleProjectClick(project.id)}
                    className="p-5 cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">
                        {project.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {formatDate(project.date)}
                      </p>
                    </div>

                    {openProject === project.id ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </div>

                  {/* Versions */}
                  {openProject === project.id && (
                    <div className="border-t px-5 pb-5">

                      {projectVersions[project.id]?.map((v: any) => (
                        <div
                          key={v.id}
                          onClick={() =>
                           navigate(`/code/${project.id}`, {
  state: {
    projectId: project.id,
    versionId: v.id
  }
})
                          }
                          className="bg-gray-50 border rounded-lg p-4 mt-3 cursor-pointer hover:bg-gray-100 transition"
                        >
                          <div className="flex justify-between">

                            <div>
                              <h4 className="font-medium">
                                Version {v.version_number}
                              </h4>

                              <p className="text-xs text-gray-500">
                                {v.edit_type}
                              </p>

                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(v.created_at)}
                              </p>
                            </div>

                          </div>

                        </div>
                      ))}

                      {(!projectVersions[project.id] ||
                        projectVersions[project.id].length === 0) && (
                        <p className="text-gray-500 mt-4">
                          No versions found.
                        </p>
                      )}

                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import * as Diff from "diff";
import {
  GitBranch,
  ChevronDown,
  ChevronUp,
  Trash2, Download,
  Eye, GitCompare,
   Layers3,
  FolderGit2,
  RotateCcw,
  Sparkles,
  Code2
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
  const [previewVersion, setPreviewVersion] = useState<{ code: string; version: number } | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<any[]>([]);
  const [compareModal, setCompareModal] = useState<{ v1: any; v2: any } | null>(null);
  const [versionStats, setVersionStats] = useState({
  totalVersions: 0,
  topProject: null as any,
  restoredVersions: 0,
  promptVersions: 0,
  codeVersions: 0,
});
const [popup, setPopup] = useState<{
  type: "success" | "error" | "confirm" | null;
  message: string;
  onConfirm?: () => void;
} | null>(null);

  const token = localStorage.getItem("token");

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

  useEffect(() => {
    if (!user?.id) return;
    const fetchProjects = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/myProjects?userId=${user.id}`);
        const data = await res.json();
        if (data.success) setProjects(data.projects);
      } catch (err) {
        console.error("Error loading projects:", err);
      }
    };
    fetchProjects();
  }, [user]);
  useEffect(() => {
  if (!user?.id || !token) return;

  const fetchVersionStats = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/version/stats/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (data.success) {
        setVersionStats(data);
      }
    } catch (err) {
      console.error("Error loading version stats:", err);
    }
  };

  fetchVersionStats();
}, [user]);

  const getVersionIcon = (editType: string) => {
    if (editType === "initial") return { icon: "🚀", color: "bg-green-500" };
    if (editType.includes("Restored")) return { icon: "♻️", color: "bg-yellow-500" };
    if (editType === "prompt") return { icon: "✨", color: "bg-blue-500" };
    if (editType === "code") return { icon: "💻", color: "bg-purple-500" };
    return { icon: "📄", color: "bg-gray-400" };
  };

  const handleProjectClick = async (projectId: number) => {
    if (!token) return;

    if (openProject === projectId) {
      setOpenProject(null);
      setSelectedForCompare([]);
      return;
    }

    setOpenProject(projectId);
    setExpandedVersion(null);
    setSelectedForCompare([]);
    setCompareModal(null);

    if (projectVersions[projectId]) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/project/${projectId}/versions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        setProjectVersions((prev) => ({ ...prev, [projectId]: data.versions }));
      }
    } catch (err) {
      console.error("Error loading versions:", err);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  const handleRestore = async (projectId: number, versionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    setPopup({
  type: "confirm",
  message: "Restore this version as current?",
  onConfirm: async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/project/${projectId}/restore/${versionId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      if (data.success) {
        setPopup({ type: "success", message: `Restored as Version ${data.version} ✅` });

        setProjectVersions((prev) => {
          const updated = { ...prev };
          delete updated[projectId];
          return updated;
        });

        setOpenProject(null);
      } else {
        setPopup({ type: "error", message: "Restore failed: " + data.message });
      }
    } catch (err) {
      console.error("Restore error:", err);
    }
  },
});
return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/project/${projectId}/restore/${versionId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        alert(`Restored as Version ${data.version} ✅`);
        setProjectVersions((prev) => {
          const updated = { ...prev };
          delete updated[projectId];
          return updated;
        });
        setOpenProject(null);
      } else {
        alert("Restore failed: " + data.message);
      }
    } catch (err) {
      console.error("Restore error:", err);
    }
  };

  const handleDeleteVersion = async (projectId: number, versionId: number, versionNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (versionNumber === 1) {
      alert("Cannot delete the initial version.");
      return;
    }
    setPopup({
  type: "confirm",
  message: `Delete Version ${versionNumber}? This cannot be undone.`,
  onConfirm: async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/version/${versionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setProjectVersions((prev) => ({
          ...prev,
          [projectId]: prev[projectId].filter((v) => v.id !== versionId),
        }));

        setPopup({ type: "success", message: "Version deleted successfully" });
      } else {
        setPopup({ type: "error", message: "Delete failed: " + data.message });
      }
    } catch (err) {
      console.error("Delete version error:", err);
    }
  },
});
return;
    try {
      const res = await fetch(`http://localhost:5000/api/version/${versionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProjectVersions((prev) => ({
          ...prev,
          [projectId]: prev[projectId].filter((v) => v.id !== versionId),
        }));
      } else {
        alert("Delete failed: " + data.message);
      }
    } catch (err) {
      console.error("Delete version error:", err);
    }
  };

  const handleDownload = (code: string, versionNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `version-${versionNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCompareSelect = (v: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedForCompare((prev) => {
      const exists = prev.find((x) => x.id === v.id);
      if (exists) return prev.filter((x) => x.id !== v.id);
      if (prev.length >= 2) return [prev[0], v];
      return [...prev, v];
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.length !== 2) return;
    const sorted = [...selectedForCompare].sort((a, b) => a.version_number - b.version_number);
    setCompareModal({ v1: sorted[0], v2: sorted[1] });
  };

  const getDiffLines = (code1: string, code2: string) => {
    return Diff.diffLines(code1, code2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <div className="max-w-5xl w-full mx-auto px-2 sm:px-0">

            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center size-16
                bg-linear-to-br from-blue-600 to-purple-600
                shadow-lg rounded-2xl mb-4">
                <GitBranch className="size-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2"> {t("versionControlTitle")}</h1>
              <p className="text-gray-600">{t("versionControlSubtitle")}</p>
            </div>

            {/* Projects */}
            <div className="space-y-4">
              {/* Version Analytics Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">

  {/* Total Versions */}
  <div className="bg-white rounded-2xl border shadow-sm p-5 
  transition-all duration-300 
  hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]">
    <div className="flex items-center justify-between">
      <div className="p-3 rounded-xl bg-blue-100">
        <Layers3 className="size-5 text-blue-600" />
      </div>
      <span className="text-xs text-blue-500 font-medium">All Saved</span>
    </div>
    <h3 className="text-2xl font-bold mt-4">{versionStats.totalVersions}</h3>
    <p className="text-sm text-gray-500 mt-1">Total Versions</p>
  </div>

  {/* Most Versioned Project */}
  <div className="bg-white rounded-2xl border shadow-sm p-5 
  transition-all duration-300 
  hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]">
    <div className="flex items-center justify-between">
      <div className="p-3 rounded-xl bg-purple-100">
        <FolderGit2 className="size-5 text-purple-600" />
      </div>
      <span className="text-xs text-purple-500 font-medium">
        {versionStats.topProject?.total_versions || 0} Builds
      </span>
    </div>
    <h3 className="text-lg font-bold mt-4 line-clamp-2 leading-snug">
  {versionStats.topProject?.project_name || "N/A"}
</h3>
    <p className="text-sm text-gray-500 mt-1">Most Versioned</p>
  </div>

  {/* Restored Versions */}
  <div className="bg-white rounded-2xl border shadow-sm p-5 
  transition-all duration-300 
  hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]">
    <div className="flex items-center justify-between">
      <div className="p-3 rounded-xl bg-amber-100">
        <RotateCcw className="size-5 text-amber-600" />
      </div>
      <span className="text-xs text-amber-500 font-medium">Recovered</span>
    </div>
    <h3 className="text-2xl font-bold mt-4">{versionStats.restoredVersions}</h3>
    <p className="text-sm text-gray-500 mt-1">Restored Versions</p>
  </div>

  {/* Prompt Edited */}
  <div className="bg-white rounded-2xl border shadow-sm p-5 
  transition-all duration-300 
  hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]">
    <div className="flex items-center justify-between">
      <div className="p-3 rounded-xl bg-indigo-100">
        <Sparkles className="size-5 text-indigo-600" />
      </div>
      <span className="text-xs text-indigo-500 font-medium">AI Modified</span>
    </div>
    <h3 className="text-2xl font-bold mt-4">{versionStats.promptVersions}</h3>
    <p className="text-sm text-gray-500 mt-1">Prompt Edited</p>
  </div>

  {/* Code Edited */}
  <div className="bg-white rounded-2xl border shadow-sm p-5 
  transition-all duration-300 
  hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]">
    <div className="flex items-center justify-between">
      <div className="p-3 rounded-xl bg-emerald-100">
        <Code2 className="size-5 text-emerald-600" />
      </div>
      <span className="text-xs text-emerald-500 font-medium">Manual Dev</span>
    </div>
    <h3 className="text-2xl font-bold mt-4">{versionStats.codeVersions}</h3>
    <p className="text-sm text-gray-500 mt-1">Code Edited</p>
  </div>

</div>
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-2xl border shadow-sm">

                  {/* Project Header */}
                  <div
                    onClick={() => handleProjectClick(project.id)}
                    className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <p className="text-sm text-gray-500">{formatDate(project.date)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {projectVersions[project.id] && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                          {projectVersions[project.id].length} versions
                        </span>
                      )}
                      {openProject === project.id ? <ChevronUp /> : <ChevronDown />}
                    </div>
                  </div>

                  {/* Versions */}
                  {openProject === project.id && (
                    <div className="border-t px-5 pb-5">

                      {/* Compare Bar */}
                      {selectedForCompare.length === 2 && (
                        <div className="mt-4 mb-2 flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
                          <span className="text-sm text-gray-600">
                            Version {selectedForCompare[0].version_number} vs Version {selectedForCompare[1].version_number}
                          </span>
                          <button
                            onClick={handleCompare}
                            className="flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-black px-4 py-1.5 rounded-lg transition"
                          >
                            <GitCompare className="size-4" />
                            Compare
                          </button>
                          <button
                            onClick={() => setSelectedForCompare([])}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                          >
                            Clear
                          </button>
                        </div>
                      )}

                      {/* Version Cards */}
                      {projectVersions[project.id]?.map((v: any) => (
                        <div
                          key={v.id}
                          onClick={() =>
                            navigate(`/code/${project.id}`, {
                              state: { projectId: project.id, versionId: v.id }
                            })
                          }
                          className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 mt-3 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all duration-200"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div>
                              <h4 className="font-medium">Version {v.version_number}</h4>
                              <p className="text-xs text-gray-500">{v.edit_type}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatDate(v.created_at)}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>

                              {/* Compare Checkbox */}
                              <input
                                type="checkbox"
                                checked={!!selectedForCompare.find((x) => x.id === v.id)}
                                onChange={() => {}}
                                onClick={(e) => {
                                  if (!v.code) return alert("No code available.");
                                  handleCompareSelect(v, e);
                                }}
                                title="Select to compare"
                                className="size-4 cursor-pointer accent-indigo-600"
                              />

                              {/* Preview Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!v.code) return alert("No code available.");
                                  setPreviewVersion({ code: v.code, version: v.version_number });
                                }}
                                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                                title="Preview"
                              >
                                <Eye className="size-3.5" />
                              </button>

                              {/* Restore */}
                              <button
                                onClick={(e) => handleRestore(project.id, v.id, e)}
                                className="text-xs bg-sky-50 hover:bg-sky-100 text-sky-700 px-3 py-1.5 rounded-lg transition"
                              >
                                Restore
                              </button>

                              {/* Download */}
                              <button
                                onClick={(e) => handleDownload(v.code, v.version_number, e)}
                                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                                title="Download this version"
                              >
                                <Download className="size-3.5" />
                              </button>

                              {/* Delete */}
                              {v.version_number !== 1 && (
                                <button
                                  onClick={(e) => handleDeleteVersion(project.id, v.id, v.version_number, e)}
                                  className="text-xs bg-red-500 hover:bg-red-600 text-black px-3 py-1.5 rounded-lg transition"
                                  title="Delete this version"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              )}

                            </div>
                          </div>
                        </div>
                      ))}

                      {(!projectVersions[project.id] ||
                        projectVersions[project.id].length === 0) && (
                        <p className="text-gray-500 mt-4">No versions found.</p>
                      )}

                    </div>
                  )}

                </div>
              ))}
            </div>

          </div>
        </main>
      </div>

      {/* Preview Modal — outside all loops, at root level */}
      {previewVersion && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg">
                Preview — Version {previewVersion.version}
              </h3>
              <button
                onClick={() => setPreviewVersion(null)}
                className="text-gray-500 hover:text-gray-800 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <iframe
              srcDoc={previewVersion.code}
              className="flex-1 w-full rounded-b-2xl"
              sandbox="allow-scripts"
              title="Version Preview"
            />
          </div>
        </div>
      )}

      {/* Compare Modal — outside all loops, at root level */}
      {compareModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">

            <div className="flex justify-between items-center p-4 border-b shrink-0">
              <div className="flex items-center gap-3">
                <GitCompare className="size-5 text-indigo-600" />
                <h3 className="font-semibold text-lg">
                  Comparing Version {compareModal.v1.version_number} → Version {compareModal.v2.version_number}
                </h3>
              </div>
              <button
                onClick={() => { setCompareModal(null); setSelectedForCompare([]); }}
                className="text-gray-500 hover:text-gray-800 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 border-b shrink-0">
              <div className="p-3 bg-red-50 border-r text-sm font-medium text-red-700">
                Version {compareModal.v1.version_number} — {compareModal.v1.edit_type}
              </div>
              <div className="p-3 bg-green-50 text-sm font-medium text-green-700">
                Version {compareModal.v2.version_number} — {compareModal.v2.edit_type}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden">
              <div className="overflow-auto border-r font-mono text-xs p-3 bg-gray-50">
                {getDiffLines(compareModal.v1.code, compareModal.v2.code).map((part, i) => (
                  !part.added && (
                    <div
                      key={i}
                      className={`whitespace-pre-wrap leading-5 px-2 rounded ${
                        part.removed ? "bg-red-100 text-red-800" : "text-gray-700"
                      }`}
                    >
                      {part.removed ? "− " : "  "}{part.value}
                    </div>
                  )
                ))}
              </div>
              <div className="overflow-auto font-mono text-xs p-3 bg-gray-50">
                {getDiffLines(compareModal.v1.code, compareModal.v2.code).map((part, i) => (
                  !part.removed && (
                    <div
                      key={i}
                      className={`whitespace-pre-wrap leading-5 px-2 rounded ${
                        part.added ? "bg-green-100 text-green-800" : "text-gray-700"
                      }`}
                    >
                      {part.added ? "+ " : "  "}{part.value}
                    </div>
                  )
                ))}
              </div>
            </div>

            <div className="p-3 border-t shrink-0 flex gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block size-3 bg-red-200 rounded" /> Removed
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block size-3 bg-green-200 rounded" /> Added
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block size-3 bg-gray-200 rounded" /> Unchanged
              </span>
            </div>

          </div>
        </div>
      )}
      {popup && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 text-center">

      {popup.type === "success" && (
        <div className="text-green-600 font-semibold mb-2">Success</div>
      )}

      {popup.type === "error" && (
        <div className="text-red-600 font-semibold mb-2">Error</div>
      )}

      {popup.type === "confirm" && (
        <div className=" text-indigo-600 font-semibold mb-2">Confirm</div>
      )}

      <p className="text-gray-700 text-sm mb-4">{popup.message}</p>

      <div className="flex justify-center gap-3">
        {popup.type === "confirm" ? (
          <>
            <button
              onClick={() => setPopup(null)}
              className="px-4 py-1.5 rounded bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                popup.onConfirm?.();
                setPopup(null);
              }}
              className="px-4 py-1.5 rounded bg-indigo-600 text-black"
            >
              Yes
            </button>
          </>
        ) : (
          <button
            onClick={() => setPopup(null)}
            className="px-4 py-1.5 rounded bg-indigo-600 text-black"
          >
            OK
          </button>
        )}
      </div>
    </div>
  </div>
)}

    </div>
  );
}
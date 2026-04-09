import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { History, Clock, Sparkles, RotateCcw, FileText } from "lucide-react";

type PromptItem = {
  prompt: string;
  created_at: string;
};

export function PromptHistoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentPrompts, setRecentPrompts] = useState<PromptItem[]>([]);
  const [allPrompts, setAllPrompts] = useState<PromptItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRecent = async () => {
      const res = await fetch("http://localhost:5000/api/prompts/recent", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setRecentPrompts(data.prompts);
    };
    fetchRecent();
  }, []);

  const handleSeeAll = async () => {
    setShowModal(true);
    setLoadingAll(true);
    const res = await fetch("http://localhost:5000/api/prompts/all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setAllPrompts(data.prompts);
    setLoadingAll(false);
  };

  const handleReuse = (prompt: string) => {
    localStorage.setItem("reusePrompt", prompt);
    alert("Prompt ready to reuse 🚀");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu />

      <div className="flex flex-1 w-full">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 w-full p-6 lg:p-8">

          {/* PAGE HEADER */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center size-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
              <History className="size-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Prompt History</h1>
            <p className="text-gray-500">
              View and reuse your previously generated prompts to speed up your workflow
            </p>
          </div>

          {/* STATS ROW — fills width on all screens */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Total Prompts</span>
              <span className="text-2xl font-bold text-gray-800">{allPrompts.length || recentPrompts.length}</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Recent (Last 7 Days)</span>
              <span className="text-2xl font-bold text-blue-600">{recentPrompts.length}</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Reused</span>
              <span className="text-2xl font-bold text-purple-600">—</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Saved</span>
              <span className="text-2xl font-bold text-green-600">—</span>
            </div>
          </div>

          {/* TWO-COLUMN LAYOUT on lg, stacked on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT — Recent Prompts (takes 2/3 width on desktop) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 w-full">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <Clock className="size-5 text-gray-400" />
                    Recent Prompts
                  </h2>
                  <button
                    onClick={handleSeeAll}
                    className="text-sm text-blue-600 font-medium hover:underline"
                  >
                    See All
                  </button>
                </div>

                {recentPrompts.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <FileText className="size-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No prompts yet. Start generating!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentPrompts.map((p, i) => (
                      <div
                        key={i}
                        className="border border-gray-100 rounded-xl p-4 flex justify-between items-start hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm text-gray-800 truncate">{p.prompt}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(p.created_at).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleReuse(p.prompt)}
                          className="shrink-0 flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium"
                        >
                          <RotateCcw className="size-3" />
                          Reuse
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR — Tips + Quick Actions (1/3 width on desktop) */}
            <div className="flex flex-col gap-6">

              {/* Pro Tip */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex gap-3 mb-4">
                  <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Sparkles className="size-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-base self-center">Pro Tip</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Reuse your best prompts to quickly generate similar apps. Modify them slightly for even better results each time.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-semibold text-base mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={handleSeeAll}
                    className="w-full text-left px-4 py-3 rounded-xl border border-gray-100 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <History className="size-4 text-blue-500" />
                    View full history
                  </button>
                  <button
                    onClick={() => {
                      if (recentPrompts[0]) handleReuse(recentPrompts[0].prompt);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl border border-gray-100 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="size-4 text-purple-500" />
                    Reuse latest prompt
                  </button>
                </div>
              </div>

              {/* Gradient CTA */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <h3 className="font-semibold text-base mb-2 text-white">Need Inspiration?</h3>
                <p className="text-sm text-blue-100 mb-4">
                  Browse your full prompt history to find your best ideas.
                </p>
                <button
                  onClick={handleSeeAll}
                  className="w-full py-2 bg-white text-blue-600 text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Browse All Prompts
                </button>
              </div>

            </div>
          </div>

        </main>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold">All Prompts</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1">
              {loadingAll ? (
                <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
              ) : allPrompts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No prompts found</p>
              ) : (
                allPrompts.map((p, i) => (
                  <div
                    key={i}
                    className="border border-gray-100 rounded-xl p-4 flex justify-between items-start hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm text-gray-800">{p.prompt}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(p.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleReuse(p.prompt)}
                      className="shrink-0 text-xs text-blue-500 hover:underline font-medium"
                    >
                      Reuse
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-5 w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
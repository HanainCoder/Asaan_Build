import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { History, Clock, Sparkles } from "lucide-react";

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

  // 🔥 Fetch recent prompts
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

  // 🔥 Fetch all prompts
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

  // 🔥 Reuse prompt
  const handleReuse = (prompt: string) => {
    localStorage.setItem("reusePrompt", prompt);
    alert("Prompt ready to reuse 🚀");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">

            {/* HEADER (MATCHED STYLE) */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center size-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
                <History className="size-8 text-white" />
              </div>
              <h1 className="mb-3">Prompt History</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                View and reuse your previously generated prompts to speed up your workflow
              </p>
            </div>

            {/* RECENT PROMPTS */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Clock className="size-5 text-gray-500" />
                  Recent Prompts
                </h2>

                <button
                  onClick={handleSeeAll}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  See All
                </button>
              </div>

              {recentPrompts.length === 0 ? (
                <p className="text-gray-500 text-sm">No prompts yet</p>
              ) : (
                <div className="space-y-3">
                  {recentPrompts.map((p, i) => (
                    <div
                      key={i}
                      className="border rounded-lg p-4 flex justify-between items-start hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm text-gray-800">{p.prompt}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(p.created_at).toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => handleReuse(p.prompt)}
                        className="text-xs text-purple-600 hover:underline"
                      >
                        Reuse
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TIP CARD (LIKE YOUR STYLE) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
              <div className="flex gap-4">
                <div className="size-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Sparkles className="size-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Pro Tip</h3>
                  <p className="text-gray-600 text-sm">
                    Reuse your best prompts to quickly generate similar apps.
                    You can also modify them for better results.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* MODAL (MATCHED YOUR WELCOME MODAL STYLE) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          
          <div className="bg-white p-6 rounded-xl w-[600px] max-h-[80vh] flex flex-col">
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">All Prompts</h2>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="overflow-y-auto space-y-3">
              {loadingAll ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : allPrompts.length === 0 ? (
                <p className="text-sm text-gray-500">No prompts found</p>
              ) : (
                allPrompts.map((p, i) => (
                  <div
                    key={i}
                    className="border rounded-lg p-3 flex justify-between"
                  >
                    <div>
                      <p className="text-sm">{p.prompt}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(p.created_at).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleReuse(p.prompt)}
                      className="text-xs text-blue-500"
                    >
                      Reuse
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Close
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
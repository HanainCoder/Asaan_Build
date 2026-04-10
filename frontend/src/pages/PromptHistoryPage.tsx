import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { History, Clock, Sparkles, RotateCcw, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  // 🔥 NEW STATES
  const [improvingIndex, setImprovingIndex] = useState<number | null>(null);
  const [improvedPrompts, setImprovedPrompts] = useState<{ [key: number]: string }>({});

  const navigate = useNavigate();
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
    navigate("/prompt");
  };

  // 🔥 AI IMPROVE FUNCTION
  const handleImprove = async (prompt: string, index: number) => {
    try {
      setImprovingIndex(index);

      const res = await fetch("http://localhost:5000/api/prompts/improve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.success) {
        setImprovedPrompts((prev) => ({
          ...prev,
          [index]: data.improved,
        }));
      }
    } catch (err) {
      console.error("Improve error", err);
    } finally {
      setImprovingIndex(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu />

      <div className="flex flex-1 w-full">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 w-full p-6 lg:p-8">

          {/* HEADER */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center size-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
              <History className="size-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Prompt History</h1>
            <p className="text-gray-500">
              View and reuse your previously generated prompts
            </p>
          </div>

          {/* RECENT PROMPTS */}
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
                <p className="text-sm">No prompts yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPrompts.map((p, i) => (
                  <div
                    key={i}
                    className="border border-gray-100 rounded-xl p-4 flex justify-between items-start hover:bg-gray-50"
                  >
                    {/* TEXT */}
                    <div className="flex-1 pr-4">
                      <p className="text-sm text-gray-800">
                        {improvedPrompts[i] || p.prompt}
                      </p>

                      {improvedPrompts[i] && (
                        <p className="text-xs text-green-600 mt-1">
                          ✨ Improved version
                        </p>
                      )}

                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(p.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex gap-3">

                      <button
                        onClick={() => handleImprove(p.prompt, i)}
                        disabled={improvingIndex === i}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Sparkles className="size-3" />
                        {improvingIndex === i ? "Improving..." : "Improve"}
                      </button>

                      <button
                        onClick={() => handleReuse(improvedPrompts[i] || p.prompt)}
                        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800"
                      >
                        <RotateCcw className="size-3" />
                        Reuse
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">

            <div className="flex justify-between mb-4">
              <h2 className="font-semibold">All Prompts</h2>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1">
              {loadingAll ? (
                <p>Loading...</p>
              ) : (
                allPrompts.map((p, i) => (
                  <div key={i} className="border p-3 rounded flex justify-between">

                    <div>
                      <p>{improvedPrompts[i] || p.prompt}</p>
                      {improvedPrompts[i] && (
                        <p className="text-xs text-green-600">✨ Improved</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => handleImprove(p.prompt, i)}>
                        Improve
                      </button>
                      <button onClick={() => handleReuse(improvedPrompts[i] || p.prompt)}>
                        Reuse
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
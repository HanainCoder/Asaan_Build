import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import {
  History,
  Clock,
  Sparkles,
  Layers,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type PromptItem = {
  id: number;
  prompt: string;
  improved_prompt?: string;
  created_at: string;
};

export function PromptHistoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentPrompts, setRecentPrompts] = useState<PromptItem[]>([]);
  const [allPrompts, setAllPrompts] = useState<PromptItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [improvingKey, setImprovingKey] = useState<number | null>(null);

  // ✅ STORE IMPROVED PROMPTS LOCALLY
  const [improvedPrompts, setImprovedPrompts] = useState<{ [key: number]: string }>({});

  // ---------------- IMPROVE ----------------
  const handleImprove = async (prompt: string, id: number) => {
    try {
      setImprovingKey(id);

      const res = await fetch("http://localhost:5000/api/prompts/improve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, id }),
      });

      const data = await res.json();

      if (data.success) {
        setImprovedPrompts((prev) => ({
          ...prev,
          [id]: data.improved,
        }));

        // optional UI sync
        setRecentPrompts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, improved_prompt: data.improved } : p
          )
        );

        setAllPrompts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, improved_prompt: data.improved } : p
          )
        );
      }
    } finally {
      setImprovingKey(null);
    }
  };

  // ---------------- FETCH RECENT ----------------
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


  // ---------------- SEE ALL ----------------
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

  useEffect(() => {
  const fetchAll = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/prompts/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) setAllPrompts(data.prompts);
    } catch (err) {
      console.error("Failed to fetch all prompts");
    }
  };

  fetchAll();
}, []);

  // ---------------- STATS ----------------
  const total = allPrompts.length || recentPrompts.length;

  const recentCount = recentPrompts.length;

  const improvedCount =
    Object.keys(improvedPrompts).length +
    recentPrompts.filter(p => p.improved_prompt).length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu />

      <div className="flex flex-1 w-full">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 w-full p-6 lg:p-8">

          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
              <History className="size-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Prompt History</h1>
            <p className="text-gray-500">
              Track, improve, and reuse your AI prompts
            </p>
          </div>

          {/* TOP CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

            <div className="bg-white p-5 rounded-2xl border">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Layers className="size-4 text-blue-500" />
                Total Prompts
              </div>
              <p className="text-2xl font-bold mt-2">{total}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Clock className="size-4 text-green-500" />
                Recent
              </div>
              <p className="text-2xl font-bold mt-2">{recentCount}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Sparkles className="size-4 text-purple-500" />
                Improved
              </div>
              <p className="text-2xl font-bold mt-2">{improvedCount}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Zap className="size-4 text-orange-500" />
                AI Boost
              </div>
              <p className="text-2xl font-bold mt-2">100%</p>
            </div>

          </div>

          {/* MAIN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border">

              <div className="flex justify-between mb-5">
                <h2 className="font-semibold flex items-center gap-2">
                  <Clock className="size-4 text-gray-400" />
                  Recent Prompts
                </h2>

                <button
                  onClick={handleSeeAll}
                  className="text-sm text-blue-600 hover:underline"
                >
                  See All
                </button>
              </div>

              {recentPrompts.length === 0 ? (
                <p className="text-gray-400 text-center py-10">
                  No prompts yet
                </p>
              ) : (
                <div className="space-y-3">
                  {recentPrompts.map((p) => {
                    const improved = improvedPrompts[p.id] || p.improved_prompt;

                    return (
                      <div
                        key={p.id}
                        className="border rounded-xl p-4 flex justify-between"
                      >
                        <div className="flex-1 pr-4">
                          <p className="text-sm line-clamp-2">
                            {improved || p.prompt}
                          </p>

                          {improved && (
                            <p className="text-xs text-green-600 mt-1">
                              ✨ Improved
                            </p>
                          )}
                        </div>

                        <div className="flex gap-3">
                         <button
  onClick={() => handleImprove(p.prompt, p.id)}
  disabled={improvingKey === p.id || !!improved}
  className="text-xs text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {improvingKey === p.id
    ? "Improving..."
    : improved
    ? "Improved"
    : "Improve"}
</button>

                          <button
                            onClick={() => handleReuse(improved || p.prompt)}
                            className="text-xs text-purple-600"
                          >
                            Reuse
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="flex flex-col gap-6">

              <div className="bg-white p-5 rounded-2xl border">
                <h3 className="font-semibold mb-2">💡 Pro Tip</h3>
                <p className="text-sm text-gray-500">
                  Improve prompts before reuse for better AI results.
                </p>
              </div>
              {/* NEW CARD 1 */}
  <div className="bg-white p-5 rounded-2xl border">
    <h3 className="font-semibold mb-2">📊 Your Activity</h3>
    <p className="text-sm text-gray-500">
      You have created <span className="font-semibold">{total}</span> prompts.
    </p>
    <p className="text-sm text-gray-500 mt-1">
      {improvedCount} prompts improved using AI.
    </p>
  </div>
  {/* NEW CARD 2 */}
  <div className="bg-white p-5 rounded-2xl border">
    <h3 className="font-semibold mb-2">🚀 Quick Action</h3>
    <button
      onClick={() => navigate("/prompt")}
      className="w-full bg-purple-600 text-white py-2 rounded-xl text-sm"
    >
      Create New Prompt
    </button>
  </div>

            </div>
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
                <p className="text-gray-400 text-center py-8">Loading...</p>
              ) : (
                allPrompts.map((p) => {
                  const improved = improvedPrompts[p.id] || p.improved_prompt;

                  return (
                    <div key={p.id} className="border p-3 rounded flex justify-between">

                      <div className="flex-1 pr-4">
                        <p className="text-sm line-clamp-2">
                          {improved || p.prompt}
                        </p>
                      </div>

                      <div className="flex gap-2">
                       <button
  onClick={() => handleImprove(p.prompt, p.id)}
  disabled={improvingKey === p.id || !!improved}
  className="text-xs text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {improvingKey === p.id
    ? "Improving..."
    : improved
    ? "Improved"
    : "Improve"}
</button>

                        <button
                          onClick={() => handleReuse(improved || p.prompt)}
                          className="text-xs text-purple-600"
                        >
                          Reuse
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
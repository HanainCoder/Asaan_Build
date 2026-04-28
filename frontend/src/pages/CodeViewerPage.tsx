import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import Editor from "@monaco-editor/react";

// ... keep all imports and existing code ...

export function CodeViewerPage() {
 const { state } = useLocation() as {
  state?: {
    prompt?: string;
    userId?: number;
    projectId?: number;
    versionId?: number;
    templateId?: string;           // ← add
   extraInstructions?: string;   
  };
};

const versionId = state?.versionId;
const templateId = state?.templateId;
const extraInstructions = state?.extraInstructions || '';

const prompt = state?.prompt || "Generate a basic landing page";
const userId = state?.userId;
const projectId = state?.projectId; // NEW
const [editPrompt, setEditPrompt] = useState("");
const [sidebarOpen, setSidebarOpen] = useState(false);
const [githubModal, setGithubModal] = useState<{ open: boolean; repoUrl?: string; error?: string }>({ open: false });

  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false); // New: saving state
  const [popup, setPopup] = useState<{
  type: "success" | "error" | null;
  message: string;
} | null>(null);
  const [code, setCode] = useState("");
  const [format, setFormat] = useState<"html" | "txt">("html");
  // const [promptInput, setPromptInput] = useState(prompt);
  const codeRef = useRef<HTMLPreElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoSavedRef = useRef(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(
  projectId || null
);

 useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  const token = params.get("token");
  const projectIdParam = params.get("projectId");

  if (token) {
    localStorage.setItem("token", token);
  }

  if (projectIdParam && projectIdParam !== "undefined") {
    setCurrentProjectId(Number(projectIdParam));
  }

  window.history.replaceState({}, document.title, "/codeviewer");
}, []);

//use effetc for github
useEffect(() => {
  const checkGithub = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.github_token) {
        setGithubConnected(true);
      }

    } catch (err) {
      console.error("GitHub check error", err);
    }
  };

  checkGithub();
}, []);


  // Download function stays the same
  const downloadCode = () => {
  if (!code) return;

  // Determine file type and extension
  const ext = format === "html" ? "html" : "txt";
  const mime = format === "html" ? "text/html" : "text/plain"; // explicit mime

  // Create Blob for download
  const blob = new Blob([code], { type: mime });
  const url = URL.createObjectURL(blob);

  // Create invisible <a> to trigger download
  const a = document.createElement("a");
  a.href = url;
  a.download = `landing-page-code.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
};

  // New: Save function
  const saveCode = async () => {
  if (!code) return;

  setSaving(true);

  try {

    // If project already exists → create NEW VERSION
    if (currentProjectId) {

      const res = await fetch(
        `http://localhost:5000/api/project/${currentProjectId}/version`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        }
      );

      const data = await res.json();

      if (data.success) {
setPopup({
  type: "success",
  message: `New version saved (v${data.version}) ✅`,
});
      } else {
setPopup({
  type: "error",
  message: "Version save failed",
});      }

    } 
    // If it's new project (not saved yet)
    else {

      const res = await fetch(
        "http://localhost:5000/api/saveMyProject",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, prompt, code }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setCurrentProjectId(data.projectId); // important
setPopup({
  type: "success",
  message: "Project saved successfully! 🎉",
});      }

    }

  } catch (err) {
    console.error(err);
    setPopup({
      type: "error",
      message: "Error saving project.",
    });
  }

  setSaving(false);
};
  //auto save code
  const autoSaveCode = async (finalCode: string) => {
  if (!finalCode || !userId) return;

  // prevent saving twice
  if (autoSavedRef.current) return;
  autoSavedRef.current = true;

  try {
    const res = await fetch("http://localhost:5000/api/saveMyProject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, prompt, code: finalCode }),
    });

    const data = await res.json();

    if (data.success) {
      setCurrentProjectId(data.projectId);
      console.log("Auto saved project:", data.projectId);
    }

  } catch (err) {
    console.error("Auto save failed:", err);
  }
};

  

  const handleEdit = async () => {
  if (!currentProjectId || !editPrompt) return;

  setLoading(true);
  setCode("");

  try {
    const response = await fetch(
      `http://localhost:5000/api/project/${currentProjectId}/edit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: editPrompt,  updatedPrompt: editPrompt  // ✅ add this
 }),
      }
    );

    // ✅ Safe check: if server streams, use reader
    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        setCode(buffer);

        if (iframeRef.current) {
          iframeRef.current.srcdoc = buffer;
        }
      }

    } else {
      // fallback if server sends normal JSON
      const data = await response.json();
      setCode(data.code || "");
      if (iframeRef.current) iframeRef.current.srcdoc = data.code || "";
    }

  } catch (err) {
    console.error("Edit error:", err);
  }

  setLoading(false);
};


  useEffect(() => {
    // 🔵 ADD THIS BLOCK (DO NOT REMOVE ANYTHING BELOW)
  if (versionId) {
  const loadVersion = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/version/${versionId}`
      );

      const data = await res.json();

      if (data.success) {
        setCode(data.code);

        if (codeRef.current) {
          codeRef.current.textContent = data.code;
        }

        if (iframeRef.current) {
          iframeRef.current.srcdoc = data.code;
        }
      }

    } catch (err) {
      console.error("Load version error", err);
    }

    setLoading(false);
  };

  loadVersion();
  return; // 🚨 IMPORTANT: stop project + GPT flow
}
    // NEW: if opening saved project → load from database
  if (projectId) {
    const loadSavedProject = async () => {
      setLoading(true);

      try {
        const res = await fetch(`http://localhost:5000/api/project/${projectId}/code`);
        const data = await res.json();

        if (data.success) {
          setCode(data.code);

          if (codeRef.current) {
            codeRef.current.textContent = data.code;
          }

          if (iframeRef.current) {
            iframeRef.current.srcdoc = data.code;
          }
        }

      } catch (err) {
        console.error("Load project error", err);
      }

      setLoading(false);
    };

    loadSavedProject();
    return; // stop GPT generation
  }
    if (!prompt) return;
    setLoading(true);
    setCode("");

    const generate = async () => {
      const response = await fetch(
  templateId
    ? "http://localhost:5000/api/generateFromTemplate"
    : "http://localhost:5000/api/generateLandingStream",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      templateId
        ? { templateId, extraInstructions }
        : { prompt, userId }
    ),
  }
);

      const reader = response.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();

      let buffer = "";
      let lineBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        lineBuffer += chunk;

        const lines = lineBuffer.split("\n");
        lineBuffer = lines.pop() || "";
        lines.forEach((line) => {
          buffer += line + "\n";
        });

        setCode(buffer);
        if (codeRef.current) {
          codeRef.current.textContent = buffer;
          codeRef.current.scrollTop = codeRef.current.scrollHeight;
        }
      }

      if (lineBuffer) buffer += lineBuffer;
      setCode(buffer);
      if (codeRef.current) codeRef.current.textContent = buffer;
      // ✅ LIVE PREVIEW ONLY
      if (iframeRef.current) {
          iframeRef.current.srcdoc = buffer;
      }

      // AUTO SAVE FINAL GPT CODE
      await autoSaveCode(buffer);
      setLoading(false);
    };

    generate();
  }, [prompt, projectId, versionId]);

  //function to upload
  const handleUploadGithub = async () => {
  if (!currentProjectId) {
    alert("Please save project first");
    return;
  }

  setUploading(true);

  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/uploadToGithub", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        projectId: currentProjectId
      })
    });

    const data = await res.json();

   // REPLACE with:
if (data.success) {
  setGithubModal({ open: true, repoUrl: data.repoUrl });
} else {
  setGithubModal({ open: true, error: data.message });
}

  } catch (err) {
    console.error(err);
    alert("Upload failed");
  }

  setUploading(false);
};
  

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full">
      <Header showMenu={true} onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
       <Sidebar
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
/>
        <main className="flex-1 flex flex-col p-6 lg:p-8 overflow-visible">
          {/* Page Header + Buttons */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-6 w-full max-w-5xl mx-auto gap-4 relative z-10">
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold mb-2">
                {t("Code Viewer") || "Generated Landing Page"}
              </h1>
              <p className="text-gray-600">
                Preview the code and live website generated from your prompt.
              </p>
            </div>
            {/* Prompt Editor */}
            {/*  
       <div className="flex gap-2 w-full mb-3">

  <input
    value={promptInput}
    onChange={(e) => setPromptInput(e.target.value)}
    placeholder="Edit prompt and regenerate..."
    className="flex-1 px-3 py-2 border rounded-md"
  />

  <button
    onClick={regeneratePrompt}
    disabled={!currentProjectId || loading}
    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
  >
    Regenerate
  </button>

</div>

*/}

            {/* Buttons */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as "html" | "txt")}
                className="px-3 py-2 rounded-md border border-gray-300"
              >
                <option value="html">HTML</option>
                <option value="txt">TXT</option>
              </select>

              <button
                onClick={downloadCode}
                disabled={loading}
                className={`flex-shrink-0 px-4 py-2 rounded-md text-black transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {loading ? "Generating..." : "Download"}
              </button>
              {/* gor githb */}
              {/* GitHub Button */}
              {/* {!githubConnected && (
  <p className="text-sm text-gray-500 mb-2">
    Connect GitHub from Dashboard to enable uploads
  </p>
)} */}
<button
  onClick={handleUploadGithub}
  disabled={!githubConnected || uploading || !currentProjectId}
  className={`flex-shrink-0 px-4 py-2 rounded-md transition ${
    !githubConnected || uploading || !currentProjectId
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-black hover:bg-gray-800 text-black"
  }`}
>
  {uploading
    ? "Uploading..."
    : githubConnected
    ? "Upload to GitHub 🚀"
    : "Connect GitHub in Dashboard"}
</button>
              <button
                onClick={saveCode}
                disabled={loading || saving || !code}
                className={`flex-shrink-0 px-4 py-2 rounded-md text-black transition ${
                  saving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              
            </div>
          </div>

          {/* Code + Preview */}
          <div className="flex flex-col md:flex-row border rounded-2xl overflow-hidden shadow-lg min-h-[500px]">
            {/* Code Viewer */}
            <div className="w-full md:w-1/2 h-[300px] md:h-full overflow-auto bg-gray-900 rounded-l-2xl">
  <Editor
    height="100%"
    defaultLanguage="html"
    theme="vs-dark"
    value={code}
    onChange={(value) => {
      const updatedCode = value || "";
      setCode(updatedCode);

      // update preview instantly
      if (iframeRef.current) {
        iframeRef.current.srcdoc = updatedCode;
      }
    }}
  />
</div>

            {/* Live Preview */}
            <div className="w-full md:w-1/2 h-[300px] md:h-full border-t md:border-t-0 md:border-l rounded-b-2xl md:rounded-r-2xl relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10 rounded-r-2xl">
                  <p className="text-gray-600 text-lg animate-pulse">
                    Generating preview...
                  </p>
                </div>
              )}
              <iframe
                ref={iframeRef}
                title="Live Preview"
                className="w-full h-full rounded-r-2xl"
              />
            </div>
          </div>
          {/* Prompt Edit (Moved Below) */}
<div className="mt-6 w-full max-w-5xl mx-auto">
  <div className="flex flex-col sm:flex-row gap-2">
    <input
      value={editPrompt}
      onChange={(e) => setEditPrompt(e.target.value)}
      placeholder="e.g. change button color to red"
      className="flex-1 px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
    />

    <button
      onClick={handleEdit}
      disabled={!currentProjectId || loading}
      className="px-6 py-3 bg-purple-600 text-black rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
    >
      Apply Changes
    </button>
  </div>
</div>
        </main>
      </div>
      {/* GitHub Upload Modal */}
{/* GitHub Upload Modal */}
{githubModal.open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-4 border border-indigo-100">
      {githubModal.error ? (
        <>
          <div className="text-4xl">❌</div>
          <h2 className="text-xl font-bold text-gray-800">Upload Failed</h2>
          <p className="text-gray-500 text-center text-sm">{githubModal.error}</p>
          <button
            onClick={() => setGithubModal({ open: false })}
            className="mt-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            Close
          </button>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-md">
            🚀
          </div>
          <h2 className="text-xl font-bold text-gray-800">Uploaded to GitHub!</h2>
          <p className="text-gray-500 text-center text-sm">Your project has been pushed successfully.</p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => { window.open(githubModal.repoUrl, "_blank"); setGithubModal({ open: false }); }}
              className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              View Repo
            </button>
            <button
              onClick={() => setGithubModal({ open: false })}
              className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-medium hover:bg-indigo-100 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}
{popup && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">

      <div className={`text-lg font-semibold mb-2 ${
        popup.type === "success" ? "text-green-600" : "text-red-600"
      }`}>
        {popup.type === "success" ? "Success" : "Error"}
      </div>

      <p className="text-gray-700 text-sm mb-4">{popup.message}</p>

      <button
        onClick={() => setPopup(null)}
        className="px-5 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700"
      >
        OK
      </button>
    </div>
  </div>
)}
    </div>
  );
}
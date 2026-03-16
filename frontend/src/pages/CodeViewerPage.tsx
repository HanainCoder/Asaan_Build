import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import Editor from "@monaco-editor/react";

// ... keep all imports and existing code ...

export function CodeViewerPage() {
  const { state } = useLocation() as { 
  state?: { prompt?: string; userId?: number; projectId?: number } 
};

const prompt = state?.prompt || "Generate a basic landing page";
const userId = state?.userId;
const projectId = state?.projectId; // NEW

  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false); // New: saving state
  const [code, setCode] = useState("");
  const [format, setFormat] = useState<"html" | "txt">("html");
  // const [promptInput, setPromptInput] = useState(prompt);
  const codeRef = useRef<HTMLPreElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoSavedRef = useRef(false);
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(
  projectId || null
);

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
        alert(`New version saved (v${data.version})`);
      } else {
        alert("Version save failed");
      }

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
        alert("Project saved successfully!");
      }

    }

  } catch (err) {
    console.error(err);
    alert("Error saving project.");
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
const uploadToGitHub = async () => {
  if (!code || !currentProjectId) {
    alert("Please save project first.");
    return;
  }

  setUploading(true);

  try {
    const token = localStorage.getItem("token"); // your JWT

    const res = await fetch("http://localhost:5000/api/github/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileContent: code,
        repoName: `asaanbuild-project-${currentProjectId}`,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("🚀 Uploaded to GitHub successfully!");
    } else {
      alert(data.message || "Upload failed");
    }

  } catch (err) {
    console.error(err);
    alert("GitHub upload error");
  }

  setUploading(false);
};
  //  regenerte prompt
//   const regeneratePrompt = async () => {

//   if (!currentProjectId || !promptInput) return;

//   setLoading(true);
//   setCode("");

//   try {

//     const response = await fetch(
//       `http://localhost:5000/api/project/${currentProjectId}/regenerate`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           prompt: promptInput
//         })
//       }
//     );

//     const reader = response.body?.getReader();
//     if (!reader) return;

//     const decoder = new TextDecoder();

//     let buffer = "";

//     while (true) {

//       const { done, value } = await reader.read();

//       if (done) break;

//       const chunk = decoder.decode(value);

//       buffer += chunk;

//       setCode(buffer);

//       if (iframeRef.current) {
//         iframeRef.current.srcdoc = buffer;
//       }

//     }

//   } catch (err) {
//     console.error("Regenerate error:", err);
//   }

//   setLoading(false);
// };


  useEffect(() => {
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
      const response = await fetch("http://localhost:5000/api/generateLandingStream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, userId }),
      });

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
  }, [prompt, projectId]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-317">
      <Header showMenu={false} />
      <div className="flex flex-1">
        <Sidebar isOpen={false} onClose={() => {}} />
        <main className="flex-1 flex flex-col p-6 lg:p-8 overflow-visible">
          {/* Page Header + Buttons */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-6 w-full max-w-5xl mx-auto gap-4 relative z-10">
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold mb-2">
                {t("generatedLandingPage") || "Generated Landing Page"}
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
            <div className="flex gap-2">
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
              <button
  onClick={uploadToGitHub}
  disabled={loading || uploading || !code}
  className={`flex-shrink-0 px-4 py-2 rounded-md text-black transition ${
    uploading
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-black text-white hover:bg-gray-800"
  }`}
>
  {uploading ? "Uploading..." : "Upload to GitHub"}
</button>
            </div>
          </div>

          {/* Code + Preview */}
          <div className="flex flex-1 border rounded-2xl overflow-hidden shadow-lg min-h-[500px]">
            {/* Code Viewer */}
            <div className="w-1/2 h-full overflow-auto bg-gray-900 rounded-l-2xl">
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
            <div className="w-1/2 h-full border-l rounded-r-2xl relative">
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
        </main>
      </div>
    </div>
  );
}
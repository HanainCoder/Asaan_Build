import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { useLanguage } from "@/contexts/LanguageContext";

export function CodeViewerPage() {
  const { state } = useLocation() as { state: { prompt: string } };
  const prompt = state?.prompt || "Generate a basic landing page";
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const codeRef = useRef<HTMLPreElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ✅ Function to download the code as HTML
  const downloadCode = () => {
  if (!code) return;

  // Save as a raw code file (you can use .txt, .html, or .js)
  const blob = new Blob([code], { type: "text/plain" }); 
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "landing-page-code.txt"; // Name of the file
  a.click();
  URL.revokeObjectURL(url);
};

  useEffect(() => {
    if (!prompt) return;
    setLoading(true);
    setCode("");

    const generate = async () => {
      const response = await fetch(
        "http://localhost:5000/api/generateLandingStream",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
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

        // Update code preview live
        setCode(buffer);
        if (codeRef.current) {
          codeRef.current.textContent = buffer;
          codeRef.current.scrollTop = codeRef.current.scrollHeight;
        }
      }

      // Flush any remaining content
      if (lineBuffer) buffer += lineBuffer;
      setCode(buffer);
      if (codeRef.current) codeRef.current.textContent = buffer;

      // ✅ Update iframe AFTER full HTML is ready
      if (iframeRef.current) {
        iframeRef.current.srcdoc = buffer;
      }

      setLoading(false);
    };

    generate();
  }, [prompt]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-317">
      <Header showMenu={false} />

      <div className="flex flex-1">
        <Sidebar isOpen={false} onClose={() => {}} />

        <main className="flex-1 flex flex-col p-6 lg:p-8 overflow-visible">
          {/* Page Header + Download Button */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-6 w-full max-w-5xl mx-auto gap-4 relative z-10">
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold mb-2">
                {t("generatedLandingPage") || "Generated Landing Page"}
              </h1>
              <p className="text-gray-600">
                Preview the code and live website generated from your prompt.
              </p>
            </div>

            <button
              onClick={downloadCode}
              disabled={loading}
              className={`flex-shrink-0 px-4 py-2 rounded-md text-black transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Generating..." : "Download Code"}
            </button>
          </div>

          {/* Code + Preview */}
          <div className="flex flex-1 border rounded-2xl overflow-hidden shadow-lg min-h-[500px]">
            {/* Code Viewer */}
            <div className="w-1/2 h-full overflow-auto bg-gray-900 rounded-l-2xl">
              <pre
                ref={codeRef}
                className="h-full p-6 font-mono text-sm text-green-400 whitespace-pre-wrap"
              >
                {code}
              </pre>
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
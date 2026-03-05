import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export function CodeViewerPage() {
  const { state } = useLocation() as { state: { prompt: string } };
  const prompt = state?.prompt || "Generate a basic landing page";

  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const codeRef = useRef<HTMLPreElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
    let lastIframeUpdate = Date.now();

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

      // Update code viewer live
      setCode(buffer);
      if (codeRef.current) {
        codeRef.current.textContent = buffer;
        codeRef.current.scrollTop = codeRef.current.scrollHeight;
      }

      // Update iframe less frequently (every 300ms)
      if (Date.now() - lastIframeUpdate > 300) {
        if (iframeRef.current) iframeRef.current.srcdoc = buffer;
        lastIframeUpdate = Date.now();
      }
    }

    // Flush any remaining content
    if (lineBuffer) buffer += lineBuffer;
    setCode(buffer);
    if (codeRef.current) codeRef.current.textContent = buffer;

    // Final iframe update
    if (iframeRef.current) iframeRef.current.srcdoc = buffer;

    setLoading(false);
  };

  generate();
}, [prompt]);

  return (
    <div className="h-screen flex flex-col p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Generated Landing Page</h1>
      {loading && <p className="text-gray-500 mb-2">Generating code...</p>}

      <div className="flex flex-1 border rounded-lg overflow-hidden h-full">
        {/* Code viewer */}
        <div className="w-1/2 h-full overflow-auto">
          <pre
            ref={codeRef}
            className="h-full p-4 font-mono text-sm text-green-400 bg-gray-900 whitespace-pre-wrap"
          >
            {code}
          </pre>
        </div>

        {/* Live preview */}
        <div className="w-1/2 h-full border-l">
          <iframe ref={iframeRef} title="Live Preview" className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useMemo } from "react";
import { SandpackProvider, SandpackPreview, SandpackCodeEditor, SandpackLayout } from "@codesandbox/sandpack-react";
import { sanitizeGeneratedCode } from "@/lib/utils";

interface CodePreviewProps {
  code?: string;
  codeOnly?: boolean;
  previewOnly?: boolean;
}

const DEFAULT_CODE = `import React, { useState } from "react";

export default function App() {
  const [count, setCount] = useState<number>(0);

  return (
    <div className="min-h-screen bg-[#F8F8F0] text-[#282824] flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-[#F0E8E0] border border-[#E8E0D0] p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#C87858]/15 text-[#C87858] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-[#C87858]/25">
          ⚡
        </div>
        <h1 className="text-2xl font-bold text-[#282824] mb-2">DevForge AI Workspace</h1>
        <p className="text-[#88857D] text-sm mb-6">
          Your live React component workspace is ready. Type a prompt to generate interactive components!
        </p>

        <div className="bg-[#F0F0E8] p-4 rounded-2xl border border-[#E8E8E8] mb-6 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#88857D]">Counter State:</span>
          <span className="text-2xl font-mono font-bold text-[#C87858]">{count}</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setCount((c) => c + 1)}
            className="flex-1 py-2.5 bg-[#C87858] hover:bg-[#D98A68] text-white font-semibold text-sm rounded-xl transition shadow-md shadow-[#C87858]/25 active:scale-95"
          >
            Increment +1
          </button>
          <button
            onClick={() => setCount(0)}
            className="px-4 py-2.5 bg-[#F0F0E8] hover:bg-[#E8E0D0] text-[#282824] font-semibold text-sm rounded-xl transition border border-[#D8D8D0] active:scale-95"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}`;

export default function CustomSandpackPreview({ code, codeOnly = false, previewOnly = false }: CodePreviewProps) {
  const [useInstantIframe, setUseInstantIframe] = useState<boolean>(false);

  const { cleanCode, isHtml, htmlDoc } = useMemo(() => {
    let raw = code && code.trim().length > 0 ? code : DEFAULT_CODE;
    raw = sanitizeGeneratedCode(raw);

    const isHtmlDoc = /^\s*<!DOCTYPE html/i.test(raw) || /^\s*<html/i.test(raw);

    if (isHtmlDoc) {
      return { cleanCode: raw, isHtml: true, htmlDoc: raw };
    }

    // Wrap React code into a standalone HTML doc with Babel & Tailwind CDN for 100% reliable instant preview fallback
    const convertedHtmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #F8F8F0; color: #282824; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${raw.replace(/import\s+.*?from\s+['"].*?['"];?/g, "")}

    if (typeof App !== 'undefined') {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<App />);
    } else {
      document.getElementById('root').innerHTML = '<div style="padding:20px;font-family:sans-serif;color:#282824;">Component ready</div>';
    }
  </script>
</body>
</html>`;

    return { cleanCode: raw, isHtml: false, htmlDoc: convertedHtmlDoc };
  }, [code]);

  // If the generated code is pure HTML OR if instant iframe mode is enabled, render the native iframe directly
  if (isHtml || useInstantIframe) {
    return (
      <div className="w-full h-full min-h-[600px] rounded-3xl overflow-hidden border border-[#E8E0D0] bg-[#F0F0E8] shadow-xl flex flex-col">
        <div className="px-4 py-2.5 bg-[#F0E8E0] border-b border-[#E8E0D0] flex items-center justify-between text-xs text-[#282824] font-semibold">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#75A86B] animate-pulse"></span>
            Instant Live Preview (HTML / Browser Compiled)
          </span>
          {!isHtml && (
            <button
              onClick={() => setUseInstantIframe(false)}
              className="text-[#C87858] hover:underline font-bold cursor-pointer"
            >
              Switch to Sandpack IDE
            </button>
          )}
        </div>
        <iframe
          srcDoc={htmlDoc}
          className="w-full flex-1 min-h-[550px] border-none"
          title="Live Output Preview"
          sandbox="allow-scripts allow-same-origin allow-modals allow-forms"
        />
      </div>
    );
  }

  return (
    <div className="w-full rounded-3xl overflow-hidden border border-[#E8E0D0] bg-[#F0F0E8] shadow-xl flex flex-col">
      <div className="px-4 py-2 bg-[#F0E8E0] border-b border-[#E8E0D0] flex items-center justify-between text-[11px] text-[#282824] font-medium">
        <span>DevForge Sandpack Bundler</span>
        <button
          onClick={() => setUseInstantIframe(true)}
          className="text-[#C87858] font-bold hover:underline cursor-pointer"
        >
          Taking long? Load Instant Preview ⚡
        </button>
      </div>

      <SandpackProvider
        template="react-ts"
        theme="light"
        files={{
          "/App.tsx": cleanCode,
          "/index.tsx": `import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

function Root() {
  useEffect(() => {
    if (!document.getElementById("tailwind-script")) {
      const script = document.createElement("script");
      script.id = "tailwind-script";
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  return <App />;
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<Root />);
}`,
          "/styles.css": `@import "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";

body {
  margin: 0;
  padding: 0;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #F8F8F0;
  color: #282824;
}`,
        }}
        customSetup={{
          entry: "/index.tsx",
          dependencies: {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "lucide-react": "^0.344.0",
          },
        }}
        options={{
          recompileMode: "delayed",
          recompileDelay: 200,
          initMode: "immediate",
        }}
      >
        <SandpackLayout className="!border-none !bg-[#F0F0E8]">
          {previewOnly ? (
            <div className="w-full h-[calc(100vh-100px)] min-h-[600px] bg-[#F0F0E8]">
              <SandpackPreview
                showRefreshButton
                showOpenInCodeSandbox={false}
                style={{ height: "100%" }}
              />
            </div>
          ) : codeOnly ? (
            <div className="w-full min-h-[550px] bg-[#F0F0E8] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#F0E8E0] border-b border-[#E8E0D0] text-xs font-mono text-[#282824] font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#75A86B] animate-pulse"></span>
                  Generated Codebase (/App.tsx, index.html)
                </span>
              </div>
              <SandpackCodeEditor
                showLineNumbers
                showInlineErrors
                showTabs
                wrapContent
                style={{ height: "520px" }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-[550px] border-none bg-[#F0F0E8]">
              {/* Editor Panel */}
              <div className="border-b lg:border-b-0 lg:border-r border-[#E8E0D0] bg-[#F0F0E8] h-[550px] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#F0E8E0] border-b border-[#E8E0D0] text-xs font-mono text-[#282824] font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#75A86B] animate-pulse"></span>
                    App.tsx (TypeScript Source)
                  </span>
                </div>
                <SandpackCodeEditor
                  showLineNumbers
                  showInlineErrors
                  showTabs
                  wrapContent
                  style={{ height: "calc(100% - 37px)" }}
                />
              </div>
              {/* Live Preview Panel */}
              <div className="bg-[#F0F0E8] h-[550px] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#F0E8E0] border-b border-[#E8E0D0] text-xs font-mono text-[#282824] font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C87858]"></span>
                    Live Output Preview
                  </span>
                </div>
                <SandpackPreview
                  showRefreshButton
                  showOpenInCodeSandbox={false}
                  style={{ height: "calc(100% - 37px)" }}
                />
              </div>
            </div>
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}

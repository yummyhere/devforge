"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

// Disable SSR for Sandpack to clear React Error #418
const SandpackPreview = dynamic(() => import("@/components/SandpackPreview"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full flex items-center justify-center bg-[#F0E8E0] text-[#88857D] rounded-2xl border border-[#E8E0D0]">
      Initializing Sandpack Environment...
    </div>
  ),
});

export default function Workspace() {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Generation failed (${response.status})`);
      }

      const textOrJson = await response.text();
      let code = textOrJson;
      try {
        const parsed = JSON.parse(textOrJson);
        if (parsed.code) code = parsed.code;
      } catch {}

      if (code) {
        setGeneratedCode(code);
      }
    } catch (err: any) {
      console.error("Generation Error:", err);
      setError(err.message || "Failed to generate component");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F0] text-[#282824] font-sans p-6 md:p-10 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E0D0] pb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#282824] flex items-center gap-2">
              <span className="text-[#C87858]">⚡</span> Gemini AI Workspace
            </h1>
            <p className="text-[#88857D] text-sm">Generate and run live React components with Google Gemini AI</p>
          </div>
        </header>

        {/* Prompt Input Form */}
        <form onSubmit={handleGenerate} className="flex gap-3 bg-[#F0E8E0] p-3 rounded-2xl border border-[#E8E0D0] shadow-sm">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            placeholder="Describe a component (e.g. 'Create an interactive calculator', 'Build a portfolio')..."
            className="flex-1 bg-[#F0F0E8] rounded-xl px-4 py-2.5 text-sm text-[#282824] placeholder-[#88857D] border border-[#E8E8E8] focus:border-[#C87858] outline-none transition"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="px-6 py-2.5 bg-[#C87858] hover:bg-[#D98A68] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md shadow-[#C87858]/20 flex items-center gap-2 cursor-pointer"
          >
            {loading ? "Generating..." : "Generate Code →"}
          </button>
        </form>

        {error && (
          <div className="p-4 rounded-2xl bg-[#C87858]/10 border border-[#C87858]/30 text-[#C87858] text-xs">
            ⚠️ {error}
          </div>
        )}

        {/* Code Runner Workspace */}
        <SandpackPreview code={generatedCode} />
      </div>
    </div>
  );
}

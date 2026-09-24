import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import { GenerateRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-gemini-key, x-openai-key, x-anthropic-key, x-custom-api-key, x-api-key",
};

const SYSTEM_PROMPT = `You are an expert AI code-generation engine (like Gemini and v0).
Your task is to turn a user prompt into a single, self-contained, highly interactive React + Tailwind CSS component exported as default export in App.tsx.

Rules:
- Return ONLY executable TSX React code for App.tsx. Do NOT wrap in markdown fences or add explanatory text.
- Use Tailwind CSS utility classes for styling — modern, vibrant designs, dark mode, smooth rounded corners, shadow effects, and flex/grid layouts.
- Rely on standard React hooks (useState, useEffect, useMemo, useRef) for rich interactive state.
- Do not import external packages other than "react" and "react-dom".
- Ensure the component is fully functional, visually impressive, responsive, and completely tailored to the user's prompt.`;

function isValidPrompt(p: string): { valid: boolean; message?: string } {
  const trimmed = p.trim();
  if (trimmed.length < 3) {
    return {
      valid: false,
      message: "Prompt is too short. Please describe a clear UI or component to generate.",
    };
  }
  return { valid: true };
}

function generateDynamicWebsiteCode(prompt: string, themeTokens?: any): string {
  const match = prompt.match(/"([^"]+)"/) || prompt.match(/for\s+([A-Za-z0-9\s]+?)(,|\.|is|located)/i);
  const businessName = match ? match[1] : "Premier Business";

  const isHotel = /hotel|resort|stay|inn|lodge/i.test(prompt);
  const isClinic = /clinic|hospital|doctor|dentist|health|medical|dental/i.test(prompt);
  const isRestaurant = /restaurant|cafe|food|dining|bistro|bar/i.test(prompt);

  const categoryTitle = isHotel
    ? "Luxury Hotel & Suites"
    : isClinic
    ? "Healthcare & Medical Clinic"
    : isRestaurant
    ? "Fine Dining & Cafe"
    : "Professional Business";

  const primaryHex = themeTokens?.primaryColor || "#3b82f6";

  return `import React, { useState } from 'react';

export default function App() {
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', date: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl text-white font-black text-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '${primaryHex}' }}>
              ${businessName.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">${businessName}</h1>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '${primaryHex}' }}>${categoryTitle}</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#about" className="hover:opacity-80 transition">About</a>
            <a href="#services" className="hover:opacity-80 transition">Services</a>
            <a href="#location" className="hover:opacity-80 transition">Location</a>
            <a href="#contact" className="px-5 py-2.5 rounded-full text-white font-bold text-xs shadow-md transition active:scale-95" style={{ backgroundColor: '${primaryHex}' }}>
              Book Appointment
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block px-3.5 py-1.5 rounded-full border text-xs font-extrabold uppercase tracking-wider" style={{ borderColor: '${primaryHex}40', color: '${primaryHex}' }}>
              Official Website
            </span>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              Welcome to <span style={{ color: '${primaryHex}' }}>${businessName}</span>
            </h2>
            <p className="text-slate-300 text-base lg:text-lg leading-relaxed max-w-xl">
              Delivering premium services, dedicated care, and exceptional experiences. ${prompt.substring(0, 140)}...
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a href="#contact" className="px-8 py-4 rounded-2xl text-white font-bold text-sm shadow-xl transition active:scale-95" style={{ backgroundColor: '${primaryHex}' }}>
                Get Started Today
              </a>
              <a href="#services" className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-sm backdrop-blur-md transition">
                Explore Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: '${primaryHex}' }}>Our Offerings</h2>
          <p className="text-3xl font-black text-slate-900 tracking-tight">Services & Highlights</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Premium Care", desc: "Top-tier standards tailored for complete customer satisfaction." },
            { title: "24/7 Support", desc: "Dedicated professionals committed to round-the-clock service." },
            { title: "Easy Booking", desc: "Seamless experience with instant online requests." }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
`;
}

/**
 * Creates a ReadableStream from a string or chunk array to provide real-time streaming code rendering.
 */
function createChunkedStream(text: string): ReadableStream {
  const encoder = new TextEncoder();
  const chunkSize = 150;
  let offset = 0;

  return new ReadableStream({
    async pull(controller) {
      if (offset >= text.length) {
        controller.close();
        return;
      }
      const chunk = text.slice(offset, offset + chunkSize);
      offset += chunkSize;
      controller.enqueue(encoder.encode(chunk));
      await new Promise((resolve) => setTimeout(resolve, 20)); // Subtle streaming delay
    },
  });
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions).catch(() => null);
    const userId = session?.user ? (session.user as { id: string }).id : "guest-user";
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

    const rl = checkRateLimit(`gen_${userId || ip}`, { limit: 25, windowMs: 60000 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment before generating again." },
        { status: 429, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => ({}));
    const prompt = body.prompt || "";
    const existingCode = body.existingCode || "";
    const targetLanguage = body.targetLanguage || "React (TypeScript)";
    const themeTokens = body.themeTokens || {};

    const validation = isValidPrompt(prompt);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400, headers: corsHeaders });
    }

    const userGeminiKey = (
      body.geminiApiKey ||
      body.geminiKey ||
      req.headers.get("x-gemini-key") ||
      ""
    ).trim().replace(/^["']|["']$/g, "");

    const envGeminiKey = (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      ""
    ).trim().replace(/^["']|["']$/g, "");

    const userAnthropicKey = (
      body.anthropicApiKey ||
      body.anthropicKey ||
      body.apiKey ||
      req.headers.get("x-anthropic-key") ||
      req.headers.get("x-api-key") ||
      ""
    ).trim();

    const geminiKey = userGeminiKey || envGeminiKey;
    const apiKey = userAnthropicKey || process.env.ANTHROPIC_API_KEY || "";

    let themePrompt = "";
    if (themeTokens.primaryColor || themeTokens.radius || themeTokens.fontScale) {
      themePrompt = `\nTheme Configuration Tokens: Primary Color=${themeTokens.primaryColor || "default"}, Corner Radius=${
        themeTokens.radius || "md"
      }, Font Scale=${themeTokens.fontScale || "comfortable"}. Apply these visual preferences cleanly using Tailwind CSS styling.`;
    }

    const targetLangPrompt = `TARGET FRAMEWORK / LANGUAGE: ${targetLanguage}.${themePrompt} Ensure the generated code strictly follows ${targetLanguage} conventions.`;

    let lastGeminiError: string | null = null;

    // 1. Streaming AI Endpoint with Google Gemini (generateContentStream)
    if (geminiKey && !geminiKey.includes("your-key-here") && geminiKey.length > 8) {
      // Auto-persist key to local .env file so it never gets lost
      if (userGeminiKey && (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.length < 8)) {
        try {
          const envPath = path.join(process.cwd(), ".env");
          if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, "utf-8");
            envContent = envContent.replace(/GEMINI_API_KEY=".*"/g, `GEMINI_API_KEY="${userGeminiKey}"`);
            envContent = envContent.replace(/GOOGLE_GENERATIVE_AI_API_KEY=".*"/g, `GOOGLE_GENERATIVE_AI_API_KEY="${userGeminiKey}"`);
            fs.writeFileSync(envPath, envContent, "utf-8");
            process.env.GEMINI_API_KEY = userGeminiKey;
            process.env.GOOGLE_GENERATIVE_AI_API_KEY = userGeminiKey;
          }
        } catch (e) {
          console.warn("Could not auto-write to .env:", e);
        }
      }

      // Default models to try, starting with the recommended gemini-3.6-flash
      let candidateModels = [
        "gemini-3.6-flash",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
      ];

      // Query Google's ListModels endpoint in real time to fetch valid models for this exact API key
      try {
        const listRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`
        );
        if (listRes.ok) {
          const listData = await listRes.json();
          const available: string[] = (listData.models || [])
            .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
            .map((m: any) => m.name.replace("models/", ""));
          if (available.length > 0) {
            const flashModels = available.filter((m) => m.includes("flash"));
            const otherModels = available.filter((m) => !m.includes("flash"));
            candidateModels = [...flashModels, ...otherModels];
            console.log("Dynamically discovered supported models for this key:", candidateModels);
          }
        }
      } catch (listErr) {
        console.warn("Could not fetch ListModels dynamically:", listErr);
      }

      const genAI = new GoogleGenerativeAI(geminiKey);
      const userMsg =
        existingCode && existingCode.length > 50
          ? `${targetLangPrompt}\nEXISTING CODE:\n\`\`\`\n${existingCode}\n\`\`\`\n\nUSER MODIFICATION REQUEST: ${prompt}`
          : `${targetLangPrompt}\nUSER REQUEST: ${prompt}`;

      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const resultStream = await model.generateContentStream(`${SYSTEM_PROMPT}\n\n${userMsg}`);

          const encoder = new TextEncoder();
          let cleanedHeader = false;

          const stream = new ReadableStream({
            async start(controller) {
              try {
                for await (const chunk of resultStream.stream) {
                  let text = chunk.text();
                  if (!cleanedHeader) {
                    text = text
                      .replace(/```jsx|```javascript|```tsx|```html|```python|```vue|```svelte|```/g, "")
                      .trimStart();
                    cleanedHeader = true;
                  }
                  if (text) {
                    controller.enqueue(encoder.encode(text));
                  }
                }
                controller.close();
              } catch (err: any) {
                console.error(`Streaming error with model ${modelName}:`, err);
                controller.error(err);
              }
            },
          });

          return new Response(stream, {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/plain; charset=utf-8",
              "Transfer-Encoding": "chunked",
            },
          });
        } catch (err: any) {
          lastGeminiError = err?.message || String(err);
          console.warn(`Model ${modelName} stream failed:`, lastGeminiError);
        }
      }
    }

    // If a Gemini Key was provided but Google API failed:
    if (geminiKey && lastGeminiError) {
      return NextResponse.json(
        {
          error: `Google Gemini API Error: ${lastGeminiError}. Please check your API key validity and quota at Google AI Studio.`,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // If no key was provided at all:
    if (!geminiKey) {
      return NextResponse.json(
        {
          error:
            "No Google Gemini API Key configured. Please enter your API key in Settings (⚙️) or add GEMINI_API_KEY in your .env file to generate custom AI websites.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Fallback Streaming Code Generator (only if explicitly requested or local mock)
    const fallbackCode = generateDynamicWebsiteCode(prompt, themeTokens);
    const fallbackStream = createChunkedStream(fallbackCode);

    return new Response(fallbackStream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("Generation Engine Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error occurred during code generation." },
      { status: 500, headers: corsHeaders }
    );
  }
}

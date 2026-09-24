"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Github, Sparkles, ArrowRight, UserCheck, Lock, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  const handleGuestSignIn = async () => {
    setGuestLoading(true);
    try {
      await signIn("credentials", { callbackUrl: "/" });
    } catch {
      setGuestLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setGithubLoading(true);
    try {
      await signIn("github", { callbackUrl: "/" });
    } catch {
      setGithubLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      await signIn("credentials", { email, callbackUrl: "/" });
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F0] text-[#282824] flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C87858]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#D98A68]/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between relative z-10 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#C87858] flex items-center justify-center font-black text-xl text-white shadow-lg shadow-[#C87858]/30 group-hover:scale-105 transition">
            D
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[#282824] flex items-center gap-1.5">
              DevForge <span className="text-[#C87858] text-xs px-2 py-0.5 rounded-full bg-[#C87858]/10 border border-[#C87858]/20">AI</span>
            </h1>
            <p className="text-[11px] font-bold text-[#88857D]">Web Builder Platform</p>
          </div>
        </Link>
        <Link
          href="/"
          className="text-xs font-bold text-[#88857D] hover:text-[#282824] transition flex items-center gap-1 bg-[#F0E8E0] border border-[#E8E0D0] px-4 py-2 rounded-full backdrop-blur-md shadow-sm"
        >
          Back to Workspace <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto relative z-10 my-12">
        <div className="bg-[#F0E8E0] border border-[#E8E0D0] rounded-3xl p-8 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C87858]/10 border border-[#C87858]/25 text-[#C87858] text-xs font-extrabold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Sign In to DevForge
            </div>
            <h2 className="text-2xl font-black tracking-tight text-[#282824]">Welcome Back</h2>
            <p className="text-xs text-[#88857D]">Access your saved projects, leads, and 1-click deployments.</p>
          </div>

          {/* Social Sign In Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGithubSignIn}
              disabled={githubLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#F0F0E8] hover:bg-[#E8E0D0] text-[#282824] border border-[#D8D8D0] font-bold text-xs flex items-center justify-center gap-3 transition shadow-sm active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Github className="w-4 h-4 text-[#282824]" />
              {githubLoading ? "Connecting to GitHub..." : "Continue with GitHub"}
            </button>

            <button
              onClick={handleGuestSignIn}
              disabled={guestLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#C87858] hover:bg-[#D98A68] text-white font-bold text-xs flex items-center justify-center gap-3 transition shadow-lg shadow-[#C87858]/25 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              {guestLoading ? "Signing in as Guest..." : "Instant Demo / Guest Access"}
            </button>
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[#D8D8D0]" />
            <span className="text-[11px] font-bold text-[#88857D] uppercase tracking-wider">or sign in with email</span>
            <div className="flex-1 h-px bg-[#D8D8D0]" />
          </div>

          {/* Email Sign In Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#282824] mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#C87858]" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full px-4 py-3 rounded-2xl bg-[#F0F0E8] border border-[#E8E8E8] text-xs text-[#282824] placeholder:text-[#88857D] focus:outline-none focus:border-[#C87858] focus:ring-2 focus:ring-[#C87858]/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3.5 rounded-2xl bg-[#282824] hover:bg-[#3d3d37] text-white border border-[#282824] font-bold text-xs transition active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-[#D8D8D0]" />
              {loading ? "Sending Magic Link..." : "Sign In with Email"}
            </button>
          </form>

          <div className="p-3.5 rounded-2xl bg-[#F0F0E8] border border-[#E8E0D0] text-[11px] text-[#88857D] flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#75A86B] shrink-0" />
            <span>Secure session persistence powered by NextAuth & Prisma ORM.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-[11px] text-[#88857D] relative z-10 py-4">
        <p>© {new Date().getFullYear()} DevForge AI Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

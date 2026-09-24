"use client";

import React from "react";
import { FolderGit2, GitCommit, Rocket, CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { t, Locale } from "@/lib/i18n";

export type DeployPhase = "idle" | "repo" | "commit" | "build" | "live" | "failed";

interface DeployStepperProps {
  currentPhase: DeployPhase;
  repoUrl?: string | null;
  liveUrl?: string | null;
  errorMessage?: string | null;
  locale?: Locale;
}

export default function DeployStepper({
  currentPhase,
  repoUrl,
  liveUrl,
  errorMessage,
  locale = "en",
}: DeployStepperProps) {
  const steps = [
    {
      id: "repo",
      label: t(locale, "deploy.step.repo"),
      icon: FolderGit2,
    },
    {
      id: "commit",
      label: t(locale, "deploy.step.commit"),
      icon: GitCommit,
    },
    {
      id: "build",
      label: t(locale, "deploy.step.build"),
      icon: Rocket,
    },
    {
      id: "live",
      label: t(locale, "deploy.step.live"),
      icon: CheckCircle2,
    },
  ];

  const getStepStatus = (stepId: string) => {
    if (currentPhase === "failed") return "failed";
    const phaseOrder = ["repo", "commit", "build", "live"];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    const stepIndex = phaseOrder.indexOf(stepId);

    if (currentPhase === "idle") return "pending";
    if (stepIndex < currentIndex || currentPhase === "live") return "completed";
    if (stepIndex === currentIndex) return "in-progress";
    return "pending";
  };

  return (
    <div className="w-full bg-[#F0E8E0] border border-[#E8E0D0] rounded-3xl p-6 text-[#282824] space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#E8E0D0] pb-4">
        <div>
          <h3 className="font-extrabold text-base tracking-tight text-[#282824] flex items-center gap-2">
            <Rocket className="w-5 h-5 text-[#C87858]" />
            1-Click Deployment Pipeline
          </h3>
          <p className="text-xs text-[#88857D] mt-0.5">Automated GitHub Repository & Vercel Build Pipeline</p>
        </div>
        {currentPhase === "live" && (
          <span className="px-3 py-1 bg-[#75A86B]/15 border border-[#75A86B]/30 text-[#75A86B] text-xs font-bold rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#75A86B] animate-pulse"></span>
            Production Live
          </span>
        )}
      </div>

      {/* 4-Phase Stepper Tracker */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
        {steps.map((step, idx) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center space-y-2 relative ${
                status === "completed"
                  ? "bg-[#F8F8F0] border-[#C87858]/30 text-[#282824]"
                  : status === "in-progress"
                  ? "bg-[#D98A68]/10 border-[#C87858] text-[#282824] ring-2 ring-[#C87858]/20"
                  : status === "failed"
                  ? "bg-rose-50 border-rose-300 text-rose-700"
                  : "bg-[#F0F0E8] border-[#D8D8D0] text-[#88857D]"
              }`}
            >
              {/* Step indicator badge */}
              <div className="flex items-center justify-center w-10 h-10 rounded-xl relative">
                {status === "completed" ? (
                  <div className="w-10 h-10 rounded-xl bg-[#75A86B] text-white flex items-center justify-center shadow-md shadow-[#75A86B]/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : status === "in-progress" ? (
                  <div className="w-10 h-10 rounded-xl bg-[#C87858] text-white flex items-center justify-center shadow-md shadow-[#C87858]/30">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : status === "failed" ? (
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#E8E0D0] border border-[#D8D8D0] text-[#88857D] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                )}
              </div>

              <span className="text-[11px] font-bold tracking-wider uppercase text-[#88857D]">
                Phase 0{idx + 1}
              </span>
              <p className="text-xs font-semibold leading-tight">{step.label}</p>
            </div>
          );
        })}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-800">Deployment Notice</p>
            <p className="mt-0.5 opacity-90">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Live Outcome Links */}
      {(liveUrl || repoUrl) && (
        <div className="pt-2 flex flex-wrap items-center gap-3">
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-5 rounded-2xl bg-[#75A86B] hover:bg-[#68995e] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#75A86B]/25 transition active:scale-98"
            >
              <ExternalLink className="w-4 h-4" />
              Open Live Production Deployment ({liveUrl.replace(/^https?:\/\//, "")})
            </a>
          )}
          {repoUrl && (
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-5 rounded-2xl bg-[#F0F0E8] hover:bg-[#E8E0D0] border border-[#D8D8D0] text-[#282824] font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <FolderGit2 className="w-4 h-4 text-[#88857D]" />
              View GitHub Repository
            </a>
          )}
        </div>
      )}
    </div>
  );
}

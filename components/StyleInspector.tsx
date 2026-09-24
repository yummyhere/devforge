"use client";

import React from "react";
import { Sliders, X, Palette, Circle, Type } from "lucide-react";
import { t, Locale } from "@/lib/i18n";

export interface ThemeTokens {
  primaryColor?: string;
  radius?: "none" | "sm" | "md" | "lg" | "full";
  fontScale?: "compact" | "comfortable" | "spacious";
}

interface StyleInspectorProps {
  themeTokens: ThemeTokens;
  onChange: (tokens: ThemeTokens) => void;
  locale?: Locale;
  isOpen?: boolean;
  onClose?: () => void;
}

const PRESET_COLORS = [
  { name: "Terracotta", hex: "#C87858" },
  { name: "Soft Terracotta", hex: "#D98A68" },
  { name: "Soft Green", hex: "#75A86B" },
  { name: "Charcoal", hex: "#282824" },
  { name: "Warm Ivory", hex: "#F0E8E0" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Emerald", hex: "#10b981" },
];

const RADIUS_OPTIONS: Array<{ id: ThemeTokens["radius"]; label: string }> = [
  { id: "none", label: "Square (0px)" },
  { id: "sm", label: "Small (4px)" },
  { id: "md", label: "Medium (8px)" },
  { id: "lg", label: "Large (16px)" },
  { id: "full", label: "Pill / Full" },
];

const FONT_SCALE_OPTIONS: Array<{ id: ThemeTokens["fontScale"]; label: string }> = [
  { id: "compact", label: "Compact" },
  { id: "comfortable", label: "Comfortable" },
  { id: "spacious", label: "Spacious" },
];

export default function StyleInspector({
  themeTokens,
  onChange,
  locale = "en",
  isOpen = true,
  onClose,
}: StyleInspectorProps) {
  if (!isOpen) return null;

  const currentPrimary = themeTokens.primaryColor || "#C87858";
  const currentRadius = themeTokens.radius || "md";
  const currentFontScale = themeTokens.fontScale || "comfortable";

  return (
    <div className="w-full bg-[#F0E8E0] border border-[#E8E0D0] rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8E0D0] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#C87858]/15 text-[#C87858] flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-[#282824] text-sm">{t(locale, "inspector.title")}</h3>
            <p className="text-[11px] text-[#88857D]">Visual No-Code Theme Tokens</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-[#88857D] hover:text-[#282824] hover:bg-[#E8E0D0] rounded-full transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Primary Color Token */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-[#282824] flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#C87858]" />
          {t(locale, "inspector.primaryColor")}
        </label>
        <div className="flex flex-wrap items-center gap-2.5">
          {PRESET_COLORS.map((col) => (
            <button
              key={col.hex}
              onClick={() => onChange({ ...themeTokens, primaryColor: col.hex })}
              style={{ backgroundColor: col.hex }}
              className={`w-8 h-8 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center shadow-sm ${
                currentPrimary === col.hex ? "ring-4 ring-[#C87858]/40 scale-110" : "hover:scale-105"
              }`}
              title={col.name}
            />
          ))}
          <input
            type="color"
            value={currentPrimary}
            onChange={(e) => onChange({ ...themeTokens, primaryColor: e.target.value })}
            className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-none p-0 overflow-hidden"
            title="Custom Hex Picker"
          />
        </div>
      </div>

      {/* Border Radius Token */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-[#282824] flex items-center gap-2">
          <Circle className="w-4 h-4 text-[#C87858]" />
          {t(locale, "inspector.radius")}
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChange({ ...themeTokens, radius: opt.id })}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center ${
                currentRadius === opt.id
                  ? "bg-[#C87858] text-white shadow-md shadow-[#C87858]/20"
                  : "bg-[#F0F0E8] hover:bg-[#E8E0D0] text-[#282824] border border-[#D8D8D0]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Typography Scale Token */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-[#282824] flex items-center gap-2">
          <Type className="w-4 h-4 text-[#C87858]" />
          {t(locale, "inspector.fontScale")}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FONT_SCALE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChange({ ...themeTokens, fontScale: opt.id })}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center ${
                currentFontScale === opt.id
                  ? "bg-[#C87858] text-white shadow-md shadow-[#C87858]/20"
                  : "bg-[#F0F0E8] hover:bg-[#E8E0D0] text-[#282824] border border-[#D8D8D0]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

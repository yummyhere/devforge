import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function isLikelyCompleteComponentCode(code: string): boolean {
  if (!code || typeof code !== "string") return false;

  const trimmed = code.trim();
  if (!/export\s+default\s+function\s+App|export\s+default\s+\(/i.test(trimmed)) {
    return false;
  }

  const stack: string[] = [];
  let quote: string | null = null;
  let escaping = false;
  let templateDepth = 0;

  for (let i = 0; i < trimmed.length; i += 1) {
    const ch = trimmed[i];
    const next = trimmed[i + 1];

    if (quote) {
      if (escaping) {
        escaping = false;
        continue;
      }
      if (ch === "\\") {
        escaping = true;
        continue;
      }
      if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (templateDepth > 0 && ch === "`") {
      templateDepth -= 1;
      continue;
    }

    if (ch === "`") {
      templateDepth += 1;
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }

    if (ch === "/" && next === "/") {
      i += 1;
      while (i + 1 < trimmed.length && trimmed[i + 1] !== "\n") i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      i += 2;
      while (i + 1 < trimmed.length && !(trimmed[i] === "*" && trimmed[i + 1] === "/")) i += 1;
      i += 1;
      continue;
    }

    if (ch === "{" || ch === "(" || ch === "[") {
      stack.push(ch);
      continue;
    }

    if (ch === "}" || ch === ")" || ch === "]") {
      const opener = stack.pop();
      const matching = {
        "}": "{",
        ")": "(",
        "]": "[",
      }[ch];

      if (!opener || opener !== matching) {
        return false;
      }
    }
  }

  if (stack.length > 0) return false;
  if (trimmed.endsWith("{" ) || trimmed.endsWith("(") || trimmed.endsWith("[") || trimmed.endsWith("return (") || trimmed.endsWith("return (") || trimmed.endsWith("<")) {
    return false;
  }

  const closeParenCount = (trimmed.match(/\)/g) || []).length;
  const openParenCount = (trimmed.match(/\(/g) || []).length;
  const closeBraceCount = (trimmed.match(/\}/g) || []).length;
  const openBraceCount = (trimmed.match(/\{/g) || []).length;

  if (openParenCount !== closeParenCount || openBraceCount !== closeBraceCount) {
    return false;
  }

  return true;
}

export function sanitizeGeneratedCode(raw: string): string {
  if (!raw || typeof raw !== "string") return "";

  let cleaned = raw
    .replace(/```(?:tsx|ts|jsx|js|javascript)?\s*/gi, "")
    .replace(/\s*```\s*$/gi, "")
    .replace(/^[\s\r\n]+/, "")
    .replace(/[\s\r\n]+$/, "");

  const codeFenceMatch = cleaned.match(/```(?:tsx|ts|jsx|js|javascript)?\s*([\s\S]*?)\s*```/i);
  if (codeFenceMatch && codeFenceMatch[1]) {
    cleaned = codeFenceMatch[1].trim();
  }

  const hasExport = /export\s+default\s+function\s+App|export\s+default\s+\(/i.test(cleaned);
  const hasImport = /import\s+.*from\s+["']react["']|import\s+React/i.test(cleaned);

  if (!hasExport && !hasImport) {
    return "";
  }

  const importIndex = cleaned.search(/import\s+.*from\s+["']react["']|import\s+React/i);
  const exportIndex = cleaned.search(/export\s+default\s+function\s+App|export\s+default\s+\(/i);
  const firstRelevantIndex = [importIndex, exportIndex].filter((index) => index >= 0).sort((a, b) => a - b)[0];

  if (typeof firstRelevantIndex === "number" && firstRelevantIndex > 0) {
    cleaned = cleaned.slice(firstRelevantIndex).trim();
  }

  const finalBrace = cleaned.lastIndexOf("}");
  if (finalBrace > -1) {
    const tail = cleaned.slice(finalBrace + 1).trim();
    if (tail.length > 0 && !/^(\)|;|,)?$/.test(tail)) {
      cleaned = cleaned.slice(0, finalBrace + 1).trim();
    }
  }

  if (!isLikelyCompleteComponentCode(cleaned)) {
    return "";
  }

  return cleaned;
}

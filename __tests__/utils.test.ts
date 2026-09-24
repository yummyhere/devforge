import { describe, it, expect } from "vitest";
import { sanitizeGeneratedCode } from "../lib/utils";

describe("Generated code sanitizer", () => {
  it("removes markdown fences and surrounding explanation text", () => {
    const raw = `Here is your code:\n\n\`\`\`tsx\nimport React from "react";\n\nexport default function App() {\n  return <div>Hello</div>;\n}\n\`\`\`\n\nLet me know if you want changes.`;

    expect(sanitizeGeneratedCode(raw)).toBe(`import React from "react";\n\nexport default function App() {\n  return <div>Hello</div>;\n}`);
  });

  it("keeps valid app code intact", () => {
    const raw = `import React from "react";\n\nexport default function App() {\n  return <div className="text-red-500">Sakura Labs</div>;\n}`;

    expect(sanitizeGeneratedCode(raw)).toBe(raw);
  });

  it("ignores incomplete streamed code before the component is finished", () => {
    const raw = `export default function App() {\n  return (`;

    expect(sanitizeGeneratedCode(raw)).toBe("");
  });
});

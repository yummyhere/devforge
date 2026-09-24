import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        warmIvory: "#F0E8E0",
        softCream: "#F8F8F0",
        offWhite: "#F0F0E8",
        lightBeige: "#E8E0D0",
        terracotta: {
          DEFAULT: "#C87858",
          hover: "#D98A68",
        },
        softTerracotta: "#D98A68",
        warmGray: "#D8D8D0",
        lightGray: "#E8E8E8",
        charcoal: "#282824",
        mutedGray: "#88857D",
        softGreen: "#75A86B",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-dm-serif)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        accent: "#8B5CF6",
        "accent-blue": "#3B82F6",
        "accent-light": "#EDE9FE",
        base: "#F8F9FF",
        surface: "#1E1B4B",
        card: "#FFFFFF",
        border: "#E2E8F0",
        navy: "#080D24",
        "navy-mid": "#0F172A",
        muted: "#64748B",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
export default config;

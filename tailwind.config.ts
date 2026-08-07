import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-dm-serif)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
        roboto: ["var(--font-roboto)", "sans-serif"],
      },
      colors: {
        // Deep violet — main brand color: intense, creative, ambitious
        accent: "#5B3A8E",
        "accent-light": "#E4DDED",
        // Muted gold — warm, elegant, quietly confident (secondary accent)
        "accent-gold": "#C5A46D",
        // Dusty mauve — romantic and emotionally expressive
        "accent-mauve": "#B982A8",
        // Smoky lavender — dreamy and artistic without being childish
        "accent-lavender": "#9B8BB5",
        // Pearl white — soft, polished, clean
        base: "#F7F3FA",
        card: "#F7F3FA",
        // Midnight navy — intelligent, private, slightly intimidating
        surface: "#18233F",
        navy: "#18233F",
        // Raised surface in dark mode — cards, panels, modals floating above the navy base
        "navy-mid": "#22264B",
        // Deepest dark-mode moment (immersive/interlude sections) — deliberately dark but never pure black
        "navy-deep": "#141B33",
        border: "#E6E0EE",
        muted: "#676186",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
export default config;

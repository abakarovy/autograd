import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05060a",
          900: "#0a0c12",
          850: "#0f1118",
          800: "#141824",
          700: "#1c2130",
        },
        frost: {
          100: "rgba(255,255,255,0.06)",
          200: "rgba(255,255,255,0.09)",
          300: "rgba(255,255,255,0.12)",
        },
        accent: {
          DEFAULT: "#5b7cff",
          soft: "#7c96ff",
          dim: "#3d5ae0",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 60px -12px rgba(91, 124, 255, 0.45)",
        card: "0 4px 24px rgba(0,0,0,0.35)",
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(91,124,255,0.22), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(124,150,255,0.12), transparent)",
        "grid-faint":
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.45s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;

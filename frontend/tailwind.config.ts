import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 12px 40px rgba(15, 23, 42, 0.08)"
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" }
        },
        pulseRing: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.7" },
          "50%": { transform: "scale(1.18)", opacity: "0.25" }
        },
        bell: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(12deg)" },
          "75%": { transform: "rotate(-12deg)" }
        }
      },
      animation: {
        shimmer: "shimmer 1.6s infinite linear",
        pulseRing: "pulseRing 1.2s infinite ease-in-out",
        bell: "bell 0.45s ease-in-out"
      }
    }
  },
  plugins: []
} satisfies Config;

import type { Config } from "tailwindcss";

// Design system OSPM v2 — "Hors repere", version chic.
// La signature (surimpression bleu/rouge decalee) est conservee mais reservee
// a un ou deux mots : le reste du site respire.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        encre: {
          DEFAULT: "#0B3A8F",
          vif: "#1B5CE0",
          nuit: "#071F49",
        },
        rouge: {
          DEFAULT: "#D62027",
          sombre: "#A5161C",
        },
        creme: {
          DEFAULT: "#FAF7F0",
          fonce: "#EFE9DC",
        },
        plomb: {
          DEFAULT: "#5E636B",
          clair: "#8A8F97",
          noir: "#10131A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        micro: ["0.75rem", { lineHeight: "1.1rem", letterSpacing: "0.04em" }],
        eyebrow: ["0.8125rem", { lineHeight: "1.2rem", letterSpacing: "0.08em" }],
        affiche: ["clamp(3rem, 8.5vw, 7rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        titre: ["clamp(2rem, 4.2vw, 3.5rem)", { lineHeight: "1.05", letterSpacing: "-0.015em" }],
        sous: ["clamp(1.25rem, 2vw, 1.6rem)", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        plaque: "14px",
        douce: "10px",
      },
      boxShadow: {
        // Ombres en deux couches : un contact net, une diffusion large.
        plaque: "0 1px 2px rgba(16, 19, 26, 0.05), 0 12px 32px -18px rgba(11, 58, 143, 0.28)",
        releve: "0 2px 4px rgba(16, 19, 26, 0.06), 0 28px 60px -28px rgba(11, 58, 143, 0.45)",
        flottant: "0 40px 90px -40px rgba(7, 31, 73, 0.55)",
      },
      transitionTimingFunction: {
        douce: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        caler: {
          "0%": { transform: "translate(-0.1em, 0.06em)", opacity: "0" },
          "60%": { transform: "translate(0.03em, -0.015em)", opacity: "1" },
          "100%": { transform: "translate(0, 0)", opacity: "1" },
        },
        calerRouge: {
          "0%": { transform: "translate(0.12em, -0.07em)", opacity: "0" },
          "60%": { transform: "translate(-0.03em, 0.02em)", opacity: "1" },
          "100%": { transform: "translate(0, 0)", opacity: "1" },
        },
        monter: {
          from: { transform: "translateY(18px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        fondu: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        caler: "caler 1000ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "caler-rouge": "calerRouge 1000ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        monter: "monter 700ms cubic-bezier(0.16, 1, 0.3, 1) both",
        fondu: "fondu 900ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;

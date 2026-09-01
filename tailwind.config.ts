import type { Config } from "tailwindcss";

// Design system OSPM v2 — "Hors repere", version chic.
// La signature (surimpression bleu/rouge decalee) est conservee mais reservee
// a un ou deux mots : le reste du site respire.
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Quadrichromie : les trois encres process aux valeurs reelles, plus
        // le noir riche. Ce ne sont pas des couleurs choisies a l'oeil, c'est
        // le nuancier du metier — le ruban CMJN du logo devient la cle de
        // lecture du site entier.
        //
        // Les noms de jetons sont conserves pour ne pas reecrire 300 classes :
        //   encre -> cyan   (l'encre d'interaction)
        //   rouge -> magenta (l'encre chaude)
        //   or    -> jaune  (l'encre de tirage, rare)
        // Tout passe par des variables CSS (globals.css) et bascule avec .dark.
        encre: {
          DEFAULT: "rgb(var(--i-cyan) / <alpha-value>)",
          vif: "rgb(var(--i-cyan-vif) / <alpha-value>)",
          nuit: "rgb(var(--c-surface-2) / <alpha-value>)",
          profond: "rgb(var(--c-surface) / <alpha-value>)",
        },
        rouge: {
          DEFAULT: "rgb(var(--i-magenta) / <alpha-value>)",
          sombre: "rgb(var(--i-magenta-sombre) / <alpha-value>)",
        },
        or: {
          DEFAULT: "rgb(var(--i-jaune) / <alpha-value>)",
          clair: "rgb(var(--i-jaune-clair) / <alpha-value>)",
          sombre: "rgb(var(--i-jaune-sombre) / <alpha-value>)",
        },
        creme: {
          DEFAULT: "rgb(var(--c-surface) / <alpha-value>)",
          fonce: "rgb(var(--c-surface-2) / <alpha-value>)",
          papier: "rgb(var(--c-surface-2) / <alpha-value>)",
        },
        carte: "rgb(var(--c-card) / <alpha-value>)",
        plomb: {
          DEFAULT: "rgb(var(--c-text-muted) / <alpha-value>)",
          clair: "rgb(var(--c-text-faint) / <alpha-value>)",
          noir: "rgb(var(--c-text-strong) / <alpha-value>)",
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
        // Lilita One est deja large et pleine : elle demande un interlettrage
        // legerement ouvert plutot que serre, sinon les pleins se touchent.
        affiche: ["clamp(3rem, 8.5vw, 7rem)", { lineHeight: "1", letterSpacing: "0.005em" }],
        // Le nom complet est l'enseigne : il doit dominer la page. Quatre mots
        // a cette taille demandent un cadre large — voir le conteneur du hero.
        enseigne: ["clamp(2.6rem, 7.2vw, 6.4rem)", { lineHeight: "0.94", letterSpacing: "-0.005em" }],
        titre: ["clamp(2rem, 4.2vw, 3.5rem)", { lineHeight: "1.08", letterSpacing: "0.005em" }],
        sous: ["clamp(1.25rem, 2vw, 1.6rem)", { lineHeight: "1.32", letterSpacing: "0.008em" }],
      },
      borderRadius: {
        // Une feuille sortie de presse n'a pas les coins arrondis : on garde
        // juste assez de rayon pour ne pas blesser l'oeil sur les petits objets.
        plaque: "3px",
        douce: "2px",
      },
      boxShadow: {
        // Sur fond sombre, une ombre portee ne se voit pas — elle ne fait que
        // salir. La profondeur vient du filet et du niveau de surface, pas du
        // flou. On garde les noms pour ne pas reecrire les classes.
        plaque: "0 0 0 1px rgb(var(--c-filet) / 0.55)",
        releve: "0 0 0 1px rgb(var(--c-filet) / 0.9)",
        flottant: "0 0 0 1px rgb(var(--c-filet) / 0.9)",
      },
      transitionTimingFunction: {
        douce: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        // Les trois plaques arrivent de trois directions et s'arretent LEGEREMENT
        // hors repere : c'est ce decalage residuel qui se voit, et c'est lui la
        // signature. Calees au pixel, elles se superposeraient et disparaitraient.
        caler: {
          "0%": { transform: "translate(-0.2em, 0.12em)", opacity: "0" },
          "100%": { transform: "translate(-0.035em, 0.02em)", opacity: "1" },
        },
        calerMagenta: {
          "0%": { transform: "translate(0.2em, -0.12em)", opacity: "0" },
          "100%": { transform: "translate(0.035em, -0.02em)", opacity: "1" },
        },
        calerJaune: {
          "0%": { transform: "translate(0.03em, 0.2em)", opacity: "0" },
          "100%": { transform: "translate(0.006em, 0.04em)", opacity: "1" },
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
        caler: "caler 1100ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "caler-magenta": "calerMagenta 1100ms cubic-bezier(0.16, 1, 0.3, 1) 90ms forwards",
        "caler-jaune": "calerJaune 1100ms cubic-bezier(0.16, 1, 0.3, 1) 180ms forwards",
        monter: "monter 700ms cubic-bezier(0.16, 1, 0.3, 1) both",
        fondu: "fondu 900ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;

"use client";

import { useEffect, useState } from "react";

const CLE = "ospm-theme";

// Bascule clair / sombre. Le theme est deja pose avant le rendu par le script
// inline de app/layout.tsx : ici on ne fait que le lire puis le changer.
export function ThemeToggle() {
  const [sombre, setSombre] = useState(false);
  const [monte, setMonte] = useState(false);

  useEffect(() => {
    setMonte(true);
    setSombre(document.documentElement.classList.contains("dark"));
  }, []);

  function basculer() {
    const prochain = !sombre;
    setSombre(prochain);
    document.documentElement.classList.toggle("dark", prochain);
    try {
      localStorage.setItem(CLE, prochain ? "dark" : "light");
    } catch {
      /* stockage indisponible : le choix ne survivra pas au rechargement */
    }
  }

  return (
    <button
      type="button"
      onClick={basculer}
      aria-label={sombre ? "Passer en mode clair" : "Passer en mode sombre"}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-douce border border-plomb-noir/[0.18] text-plomb-noir transition-colors hover:border-encre hover:text-encre"
    >
      {/* Rendu neutre avant hydratation pour eviter tout saut visuel. */}
      {monte && sombre ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

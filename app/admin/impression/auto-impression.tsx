"use client";

import { useEffect } from "react";

// Ouvre la boite de dialogue d'impression a l'arrivee sur la page.
export function AutoImpression() {
  useEffect(() => {
    const minuteur = setTimeout(() => window.print(), 400);
    return () => clearTimeout(minuteur);
  }, []);

  return null;
}

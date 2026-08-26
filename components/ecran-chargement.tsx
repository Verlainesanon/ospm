"use client";

import { useEffect, useState } from "react";
import { Loader } from "./loader";

const CLE = "ospm_deja_vu";

// Voile d'ouverture : la grille apparait a la premiere arrivee sur le site,
// puis s'efface. Une seule fois par session - au deuxieme passage, personne
// n'a envie de reattendre.
export function EcranChargement() {
  const [monte, setMonte] = useState(false);
  const [sortie, setSortie] = useState(false);

  useEffect(() => {
    let dejaVu = false;
    try {
      dejaVu = sessionStorage.getItem(CLE) === "1";
    } catch {
      /* stockage indisponible : on affiche le voile, sans plus */
    }

    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (dejaVu || reduit) return;

    setMonte(true);
    document.body.style.overflow = "hidden";

    const debutSortie = setTimeout(() => setSortie(true), 900);
    const fin = setTimeout(() => {
      setMonte(false);
      document.body.style.overflow = "";
      try {
        sessionStorage.setItem(CLE, "1");
      } catch {
        /* rien a faire */
      }
    }, 1500);

    return () => {
      clearTimeout(debutSortie);
      clearTimeout(fin);
      document.body.style.overflow = "";
    };
  }, []);

  if (!monte) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-7 bg-creme transition-opacity duration-500 ease-douce ${
        sortie ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <Loader grand />
      <p className="text-micro tracking-[0.18em] text-plomb">OSPM</p>
    </div>
  );
}

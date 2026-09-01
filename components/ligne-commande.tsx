"use client";

import { useEffect, useRef, useState } from "react";

// Ligne de terminal : une invite, du texte frappe caractere par caractere, et
// un curseur qui clignote. Reprise de la reference "terminal" — c'est la voix
// technique de l'atelier, celle des specifications et des references de bon.
//
// Le texte complet est present des le premier rendu pour les lecteurs d'ecran
// et pour le referencement ; seule sa version visible se remplit peu a peu.
export function LigneCommande({
  invite = "$",
  texte,
  vitesse = 45,
  delai = 0,
  className = "",
}: {
  invite?: string;
  texte: string;
  vitesse?: number;
  delai?: number;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [frappe, setFrappe] = useState("");
  const [fini, setFini] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Mouvement reduit : la ligne s'affiche d'un coup.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFrappe(texte);
      setFini(true);
      return;
    }

    let minuteur: ReturnType<typeof setInterval>;
    let depart: ReturnType<typeof setTimeout>;

    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (!entree.isIntersecting) return;
        observateur.disconnect();

        depart = setTimeout(() => {
          let i = 0;
          minuteur = setInterval(() => {
            i += 1;
            setFrappe(texte.slice(0, i));
            if (i >= texte.length) {
              clearInterval(minuteur);
              setFini(true);
            }
          }, vitesse);
        }, delai);
      },
      { threshold: 0.5 },
    );

    observateur.observe(element);
    return () => {
      observateur.disconnect();
      clearInterval(minuteur);
      clearTimeout(depart);
    };
  }, [texte, vitesse, delai]);

  return (
    <p
      ref={ref}
      className={`flex items-center gap-2 font-mono text-micro uppercase tracking-[0.18em] ${className}`}
    >
      <span aria-hidden className="text-encre">
        {invite}
      </span>
      {/* Le texte lisible par les outils d'assistance, invisible a l'ecran. */}
      <span className="sr-only">{texte}</span>
      <span aria-hidden className="text-plomb">
        {frappe}
      </span>
      <span
        aria-hidden
        data-fini={fini ? "true" : "false"}
        className="curseur-terminal inline-block h-[0.95em] w-[0.5em] bg-encre"
      />
    </p>
  );
}

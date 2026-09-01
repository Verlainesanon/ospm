"use client";

import { useEffect, useRef, useState } from "react";

// Titre compose lettre par lettre, facon caracteres deposes un a un dans le
// composteur. Chaque lettre arrive de sa propre profondeur, legerement pivotee,
// puis se cale sur la ligne.
//
// Ecrit a la main plutot que repris de react-bits : leur SplitText dependait du
// greffon GSAP SplitText, qui est payant. Ici, aucune dependance.
//
// Le texte reste lisible par les lecteurs d'ecran grace a l'aria-label ; les
// <span> individuels leur sont masques.
export function TitrePresse({
  texte,
  className = "",
  depart = 0,
  pas = 34,
}: {
  texte: string;
  className?: string;
  depart?: number;
  pas?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [joue, setJoue] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Mouvement reduit : le titre s'affiche pose, sans chorographie.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setJoue(true);
      return;
    }

    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (!entree.isIntersecting) return;
        setJoue(true);
        observateur.disconnect();
      },
      { threshold: 0.2 },
    );

    observateur.observe(element);
    return () => observateur.disconnect();
  }, []);

  // Chaque lettre est un inline-block : sans regroupement par mot, la ligne
  // pourrait se couper au milieu d'un mot. On enveloppe donc chaque mot.
  const mots = texte.split(" ");
  let index = 0;

  return (
    <span
      ref={ref}
      aria-label={texte}
      data-joue={joue ? "true" : "false"}
      className={`titre-presse ${className}`}
    >
      {mots.map((mot, m) => {
        const lettres = mot.split("").map((caractere) => {
          const delai = depart + index * pas;
          index += 1;
          return { caractere, delai };
        });
        index += 1; // l'espace compte dans la cadence

        return (
          <span key={`${mot}-${m}`} aria-hidden className="inline-block whitespace-nowrap">
            {lettres.map((l, i) => (
              <span key={`${l.caractere}-${i}`} style={{ transitionDelay: `${l.delai}ms` }}>
                {l.caractere}
              </span>
            ))}
            {m < mots.length - 1 && <span style={{ transitionDelay: "0ms" }}>&nbsp;</span>}
          </span>
        );
      })}
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";
import TargetCursor from "./reactbits/TargetCursor";
import ClickSpark from "./reactbits/ClickSpark";

// Le curseur devient une mire de calage : quatre reperes d'imprimeur qui se
// verrouillent sur ce qui est cliquable, et une gerbe d'encre au clic. C'est le
// geste du metier — la mire ne veut rien dire ailleurs que dans un atelier.
//
// Trois cas ou on ne l'active pas, et on rend le curseur systeme :
//  - ecran tactile : il n'y a pas de curseur a remplacer ;
//  - `prefers-reduced-motion` : la mire poursuit le pointeur en permanence ;
//  - petit ecran : le cout de calcul ne se justifie pas.
export function CurseurCalage({ children }: { children: React.ReactNode }) {
  const [actif, setActif] = useState(false);

  useEffect(() => {
    const survolFin = window.matchMedia("(hover: hover) and (pointer: fine)");
    const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Le seul critere qui compte vraiment est le pointeur : une souris ou un
    // stylet. Le seuil de largeur etait a 1024px, ce qui privait de la mire
    // toutes les fenetres d'ordinateur un peu etroites.
    const evaluer = () => {
      setActif(survolFin.matches && !mouvementReduit.matches && window.innerWidth >= 700);
    };

    evaluer();
    survolFin.addEventListener("change", evaluer);
    mouvementReduit.addEventListener("change", evaluer);
    window.addEventListener("resize", evaluer);
    return () => {
      survolFin.removeEventListener("change", evaluer);
      mouvementReduit.removeEventListener("change", evaluer);
      window.removeEventListener("resize", evaluer);
    };
  }, []);

  if (!actif) return <>{children}</>;

  return (
    <>
      {/* La mire s'ouvre en cyan et vire au magenta une fois verrouillee :
          les deux encres se relaient, comme deux passages sous presse. */}
      <TargetCursor
        targetSelector="a, button, [role='button'], input, textarea, select, summary"
        cursorColor="#00AEEF"
        cursorColorOnTarget="#EC008C"
        spinDuration={6}
        hoverDuration={0.22}
      />
      <ClickSpark sparkColor="#FFF200" sparkCount={10} sparkRadius={22} sparkSize={12} duration={420}>
        {children}
      </ClickSpark>
    </>
  );
}

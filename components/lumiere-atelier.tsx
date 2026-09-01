"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Le shader WebGL est charge a la demande, hors du paquet initial.
const LightRays = dynamic(() => import("./reactbits/LightRays"), { ssr: false });

// La lanterne de l'atelier : un faisceau qui balaie la page depuis le haut.
// Posee en fond fixe du site, elle accompagne toutes les pages.
//
// Elle existe dans les deux themes, mais pas de la meme facon — parce que la
// physique n'est pas la meme :
//   - en chambre noire, la lumiere s'ajoute au fond (`screen`) : elle eclaire ;
//   - en plein jour, on ne peut pas eclaircir un fond deja clair. `soft-light`
//     restait invisible. Une lampe se lit alors a l'envers : c'est l'ombre
//     autour du faisceau qui la revele, pas le faisceau lui-meme. On teinte
//     donc en `multiply` — le rai reste franc, ses bords se posent.
//
// Deux rendus, pour qu'il y ait TOUJOURS une lanterne :
//   - WebGL quand la machine le permet : rais nets, qui suivent le curseur ;
//   - sinon un halo en CSS pur (petits ecrans, mouvement reduit, pas de GPU).
// La version precedente exigeait 1024px de large et disparaissait en dessous
// sans rien laisser — d'ou l'impression qu'il n'y avait aucun effet.
export function LumiereAtelier() {
  const [sombre, setSombre] = useState(true);
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Le shader ne se justifie que sur une machine qui peut le rendre sans
    // ponctionner la batterie : ecran confortable, mouvement non reduit, et
    // un contexte WebGL reellement disponible.
    const webglDisponible = () => {
      try {
        const c = document.createElement("canvas");
        return !!(c.getContext("webgl2") || c.getContext("webgl"));
      } catch {
        return false;
      }
    };

    const evaluer = () => {
      setSombre(document.documentElement.classList.contains("dark"));
      setWebgl(!mouvementReduit.matches && window.innerWidth >= 700 && webglDisponible());
    };

    evaluer();
    mouvementReduit.addEventListener("change", evaluer);
    window.addEventListener("resize", evaluer);

    // Le theme se change par une classe sur <html> : on l'observe pour adapter
    // la fusion au basculement, sans rechargement.
    const observateur = new MutationObserver(evaluer);
    observateur.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      mouvementReduit.removeEventListener("change", evaluer);
      window.removeEventListener("resize", evaluer);
      observateur.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        mixBlendMode: sombre ? "screen" : "multiply",
        opacity: sombre ? 0.9 : 0.3,
      }}
    >
      {webgl ? (
        <LightRays
          raysOrigin="top-center"
          raysColor="#00AEEF"
          raysSpeed={0.5}
          lightSpread={1.1}
          rayLength={2.6}
          fadeDistance={1.7}
          saturation={1}
          followMouse
          mouseInfluence={0.12}
          noiseAmount={0.05}
          distortion={0.025}
        />
      ) : (
        // Repli sans WebGL : un faisceau conique qui respire lentement. Deux
        // degrades suffisent a poser la meme intention lumineuse.
        <div className="lanterne-repli" />
      )}
    </div>
  );
}

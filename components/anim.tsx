"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

type Effet = "monte" | "fondu" | "volet" | "cote" | "cote-droit" | "echelle";

// Revele son contenu quand il entre dans l'ecran. Un seul observateur par
// element, deconnecte des qu'il a servi : rien ne tourne en fond apres coup.
export function Reveal({
  children,
  effet = "monte",
  delai = 0,
  seuil = 0.15,
  className = "",
  as: Balise = "div",
}: {
  children: ReactNode;
  effet?: Effet;
  delai?: number;
  seuil?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Navigateur sans IntersectionObserver : on affiche tout de suite.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    // Element deja depasse (ancre, retour arriere, restauration de position) :
    // il ne repassera jamais dans l'ecran, on l'affiche sans attendre.
    const rect = element.getBoundingClientRect();
    if (rect.bottom <= 0) {
      setVisible(true);
      return;
    }

    const observateur = new IntersectionObserver(
      ([entree]) => {
        // Le second test rattrape un defilement plus rapide que l'observateur.
        if (entree.isIntersecting || entree.boundingClientRect.bottom <= 0) {
          setVisible(true);
          observateur.disconnect();
        }
      },
      { threshold: seuil, rootMargin: "0px 0px -8% 0px" },
    );

    observateur.observe(element);
    return () => observateur.disconnect();
  }, [seuil]);

  return (
    <Balise
      ref={ref}
      data-anim={effet}
      data-visible={visible ? "true" : "false"}
      style={{ transitionDelay: `${delai}ms` }}
      className={className}
    >
      {children}
    </Balise>
  );
}

// Titre compose lettre par lettre. Le texte reste lisible par les lecteurs
// d'ecran grace au aria-label ; les <span> sont masques pour eux.
export function Lettres({
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
  // Chaque lettre est un inline-block : sans regroupement par mot, la ligne
  // pourrait se couper au milieu d'un mot. On enveloppe donc chaque mot.
  const mots = texte.split(" ");
  let index = 0;

  return (
    <span className={`lettres ${className}`} aria-label={texte}>
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
              <span key={`${l.caractere}-${i}`} style={{ animationDelay: `${l.delai}ms` }}>
                {l.caractere}
              </span>
            ))}
            {m < mots.length - 1 && <span style={{ animationDelay: "0ms" }}>&nbsp;</span>}
          </span>
        );
      })}
    </span>
  );
}

// Deplacement lent au defilement. Le calcul passe par requestAnimationFrame
// pour ne jamais bloquer le fil principal pendant le scroll.
export function Parallaxe({
  children,
  force = 0.12,
  className = "",
}: {
  children: ReactNode;
  force?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Sous 1024px la parallaxe coute des calculs pour un effet invisible.
    if (window.innerWidth < 1024) return;

    let trame = 0;
    // Position mesuree une seule fois, puis recalculee depuis le defilement :
    // aucune lecture de mise en page pendant le scroll.
    let ancre = element.offsetTop + element.offsetHeight / 2;

    const placer = () => {
      trame = 0;
      const centre = ancre - window.scrollY - window.innerHeight / 2;
      element.style.transform = `translate3d(0, ${(-centre * force).toFixed(1)}px, 0)`;
    };

    const auScroll = () => {
      if (!trame) trame = requestAnimationFrame(placer);
    };

    const auResize = () => {
      element.style.transform = "";
      ancre = element.offsetTop + element.offsetHeight / 2;
      auScroll();
    };

    placer();
    window.addEventListener("scroll", auScroll, { passive: true });
    window.addEventListener("resize", auResize);
    return () => {
      window.removeEventListener("scroll", auScroll);
      window.removeEventListener("resize", auResize);
      if (trame) cancelAnimationFrame(trame);
    };
  }, [force]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// Bouton magnetique : l'element suit legerement le curseur, puis revient.
export function Magnetique({
  children,
  className = "",
  amplitude = 14,
}: {
  children: ReactNode;
  className?: string;
  amplitude?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Sur ecran tactile il n'y a pas de curseur a suivre.
    if (!window.matchMedia("(hover: hover)").matches) return;

    const suivre = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      element.style.transform = `translate3d(${x * amplitude}px, ${y * amplitude * 0.6}px, 0)`;
    };

    const relacher = () => {
      element.style.transform = "translate3d(0, 0, 0)";
    };

    element.addEventListener("mousemove", suivre);
    element.addEventListener("mouseleave", relacher);
    return () => {
      element.removeEventListener("mousemove", suivre);
      element.removeEventListener("mouseleave", relacher);
    };
  }, [amplitude]);

  return (
    <div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ transition: "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      {children}
    </div>
  );
}

// Compteur qui monte quand il devient visible. Utilise pour les chiffres cles.
export function Compteur({
  valeur,
  suffixe = "",
  duree = 1400,
  className = "",
  style,
}: {
  valeur: number;
  suffixe?: string;
  duree?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [affiche, setAffiche] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAffiche(valeur);
      return;
    }

    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (!entree.isIntersecting) return;
        observateur.disconnect();

        const debut = performance.now();
        const avancer = (maintenant: number) => {
          const t = Math.min(1, (maintenant - debut) / duree);
          // Sortie amortie : rapide au debut, pose a l'arrivee.
          setAffiche(Math.round(valeur * (1 - Math.pow(1 - t, 3))));
          if (t < 1) requestAnimationFrame(avancer);
        };
        requestAnimationFrame(avancer);
      },
      { threshold: 0.4 },
    );

    observateur.observe(element);
    return () => observateur.disconnect();
  }, [valeur, duree]);

  return (
    <span ref={ref} className={className} style={style}>
      {affiche}
      {suffixe}
    </span>
  );
}

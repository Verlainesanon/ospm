"use client";

import { useRef, type ReactNode } from "react";

// L'element s'incline vers le curseur, comme une plaque qu'on souleve pour la
// regarder en lumiere rasante. Le calcul se fait sur la position relative du
// pointeur dans l'element ; on relache au depart du curseur.
//
// Rien ne tourne en fond : l'effet ne repond qu'au geste.
export function Plaque3D({
  children,
  className = "",
  amplitude = 7,
}: {
  children: ReactNode;
  className?: string;
  amplitude?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const survoler = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = element.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    element.style.transform = `perspective(900px) rotateY(${x * amplitude}deg) rotateX(${-y * amplitude}deg) scale(1.02)`;
  };

  const relacher = () => {
    const element = ref.current;
    if (element) element.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={survoler}
      onMouseLeave={relacher}
      className={className}
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 420ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}

"use client";

// Sceau d'atelier : le badge circulaire de la maquette de reference, retire
// dans les encres de la maison. Deux anneaux concentriques et les initiales —
// c'est un tampon d'imprimeur, pas une pastille decorative.
//
// Le voyant se rallume toutes les dix secondes : le temoin d'une presse sous
// tension. Assez espace pour ne jamais tirer l'oeil pendant la lecture, assez
// regulier pour qu'on sente que l'atelier tourne.
export function SceauAtelier({
  initiales = "OSPM",
  className = "",
}: {
  initiales?: string;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[3px] border-encre bg-creme ${className}`}
    >
      <span className="flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-full border-2 border-plomb-noir/70">
        <span className="font-display text-[1.35rem] tracking-[0.02em] text-plomb-noir">
          {initiales}
        </span>
      </span>

      {/* Temoin de presse : magenta, il bat toutes les dix secondes. */}
      <span
        aria-hidden
        className="voyant-presse absolute right-1 top-1 h-3 w-3 rounded-full bg-rouge"
      />
    </span>
  );
}

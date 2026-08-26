// Visuel d'illustration par atelier. Les fichiers vivent dans public/visuels
// et se remplacent par de vraies photos sans toucher au code.
const PAR_SLUG: Record<string, string> = {
  informatique: "/visuels/informatique.svg",
  "graphic-design-impression": "/visuels/impression.svg",
  serigraphie: "/visuels/serigraphie.svg",
  photographie: "/visuels/photographie.svg",
  papeterie: "/visuels/papeterie.svg",
};

export const VISUEL_DEFAUT = "/visuels/badges.svg";

export function visuelAtelier(slug: string): string {
  return PAR_SLUG[slug] ?? VISUEL_DEFAUT;
}

// Utilise quand la galerie est encore vide : on montre le savoir-faire sans
// faire passer une composition pour une photo de realisation.
export const VISUELS_ATELIER = [
  { titre: "Badges et cartes PVC", image: "/visuels/badges.svg" },
  { titre: "Serigraphie textile", image: "/visuels/serigraphie.svg" },
  { titre: "Impression grand format", image: "/visuels/impression.svg" },
  { titre: "Studio photo", image: "/visuels/photographie.svg" },
  { titre: "Reseaux et maintenance", image: "/visuels/informatique.svg" },
  { titre: "Papeterie", image: "/visuels/papeterie.svg" },
];

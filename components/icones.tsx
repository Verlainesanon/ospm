import type { SVGProps } from "react";

// Jeu d'icones dessine pour l'atelier plutot qu'importe d'une librairie :
// aucune dependance, et chaque trace designe un vrai poste de travail. Toutes
// sont sur une grille de 24, en trait de 1.75 qui prend la couleur du texte —
// elles suivent donc le theme sans aucune regle supplementaire.

type Props = SVGProps<SVGSVGElement> & { taille?: number };

function Base({ taille = 18, children, ...props }: Props & { children: React.ReactNode }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

// WhatsApp : le combine est plein, pas en trait — c'est une marque, on la
// laisse reconnaissable au premier coup d'oeil.
export function IconeWhatsApp({ taille = 18, ...props }: Props) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
      {...props}
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.12-.14.16-.24.25-.41.08-.16.04-.3-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14 0-.3-.02-.46-.02-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

// --- Ateliers, d'apres le champ `icone` de la base -----------------------

export function IconeLaptop(p: Props) {
  // Informatique : un poste, un reseau.
  return (
    <Base {...p}>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M2 20h20" />
      <path d="M10 16h4" />
    </Base>
  );
}

export function IconePalette(p: Props) {
  // Graphic design et impression : la palette et ses encres.
  return (
    <Base {...p}>
      <path d="M12 3a9 9 0 1 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1-.24-.27-.39-.62-.39-1 0-.83.67-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.42-4.03-8-9-8Z" />
      <circle cx="7.5" cy="11.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="9" r="1.1" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function IconeShirt(p: Props) {
  // Serigraphie : le textile, support roi de l'atelier.
  return (
    <Base {...p}>
      <path d="M8.5 3 4 5.5 5.5 10l2-.7V21h9V9.3l2 .7L20 5.5 15.5 3a3.5 3.5 0 0 1-7 0Z" />
    </Base>
  );
}

export function IconeCamera(p: Props) {
  return (
    <Base {...p}>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.3-2h7l1.3 2h2.2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" />
      <circle cx="12" cy="13" r="3.5" />
    </Base>
  );
}

export function IconeFolder(p: Props) {
  // Papeterie : la rame de papier, feuilles empilees.
  return (
    <Base {...p}>
      <path d="M5 4h9l2 2.5V20H5z" />
      <path d="M8 9h6M8 13h6M8 17h4" />
    </Base>
  );
}

// --- Navigation -----------------------------------------------------------

export function IconeServices(p: Props) {
  // Une presse : le plateau et sa barre.
  return (
    <Base {...p}>
      <rect x="5" y="3" width="14" height="5" rx="1" />
      <path d="M3 8h18v7H3z" />
      <rect x="7" y="15" width="10" height="6" rx="1" />
    </Base>
  );
}

export function IconeGalerie(p: Props) {
  return (
    <Base {...p}>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <circle cx="8.5" cy="9" r="1.6" />
      <path d="m3 16 5-4 4 3 3-2.5L21 17" />
    </Base>
  );
}

export function IconeBoutique(p: Props) {
  return (
    <Base {...p}>
      <path d="M3 4h2l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h7.9a1.5 1.5 0 0 0 1.5-1.2L20 8H6" />
      <circle cx="9.5" cy="19.5" r="1.4" />
      <circle cx="17" cy="19.5" r="1.4" />
    </Base>
  );
}

export function IconeContact(p: Props) {
  // Le reperage sur la carte : 60, Rue Dessalines.
  return (
    <Base {...p}>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </Base>
  );
}

export function IconeCourriel(p: Props) {
  return (
    <Base {...p}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </Base>
  );
}

export function IconeDevis(p: Props) {
  return (
    <Base {...p}>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 16h4" />
    </Base>
  );
}

// Fait le lien entre le champ `icone` de la base et le trace correspondant.
// Un atelier ajoute depuis l'admin sans icone connue retombe sur la presse.
const PAR_NOM: Record<string, (p: Props) => JSX.Element> = {
  laptop: IconeLaptop,
  palette: IconePalette,
  shirt: IconeShirt,
  camera: IconeCamera,
  folder: IconeFolder,
};

export function IconeAtelier({ nom, ...props }: Props & { nom: string }) {
  const Trace = PAR_NOM[nom] ?? IconeServices;
  return <Trace {...props} />;
}

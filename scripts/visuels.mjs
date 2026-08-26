/**
 * Genere les visuels d'atelier en SVG, aux couleurs OSPM.
 *
 * Ce sont des compositions abstraites, pas des fausses photos : quand les
 * vraies photos de l'atelier arrivent, elles remplacent ces fichiers.
 *
 *   node scripts/visuels.mjs
 */

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const DOSSIER = path.join(process.cwd(), "public", "visuels");

const ENCRE = "#0B3A8F";
const ENCRE_VIF = "#1B5CE0";
const ROUGE = "#D62027";
const CREME = "#FAF7F0";
const CYAN = "#00AEEF";
const MAGENTA = "#EC008C";
const JAUNE = "#FFF200";

// Grain leger, applique a chaque visuel : sans lui, les aplats font plastique.
const GRAIN = `
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.055"/></feComponentTransfer>
  </filter>`;

function envelopper(contenu, largeur = 1200, hauteur = 900) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largeur} ${hauteur}" width="${largeur}" height="${hauteur}" role="img">
  <defs>${GRAIN}</defs>
  ${contenu}
  <rect width="${largeur}" height="${hauteur}" filter="url(#grain)" opacity="0.5"/>
</svg>`;
}

// --- Un visuel par atelier ------------------------------------------------

const VISUELS = {
  // Badges : cartes empilees, une en survol, hologramme en degrade.
  badges: envelopper(`
    <rect width="1200" height="900" fill="${CREME}"/>
    <g transform="translate(600 450)">
      <g transform="rotate(-8) translate(-300 -190)">
        <rect width="600" height="380" rx="28" fill="${ENCRE}" opacity="0.12"/>
      </g>
      <g transform="rotate(-3) translate(-290 -175)">
        <rect width="580" height="360" rx="26" fill="#fff"/>
        <rect x="40" y="40" width="150" height="150" rx="12" fill="${ENCRE_VIF}" opacity="0.16"/>
        <rect x="220" y="52" width="300" height="22" rx="11" fill="${ENCRE}"/>
        <rect x="220" y="94" width="210" height="16" rx="8" fill="${ENCRE}" opacity="0.35"/>
        <rect x="40" y="230" width="480" height="12" rx="6" fill="${ENCRE}" opacity="0.15"/>
        <rect x="40" y="262" width="360" height="12" rx="6" fill="${ENCRE}" opacity="0.15"/>
        <rect x="40" y="300" width="480" height="20" rx="10" fill="${ROUGE}" opacity="0.85"/>
      </g>
      <g transform="rotate(6) translate(-120 -320)">
        <rect width="240" height="150" rx="18" fill="url(#holo)"/>
      </g>
    </g>
    <defs>
      <linearGradient id="holo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${CYAN}"/>
        <stop offset="45%" stop-color="${MAGENTA}"/>
        <stop offset="100%" stop-color="${JAUNE}"/>
      </linearGradient>
    </defs>`),

  // Serigraphie : raclette et aplats textiles superposes hors repere.
  serigraphie: envelopper(`
    <rect width="1200" height="900" fill="${ENCRE}"/>
    <g opacity="0.9">
      <circle cx="470" cy="420" r="240" fill="${CYAN}" opacity="0.55"/>
      <circle cx="620" cy="470" r="240" fill="${MAGENTA}" opacity="0.5"/>
      <circle cx="560" cy="330" r="240" fill="${JAUNE}" opacity="0.45"/>
    </g>
    <rect x="120" y="700" width="960" height="34" rx="17" fill="${CREME}" opacity="0.9"/>
    <rect x="120" y="748" width="620" height="18" rx="9" fill="${CREME}" opacity="0.4"/>
    <g transform="translate(820 180) rotate(14)">
      <rect width="280" height="26" rx="13" fill="${ROUGE}"/>
      <rect y="44" width="180" height="26" rx="13" fill="${CREME}" opacity="0.7"/>
    </g>`),

  // Impression grand format : rouleau de papier qui sort en biais.
  impression: envelopper(`
    <rect width="1200" height="900" fill="${CREME}"/>
    <g transform="translate(0 60)">
      <path d="M120 720 L520 120 L1080 120 L680 720 Z" fill="#fff"/>
      <path d="M120 720 L520 120 L1080 120 L680 720 Z" fill="none" stroke="${ENCRE}" stroke-opacity="0.12"/>
      <path d="M300 520 L620 220 L940 220 L620 520 Z" fill="${ENCRE_VIF}" opacity="0.15"/>
      <rect x="360" y="470" width="300" height="18" rx="9" fill="${ENCRE}" opacity="0.5" transform="rotate(-36 360 470)"/>
      <rect x="430" y="520" width="220" height="18" rx="9" fill="${ROUGE}" opacity="0.75" transform="rotate(-36 430 520)"/>
    </g>
    <g>
      <rect x="60" y="740" width="1080" height="12" rx="6" fill="${CYAN}" opacity="0.8"/>
      <rect x="60" y="764" width="1080" height="12" rx="6" fill="${MAGENTA}" opacity="0.8"/>
      <rect x="60" y="788" width="1080" height="12" rx="6" fill="${JAUNE}" opacity="0.9"/>
      <rect x="60" y="812" width="1080" height="12" rx="6" fill="${ENCRE}" opacity="0.9"/>
    </g>`),

  // Photographie : ouverture d'objectif en lamelles.
  photographie: envelopper(`
    <rect width="1200" height="900" fill="${ENCRE}"/>
    <g transform="translate(600 450)">
      ${Array.from({ length: 8 }, (_, i) => {
        const angle = (360 / 8) * i;
        const teinte = i % 3 === 0 ? ENCRE_VIF : i % 3 === 1 ? "#0E4BB8" : "#123E96";
        return `<path transform="rotate(${angle})" d="M0 -300 L170 -230 L60 -60 Z" fill="${teinte}" opacity="0.85"/>`;
      }).join("\n      ")}
      <circle r="72" fill="${CREME}"/>
      <circle r="42" fill="${ROUGE}"/>
    </g>
    <rect x="120" y="120" width="120" height="6" rx="3" fill="${CREME}" opacity="0.6"/>
    <rect x="120" y="120" width="6" height="120" rx="3" fill="${CREME}" opacity="0.6"/>
    <rect x="960" y="774" width="120" height="6" rx="3" fill="${CREME}" opacity="0.6"/>
    <rect x="1074" y="660" width="6" height="120" rx="3" fill="${CREME}" opacity="0.6"/>`),

  // Informatique : reseau de noeuds relies, sobre.
  informatique: envelopper(`
    <rect width="1200" height="900" fill="${CREME}"/>
    <g stroke="${ENCRE}" stroke-opacity="0.22" stroke-width="2" fill="none">
      <path d="M240 240 L600 420 L960 240"/>
      <path d="M240 660 L600 420 L960 660"/>
      <path d="M240 240 L240 660"/>
      <path d="M960 240 L960 660"/>
      <path d="M600 420 L600 700"/>
    </g>
    ${[
      [240, 240, ENCRE],
      [960, 240, ENCRE],
      [240, 660, ENCRE],
      [960, 660, ENCRE],
      [600, 700, ROUGE],
    ]
      .map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="26" fill="${c}"/>`)
      .join("\n    ")}
    <circle cx="600" cy="420" r="58" fill="${ENCRE_VIF}"/>
    <circle cx="600" cy="420" r="90" fill="none" stroke="${ENCRE_VIF}" stroke-opacity="0.3" stroke-width="2"/>
    <circle cx="600" cy="420" r="130" fill="none" stroke="${ENCRE_VIF}" stroke-opacity="0.15" stroke-width="2"/>`),

  // Papeterie : feuilles empilees en escalier.
  papeterie: envelopper(`
    <rect width="1200" height="900" fill="${CREME}"/>
    ${Array.from({ length: 6 }, (_, i) => {
      const decalage = i * 26;
      const opacite = 0.14 + i * 0.14;
      return `<rect x="${300 + decalage}" y="${200 + decalage}" width="520" height="440" rx="16" fill="#fff" opacity="${Math.min(1, opacite)}" stroke="${ENCRE}" stroke-opacity="0.08"/>`;
    }).join("\n    ")}
    <g transform="translate(430 340)">
      <rect width="360" height="16" rx="8" fill="${ENCRE}" opacity="0.5"/>
      <rect y="46" width="280" height="12" rx="6" fill="${ENCRE}" opacity="0.22"/>
      <rect y="82" width="320" height="12" rx="6" fill="${ENCRE}" opacity="0.22"/>
      <rect y="118" width="200" height="12" rx="6" fill="${ENCRE}" opacity="0.22"/>
      <rect y="180" width="150" height="26" rx="13" fill="${ROUGE}"/>
    </g>`),
};

await mkdir(DOSSIER, { recursive: true });
for (const [nom, contenu] of Object.entries(VISUELS)) {
  await writeFile(path.join(DOSSIER, `${nom}.svg`), contenu, "utf8");
  console.log(`visuels/${nom}.svg`);
}

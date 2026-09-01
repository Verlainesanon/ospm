// Verifie que la lanterne est visible dans tous les cas de figure :
// les deux themes, plusieurs largeurs, avec et sans WebGL, mouvement reduit.
// Un effet qui disparait selon la machine est un effet qu'on croit absent.

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SORTIE = process.argv[2] ?? "captures-lanterne";

const CAS = [
  { nom: "sombre-1440", theme: "dark", largeur: 1440, mouvement: "no-preference" },
  { nom: "sombre-900", theme: "dark", largeur: 900, mouvement: "no-preference" },
  { nom: "clair-1440", theme: "light", largeur: 1440, mouvement: "no-preference" },
  { nom: "clair-900", theme: "light", largeur: 900, mouvement: "no-preference" },
  { nom: "sombre-reduit", theme: "dark", largeur: 1440, mouvement: "reduce" },
  { nom: "sombre-mobile", theme: "dark", largeur: 390, mouvement: "no-preference" },
];

const navigateur = await chromium.launch(
  process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {},
);
await mkdir(SORTIE, { recursive: true });

for (const cas of CAS) {
  const contexte = await navigateur.newContext({
    viewport: { width: cas.largeur, height: 900 },
    reducedMotion: cas.mouvement === "reduce" ? "reduce" : "no-preference",
  });
  await contexte.addInitScript((t) => {
    try {
      localStorage.setItem("ospm-theme", t);
      sessionStorage.setItem("ospm_deja_vu", "1");
    } catch {}
  }, cas.theme);

  const page = await contexte.newPage();
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1800);

  const etat = await page.evaluate(() => {
    const canvasWebgl = document.querySelector("canvas:not([class*='pointer-events'])");
    const repli = document.querySelector(".lanterne-repli");
    const enveloppe = (repli ?? canvasWebgl)?.closest("[aria-hidden]");
    const cs = enveloppe ? getComputedStyle(enveloppe) : null;
    return {
      rendu: repli ? "repli CSS" : canvasWebgl ? "WebGL" : "AUCUN",
      fusion: cs?.mixBlendMode ?? null,
      opacite: cs?.opacity ?? null,
    };
  });

  await page.screenshot({ path: path.join(SORTIE, `${cas.nom}.png`) });
  const alerte = etat.rendu === "AUCUN" ? "  <-- RIEN AFFICHE" : "";
  console.log(
    `${cas.nom.padEnd(15)} ${etat.rendu.padEnd(10)} fusion=${String(etat.fusion).padEnd(11)} opacite=${etat.opacite}${alerte}`,
  );

  await contexte.close();
}

await navigateur.close();

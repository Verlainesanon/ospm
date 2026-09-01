// Verifie qu'un titre ne deborde jamais de son conteneur, a plusieurs largeurs.
// Un titre coupe se voit tout de suite ; un titre qui deborde de deux pixels
// sur un telephone precis, non — d'ou cette mesure automatique.

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SORTIE = process.argv[2] ?? "captures-largeurs";
const route = process.argv[3] ?? "/";
const LARGEURS = [360, 414, 768, 1024, 1440, 1920];

const navigateur = await chromium.launch(
  process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {},
);
const contexte = await navigateur.newContext();
await contexte.addInitScript(() => {
  try {
    localStorage.setItem("ospm-theme", "dark");
    sessionStorage.setItem("ospm_deja_vu", "1");
  } catch {}
});
const page = await contexte.newPage();
await mkdir(SORTIE, { recursive: true });

for (const largeur of LARGEURS) {
  await page.setViewportSize({ width: largeur, height: 900 });
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1600);

  const mesure = await page.evaluate(() => {
    const debordements = [];
    // Un debordement horizontal du document est le symptome le plus sur.
    const large = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    for (const el of document.querySelectorAll("h1, h2, h3, .btn, [class*='text-']")) {
      if (el.scrollWidth > el.clientWidth + 2) {
        debordements.push({
          balise: el.tagName.toLowerCase(),
          texte: (el.textContent || "").trim().slice(0, 40),
          visible: el.clientWidth,
          reel: el.scrollWidth,
        });
      }
    }
    return { pageDeborde: large, debordements: debordements.slice(0, 6) };
  });

  await page.screenshot({ path: path.join(SORTIE, `${largeur}.png`) });
  const etat = mesure.pageDeborde ? "PAGE DEBORDE" : "ok";
  console.log(`${String(largeur).padStart(4)}px — ${etat} — ${mesure.debordements.length} element(s) coupe(s)`);
  for (const d of mesure.debordements) {
    console.log(`        ${d.balise} "${d.texte}" ${d.visible} < ${d.reel}`);
  }
}

await navigateur.close();

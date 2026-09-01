// Capture d'ecrans + audit de contraste, sur les deux themes.
//
// Deux raisons d'exister :
//  1. juger le rendu reel plutot que de livrer du code jamais regarde ;
//  2. trouver mecaniquement les elements devenus illisibles en mode sombre —
//     a la main, sur 32 ecrans x 2 themes, on en oublie forcement.
//
// Usage : node scripts/audit-visuel.mjs [dossier-de-sortie] [route ...]

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SORTIE = process.argv[2] ?? "captures";
const ROUTES_PAR_DEFAUT = [
  "/",
  "/services",
  "/galerie",
  "/boutique",
  "/devis",
  "/contact",
  "/connexion",
];
const routes = process.argv.length > 3 ? process.argv.slice(3) : ROUTES_PAR_DEFAUT;

// Seuils WCAG AA : 4.5 pour le texte courant, 3 pour le grand texte.
const SEUIL_NORMAL = 4.5;
const SEUIL_GRAND = 3;

// Injecte dans la page : parcourt les elements porteurs de texte et calcule le
// contraste reel entre la couleur du texte et le premier fond opaque derriere.
const AUDIT = () => {
  const canal = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const luminance = ([r, g, b]) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
  const lire = (s) => (s.match(/[\d.]+/g) ?? []).map(Number);

  // Le fond effectif : on remonte les parents jusqu'a trouver un aplat opaque.
  const fondEffectif = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const [r, g, b, a = 1] = lire(getComputedStyle(n).backgroundColor);
      if (a >= 0.85 && Number.isFinite(r)) return [r, g, b];
      n = n.parentElement;
    }
    const [r, g, b] = lire(getComputedStyle(document.body).backgroundColor);
    return Number.isFinite(r) ? [r, g, b] : [255, 255, 255];
  };

  const resultats = [];
  for (const el of document.querySelectorAll("body *")) {
    // Seulement les elements qui portent eux-memes du texte visible.
    const texte = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(" ")
      .trim();
    if (!texte) continue;

    const st = getComputedStyle(el);
    if (st.visibility === "hidden" || st.display === "none") continue;
    if (Number(st.opacity) < 0.1) continue;

    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;

    const [tr, tg, tb, ta = 1] = lire(st.color);
    if (!Number.isFinite(tr)) continue;
    if (ta < 0.1) continue;

    const fond = fondEffectif(el);
    // Le texte semi-transparent se melange au fond avant comparaison.
    const melange = [tr, tg, tb].map((c, i) => c * ta + fond[i] * (1 - ta));

    const l1 = luminance(melange);
    const l2 = luminance(fond);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    const taille = parseFloat(st.fontSize);
    const gras = Number(st.fontWeight) >= 700;
    const grand = taille >= 24 || (taille >= 18.66 && gras);
    const seuil = grand ? 3 : 4.5;

    if (ratio < seuil) {
      resultats.push({
        texte: texte.slice(0, 60),
        balise: el.tagName.toLowerCase(),
        classe: (el.className || "").toString().slice(0, 70),
        couleur: st.color,
        fond: `rgb(${fond.join(", ")})`,
        ratio: Number(ratio.toFixed(2)),
        seuil,
      });
    }
  }
  return resultats;
};

const defiler = async (page) => {
  await page.evaluate(async () => {
    const pas = 220;
    for (let y = 0; y <= document.body.scrollHeight; y += pas) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 900));
  });
};

// CHROME_BIN permet de reutiliser un Chromium deja present sur la machine
// plutot que d'attendre le telechargement de la version attendue par Playwright.
const navigateur = await chromium.launch(
  process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {},
);
const rapport = [];

for (const theme of ["dark", "light"]) {
  const contexte = await navigateur.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  // Le theme est lu depuis localStorage par le script inline du layout.
  await contexte.addInitScript((t) => {
    try {
      localStorage.setItem("ospm-theme", t);
      // On saute aussi le voile d'ouverture, sinon il masque la premiere capture.
      sessionStorage.setItem("ospm_deja_vu", "1");
    } catch {}
  }, theme);

  const page = await contexte.newPage();

  for (const route of routes) {
    const nom = route === "/" ? "accueil" : route.replace(/\//g, "-").replace(/^-/, "");
    const dossier = path.join(SORTIE, theme);
    await mkdir(dossier, { recursive: true });

    await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(1200);
    await defiler(page);

    await page.screenshot({ path: path.join(dossier, `${nom}-haut.png`) });
    await page.screenshot({ path: path.join(dossier, `${nom}-complet.png`), fullPage: true });

    const soucis = await page.evaluate(AUDIT);
    if (soucis.length) rapport.push({ theme, route, soucis });
    console.log(`${theme} ${route} — ${soucis.length} probleme(s) de contraste`);
  }

  await contexte.close();
}

await navigateur.close();
await writeFile(path.join(SORTIE, "contraste.json"), JSON.stringify(rapport, null, 2));
console.log(`\nRapport : ${path.join(SORTIE, "contraste.json")}`);
console.log(`Total : ${rapport.reduce((n, e) => n + e.soucis.length, 0)} probleme(s)`);

// Reproduit une vraie connexion administrateur, de bout en bout, et dit
// precisement ou ca casse. Plus fiable que de deviner a partir d'un ecran
// d'erreur, qui masque toujours la cause.

import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const EMAIL = process.argv[2] ?? "admin@ospm.ht";
const MDP = process.argv[3] ?? "admin123";

const navigateur = await chromium.launch(
  process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {},
);
const page = await navigateur.newPage({ viewport: { width: 1440, height: 900 } });

const erreurs = [];
page.on("pageerror", (e) => erreurs.push("PAGE: " + e.message.split("\n")[0]));
page.on("response", (r) => {
  if (r.status() >= 500) erreurs.push(`HTTP ${r.status()} ${r.url()}`);
});

console.log("1. Ouverture de /connexion");
const r1 = await page.goto(BASE + "/connexion", { waitUntil: "domcontentloaded" });
console.log(`   statut ${r1?.status()}`);

const titre = await page.locator("h1, h2").first().textContent().catch(() => null);
console.log(`   titre affiche : ${titre?.trim() ?? "(aucun)"}`);

// React doit avoir pris la main : avant l'hydratation, le clic declenche une
// soumission native que la server action n'intercepte pas.
await page.waitForTimeout(3000);

console.log("2. Saisie des identifiants");
await page.fill('input[name="email"]', EMAIL);
await page.fill('input[name="password"]', MDP);

console.log("3. Envoi du formulaire");
await page.click('button[type="submit"]');
await page.waitForTimeout(6000);

const url = page.url();
console.log(`   URL apres envoi : ${url.replace(BASE, "")}`);

const messageErreur = await page
  .locator("text=/erreur|invalide|injoignable/i")
  .first()
  .textContent()
  .catch(() => null);
if (messageErreur) console.log(`   message affiche : ${messageErreur.trim().slice(0, 90)}`);

if (url.includes("/admin")) {
  const h1 = await page.locator("h1").first().textContent().catch(() => null);
  console.log(`\nRESULTAT : connexion reussie — ecran « ${h1?.trim() ?? "?"} »`);
} else {
  console.log("\nRESULTAT : connexion echouee, toujours sur " + url.replace(BASE, ""));
}

if (erreurs.length) {
  console.log("\nErreurs relevees :");
  for (const e of [...new Set(erreurs)].slice(0, 6)) console.log("  " + e);
}

await navigateur.close();

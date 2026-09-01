// Capture le seul bas de page, dans les deux themes. Une capture pleine page
// reduit le pied a quelques pixels : pour le juger, il faut le cadrer.

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SORTIE = process.argv[2] ?? "captures-pied";
const route = process.argv[3] ?? "/";

const navigateur = await chromium.launch(
  process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {},
);

for (const theme of ["dark", "light"]) {
  const contexte = await navigateur.newContext({ viewport: { width: 1440, height: 900 } });
  await contexte.addInitScript((t) => {
    try {
      localStorage.setItem("ospm-theme", t);
      sessionStorage.setItem("ospm_deja_vu", "1");
    } catch {}
  }, theme);

  const page = await contexte.newPage();
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1400);

  await mkdir(SORTIE, { recursive: true });
  const pied = page.locator("footer").first();
  await pied.screenshot({ path: path.join(SORTIE, `pied-${theme}.png`) });
  console.log(`${theme} — pied capture`);

  await contexte.close();
}

await navigateur.close();

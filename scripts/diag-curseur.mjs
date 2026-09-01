// Verifie que la mire de calage et la lanterne sont bien montees et visibles.

import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const route = process.argv[2] ?? "/";

const navigateur = await chromium.launch(
  process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {},
);
const contexte = await navigateur.newContext({ viewport: { width: 1440, height: 900 } });
await contexte.addInitScript(() => {
  try {
    localStorage.setItem("ospm-theme", "dark");
    sessionStorage.setItem("ospm_deja_vu", "1");
  } catch {}
});
const page = await contexte.newPage();
page.on("pageerror", (e) => console.log("ERREUR PAGE:", e.message.split("\n")[0]));
page.on("console", (m) => {
  if (m.type() === "error") console.log("CONSOLE:", m.text().slice(0, 140));
});

await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000 });
await page.mouse.move(700, 450);
await page.waitForTimeout(1800);

const etat = await page.evaluate(() => {
  const coins = document.querySelectorAll(".target-cursor-corner");
  const canvas = [...document.querySelectorAll("canvas")];
  const cs = coins[0] ? getComputedStyle(coins[0]) : null;
  const conteneurCurseur = coins[0]?.parentElement;

  return {
    coins: coins.length,
    curseurVisible: cs ? cs.opacity !== "0" && cs.display !== "none" : false,
    couleurCoin: cs?.borderColor ?? null,
    positionConteneur: conteneurCurseur ? getComputedStyle(conteneurCurseur).position : null,
    curseurSysteme: getComputedStyle(document.body).cursor,
    canvas: canvas.map((c) => ({
      l: c.width,
      h: c.height,
      classe: (c.className || "").toString().slice(0, 40),
      parentPos: getComputedStyle(c.parentElement).position,
      opacite: getComputedStyle(c.parentElement).opacity,
      fusion: getComputedStyle(c.parentElement).mixBlendMode,
    })),
    // Le div de ClickSpark : h-full sur un parent sans hauteur donne 0.
    hauteurEnveloppe: (() => {
      const d = document.querySelector("body > div.relative.w-full");
      return d ? d.getBoundingClientRect().height : "absent";
    })(),
  };
});

console.log(JSON.stringify(etat, null, 2));
await navigateur.close();

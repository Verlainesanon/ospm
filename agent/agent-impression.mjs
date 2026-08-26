#!/usr/bin/env node
/**
 * Agent d'impression OSPM.
 *
 * Tourne sur le PC de la boutique. Toutes les 5 secondes, il demande au site
 * les tickets en attente et les envoie aux imprimantes thermiques :
 *   - cible "192.168.1.50:9100"  -> imprimante reseau (socket brut)
 *   - cible "\\\\PC\\TICKET" ou "USB001" -> file d'impression Windows
 *
 * Lancement :
 *   set OSPM_URL=http://localhost:3000
 *   set OSPM_AGENT_TOKEN=le-meme-jeton-que-le-serveur
 *   node agent/agent-impression.mjs
 */

import net from "node:net";
import { spawn } from "node:child_process";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

const URL_BASE = process.env.OSPM_URL ?? "http://localhost:3000";
const JETON = process.env.OSPM_AGENT_TOKEN ?? "";
const INTERVALLE = Number(process.env.OSPM_INTERVALLE ?? 5000);

// Commandes ESC/POS minimales : initialisation, coupe du papier.
const INIT = Buffer.from([0x1b, 0x40]);
const COUPE = Buffer.from([0x1d, 0x56, 0x42, 0x00]);

if (!JETON) {
  console.error("OSPM_AGENT_TOKEN manquant. Arret.");
  process.exit(1);
}

function entetes() {
  return { authorization: `Bearer ${JETON}`, "content-type": "application/json" };
}

async function recupererTravaux() {
  const reponse = await fetch(`${URL_BASE}/api/impression`, { headers: entetes() });
  if (!reponse.ok) throw new Error(`GET /api/impression : ${reponse.status}`);
  const donnees = await reponse.json();
  return donnees.jobs ?? [];
}

async function signaler(id, ok, erreur) {
  await fetch(`${URL_BASE}/api/impression`, {
    method: "POST",
    headers: entetes(),
    body: JSON.stringify({ id, ok, erreur }),
  });
}

function imprimerReseau(hote, port, contenu) {
  return new Promise((resoudre, rejeter) => {
    const socket = net.createConnection({ host: hote, port }, () => {
      socket.write(Buffer.concat([INIT, Buffer.from(contenu, "latin1"), COUPE]), () =>
        socket.end(),
      );
    });
    socket.setTimeout(8000);
    socket.on("timeout", () => socket.destroy(new Error("Delai depasse")));
    socket.on("close", resoudre);
    socket.on("error", rejeter);
  });
}

// Sur Windows, la file d'impression accepte un fichier brut copie vers le port.
function imprimerWindows(cible, contenu) {
  return new Promise(async (resoudre, rejeter) => {
    const fichier = path.join(tmpdir(), `ospm-${randomUUID()}.txt`);
    await writeFile(fichier, contenu, "latin1");

    const processus = spawn("cmd", ["/c", "copy", "/b", fichier, cible], { windowsHide: true });
    processus.on("close", async (code) => {
      await unlink(fichier).catch(() => {});
      code === 0 ? resoudre() : rejeter(new Error(`copy a renvoye ${code}`));
    });
    processus.on("error", rejeter);
  });
}

async function imprimer(job) {
  const cible = (job.imprimante?.cible ?? "").trim();
  if (!cible) throw new Error("Imprimante sans cible configuree");

  const contenu = `${job.texte}\n\n\n`;
  const reseau = cible.match(/^([\w.-]+):(\d+)$/);

  for (let copie = 0; copie < (job.copies || 1); copie++) {
    if (reseau) {
      await imprimerReseau(reseau[1], Number(reseau[2]), contenu);
    } else {
      await imprimerWindows(cible, contenu);
    }
  }
}

async function boucle() {
  try {
    const travaux = await recupererTravaux();
    for (const job of travaux) {
      try {
        await imprimer(job);
        await signaler(job.id, true);
        console.log(`Imprime : ${job.titre}`);
      } catch (e) {
        await signaler(job.id, false, String(e.message ?? e));
        console.error(`Echec : ${job.titre} - ${e.message ?? e}`);
      }
    }
  } catch (e) {
    console.error(`Agent : ${e.message ?? e}`);
  }
}

console.log(`Agent d'impression OSPM - ${URL_BASE} - toutes les ${INTERVALLE} ms`);
await boucle();
setInterval(boucle, INTERVALLE);

"use server";

import { prisma } from "@/lib/db";
import { donneesFacture, ticketTexte } from "@/lib/print";
import { exigerAcces, journaliser, rafraichir } from "../actions";

export async function creerImprimante(form: FormData) {
  await exigerAcces("impression");
  const nom = String(form.get("nom") ?? "").trim();
  if (!nom) return;

  const parDefaut = form.get("parDefaut") === "on";
  if (parDefaut) {
    await prisma.printer.updateMany({ data: { parDefaut: false } });
  }

  await prisma.printer.create({
    data: {
      nom,
      transport: String(form.get("transport") ?? "BROWSER"),
      cible: String(form.get("cible") ?? ""),
      largeurMm: Number(form.get("largeurMm") ?? 80),
      equipmentId: String(form.get("equipmentId") ?? "") || null,
      parDefaut,
    },
  });
  await journaliser("creation", "Printer", undefined, nom);
  rafraichir("/admin/impression");
}

export async function modifierImprimante(form: FormData) {
  await exigerAcces("impression");
  const id = String(form.get("id"));
  const parDefaut = form.get("parDefaut") === "on";

  if (parDefaut) {
    await prisma.printer.updateMany({ data: { parDefaut: false } });
  }

  await prisma.printer.update({
    where: { id },
    data: {
      nom: String(form.get("nom") ?? ""),
      transport: String(form.get("transport") ?? "BROWSER"),
      cible: String(form.get("cible") ?? ""),
      largeurMm: Number(form.get("largeurMm") ?? 80),
      actif: form.get("actif") === "on",
      parDefaut,
    },
  });
  rafraichir("/admin/impression");
}

export async function supprimerImprimante(form: FormData) {
  await exigerAcces("impression");
  await prisma.printer.delete({ where: { id: String(form.get("id")) } });
  rafraichir("/admin/impression");
}

export async function modifierGabarit(form: FormData) {
  await exigerAcces("impression");
  const id = String(form.get("id"));

  await prisma.printTemplate.update({
    where: { id },
    data: {
      nom: String(form.get("nom") ?? ""),
      html: String(form.get("html") ?? ""),
      css: String(form.get("css") ?? ""),
      largeurMm: Number(form.get("largeurMm") ?? 210),
      hauteurMm: Number(form.get("hauteurMm") ?? 297),
      actif: form.get("actif") === "on",
    },
  });
  await journaliser("modification", "PrintTemplate", id);
  rafraichir("/admin/impression");
}

// Met un ticket dans la file : l'agent local le recupere et l'imprime.
export async function envoyerTicket(form: FormData) {
  const session = await exigerAcces("impression");
  const invoiceId = String(form.get("invoiceId") ?? "");
  const printerId = String(form.get("printerId") ?? "");
  if (!invoiceId || !printerId) return;

  const donnees = await donneesFacture(invoiceId);
  if (!donnees) return;

  const lignes = donnees.valeurs.lignesTicket
    .split("</p>")
    .map((l) => l.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);

  await prisma.printJob.create({
    data: {
      printerId,
      titre: `${donnees.facture.type} ${donnees.facture.numero}`,
      payload: JSON.stringify({ invoiceId }),
      rendu: ticketTexte(donnees.valeurs, lignes),
      copies: Number(form.get("copies") ?? 1),
      userId: session.userId,
    },
  });

  await journaliser("impression", "Invoice", invoiceId, "ticket envoye a l'agent local");
  rafraichir("/admin/impression");
}

export async function relancerJob(form: FormData) {
  await exigerAcces("impression");
  await prisma.printJob.update({
    where: { id: String(form.get("id")) },
    data: { statut: "EN_ATTENTE", erreur: null },
  });
  rafraichir("/admin/impression");
}

export async function supprimerJob(form: FormData) {
  await exigerAcces("impression");
  await prisma.printJob.delete({ where: { id: String(form.get("id")) } });
  rafraichir("/admin/impression");
}

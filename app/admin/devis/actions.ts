"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { nextNumero } from "@/lib/numbering";
import { toNumber } from "@/lib/money";
import { exigerAcces, journaliser, rafraichir } from "../actions";

async function recalculerTotal(quoteId: string) {
  const items = await prisma.quoteItem.findMany({ where: { quoteId } });
  const total = items.reduce((s, i) => s + i.quantite * toNumber(i.prixUnitaire), 0);
  await prisma.quote.update({ where: { id: quoteId }, data: { total } });
  return total;
}

export async function changerStatutDevis(form: FormData) {
  await exigerAcces("devis");
  const id = String(form.get("id"));
  const statut = String(form.get("statut"));

  await prisma.quote.update({ where: { id }, data: { statut } });
  await journaliser("statut", "Quote", id, statut);
  rafraichir("/admin/devis", `/admin/devis/${id}`);
}

export async function ajouterLigneDevis(form: FormData) {
  await exigerAcces("devis");
  const quoteId = String(form.get("quoteId"));

  await prisma.quoteItem.create({
    data: {
      quoteId,
      designation: String(form.get("designation") ?? "Ligne"),
      details: String(form.get("details") ?? ""),
      quantite: Number(form.get("quantite") ?? 1),
      prixUnitaire: Number(form.get("prixUnitaire") ?? 0),
    },
  });
  await recalculerTotal(quoteId);
  rafraichir(`/admin/devis/${quoteId}`);
}

export async function modifierLigneDevis(form: FormData) {
  await exigerAcces("devis");
  const id = String(form.get("id"));
  const quoteId = String(form.get("quoteId"));

  await prisma.quoteItem.update({
    where: { id },
    data: {
      designation: String(form.get("designation") ?? ""),
      quantite: Number(form.get("quantite") ?? 1),
      prixUnitaire: Number(form.get("prixUnitaire") ?? 0),
    },
  });
  await recalculerTotal(quoteId);
  rafraichir(`/admin/devis/${quoteId}`);
}

export async function supprimerLigneDevis(form: FormData) {
  await exigerAcces("devis");
  const id = String(form.get("id"));
  const quoteId = String(form.get("quoteId"));

  await prisma.quoteItem.delete({ where: { id } });
  await recalculerTotal(quoteId);
  rafraichir(`/admin/devis/${quoteId}`);
}

// Transforme un devis accepte en commande : meme client, memes lignes.
export async function convertirEnCommande(form: FormData) {
  const session = await exigerAcces("commandes");
  const id = String(form.get("id"));

  const devis = await prisma.quote.findUnique({
    where: { id },
    include: { items: true, order: true },
  });
  // Un devis deja converti garde sa commande : on ne la duplique pas.
  if (!devis || devis.order) return;

  const sousTotal = devis.items.reduce((s, i) => s + i.quantite * toNumber(i.prixUnitaire), 0);
  const numero = await nextNumero("CMD");

  const commande = await prisma.order.create({
    data: {
      numero,
      quoteId: devis.id,
      customerId: devis.customerId,
      nomContact: devis.nomContact,
      telephone: devis.telephone,
      email: devis.email,
      origine: "SITE",
      devise: devis.devise,
      sousTotal,
      total: sousTotal,
      items: {
        create: devis.items.map((i) => ({
          serviceId: i.serviceId,
          designation: i.designation,
          details: i.details,
          quantite: i.quantite,
          prixUnitaire: i.prixUnitaire,
        })),
      },
      historique: { create: { nouveau: "NOUVELLE", parQui: session.nom } },
    },
  });

  await prisma.quote.update({ where: { id }, data: { statut: "ACCEPTE" } });
  await journaliser("conversion", "Quote", id, `-> commande ${numero}`);

  redirect(`/admin/commandes/${commande.id}`);
}

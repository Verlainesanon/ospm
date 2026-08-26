"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { nextNumero } from "@/lib/numbering";
import { toNumber } from "@/lib/money";
import { exigerAcces, journaliser, rafraichir } from "../actions";

async function recalculerTotal(orderId: string) {
  const commande = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!commande) return;

  const sousTotal = commande.items.reduce((s, i) => s + i.quantite * toNumber(i.prixUnitaire), 0);
  await prisma.order.update({
    where: { id: orderId },
    data: { sousTotal, total: Math.max(0, sousTotal - toNumber(commande.remise)) },
  });
}

export async function changerStatutCommande(form: FormData) {
  const session = await exigerAcces("commandes");
  const id = String(form.get("id"));
  const nouveau = String(form.get("statut"));

  const commande = await prisma.order.findUnique({ where: { id } });
  if (!commande || commande.statut === nouveau) return;

  await prisma.$transaction([
    prisma.order.update({ where: { id }, data: { statut: nouveau } }),
    prisma.orderStatusLog.create({
      data: { orderId: id, ancien: commande.statut, nouveau, parQui: session.nom },
    }),
  ]);

  await journaliser("statut", "Order", id, `${commande.statut} -> ${nouveau}`);
  rafraichir("/admin/commandes", `/admin/commandes/${id}`, "/admin");
}

export async function modifierCommande(form: FormData) {
  await exigerAcces("commandes");
  const id = String(form.get("id"));
  const dateLivraison = String(form.get("dateLivraison") ?? "");
  const assigneId = String(form.get("assigneId") ?? "");

  await prisma.order.update({
    where: { id },
    data: {
      priorite: String(form.get("priorite") ?? "NORMALE"),
      dateLivraison: dateLivraison ? new Date(dateLivraison) : null,
      assigneId: assigneId || null,
      remise: Number(form.get("remise") ?? 0),
      notes: String(form.get("notes") ?? ""),
    },
  });
  await recalculerTotal(id);
  rafraichir(`/admin/commandes/${id}`);
}

export async function ajouterLigneCommande(form: FormData) {
  await exigerAcces("commandes");
  const orderId = String(form.get("orderId"));

  await prisma.orderItem.create({
    data: {
      orderId,
      designation: String(form.get("designation") ?? "Ligne"),
      details: String(form.get("details") ?? ""),
      quantite: Number(form.get("quantite") ?? 1),
      prixUnitaire: Number(form.get("prixUnitaire") ?? 0),
    },
  });
  await recalculerTotal(orderId);
  rafraichir(`/admin/commandes/${orderId}`);
}

export async function modifierLigneCommande(form: FormData) {
  await exigerAcces("commandes");
  const id = String(form.get("id"));
  const orderId = String(form.get("orderId"));

  await prisma.orderItem.update({
    where: { id },
    data: {
      designation: String(form.get("designation") ?? ""),
      quantite: Number(form.get("quantite") ?? 1),
      prixUnitaire: Number(form.get("prixUnitaire") ?? 0),
    },
  });
  await recalculerTotal(orderId);
  rafraichir(`/admin/commandes/${orderId}`);
}

export async function supprimerLigneCommande(form: FormData) {
  await exigerAcces("commandes");
  const id = String(form.get("id"));
  const orderId = String(form.get("orderId"));

  await prisma.orderItem.delete({ where: { id } });
  await recalculerTotal(orderId);
  rafraichir(`/admin/commandes/${orderId}`);
}

export async function creerCommandeComptoir(form: FormData) {
  const session = await exigerAcces("commandes");
  const nomContact = String(form.get("nomContact") ?? "").trim();
  if (!nomContact) return;

  const numero = await nextNumero("CMD");
  const commande = await prisma.order.create({
    data: {
      numero,
      nomContact,
      telephone: String(form.get("telephone") ?? "") || null,
      origine: "BOUTIQUE",
      statut: "CONFIRMEE",
      historique: { create: { nouveau: "CONFIRMEE", parQui: session.nom } },
    },
  });

  await journaliser("creation", "Order", commande.id, numero);
  redirect(`/admin/commandes/${commande.id}`);
}

// Genere la facture correspondant a la commande, lignes comprises.
export async function facturerCommande(form: FormData) {
  await exigerAcces("finance");
  const id = String(form.get("id"));
  const type = String(form.get("type") ?? "FACTURE");

  const commande = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!commande) return;

  const numero = await nextNumero(type === "PROFORMA" ? "PRO" : "FAC");
  const sousTotal = commande.items.reduce((s, i) => s + i.quantite * toNumber(i.prixUnitaire), 0);
  const remise = toNumber(commande.remise);

  const facture = await prisma.invoice.create({
    data: {
      numero,
      type,
      statut: "EMISE",
      orderId: commande.id,
      customerId: commande.customerId,
      nomClient: commande.nomContact,
      devise: commande.devise,
      sousTotal,
      remise,
      total: Math.max(0, sousTotal - remise),
      items: {
        create: commande.items.map((i) => ({
          designation: i.designation,
          details: i.details,
          quantite: i.quantite,
          prixUnitaire: i.prixUnitaire,
        })),
      },
    },
  });

  await journaliser("creation", "Invoice", facture.id, `${numero} depuis ${commande.numero}`);
  redirect(`/admin/factures/${facture.id}`);
}

"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { nextNumero } from "@/lib/numbering";
import { toNumber } from "@/lib/money";
import { exigerAcces, journaliser, rafraichir } from "../actions";

// Recalcule les totaux et fait suivre le statut : impayee, partielle, payee.
async function recalculerFacture(invoiceId: string) {
  const facture = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { items: true, paiements: true },
  });
  if (!facture) return;

  const sousTotal = facture.items.reduce((s, i) => s + i.quantite * toNumber(i.prixUnitaire), 0);
  const total = Math.max(0, sousTotal - toNumber(facture.remise) + toNumber(facture.taxe));
  const montantPaye = facture.paiements.reduce((s, p) => s + toNumber(p.montant), 0);

  let statut = facture.statut;
  if (statut !== "ANNULEE" && statut !== "BROUILLON") {
    statut = montantPaye <= 0 ? "EMISE" : montantPaye + 0.009 < total ? "PARTIELLE" : "PAYEE";
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { sousTotal, total, montantPaye, statut },
  });
}

export async function creerFactureLibre(form: FormData) {
  await exigerAcces("finance");
  const nomClient = String(form.get("nomClient") ?? "").trim();
  if (!nomClient) return;

  const type = String(form.get("type") ?? "FACTURE");
  const numero = await nextNumero(type === "PROFORMA" ? "PRO" : type === "RECU" ? "REC" : "FAC");

  const facture = await prisma.invoice.create({
    data: {
      numero,
      type,
      statut: "BROUILLON",
      nomClient,
      customerId: String(form.get("customerId") ?? "") || null,
      devise: String(form.get("devise") ?? "HTG"),
    },
  });

  await journaliser("creation", "Invoice", facture.id, numero);
  redirect(`/admin/factures/${facture.id}`);
}

export async function modifierFacture(form: FormData) {
  await exigerAcces("finance");
  const id = String(form.get("id"));
  const echeance = String(form.get("dateEcheance") ?? "");

  await prisma.invoice.update({
    where: { id },
    data: {
      nomClient: String(form.get("nomClient") ?? ""),
      statut: String(form.get("statut") ?? "EMISE"),
      remise: Number(form.get("remise") ?? 0),
      taxe: Number(form.get("taxe") ?? 0),
      notes: String(form.get("notes") ?? ""),
      dateEcheance: echeance ? new Date(echeance) : null,
    },
  });
  await recalculerFacture(id);
  rafraichir("/admin/factures", `/admin/factures/${id}`);
}

export async function ajouterLigneFacture(form: FormData) {
  await exigerAcces("finance");
  const invoiceId = String(form.get("invoiceId"));

  await prisma.invoiceItem.create({
    data: {
      invoiceId,
      designation: String(form.get("designation") ?? "Ligne"),
      quantite: Number(form.get("quantite") ?? 1),
      prixUnitaire: Number(form.get("prixUnitaire") ?? 0),
    },
  });
  await recalculerFacture(invoiceId);
  rafraichir(`/admin/factures/${invoiceId}`);
}

export async function modifierLigneFacture(form: FormData) {
  await exigerAcces("finance");
  const id = String(form.get("id"));
  const invoiceId = String(form.get("invoiceId"));

  await prisma.invoiceItem.update({
    where: { id },
    data: {
      designation: String(form.get("designation") ?? ""),
      quantite: Number(form.get("quantite") ?? 1),
      prixUnitaire: Number(form.get("prixUnitaire") ?? 0),
    },
  });
  await recalculerFacture(invoiceId);
  rafraichir(`/admin/factures/${invoiceId}`);
}

export async function supprimerLigneFacture(form: FormData) {
  await exigerAcces("finance");
  const id = String(form.get("id"));
  const invoiceId = String(form.get("invoiceId"));

  await prisma.invoiceItem.delete({ where: { id } });
  await recalculerFacture(invoiceId);
  rafraichir(`/admin/factures/${invoiceId}`);
}

// Un paiement alimente aussi la caisse du jour : une seule saisie, deux effets.
export async function enregistrerPaiement(form: FormData) {
  const session = await exigerAcces("finance");
  const invoiceId = String(form.get("invoiceId"));
  const montant = Number(form.get("montant") ?? 0);
  if (montant <= 0) return;

  const facture = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!facture) return;

  const methode = String(form.get("methode") ?? "ESPECES");
  const sessionCaisse = await prisma.cashSession.findFirst({
    where: { fermeeLe: null },
    orderBy: { ouverteLe: "desc" },
  });

  const paiement = await prisma.payment.create({
    data: {
      invoiceId,
      montant,
      devise: facture.devise,
      methode,
      reference: String(form.get("reference") ?? "") || null,
    },
  });

  await prisma.cashMovement.create({
    data: {
      sens: "ENTREE",
      montant,
      devise: facture.devise,
      motif: `Paiement ${facture.numero}`,
      paymentId: paiement.id,
      sessionId: sessionCaisse?.id ?? null,
      userId: session.userId,
    },
  });

  await recalculerFacture(invoiceId);
  await journaliser("paiement", "Invoice", invoiceId, `${montant} ${facture.devise} - ${methode}`);
  rafraichir(`/admin/factures/${invoiceId}`, "/admin/caisse", "/admin");
}

export async function supprimerPaiement(form: FormData) {
  await exigerAcces("finance");
  const id = String(form.get("id"));
  const invoiceId = String(form.get("invoiceId"));

  await prisma.cashMovement.deleteMany({ where: { paymentId: id } });
  await prisma.payment.delete({ where: { id } });
  await recalculerFacture(invoiceId);
  rafraichir(`/admin/factures/${invoiceId}`, "/admin/caisse");
}

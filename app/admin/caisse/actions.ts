"use server";

import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/money";
import { exigerAcces, journaliser, rafraichir } from "../actions";

export async function ouvrirCaisse(form: FormData) {
  const session = await exigerAcces("finance");

  const ouverte = await prisma.cashSession.findFirst({ where: { fermeeLe: null } });
  if (ouverte) return;

  await prisma.cashSession.create({
    data: {
      ouvertePar: session.nom,
      soldeOuverture: Number(form.get("soldeOuverture") ?? 0),
    },
  });
  await journaliser("ouverture", "CashSession");
  rafraichir("/admin/caisse");
}

export async function fermerCaisse(form: FormData) {
  await exigerAcces("finance");
  const id = String(form.get("id"));

  const caisse = await prisma.cashSession.findUnique({
    where: { id },
    include: { mouvements: true },
  });
  if (!caisse) return;

  const solde = caisse.mouvements.reduce(
    (s, m) => (m.sens === "ENTREE" ? s + toNumber(m.montant) : s - toNumber(m.montant)),
    toNumber(caisse.soldeOuverture),
  );

  await prisma.cashSession.update({
    where: { id },
    data: {
      fermeeLe: new Date(),
      soldeCloture: solde,
      notes: String(form.get("notes") ?? ""),
    },
  });
  await journaliser("cloture", "CashSession", id, `solde ${solde}`);
  rafraichir("/admin/caisse");
}

// Mouvement libre : fond de caisse, appoint, sortie exceptionnelle.
export async function ajouterMouvement(form: FormData) {
  const session = await exigerAcces("finance");
  const montant = Number(form.get("montant") ?? 0);
  if (montant <= 0) return;

  const caisse = await prisma.cashSession.findFirst({ where: { fermeeLe: null } });

  await prisma.cashMovement.create({
    data: {
      sens: String(form.get("sens") ?? "ENTREE"),
      montant,
      devise: String(form.get("devise") ?? "HTG"),
      motif: String(form.get("motif") ?? "Mouvement de caisse"),
      sessionId: caisse?.id ?? null,
      userId: session.userId,
    },
  });
  rafraichir("/admin/caisse", "/admin");
}

export async function supprimerMouvement(form: FormData) {
  await exigerAcces("finance");
  const id = String(form.get("id"));

  const mouvement = await prisma.cashMovement.findUnique({ where: { id } });
  // Un mouvement issu d'un paiement ou d'une depense se supprime a la source.
  if (!mouvement || mouvement.paymentId || mouvement.expenseId) return;

  await prisma.cashMovement.delete({ where: { id } });
  rafraichir("/admin/caisse");
}

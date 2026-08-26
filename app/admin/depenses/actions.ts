"use server";

import { prisma } from "@/lib/db";
import { exigerAcces, journaliser, rafraichir } from "../actions";

export async function ajouterDepense(form: FormData) {
  const session = await exigerAcces("finance");
  const montant = Number(form.get("montant") ?? 0);
  const libelle = String(form.get("libelle") ?? "").trim();
  if (!libelle || montant <= 0) return;

  const dateSaisie = String(form.get("date") ?? "");
  const methode = String(form.get("methode") ?? "ESPECES");
  const devise = String(form.get("devise") ?? "HTG");

  const depense = await prisma.expense.create({
    data: {
      libelle,
      montant,
      devise,
      methode,
      categorieId: String(form.get("categorieId") ?? "") || null,
      fournisseur: String(form.get("fournisseur") ?? "") || null,
      date: dateSaisie ? new Date(dateSaisie) : new Date(),
      userId: session.userId,
    },
  });

  // Seules les depenses en especes touchent la caisse physique.
  if (methode === "ESPECES") {
    const caisse = await prisma.cashSession.findFirst({ where: { fermeeLe: null } });
    await prisma.cashMovement.create({
      data: {
        sens: "SORTIE",
        montant,
        devise,
        motif: `Depense : ${libelle}`,
        expenseId: depense.id,
        sessionId: caisse?.id ?? null,
        userId: session.userId,
      },
    });
  }

  await journaliser("creation", "Expense", depense.id, `${montant} ${devise}`);
  rafraichir("/admin/depenses", "/admin/caisse", "/admin");
}

export async function supprimerDepense(form: FormData) {
  await exigerAcces("finance");
  const id = String(form.get("id"));

  await prisma.cashMovement.deleteMany({ where: { expenseId: id } });
  await prisma.expense.delete({ where: { id } });
  await journaliser("suppression", "Expense", id);
  rafraichir("/admin/depenses", "/admin/caisse", "/admin");
}

export async function creerCategorieDepense(form: FormData) {
  await exigerAcces("finance");
  const nom = String(form.get("nom") ?? "").trim();
  if (!nom) return;

  await prisma.expenseCategory.create({
    data: { nom, couleur: String(form.get("couleur") ?? "#1d4ed8") },
  });
  rafraichir("/admin/depenses");
}

"use server";

import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/money";
import { exigerAcces, journaliser, rafraichir } from "../actions";

export async function creerArticle(form: FormData) {
  await exigerAcces("stock");
  const reference = String(form.get("reference") ?? "").trim().toUpperCase();
  const nom = String(form.get("nom") ?? "").trim();
  if (!reference || !nom) return;

  await prisma.stockItem.create({
    data: {
      reference,
      nom,
      categorie: String(form.get("categorie") ?? "fourniture"),
      unite: String(form.get("unite") ?? "unite"),
      quantite: Number(form.get("quantite") ?? 0),
      seuilAlerte: Number(form.get("seuilAlerte") ?? 0),
      prixAchat: Number(form.get("prixAchat") ?? 0),
      fournisseurId: String(form.get("fournisseurId") ?? "") || null,
    },
  });
  await journaliser("creation", "StockItem", undefined, reference);
  rafraichir("/admin/stock");
}

export async function modifierArticle(form: FormData) {
  await exigerAcces("stock");
  const id = String(form.get("id"));

  await prisma.stockItem.update({
    where: { id },
    data: {
      nom: String(form.get("nom") ?? ""),
      seuilAlerte: Number(form.get("seuilAlerte") ?? 0),
      prixAchat: Number(form.get("prixAchat") ?? 0),
    },
  });
  rafraichir("/admin/stock");
}

export async function supprimerArticle(form: FormData) {
  await exigerAcces("stock");
  const id = String(form.get("id"));
  await prisma.stockItem.delete({ where: { id } });
  await journaliser("suppression", "StockItem", id);
  rafraichir("/admin/stock");
}

// Toute variation passe par un mouvement : le stock reste auditable.
export async function mouvementStock(form: FormData) {
  const session = await exigerAcces("stock");
  const itemId = String(form.get("itemId"));
  const sens = String(form.get("sens") ?? "ENTREE");
  const quantite = Number(form.get("quantite") ?? 0);
  if (quantite <= 0) return;

  const article = await prisma.stockItem.findUnique({ where: { id: itemId } });
  if (!article) return;

  const actuel = toNumber(article.quantite);
  const nouvelle =
    sens === "ENTREE" ? actuel + quantite : sens === "SORTIE" ? actuel - quantite : quantite;

  await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        itemId,
        sens,
        quantite,
        motif: String(form.get("motif") ?? ""),
        refOrder: String(form.get("refOrder") ?? "") || null,
        userId: session.userId,
      },
    }),
    prisma.stockItem.update({
      where: { id: itemId },
      data: { quantite: Math.max(0, nouvelle) },
    }),
  ]);

  rafraichir("/admin/stock", "/admin");
}

export async function creerFournisseur(form: FormData) {
  await exigerAcces("stock");
  const nom = String(form.get("nom") ?? "").trim();
  if (!nom) return;

  await prisma.supplier.create({
    data: {
      nom,
      telephone: String(form.get("telephone") ?? "") || null,
      email: String(form.get("email") ?? "") || null,
    },
  });
  rafraichir("/admin/stock");
}

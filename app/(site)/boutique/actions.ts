"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { nextNumero } from "@/lib/numbering";
import { toNumber } from "@/lib/money";

const Ligne = z.object({ slug: z.string(), quantite: z.coerce.number().int().min(1).max(9999) });

const Schema = z.object({
  nomContact: z.string().min(2, "Indiquez votre nom."),
  telephone: z.string().min(6, "Indiquez un numero joignable."),
  email: z.string().email("Adresse e-mail invalide.").optional().or(z.literal("")),
  adresse: z.string().optional(),
  notes: z.string().optional(),
  lignes: z.array(Ligne).min(1, "Votre panier est vide."),
});

export type EtatCommande = { ok: boolean; message: string; numero?: string };

export async function passerCommande(entree: unknown): Promise<EtatCommande> {
  const analyse = Schema.safeParse(entree);
  if (!analyse.success) return { ok: false, message: analyse.error.issues[0].message };
  const d = analyse.data;

  // Les prix sont relus en base : le panier du navigateur ne fixe jamais le montant.
  const services = await prisma.service.findMany({
    where: { slug: { in: d.lignes.map((l) => l.slug) }, vendableEnLigne: true, visible: true },
  });
  if (services.length === 0) return { ok: false, message: "Aucun article commandable." };

  const items = d.lignes
    .map((l) => {
      const s = services.find((x) => x.slug === l.slug);
      if (!s) return null;
      return {
        serviceId: s.id,
        designation: s.nom,
        quantite: l.quantite,
        prixUnitaire: toNumber(s.prixBase),
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  const sousTotal = items.reduce((somme, i) => somme + i.quantite * i.prixUnitaire, 0);
  const numero = await nextNumero("CMD");

  await prisma.order.create({
    data: {
      numero,
      nomContact: d.nomContact,
      telephone: d.telephone,
      email: d.email || null,
      adresse: d.adresse || null,
      notes: d.notes || "",
      origine: "SITE",
      sousTotal,
      total: sousTotal,
      items: { create: items },
      historique: { create: { nouveau: "NOUVELLE", parQui: "Site public" } },
    },
  });

  return { ok: true, message: "Commande enregistree.", numero };
}

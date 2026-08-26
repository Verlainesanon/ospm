"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { nextNumero } from "@/lib/numbering";
import { enregistrerFichier } from "@/lib/upload";

const Schema = z.object({
  nomContact: z.string().min(2, "Indiquez votre nom."),
  telephone: z.string().min(6, "Indiquez un numero joignable."),
  email: z.string().email("Adresse e-mail invalide.").optional().or(z.literal("")),
  service: z.string().optional(),
  quantite: z.coerce.number().int().min(1).default(1),
  message: z.string().min(10, "Decrivez le travail en quelques mots."),
});

export type EtatDevis = { ok: boolean; message: string; numero?: string };

export async function envoyerDevis(_precedent: EtatDevis, form: FormData): Promise<EtatDevis> {
  const brut = {
    nomContact: String(form.get("nomContact") ?? ""),
    telephone: String(form.get("telephone") ?? ""),
    email: String(form.get("email") ?? ""),
    service: String(form.get("service") ?? ""),
    quantite: form.get("quantite") ?? 1,
    message: String(form.get("message") ?? ""),
  };

  const analyse = Schema.safeParse(brut);
  if (!analyse.success) {
    return { ok: false, message: analyse.error.issues[0].message };
  }
  const d = analyse.data;

  const service = d.service
    ? await prisma.service.findUnique({ where: { slug: d.service } })
    : null;

  let fichiers: { url: string; nom: string; mime: string; taille: number }[] = [];
  try {
    const envoyes = form.getAll("fichiers").filter((f): f is File => f instanceof File && f.size > 0);
    fichiers = await Promise.all(envoyes.slice(0, 5).map(enregistrerFichier));
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Fichier refuse." };
  }

  const numero = await nextNumero("DEV");

  await prisma.quote.create({
    data: {
      numero,
      nomContact: d.nomContact,
      telephone: d.telephone,
      email: d.email || null,
      message: d.message,
      items: {
        create: [
          {
            designation: service?.nom ?? "Travail a definir",
            details: d.message.slice(0, 500),
            quantite: d.quantite,
            prixUnitaire: service?.prixBase ?? 0,
            serviceId: service?.id ?? null,
          },
        ],
      },
      fichiers: { create: fichiers },
    },
  });

  return {
    ok: true,
    message: "Demande enregistree. On vous rappelle avec un prix.",
    numero,
  };
}

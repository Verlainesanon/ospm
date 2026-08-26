"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";

const Schema = z.object({
  nom: z.string().min(2, "Indiquez votre nom."),
  email: z.string().email("Adresse e-mail invalide.").optional().or(z.literal("")),
  telephone: z.string().optional(),
  sujet: z.string().optional(),
  message: z.string().min(5, "Ecrivez votre message."),
});

export type EtatContact = { ok: boolean; message: string };

export async function envoyerMessage(
  _precedent: EtatContact,
  form: FormData,
): Promise<EtatContact> {
  const analyse = Schema.safeParse({
    nom: String(form.get("nom") ?? ""),
    email: String(form.get("email") ?? ""),
    telephone: String(form.get("telephone") ?? ""),
    sujet: String(form.get("sujet") ?? ""),
    message: String(form.get("message") ?? ""),
  });

  if (!analyse.success) return { ok: false, message: analyse.error.issues[0].message };
  const d = analyse.data;

  await prisma.contactMessage.create({
    data: {
      nom: d.nom,
      email: d.email || null,
      telephone: d.telephone || null,
      sujet: d.sujet || "",
      message: d.message,
    },
  });

  return { ok: true, message: "Message recu. On vous repond au plus vite." };
}

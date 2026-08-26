"use server";

import { prisma } from "@/lib/db";
import { exigerAcces, journaliser, rafraichir } from "../actions";

export type EtatReglages = { ok: boolean; message: string };

// Enregistre en bloc tous les champs du formulaire de reglages.
export async function enregistrerReglages(
  _precedent: EtatReglages,
  form: FormData,
): Promise<EtatReglages> {
  await exigerAcces("contenu");

  const modifications: { key: string; value: string }[] = [];
  for (const [cle, valeur] of Array.from(form.entries())) {
    if (typeof valeur !== "string") continue;
    modifications.push({ key: cle, value: valeur });
  }

  await prisma.$transaction(
    modifications.map((m) =>
      prisma.siteSetting.update({ where: { key: m.key }, data: { value: m.value } }),
    ),
  );

  await journaliser("modification", "SiteSetting", undefined, `${modifications.length} champs`);
  rafraichir("/", "/contact", "/admin/reglages");

  return { ok: true, message: `${modifications.length} reglages enregistres.` };
}

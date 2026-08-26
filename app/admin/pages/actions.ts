"use server";

import { prisma } from "@/lib/db";
import { exigerAcces, journaliser, rafraichir } from "../actions";

function slugifier(valeur: string) {
  return valeur
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function creerPage(form: FormData) {
  await exigerAcces("contenu");
  const titre = String(form.get("titre") ?? "").trim();
  if (!titre) return;

  await prisma.page.create({
    data: { titre, slug: slugifier(titre), contenu: String(form.get("contenu") ?? "") },
  });
  await journaliser("creation", "Page", undefined, titre);
  rafraichir("/admin/pages");
}

export async function modifierPage(form: FormData) {
  await exigerAcces("contenu");
  const id = String(form.get("id"));
  const page = await prisma.page.update({
    where: { id },
    data: {
      titre: String(form.get("titre") ?? ""),
      contenu: String(form.get("contenu") ?? ""),
      metaDesc: String(form.get("metaDesc") ?? "") || null,
      publiee: form.get("publiee") === "on",
    },
  });
  await journaliser("modification", "Page", id);
  rafraichir("/admin/pages", `/p/${page.slug}`);
}

export async function supprimerPage(form: FormData) {
  await exigerAcces("contenu");
  const id = String(form.get("id"));
  await prisma.page.delete({ where: { id } });
  await journaliser("suppression", "Page", id);
  rafraichir("/admin/pages");
}

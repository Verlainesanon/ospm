"use server";

import { prisma } from "@/lib/db";
import { enregistrerFichier } from "@/lib/upload";
import { exigerAcces, journaliser, rafraichir } from "../actions";

const CHEMINS = ["/", "/galerie", "/admin/galerie"];

export async function ajouterRealisation(form: FormData) {
  await exigerAcces("contenu");

  const fichier = form.get("image");
  if (!(fichier instanceof File) || fichier.size === 0) return;

  const enregistre = await enregistrerFichier(fichier);
  await prisma.galleryItem.create({
    data: {
      titre: String(form.get("titre") ?? enregistre.nom),
      categorie: String(form.get("categorie") ?? "impression"),
      image: enregistre.url,
      ordre: Number(form.get("ordre") ?? 0),
    },
  });

  await journaliser("creation", "GalleryItem");
  rafraichir(...CHEMINS);
}

export async function modifierRealisation(form: FormData) {
  await exigerAcces("contenu");
  const id = String(form.get("id"));
  await prisma.galleryItem.update({
    where: { id },
    data: {
      titre: String(form.get("titre") ?? ""),
      categorie: String(form.get("categorie") ?? ""),
      ordre: Number(form.get("ordre") ?? 0),
      visible: form.get("visible") === "on",
    },
  });
  rafraichir(...CHEMINS);
}

export async function supprimerRealisation(form: FormData) {
  await exigerAcces("contenu");
  const id = String(form.get("id"));
  await prisma.galleryItem.delete({ where: { id } });
  await journaliser("suppression", "GalleryItem", id);
  rafraichir(...CHEMINS);
}

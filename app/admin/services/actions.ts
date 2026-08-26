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

// Deux services peuvent porter le meme nom dans deux ateliers : on suffixe.
async function slugLibre(base: string, existe: (slug: string) => Promise<boolean>) {
  let candidat = base || "element";
  let n = 2;
  while (await existe(candidat)) {
    candidat = `${base}-${n++}`;
  }
  return candidat;
}

const CHEMINS = ["/", "/services", "/boutique", "/admin/services"];

export async function creerCategorie(form: FormData) {
  await exigerAcces("contenu");
  const nom = String(form.get("nom") ?? "").trim();
  if (!nom) return;

  await prisma.serviceCategory.create({
    data: {
      nom,
      slug: await slugLibre(slugifier(nom), async (slug) =>
        (await prisma.serviceCategory.count({ where: { slug } })) > 0,
      ),
      description: String(form.get("description") ?? ""),
      couleur: String(form.get("couleur") ?? "bleu"),
      ordre: Number(form.get("ordre") ?? 0),
    },
  });
  await journaliser("creation", "ServiceCategory", undefined, nom);
  rafraichir(...CHEMINS);
}

export async function modifierCategorie(form: FormData) {
  await exigerAcces("contenu");
  const id = String(form.get("id"));
  await prisma.serviceCategory.update({
    where: { id },
    data: {
      nom: String(form.get("nom") ?? ""),
      description: String(form.get("description") ?? ""),
      couleur: String(form.get("couleur") ?? "bleu"),
      ordre: Number(form.get("ordre") ?? 0),
      visible: form.get("visible") === "on",
    },
  });
  await journaliser("modification", "ServiceCategory", id);
  rafraichir(...CHEMINS);
}

export async function supprimerCategorie(form: FormData) {
  await exigerAcces("contenu");
  const id = String(form.get("id"));
  await prisma.serviceCategory.delete({ where: { id } });
  await journaliser("suppression", "ServiceCategory", id);
  rafraichir(...CHEMINS);
}

export async function creerService(form: FormData) {
  await exigerAcces("contenu");
  const nom = String(form.get("nom") ?? "").trim();
  const categorieId = String(form.get("categorieId") ?? "");
  if (!nom || !categorieId) return;

  const prix = form.get("prixBase");
  await prisma.service.create({
    data: {
      nom,
      slug: await slugLibre(slugifier(nom), async (slug) =>
        (await prisma.service.count({ where: { slug } })) > 0,
      ),
      categorieId,
      description: String(form.get("description") ?? ""),
      prixBase: prix === null || prix === "" ? null : Number(prix),
      devise: String(form.get("devise") ?? "HTG"),
      unite: String(form.get("unite") ?? "unite"),
      surDevis: form.get("surDevis") === "on",
      vendableEnLigne: form.get("vendableEnLigne") === "on",
      ordre: Number(form.get("ordre") ?? 0),
    },
  });
  await journaliser("creation", "Service", undefined, nom);
  rafraichir(...CHEMINS);
}

export async function modifierService(form: FormData) {
  await exigerAcces("contenu");
  const id = String(form.get("id"));
  const prix = form.get("prixBase");

  await prisma.service.update({
    where: { id },
    data: {
      nom: String(form.get("nom") ?? ""),
      description: String(form.get("description") ?? ""),
      categorieId: String(form.get("categorieId") ?? ""),
      prixBase: prix === null || prix === "" ? null : Number(prix),
      devise: String(form.get("devise") ?? "HTG"),
      unite: String(form.get("unite") ?? "unite"),
      surDevis: form.get("surDevis") === "on",
      vendableEnLigne: form.get("vendableEnLigne") === "on",
      visible: form.get("visible") === "on",
      ordre: Number(form.get("ordre") ?? 0),
    },
  });
  await journaliser("modification", "Service", id);
  rafraichir(...CHEMINS);
}

export async function supprimerService(form: FormData) {
  await exigerAcces("contenu");
  const id = String(form.get("id"));
  await prisma.service.delete({ where: { id } });
  await journaliser("suppression", "Service", id);
  rafraichir(...CHEMINS);
}

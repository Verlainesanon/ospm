"use server";

import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { exigerAcces, journaliser, rafraichir } from "../actions";

export async function creerUtilisateur(form: FormData) {
  await exigerAcces("contenu");

  const email = String(form.get("email") ?? "").toLowerCase().trim();
  const motDePasse = String(form.get("password") ?? "");
  if (!email || motDePasse.length < 8) return;

  await prisma.user.create({
    data: {
      email,
      nom: String(form.get("nom") ?? email),
      role: String(form.get("role") ?? "TECHNICIEN"),
      password: hashPassword(motDePasse),
    },
  });
  await journaliser("creation", "User", undefined, email);
  rafraichir("/admin/utilisateurs");
}

export async function modifierUtilisateur(form: FormData) {
  await exigerAcces("contenu");
  const id = String(form.get("id"));
  const motDePasse = String(form.get("password") ?? "");

  await prisma.user.update({
    where: { id },
    data: {
      nom: String(form.get("nom") ?? ""),
      role: String(form.get("role") ?? "TECHNICIEN"),
      actif: form.get("actif") === "on",
      ...(motDePasse.length >= 8 ? { password: hashPassword(motDePasse) } : {}),
    },
  });
  await journaliser("modification", "User", id);
  rafraichir("/admin/utilisateurs");
}

export async function supprimerUtilisateur(form: FormData) {
  const session = await exigerAcces("contenu");
  const id = String(form.get("id"));

  // On ne se supprime pas soi-meme : cela fermerait l'acces en cours.
  if (id === session.userId) return;

  await prisma.user.delete({ where: { id } });
  await journaliser("suppression", "User", id);
  rafraichir("/admin/utilisateurs");
}

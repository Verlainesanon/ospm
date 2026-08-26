"use server";

import { prisma } from "@/lib/db";
import { exigerAcces, journaliser, rafraichir } from "../actions";

export async function creerClient(form: FormData) {
  await exigerAcces("clients");
  const nom = String(form.get("nom") ?? "").trim();
  if (!nom) return;

  await prisma.customer.create({
    data: {
      nom,
      type: String(form.get("type") ?? "PARTICULIER"),
      telephone: String(form.get("telephone") ?? "") || null,
      whatsapp: String(form.get("whatsapp") ?? "") || null,
      email: String(form.get("email") ?? "") || null,
      adresse: String(form.get("adresse") ?? "") || null,
      notes: String(form.get("notes") ?? "") || null,
    },
  });
  await journaliser("creation", "Customer", undefined, nom);
  rafraichir("/admin/clients");
}

export async function modifierClient(form: FormData) {
  await exigerAcces("clients");
  const id = String(form.get("id"));

  await prisma.customer.update({
    where: { id },
    data: {
      nom: String(form.get("nom") ?? ""),
      type: String(form.get("type") ?? "PARTICULIER"),
      telephone: String(form.get("telephone") ?? "") || null,
      email: String(form.get("email") ?? "") || null,
    },
  });
  rafraichir("/admin/clients");
}

export async function supprimerClient(form: FormData) {
  await exigerAcces("clients");
  const id = String(form.get("id"));
  await prisma.customer.delete({ where: { id } });
  await journaliser("suppression", "Customer", id);
  rafraichir("/admin/clients");
}

"use server";

import { prisma } from "@/lib/db";
import { exigerAcces, journaliser, rafraichir } from "../actions";

export async function creerEquipement(form: FormData) {
  await exigerAcces("materiel");
  const nom = String(form.get("nom") ?? "").trim();
  if (!nom) return;

  const dateAchat = String(form.get("dateAchat") ?? "");
  const prix = form.get("prixAchat");

  await prisma.equipment.create({
    data: {
      nom,
      type: String(form.get("type") ?? "IMPRIMANTE"),
      marque: String(form.get("marque") ?? "") || null,
      modele: String(form.get("modele") ?? "") || null,
      numeroSerie: String(form.get("numeroSerie") ?? "") || null,
      emplacement: String(form.get("emplacement") ?? "Atelier"),
      dateAchat: dateAchat ? new Date(dateAchat) : null,
      prixAchat: prix === null || prix === "" ? null : Number(prix),
    },
  });
  await journaliser("creation", "Equipment", undefined, nom);
  rafraichir("/admin/materiel");
}

export async function modifierEquipement(form: FormData) {
  await exigerAcces("materiel");
  const id = String(form.get("id"));

  await prisma.equipment.update({
    where: { id },
    data: {
      nom: String(form.get("nom") ?? ""),
      etat: String(form.get("etat") ?? "OK"),
      emplacement: String(form.get("emplacement") ?? ""),
      notes: String(form.get("notes") ?? ""),
    },
  });
  rafraichir("/admin/materiel", "/admin/impression");
}

export async function supprimerEquipement(form: FormData) {
  await exigerAcces("materiel");
  const id = String(form.get("id"));
  await prisma.equipment.delete({ where: { id } });
  await journaliser("suppression", "Equipment", id);
  rafraichir("/admin/materiel");
}

export async function ajouterMaintenance(form: FormData) {
  const session = await exigerAcces("materiel");
  const equipmentId = String(form.get("equipmentId"));
  const description = String(form.get("description") ?? "").trim();
  if (!description) return;

  const prochaine = String(form.get("prochaineLe") ?? "");

  await prisma.maintenance.create({
    data: {
      equipmentId,
      type: String(form.get("type") ?? "PREVENTIVE"),
      description,
      cout: Number(form.get("cout") ?? 0),
      technicien: String(form.get("technicien") ?? "") || null,
      prochaineLe: prochaine ? new Date(prochaine) : null,
      userId: session.userId,
    },
  });

  await journaliser("maintenance", "Equipment", equipmentId, description);
  rafraichir("/admin/materiel");
}

export async function lierConsommable(form: FormData) {
  await exigerAcces("materiel");
  const equipmentId = String(form.get("equipmentId"));
  const itemId = String(form.get("itemId"));
  if (!itemId) return;

  await prisma.equipmentConsumable.upsert({
    where: { equipmentId_itemId: { equipmentId, itemId } },
    update: {},
    create: { equipmentId, itemId },
  });
  rafraichir("/admin/materiel");
}

export async function delierConsommable(form: FormData) {
  await exigerAcces("materiel");
  await prisma.equipmentConsumable.delete({ where: { id: String(form.get("id")) } });
  rafraichir("/admin/materiel");
}

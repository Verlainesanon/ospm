"use server";

import { prisma } from "@/lib/db";
import { exigerAcces, rafraichir } from "../actions";

export async function basculerLu(form: FormData) {
  await exigerAcces("clients");
  await prisma.contactMessage.update({
    where: { id: String(form.get("id")) },
    data: { lu: form.get("lu") === "1" },
  });
  rafraichir("/admin/messages", "/admin");
}

export async function supprimerMessage(form: FormData) {
  await exigerAcces("clients");
  await prisma.contactMessage.delete({ where: { id: String(form.get("id")) } });
  rafraichir("/admin/messages", "/admin");
}

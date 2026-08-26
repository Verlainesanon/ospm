"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { destroySession, getSession, can, type Role } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function deconnexion() {
  destroySession();
  redirect("/connexion");
}

// Garde-fou commun a toutes les actions d'administration : session valide et
// droit sur la zone concernee, sinon on ne touche pas a la base.
export async function exigerAcces(zone: string) {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (!can(session.role as Role, zone)) {
    throw new Error("Vous n'avez pas acces a cette section.");
  }
  return session;
}

export async function journaliser(
  action: string,
  entite: string,
  entiteId?: string,
  details?: string,
) {
  const session = await getSession();
  await prisma.auditLog.create({
    data: { action, entite, entiteId, details, userId: session?.userId },
  });
}

export async function rafraichir(...chemins: string[]) {
  for (const c of chemins) revalidatePath(c);
}

"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/auth";

export type EtatLogin = { erreur: string };

export async function connexion(_precedent: EtatLogin, form: FormData): Promise<EtatLogin> {
  const email = String(form.get("email") ?? "");
  const motDePasse = String(form.get("password") ?? "");

  if (!email || !motDePasse) return { erreur: "Renseignez l'e-mail et le mot de passe." };

  const resultat = await login(email, motDePasse);
  if (!resultat.ok) return { erreur: resultat.erreur };

  redirect("/admin");
}

import { prisma } from "./db";

export type Reglages = Record<string, string>;

// Les parametres sont peu nombreux et lus sur presque chaque page : une seule
// requete, remise a plat en objet cle/valeur.
export async function getReglages(): Promise<Reglages> {
  const lignes = await prisma.siteSetting.findMany();
  return Object.fromEntries(lignes.map((l) => [l.key, l.value]));
}

export function reglage(r: Reglages, cle: string, defaut = ""): string {
  return r[cle]?.trim() || defaut;
}

// "+509 42-71-28-91" -> "50942712891", utilisable dans un lien wa.me.
export function numeroWhatsapp(valeur: string): string {
  return valeur.replace(/\D/g, "");
}

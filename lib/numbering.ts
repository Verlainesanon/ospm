import { prisma } from "./db";

// Numerotation sequentielle par prefixe et par annee : DEV-2026-0001.
// Le compteur est incremente dans une transaction pour eviter les doublons
// quand deux postes enregistrent en meme temps.
export async function nextNumero(prefixe: string, annee = new Date().getFullYear()) {
  const cle = `${prefixe}-${annee}`;
  const compteur = await prisma.$transaction(async (tx) => {
    const existant = await tx.counter.findUnique({ where: { cle } });
    if (!existant) {
      return tx.counter.create({ data: { cle, annee, valeur: 1 } });
    }
    return tx.counter.update({ where: { cle }, data: { valeur: { increment: 1 } } });
  });
  return `${prefixe}-${annee}-${String(compteur.valeur).padStart(4, "0")}`;
}

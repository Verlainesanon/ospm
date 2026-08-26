import { Prisma } from "@prisma/client";

export type Devise = "HTG" | "USD";

export function toNumber(v: Prisma.Decimal | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  return typeof v === "number" ? v : Number(v);
}

export function formatMontant(
  v: Prisma.Decimal | number | null | undefined,
  devise: string = "HTG",
): string {
  const n = toNumber(v);
  const formate = n.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return devise === "USD" ? `$ ${formate}` : `${formate} G`;
}

export type LigneMontant = { quantite: number; prixUnitaire: Prisma.Decimal | number };

export function sousTotal(lignes: LigneMontant[]): number {
  return lignes.reduce((somme, l) => somme + l.quantite * toNumber(l.prixUnitaire), 0);
}

export function totalDocument(
  lignes: LigneMontant[],
  remise = 0,
  taxe = 0,
): { sousTotal: number; total: number } {
  const st = sousTotal(lignes);
  return { sousTotal: st, total: Math.max(0, st - remise + taxe) };
}

// Conversion vers la devise d'affichage, taux = valeur d'1 USD en HTG.
export function convertir(montant: number, de: Devise, vers: Devise, taux: number): number {
  if (de === vers) return montant;
  return de === "USD" ? montant * taux : montant / taux;
}

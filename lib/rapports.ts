import { prisma } from "./db";
import { toNumber } from "./money";

const MOIS_COURT = ["jan", "fev", "mar", "avr", "mai", "juin", "juil", "aou", "sep", "oct", "nov", "dec"];

export function debutDuMois(decalage = 0): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() + decalage);
  return d;
}

// Encaissements et depenses des N derniers mois, prets pour le graphique.
export async function serieMensuelle(nbMois = 6) {
  const debut = debutDuMois(-(nbMois - 1));

  const [paiements, depenses] = await Promise.all([
    prisma.payment.findMany({ where: { date: { gte: debut } }, select: { date: true, montant: true } }),
    prisma.expense.findMany({ where: { date: { gte: debut } }, select: { date: true, montant: true } }),
  ]);

  const points = [];
  for (let i = 0; i < nbMois; i++) {
    const mois = debutDuMois(-(nbMois - 1) + i);
    const suivant = new Date(mois);
    suivant.setMonth(suivant.getMonth() + 1);

    const dansLeMois = (d: Date) => d >= mois && d < suivant;

    points.push({
      mois: MOIS_COURT[mois.getMonth()],
      encaisse: paiements.filter((p) => dansLeMois(p.date)).reduce((s, p) => s + toNumber(p.montant), 0),
      depense: depenses.filter((d) => dansLeMois(d.date)).reduce((s, d) => s + toNumber(d.montant), 0),
    });
  }
  return points;
}

export async function chiffresDuJour() {
  const debut = new Date();
  debut.setHours(0, 0, 0, 0);

  const [paiements, depenses, commandes] = await Promise.all([
    prisma.payment.findMany({ where: { date: { gte: debut } }, select: { montant: true } }),
    prisma.expense.findMany({ where: { date: { gte: debut } }, select: { montant: true } }),
    prisma.order.count({ where: { createdAt: { gte: debut } } }),
  ]);

  return {
    encaisse: paiements.reduce((s, p) => s + toNumber(p.montant), 0),
    depense: depenses.reduce((s, d) => s + toNumber(d.montant), 0),
    commandes,
  };
}

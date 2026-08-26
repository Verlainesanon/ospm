import { prisma } from "./db";
import { formatMontant, toNumber } from "./money";
import { getReglages, reglage } from "./settings";

// Rendu de gabarit : remplacement de {{cle}} par la valeur fournie.
// Les valeurs sont echappees, sauf celles pre-rendues (lignes de tableau).
export function rendreGabarit(
  html: string,
  valeurs: Record<string, string>,
  brutes: string[] = ["lignes"],
): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, cle: string) => {
    const valeur = valeurs[cle] ?? "";
    return brutes.includes(cle) ? valeur : echapper(valeur);
  });
}

export function echapper(valeur: string): string {
  return valeur
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Prepare toutes les valeurs d'une facture pour n'importe quel gabarit.
export async function donneesFacture(invoiceId: string) {
  const [facture, r] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true, paiements: true, customer: true },
    }),
    getReglages(),
  ]);
  if (!facture) return null;

  const lignesHtml = facture.items
    .map(
      (i) =>
        `<tr><td>${echapper(i.designation)}</td><td>${i.quantite}</td><td>${formatMontant(
          i.prixUnitaire,
          facture.devise,
        )}</td><td>${formatMontant(
          i.quantite * toNumber(i.prixUnitaire),
          facture.devise,
        )}</td></tr>`,
    )
    .join("");

  const lignesTicket = facture.items
    .map(
      (i) =>
        `<p>${echapper(i.designation)} x${i.quantite} — ${formatMontant(
          i.quantite * toNumber(i.prixUnitaire),
          facture.devise,
        )}</p>`,
    )
    .join("");

  return {
    facture,
    valeurs: {
      logo: "/logo.jpeg",
      entreprise: reglage(r, "site.nom", "OSPM"),
      adresse: reglage(r, "contact.adresse"),
      telephone: `${reglage(r, "contact.whatsapp1")} / ${reglage(r, "contact.whatsapp2")}`,
      email: reglage(r, "contact.email"),
      type: facture.type,
      numero: facture.numero,
      date: facture.dateEmission.toLocaleDateString("fr-FR"),
      client: facture.nomClient,
      lignes: lignesHtml,
      lignesTicket,
      sousTotal: formatMontant(facture.sousTotal, facture.devise),
      remise: formatMontant(facture.remise, facture.devise),
      taxe: formatMontant(facture.taxe, facture.devise),
      total: formatMontant(facture.total, facture.devise),
      paye: formatMontant(facture.montantPaye, facture.devise),
      reste: formatMontant(
        toNumber(facture.total) - toNumber(facture.montantPaye),
        facture.devise,
      ),
      methode: facture.paiements[0]?.methode ?? "",
      mention: reglage(r, "finance.mentionFacture"),
    } as Record<string, string>,
  };
}

// Texte brut envoye a une imprimante thermique par l'agent local.
export function ticketTexte(valeurs: Record<string, string>, lignes: string[]): string {
  return [
    valeurs.entreprise,
    valeurs.adresse,
    valeurs.telephone,
    "--------------------------------",
    `${valeurs.type} ${valeurs.numero}`,
    valeurs.date,
    `Client : ${valeurs.client}`,
    "--------------------------------",
    ...lignes,
    "--------------------------------",
    `TOTAL      ${valeurs.total}`,
    `PAYE       ${valeurs.paye}`,
    `RESTE      ${valeurs.reste}`,
    valeurs.methode ? `Regle par ${valeurs.methode}` : "",
    "",
    valeurs.mention || "Merci de votre confiance.",
    "",
  ]
    .filter(Boolean)
    .join("\n");
}

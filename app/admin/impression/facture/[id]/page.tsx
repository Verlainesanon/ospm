import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { donneesFacture, rendreGabarit } from "@/lib/print";
import { AutoImpression } from "../../auto-impression";

// Page d'impression navigateur : le gabarit choisi dans l'admin est rendu tel
// quel, la boite de dialogue d'impression s'ouvre toute seule.
export default async function ImprimerFacture({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { gabarit?: string };
}) {
  const donnees = await donneesFacture(params.id);
  if (!donnees) notFound();

  const cle = searchParams.gabarit ?? "facture-a4";
  const gabarit =
    (await prisma.printTemplate.findUnique({ where: { cle } })) ??
    (await prisma.printTemplate.findFirst({ where: { type: "FACTURE" } }));

  if (!gabarit) notFound();

  const html = rendreGabarit(gabarit.html, donnees.valeurs);

  return (
    <>
      <AutoImpression />
      <style>{`
        @page { size: ${gabarit.largeurMm}mm auto; margin: 10mm; }
        .doc, .recu { font-family: var(--font-sans), sans-serif; color: #14151A; }
        .doc .logo { height: 46px; width: auto; margin-bottom: 8px; }
        .recu .logo { height: 34px; width: auto; margin: 0 auto 6px; display: block; }
        .doc header { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
        .doc h1 { font-size: 18px; font-weight: 800; text-transform: uppercase; }
        .doc h2 { font-size: 14px; font-weight: 700; }
        .doc p { font-size: 11px; }
        .doc table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        .doc th { text-align: left; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #0B3A8F; padding: 6px 4px; }
        .doc td { font-size: 11px; border-bottom: 1px solid #E8DFCC; padding: 6px 4px; }
        .doc .totaux { text-align: right; font-size: 12px; }
        .doc .totaux .grand { font-size: 16px; font-weight: 800; color: #0B3A8F; }
        .doc footer { margin-top: 32px; border-top: 1px solid #E8DFCC; padding-top: 8px; font-size: 10px; }
        .recu { width: ${gabarit.largeurMm}mm; font-size: 11px; }
        .recu h1 { font-size: 14px; font-weight: 800; text-transform: uppercase; }
        .recu .grand { font-weight: 800; font-size: 13px; }
        ${gabarit.css}
      `}</style>
      <div className="mx-auto max-w-3xl bg-white p-8" dangerouslySetInnerHTML={{ __html: html }} />
      <p className="sans-impression mx-auto mt-6 max-w-3xl px-8 text-micro text-plomb">
        Gabarit &laquo; {gabarit.nom} &raquo; - modifiable dans Impression &gt; Gabarits.
      </p>
    </>
  );
}

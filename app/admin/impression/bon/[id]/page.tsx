import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { toNumber, formatMontant } from "@/lib/money";
import { AutoImpression } from "../../auto-impression";
import { Logo } from "@/components/logo";

// Bon de travail : la fiche qui suit la commande dans l'atelier.
export default async function BonDeTravailImprimable({ params }: { params: { id: string } }) {
  const commande = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, assigne: true, fichiers: true },
  });
  if (!commande) notFound();

  return (
    <>
      <AutoImpression />
      <style>{`@page { size: A5; margin: 10mm; }`}</style>

      <div className="mx-auto max-w-xl bg-white p-8 text-plomb-noir">
        <div className="flex items-start justify-between border-b-2 border-encre pb-3">
          <div>
            <Logo hauteur={34} />
            <p className="mt-2 text-micro text-plomb">Bon de travail</p>
          </div>
          <div className="text-right">
            <p className="text-[0.9375rem]">{commande.numero}</p>
            <p className="ref">
              {commande.createdAt.toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-micro text-plomb">Client</dt>
            <dd>{commande.nomContact}</dd>
          </div>
          <div>
            <dt className="text-micro text-plomb">Telephone</dt>
            <dd>{commande.telephone ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-micro text-plomb">Livraison</dt>
            <dd>
              {commande.dateLivraison
                ? commande.dateLivraison.toLocaleDateString("fr-FR")
                : "a definir"}
            </dd>
          </div>
          <div>
            <dt className="text-micro text-plomb">Assigne a</dt>
            <dd>{commande.assigne?.nom ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-micro text-plomb">Priorite</dt>
            <dd>{commande.priorite}</dd>
          </div>
          <div>
            <dt className="text-micro text-plomb">Statut</dt>
            <dd>{commande.statut.replace(/_/g, " ")}</dd>
          </div>
        </dl>

        <table className="mt-5 w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-encre px-1 py-1.5 text-left ref uppercase">
                Travail
              </th>
              <th className="border-b border-encre px-1 py-1.5 text-right ref uppercase">
                Qte
              </th>
              <th className="border-b border-encre px-1 py-1.5 text-right ref uppercase">
                Montant
              </th>
            </tr>
          </thead>
          <tbody>
            {commande.items.map((i) => (
              <tr key={i.id}>
                <td className="border-b border-plomb-noir/[0.08] px-1 py-1.5">
                  {i.designation}
                  {i.details && <span className="block text-xs text-plomb">{i.details}</span>}
                </td>
                <td className="border-b border-plomb-noir/[0.08] px-1 py-1.5 text-right font-mono">
                  {i.quantite}
                </td>
                <td className="border-b border-plomb-noir/[0.08] px-1 py-1.5 text-right font-mono">
                  {formatMontant(i.quantite * toNumber(i.prixUnitaire), commande.devise)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-3 text-right font-mono">
          Total : {formatMontant(commande.total, commande.devise)}
        </p>

        {commande.notes && (
          <p className="mt-4 border-t border-plomb-noir/[0.08] pt-3 text-sm">
            <span className="text-micro text-plomb">Notes : </span>
            {commande.notes}
          </p>
        )}

        {commande.fichiers.length > 0 && (
          <p className="mt-2 text-micro text-plomb">
            {commande.fichiers.length} fichier(s) client joint(s)
          </p>
        )}

        <div className="mt-10 grid grid-cols-2 gap-8 text-center text-micro text-plomb">
          <p className="border-t border-plomb-noir pt-1">Execute par</p>
          <p className="border-t border-plomb-noir pt-1">Recu par le client</p>
        </div>
      </div>
    </>
  );
}

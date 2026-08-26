import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMontant, toNumber } from "@/lib/money";
import { TitrePage, Carte, Tableau, Statut } from "@/components/admin";
import {
  changerStatutDevis,
  ajouterLigneDevis,
  modifierLigneDevis,
  supprimerLigneDevis,
  convertirEnCommande,
} from "../actions";
import { BoutonEnvoi } from "@/components/bouton-envoi";

const STATUTS = ["NOUVEAU", "ENVOYE", "ACCEPTE", "REFUSE", "EXPIRE"];

export default async function DetailDevis({ params }: { params: { id: string } }) {
  const devis = await prisma.quote.findUnique({
    where: { id: params.id },
    include: { items: true, fichiers: true, order: true, customer: true },
  });
  if (!devis) notFound();

  return (
    <>
      <TitrePage
        titre={`Devis ${devis.numero}`}
        sousTitre={`Recu le ${devis.createdAt.toLocaleString("fr-FR")}`}
        action={
          <div className="flex items-center gap-3">
            <Statut valeur={devis.statut} />
            <Link href="/admin/devis" className="btn-contour btn-petit">
              Retour
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-6">
          <Carte titre="Lignes du devis">
            <Tableau colonnes={["Designation", "Qte", "P.U.", "Montant", ""]}>
              {devis.items.map((i) => (
                <tr key={i.id}>
                  <td className="px-3 py-2" colSpan={5}>
                    <form
                      action={modifierLigneDevis}
                      className="grid items-center gap-2 sm:grid-cols-[1fr_5rem_7rem_7rem_auto]"
                    >
                      <input type="hidden" name="id" value={i.id} />
                      <input type="hidden" name="quoteId" value={devis.id} />
                      <input
                        name="designation"
                        defaultValue={i.designation}
                        className="champ"
                        aria-label="Designation"
                      />
                      <input
                        name="quantite"
                        type="number"
                        min={1}
                        defaultValue={i.quantite}
                        className="champ"
                        aria-label="Quantite"
                      />
                      <input
                        name="prixUnitaire"
                        type="number"
                        step="0.01"
                        defaultValue={toNumber(i.prixUnitaire)}
                        className="champ"
                        aria-label="Prix unitaire"
                      />
                      <span className="text-[0.9375rem]">
                        {formatMontant(i.quantite * toNumber(i.prixUnitaire), devis.devise)}
                      </span>
                      <BoutonEnvoi variante="contour">OK</BoutonEnvoi>
                    </form>
                    {i.details && <p className="mt-1 text-sm text-plomb">{i.details}</p>}
                    <form action={supprimerLigneDevis} className="mt-1">
                      <input type="hidden" name="id" value={i.id} />
                      <input type="hidden" name="quoteId" value={devis.id} />
                      <button className="text-micro font-medium text-rouge hover:underline">
                        Supprimer la ligne
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </Tableau>

            <form
              action={ajouterLigneDevis}
              className="mt-5 grid gap-2 border-t border-plomb-noir/[0.08] pt-5 sm:grid-cols-[1fr_5rem_7rem_auto]"
            >
              <input type="hidden" name="quoteId" value={devis.id} />
              <input name="designation" placeholder="Designation" className="champ" required />
              <input
                name="quantite"
                type="number"
                min={1}
                defaultValue={1}
                className="champ"
                aria-label="Quantite"
              />
              <input
                name="prixUnitaire"
                type="number"
                step="0.01"
                placeholder="Prix"
                className="champ"
                aria-label="Prix unitaire"
              />
              <BoutonEnvoi variante="encre">Ajouter</BoutonEnvoi>
            </form>

            <p className="mt-5 flex items-baseline justify-between border-t border-plomb-noir/[0.08] pt-4 font-mono uppercase">
              <span className="text-micro text-plomb">Total du devis</span>
              <span className="text-lg text-encre">{formatMontant(devis.total, devis.devise)}</span>
            </p>
          </Carte>

          {devis.message && (
            <Carte titre="Demande du client">
              <p className="whitespace-pre-wrap text-sm text-plomb-noir">{devis.message}</p>
            </Carte>
          )}

          {devis.fichiers.length > 0 && (
            <Carte titre={`Fichiers envoyes (${devis.fichiers.length})`}>
              <ul className="grid gap-3 sm:grid-cols-3">
                {devis.fichiers.map((f) => (
                  <li key={f.id} className="rounded-plaque border border-plomb-noir/[0.08] p-3">
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-sm text-encre hover:text-rouge"
                    >
                      {f.nom}
                    </a>
                    <p className="mt-1 ref">
                      {(f.taille / 1024).toFixed(0)} Ko
                    </p>
                  </li>
                ))}
              </ul>
            </Carte>
          )}
        </div>

        <div className="space-y-6 lg:sticky lg:top-8">
          <Carte titre="Client">
            <p className="text-plomb-noir">{devis.nomContact}</p>
            <p className="mt-1 ref">{devis.telephone}</p>
            {devis.email && <p className="ref">{devis.email}</p>}
          </Carte>

          <Carte titre="Suivi">
            <form action={changerStatutDevis} className="space-y-3">
              <input type="hidden" name="id" value={devis.id} />
              <select name="statut" defaultValue={devis.statut} className="champ" aria-label="Statut">
                {STATUTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <BoutonEnvoi variante="contour" pleineLargeur>Changer le statut</BoutonEnvoi>
            </form>

            {devis.order ? (
              <Link
                href={`/admin/commandes/${devis.order.id}`}
                className="btn-encre mt-4 w-full"
              >
                Voir la commande {devis.order.numero}
              </Link>
            ) : (
              <form action={convertirEnCommande} className="mt-4">
                <input type="hidden" name="id" value={devis.id} />
                <BoutonEnvoi variante="encre" pleineLargeur>Transformer en commande</BoutonEnvoi>
              </form>
            )}
          </Carte>
        </div>
      </div>
    </>
  );
}

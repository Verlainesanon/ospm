import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMontant, toNumber } from "@/lib/money";
import { TitrePage, Carte, Tableau, Statut } from "@/components/admin";
import {
  changerStatutCommande,
  modifierCommande,
  ajouterLigneCommande,
  modifierLigneCommande,
  supprimerLigneCommande,
  facturerCommande,
} from "../actions";
import { BoutonEnvoi } from "@/components/bouton-envoi";

const STATUTS = ["NOUVELLE", "CONFIRMEE", "EN_PRODUCTION", "PRETE", "LIVREE", "ANNULEE"];

export default async function DetailCommande({ params }: { params: { id: string } }) {
  const [commande, techniciens] = await Promise.all([
    prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        fichiers: true,
        invoices: true,
        assigne: true,
        historique: { orderBy: { createdAt: "desc" } },
        quote: true,
      },
    }),
    prisma.user.findMany({ where: { actif: true }, orderBy: { nom: "asc" } }),
  ]);

  if (!commande) notFound();

  return (
    <>
      <TitrePage
        titre={`Commande ${commande.numero}`}
        sousTitre={`Ouverte le ${commande.createdAt.toLocaleString("fr-FR")} - origine ${commande.origine.toLowerCase()}`}
        action={
          <div className="flex items-center gap-3">
            <Statut valeur={commande.statut} />
            <Link href={`/admin/impression/bon/${commande.id}`} className="btn-contour btn-petit">
              Bon de travail
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-6">
          <Carte titre="Lignes">
            <Tableau colonnes={["Designation", "Qte", "P.U.", "Montant", ""]}>
              {commande.items.map((i) => (
                <tr key={i.id}>
                  <td className="px-3 py-2" colSpan={5}>
                    <form
                      action={modifierLigneCommande}
                      className="grid items-center gap-2 sm:grid-cols-[1fr_5rem_7rem_7rem_auto]"
                    >
                      <input type="hidden" name="id" value={i.id} />
                      <input type="hidden" name="orderId" value={commande.id} />
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
                        {formatMontant(i.quantite * toNumber(i.prixUnitaire), commande.devise)}
                      </span>
                      <BoutonEnvoi variante="contour">OK</BoutonEnvoi>
                    </form>
                    {i.details && <p className="mt-1 text-sm text-plomb">{i.details}</p>}
                    <form action={supprimerLigneCommande} className="mt-1">
                      <input type="hidden" name="id" value={i.id} />
                      <input type="hidden" name="orderId" value={commande.id} />
                      <button className="text-micro font-medium text-rouge hover:underline">
                        Supprimer la ligne
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </Tableau>

            <form
              action={ajouterLigneCommande}
              className="mt-5 grid gap-2 border-t border-plomb-noir/[0.08] pt-5 sm:grid-cols-[1fr_5rem_7rem_auto]"
            >
              <input type="hidden" name="orderId" value={commande.id} />
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

            <dl className="mt-5 space-y-1 border-t border-plomb-noir/[0.08] pt-4 text-[0.9375rem]">
              <div className="flex justify-between">
                <dt className="text-micro uppercase text-plomb">Sous-total</dt>
                <dd>{formatMontant(commande.sousTotal, commande.devise)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-micro uppercase text-plomb">Remise</dt>
                <dd className="text-rouge">- {formatMontant(commande.remise, commande.devise)}</dd>
              </div>
              <div className="flex justify-between border-t border-plomb-noir/[0.08] pt-2 text-lg">
                <dt className="text-micro uppercase text-plomb">Total</dt>
                <dd className="text-encre">{formatMontant(commande.total, commande.devise)}</dd>
              </div>
            </dl>
          </Carte>

          {commande.fichiers.length > 0 && (
            <Carte titre="Fichiers du client">
              <ul className="grid gap-3 sm:grid-cols-3">
                {commande.fichiers.map((f) => (
                  <li key={f.id} className="rounded-plaque border border-plomb-noir/[0.08] p-3">
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-sm text-encre hover:text-rouge"
                    >
                      {f.nom}
                    </a>
                  </li>
                ))}
              </ul>
            </Carte>
          )}

          <Carte titre="Historique">
            <ol className="space-y-2">
              {commande.historique.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-plomb-noir">
                    {h.ancien ? `${h.ancien} -> ${h.nouveau}` : h.nouveau}
                  </span>
                  <span className="ref">
                    {h.parQui} - {h.createdAt.toLocaleString("fr-FR")}
                  </span>
                </li>
              ))}
            </ol>
          </Carte>
        </div>

        <div className="space-y-6 lg:sticky lg:top-8">
          <Carte titre="Client">
            <p className="text-plomb-noir">{commande.nomContact}</p>
            <p className="mt-1 ref">{commande.telephone}</p>
            {commande.email && <p className="ref">{commande.email}</p>}
            {commande.quote && (
              <Link
                href={`/admin/devis/${commande.quote.id}`}
                className="mt-3 block text-micro font-medium text-encre hover:text-rouge"
              >
                Devis {commande.quote.numero}
              </Link>
            )}
          </Carte>

          <Carte titre="Avancement">
            <form action={changerStatutCommande} className="space-y-3">
              <input type="hidden" name="id" value={commande.id} />
              <select
                name="statut"
                defaultValue={commande.statut}
                className="champ"
                aria-label="Statut"
              >
                {STATUTS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <BoutonEnvoi variante="encre" pleineLargeur>Mettre a jour</BoutonEnvoi>
            </form>
          </Carte>

          <Carte titre="Production">
            <form action={modifierCommande} className="space-y-3">
              <input type="hidden" name="id" value={commande.id} />
              <div>
                <label className="etiquette" htmlFor="priorite">
                  Priorite
                </label>
                <select id="priorite" name="priorite" defaultValue={commande.priorite} className="champ">
                  <option value="BASSE">Basse</option>
                  <option value="NORMALE">Normale</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>
              <div>
                <label className="etiquette" htmlFor="assigneId">
                  Assigne a
                </label>
                <select
                  id="assigneId"
                  name="assigneId"
                  defaultValue={commande.assigneId ?? ""}
                  className="champ"
                >
                  <option value="">Personne</option>
                  {techniciens.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="etiquette" htmlFor="dateLivraison">
                  Date de livraison
                </label>
                <input
                  id="dateLivraison"
                  name="dateLivraison"
                  type="date"
                  defaultValue={
                    commande.dateLivraison
                      ? commande.dateLivraison.toISOString().slice(0, 10)
                      : ""
                  }
                  className="champ"
                />
              </div>
              <div>
                <label className="etiquette" htmlFor="remise">
                  Remise ({commande.devise})
                </label>
                <input
                  id="remise"
                  name="remise"
                  type="number"
                  step="0.01"
                  defaultValue={toNumber(commande.remise)}
                  className="champ"
                />
              </div>
              <div>
                <label className="etiquette" htmlFor="notes">
                  Notes d'atelier
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  defaultValue={commande.notes}
                  className="champ"
                />
              </div>
              <BoutonEnvoi variante="contour" pleineLargeur>Enregistrer</BoutonEnvoi>
            </form>
          </Carte>

          <Carte titre="Facturation">
            {commande.invoices.length > 0 ? (
              <ul className="space-y-2">
                {commande.invoices.map((f) => (
                  <li key={f.id}>
                    <Link
                      href={`/admin/factures/${f.id}`}
                      className="flex items-center justify-between gap-3 text-sm text-encre hover:text-rouge"
                    >
                      <span className="ref">{f.numero}</span>
                      <Statut valeur={f.statut} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-plomb">Aucune facture emise pour cette commande.</p>
            )}

            <div className="mt-4 grid gap-2">
              <form action={facturerCommande}>
                <input type="hidden" name="id" value={commande.id} />
                <input type="hidden" name="type" value="FACTURE" />
                <BoutonEnvoi variante="encre" pleineLargeur>Emettre une facture</BoutonEnvoi>
              </form>
              <form action={facturerCommande}>
                <input type="hidden" name="id" value={commande.id} />
                <input type="hidden" name="type" value="PROFORMA" />
                <BoutonEnvoi variante="contour" pleineLargeur>Emettre une proforma</BoutonEnvoi>
              </form>
            </div>
          </Carte>
        </div>
      </div>
    </>
  );
}

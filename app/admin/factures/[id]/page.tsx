import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMontant, toNumber } from "@/lib/money";
import { TitrePage, Carte, Tableau, Statut } from "@/components/admin";
import {
  modifierFacture,
  ajouterLigneFacture,
  modifierLigneFacture,
  supprimerLigneFacture,
  enregistrerPaiement,
  supprimerPaiement,
} from "../actions";
import { BoutonEnvoi } from "@/components/bouton-envoi";

const STATUTS = ["BROUILLON", "EMISE", "PARTIELLE", "PAYEE", "ANNULEE"];
const METHODES = ["ESPECES", "MONCASH", "NATCASH", "CHEQUE", "VIREMENT", "CARTE"];

export default async function DetailFacture({ params }: { params: { id: string } }) {
  const facture = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      paiements: { orderBy: { date: "desc" } },
      order: true,
      customer: true,
    },
  });
  if (!facture) notFound();

  const reste = toNumber(facture.total) - toNumber(facture.montantPaye);

  return (
    <>
      <TitrePage
        titre={`${facture.type} ${facture.numero}`}
        sousTitre={`Emise le ${facture.dateEmission.toLocaleDateString("fr-FR")}`}
        action={
          <div className="flex items-center gap-3">
            <Statut valeur={facture.statut} />
            <Link href={`/admin/impression/facture/${facture.id}`} className="btn-encre btn-petit">
              Imprimer
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-6">
          <Carte titre="Lignes">
            <Tableau colonnes={["Designation", "Qte", "P.U.", "Montant", ""]}>
              {facture.items.map((i) => (
                <tr key={i.id}>
                  <td className="px-3 py-2" colSpan={5}>
                    <form
                      action={modifierLigneFacture}
                      className="grid items-center gap-2 sm:grid-cols-[1fr_5rem_7rem_7rem_auto]"
                    >
                      <input type="hidden" name="id" value={i.id} />
                      <input type="hidden" name="invoiceId" value={facture.id} />
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
                        {formatMontant(i.quantite * toNumber(i.prixUnitaire), facture.devise)}
                      </span>
                      <BoutonEnvoi variante="contour">OK</BoutonEnvoi>
                    </form>
                    <form action={supprimerLigneFacture} className="mt-1">
                      <input type="hidden" name="id" value={i.id} />
                      <input type="hidden" name="invoiceId" value={facture.id} />
                      <button className="text-micro font-medium text-rouge hover:underline">
                        Supprimer la ligne
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </Tableau>

            <form
              action={ajouterLigneFacture}
              className="mt-5 grid gap-2 border-t border-plomb-noir/[0.08] pt-5 sm:grid-cols-[1fr_5rem_7rem_auto]"
            >
              <input type="hidden" name="invoiceId" value={facture.id} />
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
                <dd>{formatMontant(facture.sousTotal, facture.devise)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-micro uppercase text-plomb">Remise</dt>
                <dd className="text-rouge">- {formatMontant(facture.remise, facture.devise)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-micro uppercase text-plomb">Taxe</dt>
                <dd>{formatMontant(facture.taxe, facture.devise)}</dd>
              </div>
              <div className="flex justify-between border-t border-plomb-noir/[0.08] pt-2 text-lg">
                <dt className="text-micro uppercase text-plomb">Total</dt>
                <dd className="text-encre">{formatMontant(facture.total, facture.devise)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-micro uppercase text-plomb">Deja paye</dt>
                <dd>{formatMontant(facture.montantPaye, facture.devise)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-micro uppercase text-plomb">Reste du</dt>
                <dd className={reste > 0 ? "text-rouge" : "text-emerald-700"}>
                  {formatMontant(reste, facture.devise)}
                </dd>
              </div>
            </dl>
          </Carte>

          <Carte titre={`Paiements (${facture.paiements.length})`}>
            {facture.paiements.length > 0 && (
              <Tableau colonnes={["Date", "Montant", "Methode", "Reference", ""]}>
                {facture.paiements.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2 ref">
                      {p.date.toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-3 py-2 font-mono">{formatMontant(p.montant, p.devise)}</td>
                    <td className="px-3 py-2 ref">{p.methode}</td>
                    <td className="px-3 py-2 text-sm text-plomb">{p.reference ?? "-"}</td>
                    <td className="px-3 py-2 text-right">
                      <form action={supprimerPaiement}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="invoiceId" value={facture.id} />
                        <button className="text-micro font-medium text-rouge hover:underline">
                          Annuler
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </Tableau>
            )}

            <form
              action={enregistrerPaiement}
              className="mt-5 grid gap-2 border-t border-plomb-noir/[0.08] pt-5 sm:grid-cols-[7rem_9rem_1fr_auto]"
            >
              <input type="hidden" name="invoiceId" value={facture.id} />
              <input
                name="montant"
                type="number"
                step="0.01"
                defaultValue={reste > 0 ? reste.toFixed(2) : ""}
                placeholder="Montant"
                className="champ"
                aria-label="Montant"
                required
              />
              <select name="methode" className="champ" aria-label="Methode">
                {METHODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <input name="reference" placeholder="Reference (facultatif)" className="champ" />
              <BoutonEnvoi variante="encre">Encaisser</BoutonEnvoi>
            </form>
          </Carte>
        </div>

        <div className="space-y-6 lg:sticky lg:top-8">
          <Carte titre="Document">
            <form action={modifierFacture} className="space-y-3">
              <input type="hidden" name="id" value={facture.id} />
              <div>
                <label className="etiquette" htmlFor="nomClient">
                  Client
                </label>
                <input
                  id="nomClient"
                  name="nomClient"
                  defaultValue={facture.nomClient}
                  className="champ"
                />
              </div>
              <div>
                <label className="etiquette" htmlFor="statut">
                  Statut
                </label>
                <select id="statut" name="statut" defaultValue={facture.statut} className="champ">
                  {STATUTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="etiquette" htmlFor="remise">
                    Remise
                  </label>
                  <input
                    id="remise"
                    name="remise"
                    type="number"
                    step="0.01"
                    defaultValue={toNumber(facture.remise)}
                    className="champ"
                  />
                </div>
                <div>
                  <label className="etiquette" htmlFor="taxe">
                    Taxe
                  </label>
                  <input
                    id="taxe"
                    name="taxe"
                    type="number"
                    step="0.01"
                    defaultValue={toNumber(facture.taxe)}
                    className="champ"
                  />
                </div>
              </div>
              <div>
                <label className="etiquette" htmlFor="dateEcheance">
                  Echeance
                </label>
                <input
                  id="dateEcheance"
                  name="dateEcheance"
                  type="date"
                  defaultValue={
                    facture.dateEcheance ? facture.dateEcheance.toISOString().slice(0, 10) : ""
                  }
                  className="champ"
                />
              </div>
              <div>
                <label className="etiquette" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  defaultValue={facture.notes}
                  className="champ"
                />
              </div>
              <BoutonEnvoi variante="contour" pleineLargeur>Enregistrer</BoutonEnvoi>
            </form>
          </Carte>

          {facture.order && (
            <Carte titre="Commande liee">
              <Link
                href={`/admin/commandes/${facture.order.id}`}
                className="text-micro font-medium text-encre hover:text-rouge"
              >
                {facture.order.numero}
              </Link>
            </Carte>
          )}
        </div>
      </div>
    </>
  );
}

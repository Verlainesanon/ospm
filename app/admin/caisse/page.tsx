import { prisma } from "@/lib/db";
import { formatMontant, toNumber } from "@/lib/money";
import { TitrePage, Carte, Tableau, Chiffre, Vide } from "@/components/admin";
import { ouvrirCaisse, fermerCaisse, ajouterMouvement, supprimerMouvement } from "./actions";
import { BoutonEnvoi } from "@/components/bouton-envoi";

export const metadata = { title: "Caisse" };

export default async function AdminCaisse() {
  const caisse = await prisma.cashSession.findFirst({
    where: { fermeeLe: null },
    include: { mouvements: { orderBy: { date: "desc" }, include: { user: true } } },
  });

  const dernieres = await prisma.cashSession.findMany({
    where: { fermeeLe: { not: null } },
    orderBy: { fermeeLe: "desc" },
    take: 10,
  });

  const entrees = caisse?.mouvements
    .filter((m) => m.sens === "ENTREE")
    .reduce((s, m) => s + toNumber(m.montant), 0) ?? 0;
  const sorties = caisse?.mouvements
    .filter((m) => m.sens === "SORTIE")
    .reduce((s, m) => s + toNumber(m.montant), 0) ?? 0;
  const solde = toNumber(caisse?.soldeOuverture) + entrees - sorties;

  return (
    <>
      <TitrePage
        titre="Caisse"
        sousTitre="Une session par journee. Les paiements de factures et les depenses y tombent automatiquement."
      />

      {!caisse ? (
        <Carte titre="Aucune caisse ouverte">
          <form action={ouvrirCaisse} className="grid gap-3 sm:grid-cols-[12rem_auto]">
            <div>
              <label className="etiquette" htmlFor="soldeOuverture">
                Fond de caisse au depart
              </label>
              <input
                id="soldeOuverture"
                name="soldeOuverture"
                type="number"
                step="0.01"
                defaultValue={0}
                className="champ"
              />
            </div>
            <div className="flex items-end">
              <button className="btn-encre">Ouvrir la caisse</button>
            </div>
          </form>
        </Carte>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <Chiffre
              label="Fond de depart"
              valeur={formatMontant(caisse.soldeOuverture)}
              accent="plomb"
            />
            <Chiffre label="Entrees" valeur={formatMontant(entrees)} />
            <Chiffre label="Sorties" valeur={formatMontant(sorties)} accent="rouge" />
            <Chiffre
              label="Solde theorique"
              valeur={formatMontant(solde)}
              detail={`Ouverte le ${caisse.ouverteLe.toLocaleString("fr-FR")}`}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
            <Carte titre={`${caisse.mouvements.length} mouvement(s)`}>
              {caisse.mouvements.length === 0 ? (
                <Vide texte="Aucun mouvement depuis l'ouverture." />
              ) : (
                <Tableau colonnes={["Heure", "Motif", "Par", "Sens", "Montant", ""]}>
                  {caisse.mouvements.map((m) => (
                    <tr key={m.id}>
                      <td className="px-3 py-2 ref">
                        {m.date.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-3 py-2 text-plomb-noir">{m.motif}</td>
                      <td className="px-3 py-2 text-sm text-plomb">{m.user?.nom ?? "-"}</td>
                      <td className="px-3 py-2 ref uppercase">
                        {m.sens === "ENTREE" ? (
                          <span className="text-emerald-700">entree</span>
                        ) : (
                          <span className="text-rouge">sortie</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono">{formatMontant(m.montant, m.devise)}</td>
                      <td className="px-3 py-2 text-right">
                        {!m.paymentId && !m.expenseId && (
                          <form action={supprimerMouvement}>
                            <input type="hidden" name="id" value={m.id} />
                            <button className="text-micro font-medium text-rouge hover:underline">
                              Supprimer
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </Tableau>
              )}
            </Carte>

            <div className="space-y-6 lg:sticky lg:top-8">
              <Carte titre="Mouvement manuel">
                <form action={ajouterMouvement} className="space-y-3">
                  <div>
                    <label className="etiquette" htmlFor="sens">
                      Sens
                    </label>
                    <select id="sens" name="sens" className="champ">
                      <option value="ENTREE">Entree</option>
                      <option value="SORTIE">Sortie</option>
                    </select>
                  </div>
                  <div>
                    <label className="etiquette" htmlFor="montant">
                      Montant
                    </label>
                    <input
                      id="montant"
                      name="montant"
                      type="number"
                      step="0.01"
                      className="champ"
                      required
                    />
                  </div>
                  <div>
                    <label className="etiquette" htmlFor="motif">
                      Motif
                    </label>
                    <input id="motif" name="motif" className="champ" required />
                  </div>
                  <BoutonEnvoi variante="encre" pleineLargeur>Enregistrer</BoutonEnvoi>
                </form>
              </Carte>

              <Carte titre="Cloture">
                <form action={fermerCaisse} className="space-y-3">
                  <input type="hidden" name="id" value={caisse.id} />
                  <div>
                    <label className="etiquette" htmlFor="notes">
                      Ecart constate, remarques
                    </label>
                    <textarea id="notes" name="notes" rows={3} className="champ" />
                  </div>
                  <button className="btn-rouge w-full">Fermer la caisse</button>
                  <p className="text-micro text-plomb">
                    Solde enregistre : {formatMontant(solde)}
                  </p>
                </form>
              </Carte>
            </div>
          </div>
        </>
      )}

      {dernieres.length > 0 && (
        <Carte titre="Dernieres clotures" className="mt-6">
          <Tableau colonnes={["Ouverte le", "Fermee le", "Par", "Solde de cloture", "Notes"]}>
            {dernieres.map((s) => (
              <tr key={s.id}>
                <td className="px-3 py-2 ref">
                  {s.ouverteLe.toLocaleString("fr-FR")}
                </td>
                <td className="px-3 py-2 ref">
                  {s.fermeeLe?.toLocaleString("fr-FR")}
                </td>
                <td className="px-3 py-2 text-sm">{s.ouvertePar}</td>
                <td className="px-3 py-2 font-mono">{formatMontant(s.soldeCloture)}</td>
                <td className="px-3 py-2 text-sm text-plomb">{s.notes}</td>
              </tr>
            ))}
          </Tableau>
        </Carte>
      )}
    </>
  );
}

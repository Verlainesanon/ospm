import { prisma } from "@/lib/db";
import { formatMontant, toNumber } from "@/lib/money";
import { TitrePage, Carte, Tableau, Chiffre, Vide } from "@/components/admin";
import { ajouterDepense, supprimerDepense, creerCategorieDepense } from "./actions";
import { BoutonEnvoi } from "@/components/bouton-envoi";

export const metadata = { title: "Depenses" };

const METHODES = ["ESPECES", "MONCASH", "NATCASH", "CHEQUE", "VIREMENT", "CARTE"];

export default async function AdminDepenses({
  searchParams,
}: {
  searchParams: { mois?: string };
}) {
  const mois = searchParams.mois ?? new Date().toISOString().slice(0, 7);
  const debut = new Date(`${mois}-01T00:00:00`);
  const fin = new Date(debut);
  fin.setMonth(fin.getMonth() + 1);

  const [depenses, categories] = await Promise.all([
    prisma.expense.findMany({
      where: { date: { gte: debut, lt: fin } },
      orderBy: { date: "desc" },
      include: { categorie: true, user: true },
    }),
    prisma.expenseCategory.findMany({ orderBy: { nom: "asc" } }),
  ]);

  const total = depenses.reduce((s, d) => s + toNumber(d.montant), 0);
  const parCategorie = categories
    .map((c) => ({
      nom: c.nom,
      couleur: c.couleur,
      total: depenses
        .filter((d) => d.categorieId === c.id)
        .reduce((s, d) => s + toNumber(d.montant), 0),
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <>
      <TitrePage
        titre="Depenses"
        sousTitre="Sorties d'argent de l'atelier. Les depenses en especes sortent aussi de la caisse."
        action={
          <form className="flex items-end gap-2">
            <div>
              <label className="etiquette" htmlFor="mois">
                Mois
              </label>
              <input id="mois" name="mois" type="month" defaultValue={mois} className="champ" />
            </div>
            <BoutonEnvoi variante="contour">Afficher</BoutonEnvoi>
          </form>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Chiffre label="Total du mois" valeur={formatMontant(total)} accent="rouge" />
        <Chiffre label="Nombre de depenses" valeur={String(depenses.length)} accent="plomb" />
        <Chiffre
          label="Poste principal"
          valeur={parCategorie[0]?.nom ?? "-"}
          detail={parCategorie[0] ? formatMontant(parCategorie[0].total) : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-6">
          <Carte titre={`Depenses de ${debut.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`}>
            {depenses.length === 0 ? (
              <Vide texte="Aucune depense enregistree ce mois-ci." />
            ) : (
              <Tableau colonnes={["Date", "Libelle", "Categorie", "Methode", "Montant", ""]}>
                {depenses.map((d) => (
                  <tr key={d.id}>
                    <td className="px-3 py-2 ref">
                      {d.date.toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-3 py-2">
                      <p className="text-plomb-noir">{d.libelle}</p>
                      {d.fournisseur && (
                        <p className="ref">{d.fournisseur}</p>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm text-plomb">{d.categorie?.nom ?? "-"}</td>
                    <td className="px-3 py-2 ref">{d.methode}</td>
                    <td className="px-3 py-2 font-mono">{formatMontant(d.montant, d.devise)}</td>
                    <td className="px-3 py-2 text-right">
                      <form action={supprimerDepense}>
                        <input type="hidden" name="id" value={d.id} />
                        <button className="text-micro font-medium text-rouge hover:underline">
                          Supprimer
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </Tableau>
            )}
          </Carte>

          {parCategorie.length > 0 && (
            <Carte titre="Repartition par poste">
              <ul className="space-y-3">
                {parCategorie.map((c) => (
                  <li key={c.nom}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-plomb-noir">{c.nom}</span>
                      <span className="text-[0.9375rem]">{formatMontant(c.total)}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-douce bg-creme">
                      <div
                        className="h-1.5 rounded-plaque"
                        style={{
                          width: `${Math.round((c.total / total) * 100)}%`,
                          backgroundColor: c.couleur,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Carte>
          )}
        </div>

        <div className="space-y-6 lg:sticky lg:top-8">
          <Carte titre="Nouvelle depense">
            <form action={ajouterDepense} className="space-y-3">
              <div>
                <label className="etiquette" htmlFor="libelle">
                  Libelle
                </label>
                <input id="libelle" name="libelle" className="champ" required />
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
                <label className="etiquette" htmlFor="categorieId">
                  Categorie
                </label>
                <select id="categorieId" name="categorieId" className="champ">
                  <option value="">Sans categorie</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="etiquette" htmlFor="methode">
                  Methode
                </label>
                <select id="methode" name="methode" className="champ">
                  {METHODES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="etiquette" htmlFor="fournisseur">
                  Fournisseur
                </label>
                <input id="fournisseur" name="fournisseur" className="champ" />
              </div>
              <div>
                <label className="etiquette" htmlFor="date">
                  Date
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="champ"
                />
              </div>
              <BoutonEnvoi variante="encre" pleineLargeur>Enregistrer la depense</BoutonEnvoi>
            </form>
          </Carte>

          <Carte titre="Nouveau poste de depense">
            <form action={creerCategorieDepense} className="flex gap-2">
              <input name="nom" placeholder="Nom" className="champ" required aria-label="Nom" />
              <input
                name="couleur"
                type="color"
                defaultValue="#1d4ed8"
                className="h-11 w-14 rounded-plaque border border-plomb-noir/[0.08]"
                aria-label="Couleur"
              />
              <BoutonEnvoi variante="contour">OK</BoutonEnvoi>
            </form>
          </Carte>
        </div>
      </div>
    </>
  );
}

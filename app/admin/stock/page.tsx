import { prisma } from "@/lib/db";
import { formatMontant, toNumber } from "@/lib/money";
import { TitrePage, Carte, Tableau, Chiffre, Vide, Champ } from "@/components/admin";
import {
  creerArticle,
  modifierArticle,
  supprimerArticle,
  mouvementStock,
  creerFournisseur,
} from "./actions";
import { BoutonEnvoi } from "@/components/bouton-envoi";

export const metadata = { title: "Stock" };

const CATEGORIES = ["fourniture", "consommable", "produit_fini"];
const UNITES = ["unite", "rame", "boite", "metre", "litre", "kg"];

export default async function AdminStock() {
  const [articles, fournisseurs, mouvements] = await Promise.all([
    prisma.stockItem.findMany({ orderBy: { nom: "asc" }, include: { fournisseur: true } }),
    prisma.supplier.findMany({ orderBy: { nom: "asc" } }),
    prisma.stockMovement.findMany({
      orderBy: { date: "desc" },
      take: 25,
      include: { item: true, user: true },
    }),
  ]);

  const enAlerte = articles.filter((a) => toNumber(a.quantite) <= toNumber(a.seuilAlerte));
  const valeur = articles.reduce((s, a) => s + toNumber(a.quantite) * toNumber(a.prixAchat), 0);

  return (
    <>
      <TitrePage
        titre="Stock"
        sousTitre="Fournitures et consommables de l'atelier. Chaque variation laisse un mouvement tracable."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Chiffre label="Articles suivis" valeur={String(articles.length)} accent="plomb" />
        <Chiffre label="Valeur du stock" valeur={formatMontant(valeur)} />
        <Chiffre
          label="Sous le seuil"
          valeur={String(enAlerte.length)}
          accent={enAlerte.length > 0 ? "rouge" : "plomb"}
          detail={enAlerte.map((a) => a.nom).slice(0, 3).join(", ") || undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-start">
        <div className="space-y-6">
          <Carte titre={`${articles.length} article(s)`}>
            {articles.length === 0 ? (
              <Vide texte="Aucun article en stock." />
            ) : (
              <div className="space-y-4">
                {articles.map((a) => {
                  const alerte = toNumber(a.quantite) <= toNumber(a.seuilAlerte);
                  return (
                    <article
                      key={a.id}
                      className={`rounded-douce border p-5 ${
                        alerte ? "border-rouge/30 bg-rouge/[0.03]" : "border-plomb-noir/[0.08]"
                      }`}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <div>
                          <h3 className="font-sans text-[1.0625rem] font-medium text-plomb-noir">{a.nom}</h3>
                          <p className="ref mt-1">
                            {a.reference}
                            {a.fournisseur && ` · ${a.fournisseur.nom}`}
                          </p>
                        </div>
                        <p
                          className={`font-display text-2xl ${alerte ? "text-rouge" : "text-encre"}`}
                        >
                          {toNumber(a.quantite)}
                          <span className="ml-1.5 text-micro text-plomb">{a.unite}</span>
                        </p>
                      </div>

                      <div className="mt-5 grid gap-5 lg:grid-cols-2">
                        {/* Fiche article */}
                        <form action={modifierArticle} className="space-y-3">
                          <input type="hidden" name="id" value={a.id} />
                          <Champ label="Nom de l'article">
                            <input name="nom" defaultValue={a.nom} className="champ" />
                          </Champ>
                          <div className="grid grid-cols-2 gap-3">
                            <Champ label="Seuil d'alerte">
                              <input
                                name="seuilAlerte"
                                type="number"
                                step="0.01"
                                defaultValue={toNumber(a.seuilAlerte)}
                                className="champ"
                              />
                            </Champ>
                            <Champ label="Prix d'achat">
                              <input
                                name="prixAchat"
                                type="number"
                                step="0.01"
                                defaultValue={toNumber(a.prixAchat)}
                                className="champ"
                              />
                            </Champ>
                          </div>
                          <BoutonEnvoi variante="contour">Enregistrer la fiche</BoutonEnvoi>
                        </form>

                        {/* Mouvement de stock */}
                        <form
                          action={mouvementStock}
                          className="space-y-3 rounded-douce bg-creme p-4"
                        >
                          <input type="hidden" name="itemId" value={a.id} />
                          <p className="text-micro font-medium text-plomb-noir">
                            Enregistrer un mouvement
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <Champ label="Sens">
                              <select name="sens" className="champ">
                                <option value="ENTREE">Entree</option>
                                <option value="SORTIE">Sortie</option>
                                <option value="AJUSTEMENT">Ajustement</option>
                              </select>
                            </Champ>
                            <Champ label={`Quantite (${a.unite})`}>
                              <input
                                name="quantite"
                                type="number"
                                step="0.01"
                                className="champ"
                                required
                              />
                            </Champ>
                          </div>
                          <Champ label="Motif">
                            <input
                              name="motif"
                              placeholder="Reappro, sortie atelier, inventaire..."
                              className="champ"
                            />
                          </Champ>
                          <BoutonEnvoi variante="encre">Valider le mouvement</BoutonEnvoi>
                        </form>
                      </div>

                      <form
                        action={supprimerArticle}
                        className="mt-4 border-t border-plomb-noir/[0.08] pt-3"
                      >
                        <input type="hidden" name="id" value={a.id} />
                        <button className="text-micro font-medium text-rouge transition-colors hover:text-rouge-sombre">
                          Supprimer l&apos;article
                        </button>
                      </form>
                    </article>
                  );
                })}
              </div>
            )}
          </Carte>

          <Carte titre="Derniers mouvements">
            {mouvements.length === 0 ? (
              <Vide texte="Aucun mouvement enregistre." />
            ) : (
              <Tableau colonnes={["Date", "Article", "Sens", "Quantite", "Motif", "Par"]}>
                {mouvements.map((m) => (
                  <tr key={m.id}>
                    <td className="px-3 py-2.5 ref">{m.date.toLocaleDateString("fr-FR")}</td>
                    <td className="px-3 py-2.5 text-plomb-noir">{m.item.nom}</td>
                    <td className="px-3 py-2.5">
                      {m.sens === "ENTREE" ? (
                        <span className="text-emerald-700">Entree</span>
                      ) : m.sens === "SORTIE" ? (
                        <span className="text-rouge">Sortie</span>
                      ) : (
                        <span className="text-plomb">Ajustement</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-medium">{toNumber(m.quantite)}</td>
                    <td className="px-3 py-2.5 text-plomb">{m.motif || "—"}</td>
                    <td className="px-3 py-2.5 text-plomb">{m.user?.nom ?? "—"}</td>
                  </tr>
                ))}
              </Tableau>
            )}
          </Carte>
        </div>

        <div className="space-y-6 lg:sticky lg:top-8">
          <Carte titre="Nouvel article">
            <form action={creerArticle} className="space-y-4">
              <Champ label="Reference">
                <input name="reference" placeholder="PAP-A4" className="champ" required />
              </Champ>
              <Champ label="Nom">
                <input name="nom" className="champ" required />
              </Champ>
              <div className="grid grid-cols-2 gap-3">
                <Champ label="Categorie">
                  <select name="categorie" className="champ">
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </Champ>
                <Champ label="Unite">
                  <select name="unite" className="champ">
                    {UNITES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </Champ>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Champ label="Quantite">
                  <input name="quantite" type="number" step="0.01" defaultValue={0} className="champ" />
                </Champ>
                <Champ label="Seuil">
                  <input
                    name="seuilAlerte"
                    type="number"
                    step="0.01"
                    defaultValue={0}
                    className="champ"
                  />
                </Champ>
                <Champ label="Achat">
                  <input name="prixAchat" type="number" step="0.01" defaultValue={0} className="champ" />
                </Champ>
              </div>
              <Champ label="Fournisseur">
                <select name="fournisseurId" className="champ">
                  <option value="">Aucun</option>
                  {fournisseurs.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nom}
                    </option>
                  ))}
                </select>
              </Champ>
              <BoutonEnvoi variante="encre" pleineLargeur>Ajouter l&apos;article</BoutonEnvoi>
            </form>
          </Carte>

          <Carte titre="Nouveau fournisseur">
            <form action={creerFournisseur} className="space-y-4">
              <Champ label="Nom">
                <input name="nom" className="champ" required />
              </Champ>
              <Champ label="Telephone">
                <input name="telephone" className="champ" />
              </Champ>
              <BoutonEnvoi variante="contour" pleineLargeur>Ajouter</BoutonEnvoi>
            </form>
          </Carte>
        </div>
      </div>
    </>
  );
}

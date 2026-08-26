import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/money";
import { TitrePage, Carte, Vide, Champ } from "@/components/admin";
import {
  creerCategorie,
  modifierCategorie,
  supprimerCategorie,
  creerService,
  modifierService,
  supprimerService,
} from "./actions";
import { BoutonEnvoi } from "@/components/bouton-envoi";

export const metadata = { title: "Services & prix" };

const UNITES = ["unite", "page", "m2", "heure", "forfait", "jeu de 4", "document"];
const COULEURS: [string, string][] = [
  ["bleu", "Bleu"],
  ["rouge", "Rouge"],
  ["creme", "Creme"],
];

export default async function AdminServices() {
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { ordre: "asc" },
    include: { services: { orderBy: { ordre: "asc" } } },
  });

  return (
    <>
      <TitrePage
        titre="Services & prix"
        sousTitre="Chaque modification apparait immediatement sur le site public. Un service coche « vendable en ligne » rejoint la boutique."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-start">
        <div className="space-y-6">
          {categories.map((c) => (
            <Carte
              key={c.id}
              titre={`${c.nom} · ${c.services.length} service(s)`}
              action={
                !c.visible ? (
                  <span className="rounded-full bg-plomb/10 px-3 py-1 text-micro text-plomb">
                    Masque du site
                  </span>
                ) : null
              }
            >
              {/* --- Fiche de l'atelier --- */}
              <form action={modifierCategorie} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={c.id} />
                <Champ label="Nom de l'atelier">
                  <input name="nom" defaultValue={c.nom} className="champ" />
                </Champ>
                <Champ label="Description affichee sur le site">
                  <input name="description" defaultValue={c.description} className="champ" />
                </Champ>
                <Champ label="Couleur d'accent">
                  <select name="couleur" defaultValue={c.couleur} className="champ">
                    {COULEURS.map(([valeur, label]) => (
                      <option key={valeur} value={valeur}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Champ>
                <Champ label="Ordre d'affichage">
                  <input name="ordre" type="number" defaultValue={c.ordre} className="champ" />
                </Champ>
                <div className="flex items-center gap-5 sm:col-span-2">
                  <label className="flex items-center gap-2 text-[0.9375rem] text-plomb">
                    <input type="checkbox" name="visible" defaultChecked={c.visible} /> Visible sur
                    le site
                  </label>
                  <BoutonEnvoi variante="contour">Enregistrer l&apos;atelier</BoutonEnvoi>
                </div>
              </form>

              {/* --- Services de l'atelier --- */}
              <div className="mt-7 space-y-3 border-t border-plomb-noir/[0.08] pt-6">
                {c.services.length === 0 && <Vide texte="Cet atelier n'a encore aucun service." />}

                {c.services.map((s) => (
                  <article key={s.id} className="rounded-douce border border-plomb-noir/[0.08] p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h3 className="font-sans text-[1.0625rem] font-medium text-plomb-noir">
                        {s.nom}
                      </h3>
                      <p className="ref">
                        {s.surDevis || s.prixBase === null
                          ? "Sur devis"
                          : `${toNumber(s.prixBase)} ${s.devise} / ${s.unite}`}
                        {s.vendableEnLigne && " · en boutique"}
                        {!s.visible && " · masque"}
                      </p>
                    </div>

                    <form action={modifierService} className="mt-4 grid gap-3 sm:grid-cols-2">
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="categorieId" value={c.id} />
                      <input type="hidden" name="ordre" value={s.ordre} />

                      <Champ label="Nom du service">
                        <input name="nom" defaultValue={s.nom} className="champ" />
                      </Champ>
                      <Champ label="Description">
                        <input name="description" defaultValue={s.description} className="champ" />
                      </Champ>

                      <div className="grid grid-cols-3 gap-3 sm:col-span-2">
                        <Champ label="Prix de base">
                          <input
                            name="prixBase"
                            type="number"
                            step="0.01"
                            defaultValue={s.prixBase === null ? "" : toNumber(s.prixBase)}
                            placeholder="Vide si sur devis"
                            className="champ"
                          />
                        </Champ>
                        <Champ label="Devise">
                          <select name="devise" defaultValue={s.devise} className="champ">
                            <option value="HTG">HTG</option>
                            <option value="USD">USD</option>
                          </select>
                        </Champ>
                        <Champ label="Unite">
                          <select name="unite" defaultValue={s.unite} className="champ">
                            {UNITES.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </Champ>
                      </div>

                      <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
                        <label className="flex items-center gap-2 text-[0.9375rem] text-plomb">
                          <input type="checkbox" name="surDevis" defaultChecked={s.surDevis} /> Sur
                          devis
                        </label>
                        <label className="flex items-center gap-2 text-[0.9375rem] text-plomb">
                          <input
                            type="checkbox"
                            name="vendableEnLigne"
                            defaultChecked={s.vendableEnLigne}
                          />{" "}
                          Vendable en ligne
                        </label>
                        <label className="flex items-center gap-2 text-[0.9375rem] text-plomb">
                          <input type="checkbox" name="visible" defaultChecked={s.visible} /> Visible
                        </label>
                        <BoutonEnvoi variante="contour">Enregistrer</BoutonEnvoi>
                      </div>
                    </form>

                    <form
                      action={supprimerService}
                      className="mt-4 border-t border-plomb-noir/[0.08] pt-3"
                    >
                      <input type="hidden" name="id" value={s.id} />
                      <button className="text-micro font-medium text-rouge transition-colors hover:text-rouge-sombre">
                        Supprimer ce service
                      </button>
                    </form>
                  </article>
                ))}

                {/* --- Ajout rapide --- */}
                <form
                  action={creerService}
                  className="grid gap-3 rounded-douce bg-creme p-5 sm:grid-cols-[1.6fr_0.8fr_auto] sm:items-end"
                >
                  <input type="hidden" name="categorieId" value={c.id} />
                  <Champ label="Nouveau service dans cet atelier">
                    <input name="nom" placeholder="Nom du service" className="champ" required />
                  </Champ>
                  <Champ label="Prix (facultatif)">
                    <input name="prixBase" type="number" step="0.01" className="champ" />
                  </Champ>
                  <BoutonEnvoi variante="encre">Ajouter</BoutonEnvoi>
                </form>
              </div>

              <form
                action={supprimerCategorie}
                className="mt-6 border-t border-plomb-noir/[0.08] pt-4"
              >
                <input type="hidden" name="id" value={c.id} />
                <button className="text-micro font-medium text-rouge transition-colors hover:text-rouge-sombre">
                  Supprimer l&apos;atelier et ses {c.services.length} service(s)
                </button>
              </form>
            </Carte>
          ))}
        </div>

        <Carte titre="Nouvel atelier" className="lg:sticky lg:top-8">
          <form action={creerCategorie} className="space-y-4">
            <Champ label="Nom">
              <input name="nom" className="champ" required />
            </Champ>
            <Champ label="Description">
              <textarea name="description" rows={3} className="champ" />
            </Champ>
            <Champ label="Couleur d'accent">
              <select name="couleur" className="champ">
                {COULEURS.map(([valeur, label]) => (
                  <option key={valeur} value={valeur}>
                    {label}
                  </option>
                ))}
              </select>
            </Champ>
            <BoutonEnvoi variante="encre" pleineLargeur>Creer l&apos;atelier</BoutonEnvoi>
          </form>
          <p className="mt-4 text-micro text-plomb-clair">
            Un nouvel atelier reprend le visuel par defaut tant qu&apos;aucune image ne lui est
            associee dans lib/visuels.ts.
          </p>
        </Carte>
      </div>
    </>
  );
}

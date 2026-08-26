import { prisma } from "@/lib/db";
import { TitrePage, Carte, Vide } from "@/components/admin";
import { ajouterRealisation, modifierRealisation, supprimerRealisation } from "./actions";
import { BoutonEnvoi, VoileSiEnvoi } from "@/components/bouton-envoi";

export const metadata = { title: "Galerie" };

const CATEGORIES = ["impression", "serigraphie", "photographie", "badges", "banderoles", "autre"];

export default async function AdminGalerie() {
  const items = await prisma.galleryItem.findMany({
    orderBy: [{ ordre: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <TitrePage
        titre="Galerie"
        sousTitre="Les photos publiees ici alimentent la page Realisations et l'accueil."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <Carte titre={`${items.length} realisation(s)`}>
          {items.length === 0 ? (
            <Vide texte="Aucune photo pour le moment. Ajoutez-en une avec le formulaire a droite." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((g) => (
                <div key={g.id} className="rounded-plaque border border-plomb-noir/[0.08]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.image} alt={g.titre} className="aspect-[4/3] w-full object-cover" />
                  <form action={modifierRealisation} className="space-y-2 p-3">
                    <input type="hidden" name="id" value={g.id} />
                    <input name="titre" defaultValue={g.titre} className="champ" aria-label="Titre" />
                    <select
                      name="categorie"
                      defaultValue={g.categorie}
                      className="champ"
                      aria-label="Categorie"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center justify-between gap-2">
                      <input
                        name="ordre"
                        type="number"
                        defaultValue={g.ordre}
                        className="champ w-16"
                        aria-label="Ordre"
                      />
                      <label className="flex items-center gap-1.5 text-micro text-plomb">
                        <input type="checkbox" name="visible" defaultChecked={g.visible} /> Visible
                      </label>
                      <BoutonEnvoi variante="contour">OK</BoutonEnvoi>
                    </div>
                  </form>
                  <form action={supprimerRealisation} className="border-t border-plomb-noir/[0.08] px-3 py-2">
                    <input type="hidden" name="id" value={g.id} />
                    <button className="text-micro font-medium text-rouge hover:underline">
                      Supprimer
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </Carte>

        <Carte titre="Ajouter une photo" className="lg:sticky lg:top-8">
          <form action={ajouterRealisation} className="relative space-y-4">
            <VoileSiEnvoi titre="Publication de la photo" detail="Le transfert peut prendre quelques secondes." />

            <div>
              <label className="etiquette" htmlFor="image">
                Fichier (10 Mo max)
              </label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                required
                className="champ file:mr-3 file:rounded-full file:border-0 file:bg-encre file:px-4 file:py-1.5 file:text-micro file:text-white"
              />
            </div>
            <div>
              <label className="etiquette" htmlFor="titre">
                Titre
              </label>
              <input id="titre" name="titre" className="champ" required />
            </div>
            <div>
              <label className="etiquette" htmlFor="categorie">
                Categorie
              </label>
              <select id="categorie" name="categorie" className="champ">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <BoutonEnvoi pleineLargeur enCours="Publication">
              Publier la photo
            </BoutonEnvoi>
          </form>
        </Carte>
      </div>
    </>
  );
}

import { prisma } from "@/lib/db";
import { TitrePage, Carte } from "@/components/admin";
import { creerPage, modifierPage, supprimerPage } from "./actions";
import { BoutonEnvoi } from "@/components/bouton-envoi";

export const metadata = { title: "Pages" };

export default async function AdminPages() {
  const pages = await prisma.page.findMany({ orderBy: { ordre: "asc" } });

  return (
    <>
      <TitrePage
        titre="Pages"
        sousTitre="Textes libres publies a l'adresse /p/{slug} : a propos, mentions legales, conditions."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-6">
          {pages.map((p) => (
            <Carte key={p.id} titre={`/p/${p.slug}`}>
              <form action={modifierPage} className="space-y-3">
                <input type="hidden" name="id" value={p.id} />
                <div>
                  <label className="etiquette" htmlFor={`titre-${p.id}`}>
                    Titre
                  </label>
                  <input id={`titre-${p.id}`} name="titre" defaultValue={p.titre} className="champ" />
                </div>
                <div>
                  <label className="etiquette" htmlFor={`contenu-${p.id}`}>
                    Contenu
                  </label>
                  <textarea
                    id={`contenu-${p.id}`}
                    name="contenu"
                    defaultValue={p.contenu}
                    rows={8}
                    className="champ"
                  />
                </div>
                <div>
                  <label className="etiquette" htmlFor={`meta-${p.id}`}>
                    Description pour les moteurs de recherche
                  </label>
                  <input
                    id={`meta-${p.id}`}
                    name="metaDesc"
                    defaultValue={p.metaDesc ?? ""}
                    className="champ"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-micro text-plomb">
                    <input type="checkbox" name="publiee" defaultChecked={p.publiee} /> Publiee
                  </label>
                  <BoutonEnvoi variante="encre">Enregistrer</BoutonEnvoi>
                </div>
              </form>
              <form action={supprimerPage} className="mt-4 border-t border-plomb-noir/[0.08] pt-4">
                <input type="hidden" name="id" value={p.id} />
                <button className="text-micro font-medium text-rouge hover:underline">
                  Supprimer la page
                </button>
              </form>
            </Carte>
          ))}
        </div>

        <Carte titre="Nouvelle page" className="lg:sticky lg:top-8">
          <form action={creerPage} className="space-y-3">
            <div>
              <label className="etiquette" htmlFor="titre-new">
                Titre
              </label>
              <input id="titre-new" name="titre" className="champ" required />
            </div>
            <div>
              <label className="etiquette" htmlFor="contenu-new">
                Contenu
              </label>
              <textarea id="contenu-new" name="contenu" rows={5} className="champ" />
            </div>
            <BoutonEnvoi variante="encre" pleineLargeur>Creer la page</BoutonEnvoi>
          </form>
        </Carte>
      </div>
    </>
  );
}

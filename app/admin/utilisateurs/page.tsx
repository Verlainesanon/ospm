import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/auth";
import { TitrePage, Carte, Champ } from "@/components/admin";
import { creerUtilisateur, modifierUtilisateur, supprimerUtilisateur } from "./actions";
import { BoutonEnvoi } from "@/components/bouton-envoi";

export const metadata = { title: "Utilisateurs" };

const DESCRIPTION_ROLE: Record<string, string> = {
  ADMIN: "Acces complet, y compris les comptes",
  GESTIONNAIRE: "Tout sauf la creation de comptes",
  CAISSIER: "Commandes, devis, clients, finance, impression",
  TECHNICIEN: "Commandes, stock, materiel, impression",
};

export default async function AdminUtilisateurs() {
  const utilisateurs = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <>
      <TitrePage
        titre="Utilisateurs"
        sousTitre="Chaque role ouvre un ensemble de sections. Un caissier ne voit ni le stock ni le contenu du site."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-start">
        <Carte titre={`${utilisateurs.length} compte(s)`}>
          <div className="space-y-3">
            {utilisateurs.map((u) => (
              <article key={u.id} className="rounded-douce border border-plomb-noir/[0.08] p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-sans text-[1.0625rem] font-medium text-plomb-noir">{u.nom}</h3>
                  <p className="ref">{u.email}</p>
                </div>

                <form action={modifierUtilisateur} className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="id" value={u.id} />
                  <Champ label="Nom affiche">
                    <input name="nom" defaultValue={u.nom} className="champ" />
                  </Champ>
                  <Champ label="Role">
                    <select name="role" defaultValue={u.role} className="champ">
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r.charAt(0) + r.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </Champ>
                  <Champ label="Nouveau mot de passe (laisser vide pour garder l'actuel)">
                    <input
                      name="password"
                      type="password"
                      placeholder="8 caracteres minimum"
                      className="champ"
                    />
                  </Champ>
                  <div className="flex items-end gap-4 pb-1">
                    <label className="flex items-center gap-2 text-[0.9375rem] text-plomb">
                      <input type="checkbox" name="actif" defaultChecked={u.actif} /> Compte actif
                    </label>
                    <BoutonEnvoi variante="contour">Enregistrer</BoutonEnvoi>
                  </div>
                </form>

                <p className="mt-3 text-micro text-plomb-clair">{DESCRIPTION_ROLE[u.role]}</p>

                <form
                  action={supprimerUtilisateur}
                  className="mt-4 border-t border-plomb-noir/[0.08] pt-3"
                >
                  <input type="hidden" name="id" value={u.id} />
                  <button className="text-micro font-medium text-rouge transition-colors hover:text-rouge-sombre">
                    Supprimer ce compte
                  </button>
                </form>
              </article>
            ))}
          </div>
        </Carte>

        <Carte titre="Nouveau compte" className="lg:sticky lg:top-8">
          <form action={creerUtilisateur} className="space-y-4">
            <Champ label="Nom">
              <input name="nom" className="champ" required />
            </Champ>
            <Champ label="E-mail">
              <input name="email" type="email" className="champ" required />
            </Champ>
            <Champ label="Role">
              <select name="role" className="champ">
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </Champ>
            <Champ label="Mot de passe (8 caracteres minimum)">
              <input name="password" type="password" minLength={8} className="champ" required />
            </Champ>
            <BoutonEnvoi variante="encre" pleineLargeur>Creer le compte</BoutonEnvoi>
          </form>
        </Carte>
      </div>
    </>
  );
}

import { prisma } from "@/lib/db";
import { formatMontant, toNumber } from "@/lib/money";
import { TitrePage, Carte, Statut, Chiffre, Vide, Champ } from "@/components/admin";
import {
  creerEquipement,
  modifierEquipement,
  supprimerEquipement,
  ajouterMaintenance,
  lierConsommable,
  delierConsommable,
} from "./actions";
import { BoutonEnvoi } from "@/components/bouton-envoi";

export const metadata = { title: "Materiel" };

const TYPES: [string, string][] = [
  ["IMPRIMANTE", "Imprimante"],
  ["PRESSE", "Presse"],
  ["APPAREIL_PHOTO", "Appareil photo"],
  ["ORDINATEUR", "Ordinateur"],
  ["PLASTIFIEUSE", "Plastifieuse"],
  ["AUTRE", "Autre"],
];

const ETATS: [string, string][] = [
  ["OK", "En service"],
  ["MAINTENANCE", "En maintenance"],
  ["PANNE", "En panne"],
  ["HORS_SERVICE", "Hors service"],
];

export default async function AdminMateriel() {
  const [equipements, articles] = await Promise.all([
    prisma.equipment.findMany({
      orderBy: { nom: "asc" },
      include: {
        maintenances: { orderBy: { date: "desc" }, take: 5 },
        consommables: { include: { item: true } },
        printer: true,
      },
    }),
    prisma.stockItem.findMany({ orderBy: { nom: "asc" } }),
  ]);

  const horsService = equipements.filter((e) => e.etat === "PANNE" || e.etat === "HORS_SERVICE");
  const aujourdhui = new Date();
  const maintenancesDues = equipements.filter((e) =>
    e.maintenances.some((m) => m.prochaineLe && m.prochaineLe <= aujourdhui),
  );

  return (
    <>
      <TitrePage
        titre="Materiel"
        sousTitre="Le parc de l'atelier : imprimantes, presses, appareils photo. Etat, interventions et consommables rattaches au stock."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Chiffre label="Equipements" valeur={String(equipements.length)} accent="plomb" />
        <Chiffre
          label="En panne / hors service"
          valeur={String(horsService.length)}
          accent={horsService.length > 0 ? "rouge" : "plomb"}
          detail={horsService.map((e) => e.nom).slice(0, 3).join(", ") || undefined}
        />
        <Chiffre
          label="Maintenances dues"
          valeur={String(maintenancesDues.length)}
          accent={maintenancesDues.length > 0 ? "rouge" : "plomb"}
          detail={maintenancesDues.map((e) => e.nom).slice(0, 3).join(", ") || undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-start">
        <div className="space-y-6">
          {equipements.length === 0 && (
            <Carte>
              <Vide texte="Aucun equipement enregistre." />
            </Carte>
          )}

          {equipements.map((e) => (
            <Carte
              key={e.id}
              titre={e.nom}
              action={
                <div className="flex items-center gap-3">
                  <span className="ref">{TYPES.find(([v]) => v === e.type)?.[1] ?? e.type}</span>
                  <Statut valeur={e.etat} />
                </div>
              }
            >
              <p className="ref">
                {[e.marque, e.modele, e.numeroSerie].filter(Boolean).join(" · ") ||
                  "Marque et modele a renseigner"}
                {e.prixAchat && ` · achete ${formatMontant(e.prixAchat)}`}
                {e.printer && ` · imprimante configuree : ${e.printer.nom}`}
              </p>

              {/* --- Fiche --- */}
              <form action={modifierEquipement} className="mt-5 grid gap-3 sm:grid-cols-3">
                <input type="hidden" name="id" value={e.id} />
                <Champ label="Nom">
                  <input name="nom" defaultValue={e.nom} className="champ" />
                </Champ>
                <Champ label="Etat">
                  <select name="etat" defaultValue={e.etat} className="champ">
                    {ETATS.map(([valeur, label]) => (
                      <option key={valeur} value={valeur}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Champ>
                <Champ label="Emplacement">
                  <input name="emplacement" defaultValue={e.emplacement} className="champ" />
                </Champ>
                <Champ label="Notes" className="sm:col-span-3">
                  <textarea name="notes" rows={2} defaultValue={e.notes} className="champ" />
                </Champ>
                <div className="sm:col-span-3">
                  <BoutonEnvoi variante="contour">Enregistrer la fiche</BoutonEnvoi>
                </div>
              </form>

              <div className="mt-6 grid gap-6 border-t border-plomb-noir/[0.08] pt-6 lg:grid-cols-2">
                {/* --- Consommables --- */}
                <div>
                  <p className="text-micro font-medium text-plomb-noir">Consommables lies</p>

                  {e.consommables.length === 0 ? (
                    <p className="mt-2 text-[0.9375rem] text-plomb">
                      Aucun consommable rattache a cet equipement.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {e.consommables.map((c) => {
                        const alerte = toNumber(c.item.quantite) <= toNumber(c.item.seuilAlerte);
                        return (
                          <li
                            key={c.id}
                            className="flex items-center justify-between gap-3 rounded-douce border border-plomb-noir/[0.08] px-4 py-2.5"
                          >
                            <span className="text-[0.9375rem] text-plomb-noir">
                              {c.item.nom}
                              <span className={`ml-2 ${alerte ? "text-rouge" : "text-plomb"}`}>
                                {toNumber(c.item.quantite)} {c.item.unite}
                              </span>
                            </span>
                            <form action={delierConsommable}>
                              <input type="hidden" name="id" value={c.id} />
                              <button className="text-micro font-medium text-rouge transition-colors hover:text-rouge-sombre">
                                Retirer
                              </button>
                            </form>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <form action={lierConsommable} className="mt-3 flex items-end gap-3">
                    <input type="hidden" name="equipmentId" value={e.id} />
                    <Champ label="Rattacher un article du stock" className="flex-1">
                      <select name="itemId" className="champ">
                        <option value="">Choisir un article</option>
                        {articles.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.nom}
                          </option>
                        ))}
                      </select>
                    </Champ>
                    <BoutonEnvoi variante="contour">Lier</BoutonEnvoi>
                  </form>
                </div>

                {/* --- Maintenance --- */}
                <div>
                  <p className="text-micro font-medium text-plomb-noir">Interventions</p>

                  {e.maintenances.length === 0 ? (
                    <p className="mt-2 text-[0.9375rem] text-plomb">
                      Aucune intervention enregistree.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {e.maintenances.map((m) => (
                        <li
                          key={m.id}
                          className="rounded-douce border border-plomb-noir/[0.08] px-4 py-3"
                        >
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-[0.9375rem] text-plomb-noir">
                              {m.description}
                            </span>
                            <span className="ref">{m.date.toLocaleDateString("fr-FR")}</span>
                          </div>
                          <p className="mt-1 text-micro text-plomb">
                            {m.type === "REPARATION" ? "Reparation" : "Preventive"}
                            {toNumber(m.cout) > 0 && ` · ${formatMontant(m.cout)}`}
                            {m.prochaineLe &&
                              ` · prochaine le ${m.prochaineLe.toLocaleDateString("fr-FR")}`}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form
                    action={ajouterMaintenance}
                    className="mt-3 space-y-3 rounded-douce bg-creme p-4"
                  >
                    <input type="hidden" name="equipmentId" value={e.id} />
                    <Champ label="Intervention effectuee">
                      <input
                        name="description"
                        placeholder="Nettoyage des tetes, changement du rouleau..."
                        className="champ"
                        required
                      />
                    </Champ>
                    <Champ label="Type d'intervention">
                      <select name="type" className="champ">
                        <option value="PREVENTIVE">Preventive</option>
                        <option value="REPARATION">Reparation</option>
                      </select>
                    </Champ>
                    <div className="grid grid-cols-2 gap-3">
                      <Champ label="Cout">
                        <input name="cout" type="number" step="0.01" className="champ" />
                      </Champ>
                      <Champ label="Prochaine echeance">
                        <input name="prochaineLe" type="date" className="champ" />
                      </Champ>
                    </div>
                    <BoutonEnvoi variante="encre">Enregistrer l&apos;intervention</BoutonEnvoi>
                  </form>
                </div>
              </div>

              <form
                action={supprimerEquipement}
                className="mt-6 border-t border-plomb-noir/[0.08] pt-4"
              >
                <input type="hidden" name="id" value={e.id} />
                <button className="text-micro font-medium text-rouge transition-colors hover:text-rouge-sombre">
                  Supprimer cet equipement
                </button>
              </form>
            </Carte>
          ))}
        </div>

        <Carte titre="Nouvel equipement" className="lg:sticky lg:top-8">
          <form action={creerEquipement} className="space-y-4">
            <Champ label="Nom">
              <input name="nom" className="champ" required />
            </Champ>
            <Champ label="Type">
              <select name="type" className="champ">
                {TYPES.map(([valeur, label]) => (
                  <option key={valeur} value={valeur}>
                    {label}
                  </option>
                ))}
              </select>
            </Champ>
            <div className="grid grid-cols-2 gap-3">
              <Champ label="Marque">
                <input name="marque" className="champ" />
              </Champ>
              <Champ label="Modele">
                <input name="modele" className="champ" />
              </Champ>
            </div>
            <Champ label="Numero de serie">
              <input name="numeroSerie" className="champ" />
            </Champ>
            <Champ label="Emplacement">
              <input name="emplacement" defaultValue="Atelier" className="champ" />
            </Champ>
            <div className="grid grid-cols-2 gap-3">
              <Champ label="Date d'achat">
                <input name="dateAchat" type="date" className="champ" />
              </Champ>
              <Champ label="Prix d'achat">
                <input name="prixAchat" type="number" step="0.01" className="champ" />
              </Champ>
            </div>
            <BoutonEnvoi variante="encre" pleineLargeur>Ajouter au parc</BoutonEnvoi>
          </form>
        </Carte>
      </div>
    </>
  );
}

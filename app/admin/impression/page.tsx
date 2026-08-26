import Link from "next/link";
import { prisma } from "@/lib/db";
import { TitrePage, Carte, Tableau, Statut, Vide, Champ } from "@/components/admin";
import {
  creerImprimante,
  modifierImprimante,
  supprimerImprimante,
  modifierGabarit,
  envoyerTicket,
  relancerJob,
  supprimerJob,
} from "./actions";
import { BoutonEnvoi } from "@/components/bouton-envoi";

export const metadata = { title: "Impression" };

const CHAMPS_GABARIT = [
  "entreprise",
  "adresse",
  "telephone",
  "email",
  "logo",
  "type",
  "numero",
  "date",
  "client",
  "lignes",
  "sousTotal",
  "remise",
  "taxe",
  "total",
  "paye",
  "reste",
  "methode",
  "mention",
];

export default async function AdminImpression() {
  const [imprimantes, gabarits, jobs, equipements, facturesRecentes] = await Promise.all([
    prisma.printer.findMany({ orderBy: { nom: "asc" }, include: { equipment: true } }),
    prisma.printTemplate.findMany({ orderBy: { type: "asc" } }),
    prisma.printJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      include: { printer: true },
    }),
    prisma.equipment.findMany({ where: { type: "IMPRIMANTE" }, orderBy: { nom: "asc" } }),
    prisma.invoice.findMany({ orderBy: { dateEmission: "desc" }, take: 20 }),
  ]);

  const thermiques = imprimantes.filter((i) => i.transport === "ESCPOS" && i.actif);
  const enAttente = jobs.filter((j) => j.statut === "EN_ATTENTE").length;

  return (
    <>
      <TitrePage
        titre="Impression"
        sousTitre="Le navigateur imprime tout document ; l'agent local prend en charge les imprimantes thermiques."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-start">
        <div className="space-y-6">
          {/* --- Imprimantes --- */}
          <Carte titre={`Imprimantes · ${imprimantes.length}`}>
            {imprimantes.length === 0 ? (
              <Vide texte="Aucune imprimante configuree." />
            ) : (
              <div className="space-y-3">
                {imprimantes.map((p) => (
                  <article key={p.id} className="rounded-douce border border-plomb-noir/[0.08] p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h3 className="font-sans text-[1.0625rem] font-medium text-plomb-noir">
                        {p.nom}
                      </h3>
                      <p className="ref">
                        {p.transport === "ESCPOS" ? "Agent local · thermique" : "Navigateur"}
                        {p.parDefaut && " · par defaut"}
                        {!p.actif && " · desactivee"}
                      </p>
                    </div>

                    <form action={modifierImprimante} className="mt-4 grid gap-3 sm:grid-cols-2">
                      <input type="hidden" name="id" value={p.id} />
                      <Champ label="Nom">
                        <input name="nom" defaultValue={p.nom} className="champ" />
                      </Champ>
                      <Champ label="Mode d'impression">
                        <select name="transport" defaultValue={p.transport} className="champ">
                          <option value="BROWSER">Navigateur (dialogue d&apos;impression)</option>
                          <option value="ESCPOS">Thermique (agent local)</option>
                        </select>
                      </Champ>
                      <Champ label="Cible (nom Windows, IP:port ou USB)">
                        <input
                          name="cible"
                          defaultValue={p.cible}
                          placeholder="192.168.1.50:9100"
                          className="champ"
                        />
                      </Champ>
                      <Champ label="Largeur du papier (mm)">
                        <input
                          name="largeurMm"
                          type="number"
                          defaultValue={p.largeurMm}
                          className="champ"
                        />
                      </Champ>
                      <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
                        <label className="flex items-center gap-2 text-[0.9375rem] text-plomb">
                          <input type="checkbox" name="actif" defaultChecked={p.actif} /> Active
                        </label>
                        <label className="flex items-center gap-2 text-[0.9375rem] text-plomb">
                          <input type="checkbox" name="parDefaut" defaultChecked={p.parDefaut} /> Par
                          defaut
                        </label>
                        <BoutonEnvoi variante="contour">Enregistrer</BoutonEnvoi>
                      </div>
                    </form>

                    {p.equipment && (
                      <p className="mt-3 flex items-center gap-2 text-micro text-plomb">
                        Materiel associe : {p.equipment.nom}
                        <Statut valeur={p.equipment.etat} />
                      </p>
                    )}

                    <form
                      action={supprimerImprimante}
                      className="mt-4 border-t border-plomb-noir/[0.08] pt-3"
                    >
                      <input type="hidden" name="id" value={p.id} />
                      <button className="text-micro font-medium text-rouge transition-colors hover:text-rouge-sombre">
                        Supprimer cette imprimante
                      </button>
                    </form>
                  </article>
                ))}
              </div>
            )}
          </Carte>

          {/* --- File d'attente --- */}
          <Carte
            titre="File d'attente de l'agent local"
            action={
              <span className="ref">
                {enAttente} en attente · {jobs.length} recent(s)
              </span>
            }
          >
            {jobs.length === 0 ? (
              <Vide texte="Aucun travail envoye a l'agent local." />
            ) : (
              <Tableau colonnes={["Cree", "Titre", "Imprimante", "Copies", "Statut", ""]}>
                {jobs.map((j) => (
                  <tr key={j.id}>
                    <td className="px-3 py-2.5 ref">{j.createdAt.toLocaleString("fr-FR")}</td>
                    <td className="px-3 py-2.5 text-plomb-noir">
                      {j.titre}
                      {j.erreur && <span className="block text-micro text-rouge">{j.erreur}</span>}
                    </td>
                    <td className="px-3 py-2.5 text-plomb">{j.printer?.nom ?? "—"}</td>
                    <td className="px-3 py-2.5">{j.copies}</td>
                    <td className="px-3 py-2.5">
                      <Statut valeur={j.statut} />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-4">
                        {j.statut !== "EN_ATTENTE" && (
                          <form action={relancerJob}>
                            <input type="hidden" name="id" value={j.id} />
                            <button className="text-micro font-medium text-encre transition-colors hover:text-encre-vif">
                              Relancer
                            </button>
                          </form>
                        )}
                        <form action={supprimerJob}>
                          <input type="hidden" name="id" value={j.id} />
                          <button className="text-micro font-medium text-rouge transition-colors hover:text-rouge-sombre">
                            Retirer
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </Tableau>
            )}
          </Carte>

          {/* --- Gabarits --- */}
          <Carte titre="Gabarits imprimables">
            <div className="space-y-4">
              {gabarits.map((g) => (
                <details key={g.id} className="rounded-douce border border-plomb-noir/[0.08] p-5">
                  <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-3">
                    <span className="font-sans text-[1.0625rem] font-medium text-plomb-noir">
                      {g.nom}
                    </span>
                    <span className="ref">
                      {g.largeurMm} × {g.hauteurMm} mm · {g.cle}
                      {!g.actif && " · inactif"}
                    </span>
                  </summary>

                  <form action={modifierGabarit} className="mt-5 space-y-3">
                    <input type="hidden" name="id" value={g.id} />
                    <div className="grid gap-3 sm:grid-cols-[1.5fr_0.6fr_0.6fr_auto] sm:items-end">
                      <Champ label="Nom du gabarit">
                        <input name="nom" defaultValue={g.nom} className="champ" />
                      </Champ>
                      <Champ label="Largeur (mm)">
                        <input
                          name="largeurMm"
                          type="number"
                          defaultValue={g.largeurMm}
                          className="champ"
                        />
                      </Champ>
                      <Champ label="Hauteur (mm)">
                        <input
                          name="hauteurMm"
                          type="number"
                          defaultValue={g.hauteurMm}
                          className="champ"
                        />
                      </Champ>
                      <label className="flex items-center gap-2 pb-3 text-[0.9375rem] text-plomb">
                        <input type="checkbox" name="actif" defaultChecked={g.actif} /> Actif
                      </label>
                    </div>

                    <Champ label="Structure HTML">
                      <textarea
                        name="html"
                        defaultValue={g.html}
                        rows={10}
                        className="champ font-mono text-xs"
                      />
                    </Champ>
                    <Champ label="CSS additionnel">
                      <textarea
                        name="css"
                        defaultValue={g.css}
                        rows={3}
                        className="champ font-mono text-xs"
                      />
                    </Champ>

                    <BoutonEnvoi variante="encre">Enregistrer le gabarit</BoutonEnvoi>
                  </form>
                </details>
              ))}
            </div>

            <div className="mt-6 rounded-douce bg-creme p-5">
              <p className="text-micro font-medium text-plomb-noir">
                Champs disponibles dans les gabarits
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CHAMPS_GABARIT.map((c) => (
                  <code
                    key={c}
                    className="rounded-full bg-white px-3 py-1 font-mono text-xs text-plomb"
                  >
                    {`{{${c}}}`}
                  </code>
                ))}
              </div>
            </div>
          </Carte>
        </div>

        <div className="space-y-6 lg:sticky lg:top-8">
          {/* --- Envoi vers l'agent --- */}
          <Carte titre="Imprimer un ticket">
            {thermiques.length === 0 ? (
              <p className="text-[0.9375rem] leading-relaxed text-plomb">
                Configurez d&apos;abord une imprimante en mode « Thermique », puis lancez
                l&apos;agent local sur le PC de la boutique.
              </p>
            ) : (
              <form action={envoyerTicket} className="space-y-4">
                <Champ label="Document">
                  <select name="invoiceId" className="champ" required>
                    {facturesRecentes.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.numero} — {f.nomClient}
                      </option>
                    ))}
                  </select>
                </Champ>
                <Champ label="Imprimante">
                  <select name="printerId" className="champ" required>
                    {thermiques.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nom}
                      </option>
                    ))}
                  </select>
                </Champ>
                <Champ label="Copies">
                  <input name="copies" type="number" min={1} defaultValue={1} className="champ" />
                </Champ>
                <BoutonEnvoi variante="encre" pleineLargeur>Envoyer a l&apos;agent</BoutonEnvoi>
              </form>
            )}
          </Carte>

          {/* --- Impression navigateur --- */}
          <Carte titre="Imprimer depuis le navigateur">
            {facturesRecentes.length === 0 ? (
              <p className="text-[0.9375rem] text-plomb">Aucun document a imprimer.</p>
            ) : (
              <ul className="space-y-1">
                {facturesRecentes.slice(0, 8).map((f) => (
                  <li key={f.id}>
                    <Link
                      href={`/admin/impression/facture/${f.id}`}
                      className="flex items-baseline justify-between gap-3 rounded-douce px-3 py-2 text-[0.9375rem] transition-colors hover:bg-creme"
                    >
                      <span className="text-encre">{f.numero}</span>
                      <span className="truncate text-plomb">{f.nomClient}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Carte>

          {/* --- Agent local --- */}
          <Carte titre="Agent local">
            <p className="text-[0.9375rem] leading-relaxed text-plomb">
              L&apos;agent tourne sur le PC de la boutique et interroge la file toutes les 5
              secondes.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-douce bg-creme p-4 font-mono text-xs text-plomb-noir">
              {`set OSPM_URL=http://localhost:3000
set OSPM_AGENT_TOKEN=...
node agent/agent-impression.mjs`}
            </pre>
            <p className="mt-3 text-micro text-plomb-clair">
              Le jeton se trouve dans le fichier .env, cle OSPM_AGENT_TOKEN.
            </p>
          </Carte>

          {/* --- Nouvelle imprimante --- */}
          <Carte titre="Nouvelle imprimante">
            <form action={creerImprimante} className="space-y-4">
              <Champ label="Nom">
                <input
                  name="nom"
                  placeholder="Comptoir, Ticket 80mm..."
                  className="champ"
                  required
                />
              </Champ>
              <Champ label="Mode d'impression">
                <select name="transport" className="champ">
                  <option value="BROWSER">Navigateur</option>
                  <option value="ESCPOS">Thermique (agent local)</option>
                </select>
              </Champ>
              <Champ label="Cible">
                <input name="cible" placeholder="192.168.1.50:9100 ou USB001" className="champ" />
              </Champ>
              <Champ label="Materiel associe">
                <select name="equipmentId" className="champ">
                  <option value="">Aucun</option>
                  {equipements.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nom}
                    </option>
                  ))}
                </select>
              </Champ>
              <BoutonEnvoi variante="encre" pleineLargeur>Ajouter l&apos;imprimante</BoutonEnvoi>
            </form>
          </Carte>
        </div>
      </div>
    </>
  );
}

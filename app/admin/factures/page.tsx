import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMontant, toNumber } from "@/lib/money";
import { TitrePage, Carte, Tableau, Statut, Chiffre, Vide } from "@/components/admin";
import { creerFactureLibre } from "./actions";
import { BoutonEnvoi } from "@/components/bouton-envoi";

export const metadata = { title: "Factures & recus" };

const FILTRES = ["TOUS", "BROUILLON", "EMISE", "PARTIELLE", "PAYEE", "ANNULEE"];

export default async function AdminFactures({
  searchParams,
}: {
  searchParams: { statut?: string };
}) {
  const statut = searchParams.statut ?? "TOUS";

  const [factures, clients] = await Promise.all([
    prisma.invoice.findMany({
      where: statut === "TOUS" ? {} : { statut },
      orderBy: { dateEmission: "desc" },
      take: 200,
    }),
    prisma.customer.findMany({ orderBy: { nom: "asc" }, take: 500 }),
  ]);

  const totalFacture = factures.reduce((s, f) => s + toNumber(f.total), 0);
  const totalEncaisse = factures.reduce((s, f) => s + toNumber(f.montantPaye), 0);

  return (
    <>
      <TitrePage
        titre="Factures & recus"
        sousTitre="Proformas, factures et recus. Chaque paiement saisi alimente la caisse."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Chiffre label="Documents" valeur={String(factures.length)} accent="plomb" />
        <Chiffre label="Total facture" valeur={formatMontant(totalFacture)} />
        <Chiffre
          label="Reste a encaisser"
          valeur={formatMontant(totalFacture - totalEncaisse)}
          accent="rouge"
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTRES.map((f) => (
          <Link
            key={f}
            href={f === "TOUS" ? "/admin/factures" : `/admin/factures?statut=${f}`}
            className={`rounded-plaque border px-3 py-1.5 ref uppercase ${
              statut === f
                ? "border-encre bg-encre text-creme"
                : "border-plomb-noir/[0.08] text-plomb hover:border-encre"
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <Carte titre={`${factures.length} document(s)`}>
          {factures.length === 0 ? (
            <Vide texte="Aucun document pour ce filtre." />
          ) : (
            <Tableau colonnes={["Numero", "Type", "Client", "Date", "Total", "Paye", "Statut", ""]}>
              {factures.map((f) => (
                <tr key={f.id} className="hover:bg-creme/50">
                  <td className="px-3 py-2 ref">{f.numero}</td>
                  <td className="px-3 py-2 ref">{f.type}</td>
                  <td className="px-3 py-2 text-plomb-noir">{f.nomClient}</td>
                  <td className="px-3 py-2 ref">
                    {f.dateEmission.toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-3 py-2 font-mono">{formatMontant(f.total, f.devise)}</td>
                  <td className="px-3 py-2 font-mono text-plomb">
                    {formatMontant(f.montantPaye, f.devise)}
                  </td>
                  <td className="px-3 py-2">
                    <Statut valeur={f.statut} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/admin/factures/${f.id}`}
                      className="text-micro font-medium text-encre hover:text-rouge"
                    >
                      Ouvrir
                    </Link>
                  </td>
                </tr>
              ))}
            </Tableau>
          )}
        </Carte>

        <Carte titre="Nouveau document" className="lg:sticky lg:top-8">
          <form action={creerFactureLibre} className="space-y-3">
            <div>
              <label className="etiquette" htmlFor="type">
                Type
              </label>
              <select id="type" name="type" className="champ">
                <option value="FACTURE">Facture</option>
                <option value="PROFORMA">Proforma</option>
                <option value="RECU">Recu</option>
              </select>
            </div>
            <div>
              <label className="etiquette" htmlFor="nomClient">
                Nom du client
              </label>
              <input id="nomClient" name="nomClient" className="champ" required />
            </div>
            <div>
              <label className="etiquette" htmlFor="customerId">
                Lier a une fiche client
              </label>
              <select id="customerId" name="customerId" className="champ">
                <option value="">Aucune</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="etiquette" htmlFor="devise">
                Devise
              </label>
              <select id="devise" name="devise" className="champ">
                <option value="HTG">HTG</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <BoutonEnvoi variante="encre" pleineLargeur>Creer</BoutonEnvoi>
          </form>
        </Carte>
      </div>
    </>
  );
}

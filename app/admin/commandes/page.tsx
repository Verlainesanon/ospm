import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMontant } from "@/lib/money";
import { TitrePage, Carte, Tableau, Statut, Vide } from "@/components/admin";
import { creerCommandeComptoir } from "./actions";
import { BoutonEnvoi } from "@/components/bouton-envoi";

export const metadata = { title: "Commandes" };

const FILTRES = ["TOUS", "NOUVELLE", "CONFIRMEE", "EN_PRODUCTION", "PRETE", "LIVREE", "ANNULEE"];

export default async function AdminCommandes({
  searchParams,
}: {
  searchParams: { statut?: string };
}) {
  const statut = searchParams.statut ?? "TOUS";
  const commandes = await prisma.order.findMany({
    where: statut === "TOUS" ? {} : { statut },
    orderBy: [{ priorite: "desc" }, { createdAt: "desc" }],
    include: { assigne: true, invoices: true },
    take: 200,
  });

  return (
    <>
      <TitrePage
        titre="Commandes"
        sousTitre="Le travail en cours a l'atelier, de la reception au retrait."
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTRES.map((f) => (
          <Link
            key={f}
            href={f === "TOUS" ? "/admin/commandes" : `/admin/commandes?statut=${f}`}
            className={`rounded-plaque border px-3 py-1.5 ref uppercase ${
              statut === f
                ? "border-encre bg-encre text-creme"
                : "border-plomb-noir/[0.08] text-plomb hover:border-encre"
            }`}
          >
            {f.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start">
        <Carte titre={`${commandes.length} commande(s)`}>
          {commandes.length === 0 ? (
            <Vide texte="Aucune commande pour ce filtre." />
          ) : (
            <Tableau
              colonnes={["Numero", "Client", "Livraison", "Assigne", "Total", "Facture", "Statut", ""]}
            >
              {commandes.map((c) => (
                <tr key={c.id} className="hover:bg-creme/50">
                  <td className="px-3 py-2 ref">
                    {c.numero}
                    {c.priorite === "URGENTE" && (
                      <span className="ml-2 text-micro font-medium text-rouge">urgent</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-plomb-noir">{c.nomContact}</p>
                    <p className="ref">{c.telephone ?? ""}</p>
                  </td>
                  <td className="px-3 py-2 ref">
                    {c.dateLivraison ? c.dateLivraison.toLocaleDateString("fr-FR") : "-"}
                  </td>
                  <td className="px-3 py-2 text-sm text-plomb">{c.assigne?.nom ?? "-"}</td>
                  <td className="px-3 py-2 font-mono">{formatMontant(c.total, c.devise)}</td>
                  <td className="px-3 py-2 ref">
                    {c.invoices.length > 0 ? c.invoices[0].numero : "-"}
                  </td>
                  <td className="px-3 py-2">
                    <Statut valeur={c.statut} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/admin/commandes/${c.id}`}
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

        <Carte titre="Commande au comptoir" className="lg:sticky lg:top-8">
          <form action={creerCommandeComptoir} className="space-y-3">
            <div>
              <label className="etiquette" htmlFor="nomContact">
                Nom du client
              </label>
              <input id="nomContact" name="nomContact" className="champ" required />
            </div>
            <div>
              <label className="etiquette" htmlFor="telephone">
                Telephone
              </label>
              <input id="telephone" name="telephone" className="champ" />
            </div>
            <BoutonEnvoi variante="encre" pleineLargeur>Ouvrir la commande</BoutonEnvoi>
            <p className="text-micro text-plomb">
              Les lignes s'ajoutent ensuite dans le detail.
            </p>
          </form>
        </Carte>
      </div>
    </>
  );
}

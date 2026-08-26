import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMontant } from "@/lib/money";
import { TitrePage, Carte, Tableau, Statut, Vide } from "@/components/admin";

export const metadata = { title: "Devis" };

const FILTRES = ["TOUS", "NOUVEAU", "ENVOYE", "ACCEPTE", "REFUSE", "EXPIRE"];

export default async function AdminDevis({
  searchParams,
}: {
  searchParams: { statut?: string };
}) {
  const statut = searchParams.statut ?? "TOUS";
  const devis = await prisma.quote.findMany({
    where: statut === "TOUS" ? {} : { statut },
    orderBy: { createdAt: "desc" },
    include: { items: true, fichiers: true },
    take: 200,
  });

  return (
    <>
      <TitrePage titre="Devis" sousTitre="Demandes recues depuis le site et saisies au comptoir." />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTRES.map((f) => (
          <Link
            key={f}
            href={f === "TOUS" ? "/admin/devis" : `/admin/devis?statut=${f}`}
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

      <Carte titre={`${devis.length} devis`}>
        {devis.length === 0 ? (
          <Vide texte="Aucun devis pour ce filtre." />
        ) : (
          <Tableau colonnes={["Numero", "Client", "Recu le", "Fichiers", "Total", "Statut", ""]}>
            {devis.map((d) => (
              <tr key={d.id} className="hover:bg-creme/50">
                <td className="px-3 py-2 ref">{d.numero}</td>
                <td className="px-3 py-2">
                  <p className="text-plomb-noir">{d.nomContact}</p>
                  <p className="ref">{d.telephone ?? d.email ?? ""}</p>
                </td>
                <td className="px-3 py-2 ref">
                  {d.createdAt.toLocaleDateString("fr-FR")}
                </td>
                <td className="px-3 py-2 ref">{d.fichiers.length}</td>
                <td className="px-3 py-2 font-mono">{formatMontant(d.total, d.devise)}</td>
                <td className="px-3 py-2">
                  <Statut valeur={d.statut} />
                </td>
                <td className="px-3 py-2 text-right">
                  <Link
                    href={`/admin/devis/${d.id}`}
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
    </>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMontant, toNumber } from "@/lib/money";
import { serieMensuelle, chiffresDuJour } from "@/lib/rapports";
import { TitrePage, Carte, Tableau, Statut, Chiffre, Vide } from "@/components/admin";
import { BarresMensuelles } from "@/components/graphiques";

export default async function TableauDeBord() {
  const [jour, points, enCours, devisNouveaux, impayees, stockBas, messages, caisse] =
    await Promise.all([
      chiffresDuJour(),
      serieMensuelle(6),
      prisma.order.findMany({
        where: { statut: { in: ["NOUVELLE", "CONFIRMEE", "EN_PRODUCTION", "PRETE"] } },
        orderBy: [{ priorite: "desc" }, { createdAt: "asc" }],
        take: 10,
        include: { assigne: true },
      }),
      prisma.quote.count({ where: { statut: "NOUVEAU" } }),
      prisma.invoice.findMany({
        where: { statut: { in: ["EMISE", "PARTIELLE"] } },
        select: { total: true, montantPaye: true },
      }),
      prisma.stockItem.findMany({ orderBy: { nom: "asc" } }),
      prisma.contactMessage.count({ where: { lu: false } }),
      prisma.cashSession.findFirst({ where: { fermeeLe: null } }),
    ]);

  const resteAEncaisser = impayees.reduce(
    (s, f) => s + toNumber(f.total) - toNumber(f.montantPaye),
    0,
  );
  const articlesEnAlerte = stockBas.filter(
    (a) => toNumber(a.quantite) <= toNumber(a.seuilAlerte),
  );

  return (
    <>
      <TitrePage
        titre="Tableau de bord"
        sousTitre={new Date().toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        action={
          caisse ? (
            <Link href="/admin/caisse" className="btn-contour btn-petit">
              Caisse ouverte
            </Link>
          ) : (
            <Link href="/admin/caisse" className="btn-rouge px-4 py-2">
              Ouvrir la caisse
            </Link>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Chiffre label="Encaisse aujourd'hui" valeur={formatMontant(jour.encaisse)} />
        <Chiffre label="Depense aujourd'hui" valeur={formatMontant(jour.depense)} accent="rouge" />
        <Chiffre
          label="Reste a encaisser"
          valeur={formatMontant(resteAEncaisser)}
          detail={`${impayees.length} facture(s)`}
          accent={resteAEncaisser > 0 ? "rouge" : "plomb"}
        />
        <Chiffre
          label="Travail en cours"
          valeur={String(enCours.length)}
          detail={`${jour.commandes} commande(s) aujourd'hui`}
          accent="plomb"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="space-y-6">
          <Carte titre="Six derniers mois">
            <BarresMensuelles points={points} />
          </Carte>

          <Carte
            titre="Travail en cours"
            action={
              <Link
                href="/admin/commandes"
                className="text-micro font-medium text-encre hover:text-rouge"
              >
                Tout voir
              </Link>
            }
          >
            {enCours.length === 0 ? (
              <Vide texte="Rien en production." lien={{ href: "/admin/commandes", label: "Ouvrir une commande" }} />
            ) : (
              <Tableau colonnes={["Numero", "Client", "Livraison", "Assigne", "Statut"]}>
                {enCours.map((c) => (
                  <tr key={c.id} className="hover:bg-creme/50">
                    <td className="px-3 py-2 ref">
                      <Link href={`/admin/commandes/${c.id}`} className="text-encre hover:text-rouge">
                        {c.numero}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-plomb-noir">{c.nomContact}</td>
                    <td className="px-3 py-2 ref">
                      {c.dateLivraison ? c.dateLivraison.toLocaleDateString("fr-FR") : "-"}
                    </td>
                    <td className="px-3 py-2 text-sm text-plomb">{c.assigne?.nom ?? "-"}</td>
                    <td className="px-3 py-2">
                      <Statut valeur={c.statut} />
                    </td>
                  </tr>
                ))}
              </Tableau>
            )}
          </Carte>
        </div>

        <div className="space-y-6">
          <Carte titre="A traiter">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between gap-3">
                <Link href="/admin/devis?statut=NOUVEAU" className="text-encre hover:text-rouge">
                  Nouveaux devis
                </Link>
                <span className="font-mono">{devisNouveaux}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <Link href="/admin/messages" className="text-encre hover:text-rouge">
                  Messages non lus
                </Link>
                <span className="font-mono">{messages}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <Link href="/admin/factures?statut=PARTIELLE" className="text-encre hover:text-rouge">
                  Factures partiellement payees
                </Link>
                <span className="font-mono">{impayees.length}</span>
              </li>
            </ul>
          </Carte>

          <Carte titre="Stock sous le seuil">
            {articlesEnAlerte.length === 0 ? (
              <p className="text-sm text-plomb">Tout est au-dessus du seuil.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {articlesEnAlerte.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3">
                    <span className="text-plomb-noir">{a.nom}</span>
                    <span className="font-mono text-rouge">
                      {toNumber(a.quantite)} {a.unite}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/stock"
              className="mt-4 block text-micro font-medium text-encre hover:text-rouge"
            >
              Gerer le stock
            </Link>
          </Carte>
        </div>
      </div>
    </>
  );
}

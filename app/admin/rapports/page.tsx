import { prisma } from "@/lib/db";
import { formatMontant, toNumber } from "@/lib/money";
import { serieMensuelle } from "@/lib/rapports";
import { TitrePage, Carte, Chiffre, Vide } from "@/components/admin";
import { BarresMensuelles, Classement, SERIES } from "@/components/graphiques";
import { BoutonEnvoi } from "@/components/bouton-envoi";

export const metadata = { title: "Rapports" };

export default async function Rapports({
  searchParams,
}: {
  searchParams: { debut?: string; fin?: string };
}) {
  const finParDefaut = new Date();
  const debutParDefaut = new Date();
  debutParDefaut.setMonth(debutParDefaut.getMonth() - 1);

  const debut = searchParams.debut ? new Date(searchParams.debut) : debutParDefaut;
  const fin = searchParams.fin ? new Date(`${searchParams.fin}T23:59:59`) : finParDefaut;

  const [paiements, depenses, lignes, commandes, points] = await Promise.all([
    prisma.payment.findMany({
      where: { date: { gte: debut, lte: fin } },
      select: { montant: true, methode: true, devise: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: debut, lte: fin } },
      include: { categorie: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: debut, lte: fin } } },
      select: { designation: true, quantite: true, prixUnitaire: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: debut, lte: fin } },
      select: { nomContact: true, total: true, statut: true },
    }),
    serieMensuelle(6),
  ]);

  const encaisse = paiements.reduce((s, p) => s + toNumber(p.montant), 0);
  const depense = depenses.reduce((s, d) => s + toNumber(d.montant), 0);
  const chiffreCommandes = commandes.reduce((s, c) => s + toNumber(c.total), 0);

  const parService = Object.entries(
    lignes.reduce<Record<string, number>>((acc, l) => {
      acc[l.designation] = (acc[l.designation] ?? 0) + l.quantite * toNumber(l.prixUnitaire);
      return acc;
    }, {}),
  )
    .map(([label, valeur]) => ({ label, valeur }))
    .sort((a, b) => b.valeur - a.valeur)
    .slice(0, 8);

  const parClient = Object.entries(
    commandes.reduce<Record<string, number>>((acc, c) => {
      acc[c.nomContact] = (acc[c.nomContact] ?? 0) + toNumber(c.total);
      return acc;
    }, {}),
  )
    .map(([label, valeur]) => ({ label, valeur }))
    .sort((a, b) => b.valeur - a.valeur)
    .slice(0, 8);

  const parMethode = Object.entries(
    paiements.reduce<Record<string, number>>((acc, p) => {
      acc[p.methode] = (acc[p.methode] ?? 0) + toNumber(p.montant);
      return acc;
    }, {}),
  )
    .map(([label, valeur]) => ({ label, valeur }))
    .sort((a, b) => b.valeur - a.valeur);

  const parPoste = Object.entries(
    depenses.reduce<Record<string, number>>((acc, d) => {
      const nom = d.categorie?.nom ?? "Sans categorie";
      acc[nom] = (acc[nom] ?? 0) + toNumber(d.montant);
      return acc;
    }, {}),
  )
    .map(([label, valeur]) => ({ label, valeur }))
    .sort((a, b) => b.valeur - a.valeur);

  return (
    <>
      <TitrePage
        titre="Rapports"
        sousTitre={`Du ${debut.toLocaleDateString("fr-FR")} au ${fin.toLocaleDateString("fr-FR")}`}
        action={
          <form className="flex flex-wrap items-end gap-2">
            <div>
              <label className="etiquette" htmlFor="debut">
                Debut
              </label>
              <input
                id="debut"
                name="debut"
                type="date"
                defaultValue={debut.toISOString().slice(0, 10)}
                className="champ"
              />
            </div>
            <div>
              <label className="etiquette" htmlFor="fin">
                Fin
              </label>
              <input
                id="fin"
                name="fin"
                type="date"
                defaultValue={fin.toISOString().slice(0, 10)}
                className="champ"
              />
            </div>
            <BoutonEnvoi variante="contour">Afficher</BoutonEnvoi>
          </form>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Chiffre label="Encaisse" valeur={formatMontant(encaisse)} />
        <Chiffre label="Depenses" valeur={formatMontant(depense)} accent="rouge" />
        <Chiffre
          label="Solde"
          valeur={formatMontant(encaisse - depense)}
          accent={encaisse - depense >= 0 ? "plomb" : "rouge"}
        />
        <Chiffre
          label="Commandes prises"
          valeur={String(commandes.length)}
          detail={formatMontant(chiffreCommandes)}
          accent="plomb"
        />
      </div>

      <div className="mt-6 space-y-6">
        <Carte titre="Encaissements et depenses, six derniers mois">
          <BarresMensuelles points={points} />
        </Carte>

        <div className="grid gap-6 lg:grid-cols-2">
          <Carte titre="Services les plus vendus">
            {parService.length === 0 ? (
              <Vide texte="Aucune commande sur la periode." />
            ) : (
              <Classement lignes={parService} />
            )}
          </Carte>

          <Carte titre="Meilleurs clients">
            {parClient.length === 0 ? (
              <Vide texte="Aucune commande sur la periode." />
            ) : (
              <Classement lignes={parClient} />
            )}
          </Carte>

          <Carte titre="Encaissements par methode">
            {parMethode.length === 0 ? (
              <Vide texte="Aucun paiement sur la periode." />
            ) : (
              <Classement lignes={parMethode} />
            )}
          </Carte>

          <Carte titre="Depenses par poste">
            {parPoste.length === 0 ? (
              <Vide texte="Aucune depense sur la periode." />
            ) : (
              <Classement lignes={parPoste} couleur={SERIES.depense} />
            )}
          </Carte>
        </div>
      </div>
    </>
  );
}

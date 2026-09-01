import Link from "next/link";
import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/money";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/anim";
import { TitrePresse } from "@/components/titre-presse";
import { LigneCommande } from "@/components/ligne-commande";
import { Boutique } from "./boutique";

export const metadata = { title: "Boutique" };

async function chargerServices() {
  return prisma.service.findMany({
    where: { visible: true, vendableEnLigne: true },
    orderBy: [{ categorie: { ordre: "asc" } }, { ordre: "asc" }],
    include: { categorie: { select: { nom: true } } },
  });
}

export default async function PageBoutique() {
  let services: Awaited<ReturnType<typeof chargerServices>> = [];
  try {
    services = await chargerServices();
  } catch (e) {
    console.error("Erreur chargement boutique:", e);
  }

  const articles = services.map((s) => ({
    slug: s.slug,
    nom: s.nom,
    description: s.description,
    categorie: s.categorie.nom,
    prix: toNumber(s.prixBase),
    devise: s.devise,
    unite: s.unite,
    image: s.image,
  }));

  return (
    <Section>
      <Reveal effet="fondu">
        <LigneCommande texte="boutique --en-ligne" vitesse={42} delai={200} />
      </Reveal>
      <h1 className="mt-7 text-enseigne">
        <TitrePresse texte="Boutique" depart={140} pas={44} />
      </h1>
      <p className="mt-6 max-w-2xl text-plomb">
        Les travaux a prix fixe se commandent directement ici. Pour tout le reste, passez par
        le devis.
      </p>

      <Reveal effet="monte" delai={200} className="mt-12">
        {articles.length === 0 ? (
          <div className="plaque p-10 text-center">
            <p className="text-sous">
              Aucun article en vente pour le moment
            </p>
            <p className="mt-3 text-sm text-plomb">
              Dans l'admin, ouvrez un service, fixez son prix et cochez &laquo; vendable en
              ligne &raquo;.
            </p>
            <Link href="/devis" className="btn-encre mt-6">
              Demander un devis
            </Link>
          </div>
        ) : (
          <Boutique articles={articles} />
        )}
      </Reveal>
    </Section>
  );
}

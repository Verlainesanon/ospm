import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { formatMontant } from "@/lib/money";
import { visuelAtelier } from "@/lib/visuels";
import { Eyebrow } from "@/components/ui";
import { Reveal } from "@/components/anim";
import { TitrePresse } from "@/components/titre-presse";
import { LigneCommande } from "@/components/ligne-commande";
import { Plaque3D } from "@/components/plaque-3d";
import { IconeAtelier } from "@/components/icones";

export const metadata = { title: "Services" };

// Une encre process par atelier, comme sur l'accueil : la meme cle de lecture
// d'un bout a l'autre du site.
const ENCRES = [
  { texte: "text-encre", fond: "bg-encre", bord: "border-encre" },
  { texte: "text-rouge", fond: "bg-rouge", bord: "border-rouge" },
  { texte: "text-or", fond: "bg-or", bord: "border-or" },
] as const;

type CategorieAvecServices = Awaited<ReturnType<typeof chargerCategories>>[number];

async function chargerCategories() {
  return prisma.serviceCategory.findMany({
    where: { visible: true },
    orderBy: { ordre: "asc" },
    include: { services: { where: { visible: true }, orderBy: { ordre: "asc" } } },
  });
}

export default async function Services() {
  let categories: CategorieAvecServices[] = [];
  try {
    categories = await chargerCategories();
  } catch (e) {
    console.error("Erreur chargement categories services:", e);
  }

  return (
    <>
      {/* ------------------------------------------------------- En-tete */}
      <section className="mx-auto w-full max-w-[104rem] px-5 pb-16 pt-36 sm:px-8">
        <Reveal effet="fondu">
          <LigneCommande texte="services --list" vitesse={45} delai={200} />
        </Reveal>

        <h1 className="mt-7 max-w-5xl">
          <span className="block text-enseigne">
            <TitrePresse texte="Ce que fait" depart={180} pas={26} />
            <br />
            <TitrePresse texte="l'atelier" depart={520} pas={26} />
          </span>
        </h1>

        <Reveal effet="monte" delai={220}>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-plomb">
            Les prix affichés couvrent le cas standard. Les travaux sur mesure passent par un devis
            gratuit.
          </p>
        </Reveal>
      </section>

      {/* ------------------------------------------------------ Ateliers
          Un atelier par bande pleine largeur : image d'un cote, tarifs de
          l'autre, filet d'encre en tete. Les cartes flottantes precedentes
          hachaient la lecture — ici chaque atelier tient d'un bloc. */}
      {categories.map((c, index) => {
        const encre = ENCRES[index % ENCRES.length];
        const imageADroite = index % 2 === 1;

        return (
          <section
            key={c.id}
            className="mx-auto w-full max-w-[104rem] border-t border-plomb-noir/15 px-5 py-16 sm:px-8 md:py-20"
          >
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div className={imageADroite ? "lg:order-2" : ""}>
                <Reveal effet="fondu">
                  <Plaque3D className="relative aspect-[5/3] overflow-hidden">
                    <Image
                      src={visuelAtelier(c.slug)}
                      alt={c.nom}
                      fill
                      className="object-cover"
                    />
                    <span
                      aria-hidden
                      className={`absolute inset-x-0 bottom-0 h-1 ${encre.fond}`}
                    />
                  </Plaque3D>
                </Reveal>
              </div>

              <div className={imageADroite ? "lg:order-1" : ""}>
                <Reveal effet="monte">
                  <span className={`inline-flex items-center gap-3 ${encre.texte}`}>
                    <IconeAtelier nom={c.icone} taille={24} />
                    <span className="font-mono text-micro tracking-[0.14em]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <h2 className="mt-3 text-titre">{c.nom}</h2>
                  <p className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-plomb">
                    {c.description}
                  </p>
                </Reveal>

                {/* Les tarifs en lignes reglees : un libelle a gauche, un prix
                    a droite, le prix en mono parce que c'est une donnee. */}
                <ul className="mt-10 border-t border-plomb-noir/15">
                  {c.services.map((s, j) => (
                    <Reveal
                      key={s.id}
                      as="li"
                      effet="monte"
                      delai={j * 60}
                      className="grid gap-x-6 gap-y-1 border-b border-plomb-noir/15 py-4 sm:grid-cols-[1fr_auto] sm:items-baseline"
                    >
                      <div>
                        <h3 className="text-[1.0625rem] font-medium text-plomb-noir">{s.nom}</h3>
                        {s.description && (
                          <p className="mt-1 text-[0.9375rem] leading-relaxed text-plomb">
                            {s.description}
                          </p>
                        )}
                      </div>
                      <p className={`font-mono text-micro tracking-[0.06em] ${encre.texte}`}>
                        {s.surDevis || s.prixBase === null
                          ? "sur devis"
                          : `dès ${formatMontant(s.prixBase, s.devise)}`}
                      </p>
                    </Reveal>
                  ))}
                </ul>

                <Reveal effet="fondu" delai={140}>
                  <Link
                    href={`/services/${c.slug}`}
                    className="group mt-8 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-plomb-noir transition-colors hover:text-encre"
                  >
                    Détail de l&apos;atelier
                    <span className="transition-transform duration-300 ease-douce group-hover:translate-x-1.5">
                      →
                    </span>
                  </Link>
                </Reveal>
              </div>
            </div>
          </section>
        );
      })}

      {/* ---------------------------------------------------------- Appel */}
      <section className="border-t-2 border-encre bg-creme-fonce">
        <div className="mx-auto w-full max-w-[104rem] px-5 py-20 sm:px-8">
          <Reveal effet="monte">
            <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
              <div className="max-w-xl">
                <Eyebrow>Votre projet</Eyebrow>
                <h2 className="mt-5 text-titre">Un format hors-norme ?</h2>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-plomb">
                  Décrivez ce qu&apos;il vous faut : nous calons le tarif et le délai dans la journée.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/devis" className="btn-encre">
                  Demander un devis
                </Link>
                <Link href="/boutique" className="btn-contour">
                  Commander en ligne
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

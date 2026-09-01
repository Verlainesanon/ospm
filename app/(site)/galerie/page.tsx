import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { VISUELS_ATELIER } from "@/lib/visuels";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/anim";
import { TitrePresse } from "@/components/titre-presse";
import { LigneCommande } from "@/components/ligne-commande";

export const metadata = { title: "Realisations" };

export default async function Galerie() {
  const items = await prisma.galleryItem.findMany({
    where: { visible: true },
    orderBy: [{ ordre: "asc" }, { createdAt: "desc" }],
  });

  return (
    <Section>
      <div className="max-w-3xl">
        <Reveal effet="fondu">
          <LigneCommande texte="galerie --realisations" vitesse={42} delai={200} />
        </Reveal>
        <h1 className="mt-7 text-enseigne">
          <TitrePresse texte="Realisations" depart={140} pas={40} />
        </h1>
      </div>

      {items.length === 0 ? (
        <>
          <p className="plomb-texte mt-7 max-w-xl">
            Les photos des travaux recents arrivent bientot. En attendant, voici les familles de
            supports qui sortent de l&apos;atelier.
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {VISUELS_ATELIER.map((v, i) => (
              <Reveal key={v.titre} effet="volet" delai={i * 110} as="figure" className="carte-lien">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={v.image} alt={v.titre} fill className="object-cover" />
                </div>
                <figcaption className="px-5 py-4 text-[0.9375rem] text-plomb-noir">
                  {v.titre}
                </figcaption>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link href="/devis" className="btn-encre">
              Demander un devis
            </Link>
            <Link href="/admin/galerie" className="btn-contour">
              Publier des photos
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>figure]:mb-5">
          {items.map((g, i) => (
            <Reveal key={g.id} effet="volet" delai={(i % 6) * 90} as="figure" className="carte-lien break-inside-avoid">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.image} alt={g.titre} className="w-full object-cover" />
              <figcaption className="flex items-center justify-between gap-3 px-5 py-4">
                <span className="text-[0.9375rem] text-plomb-noir">{g.titre}</span>
                <span className="text-micro text-plomb-clair">{g.categorie}</span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}

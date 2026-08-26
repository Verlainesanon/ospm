import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { formatMontant } from "@/lib/money";
import { visuelAtelier } from "@/lib/visuels";
import { Eyebrow, Section } from "@/components/ui";
import { Reveal, Lettres, Magnetique } from "@/components/anim";

export const metadata = { title: "Services" };

export default async function Services() {
  const categories = await prisma.serviceCategory.findMany({
    where: { visible: true },
    orderBy: { ordre: "asc" },
    include: { services: { where: { visible: true }, orderBy: { ordre: "asc" } } },
  });

  return (
    <Section>
      <div className="max-w-3xl">
        <Reveal effet="fondu">
          <Eyebrow>Catalogue complet</Eyebrow>
        </Reveal>
        <h1 className="mt-6 text-affiche">
          <Lettres texte="Ce que fait" depart={150} />
          <br />
          <Lettres texte="l'atelier" depart={520} className="italic text-encre" />
        </h1>
        <p className="plomb-texte mt-7 text-lg">
          Les prix affiches sont des points de depart : ils couvrent le cas standard. Les travaux
          sur mesure passent par un devis gratuit.
        </p>
      </div>

      <div className="mt-20 space-y-24">
        {categories.map((c, index) => (
          <div key={c.id}>
            <div
              className={`grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center ${
                index % 2 === 1 ? "lg:[&>figure]:order-2" : ""
              }`}
            >
              <Reveal effet="volet" as="figure">
                <div className="relative aspect-[5/3] overflow-hidden rounded-plaque shadow-releve">
                  <Image src={visuelAtelier(c.slug)} alt={c.nom} fill className="object-cover" />
                </div>
              </Reveal>

              <Reveal effet={index % 2 === 1 ? "cote" : "cote-droit"} delai={140}>
                <h2 className="text-titre">{c.nom}</h2>
                <p className="plomb-texte mt-5">{c.description}</p>
                <Link
                  href={`/services/${c.slug}`}
                  className="lien-trait mt-7 inline-block font-medium text-encre transition-colors hover:text-rouge"
                >
                  Detail de l&apos;atelier →
                </Link>
              </Reveal>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {c.services.map((s, j) => (
                <Reveal key={s.id} effet="monte" delai={j * 70} className="plaque-douce brillance p-6">
                  <h3 className="font-sans text-[1.0625rem] font-medium text-plomb-noir">{s.nom}</h3>
                  {s.description && (
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-plomb">
                      {s.description}
                    </p>
                  )}
                  <p className="mt-4 text-[0.9375rem] font-medium text-encre">
                    {s.surDevis || s.prixBase === null
                      ? "Sur devis"
                      : `A partir de ${formatMontant(s.prixBase, s.devise)}`}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Reveal effet="monte" className="mt-20 flex flex-wrap gap-4">
        <Magnetique>
          <Link href="/devis" className="btn-encre brillance">
            Demander un devis
          </Link>
        </Magnetique>
        <Magnetique amplitude={10}>
          <Link href="/boutique" className="btn-contour">
            Commander en ligne
          </Link>
        </Magnetique>
      </Reveal>
    </Section>
  );
}

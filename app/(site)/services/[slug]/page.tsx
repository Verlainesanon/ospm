import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMontant } from "@/lib/money";
import { visuelAtelier } from "@/lib/visuels";
import { Eyebrow, Section } from "@/components/ui";
import { Reveal, Lettres, Parallaxe, Magnetique } from "@/components/anim";

// Les ateliers sont modifiables depuis l'admin : la page est rendue a la demande
// plutot que figee au build.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const c = await prisma.serviceCategory.findUnique({ where: { slug: params.slug } });
  return { title: c?.nom ?? "Service" };
}

export default async function CategorieService({ params }: { params: { slug: string } }) {
  const categorie = await prisma.serviceCategory.findUnique({
    where: { slug: params.slug },
    include: {
      services: {
        where: { visible: true },
        orderBy: { ordre: "asc" },
        include: { options: { orderBy: { ordre: "asc" } } },
      },
    },
  });

  if (!categorie || !categorie.visible) notFound();

  return (
    <>
      <section className="px-5 pt-14 sm:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <Link href="/services" className="text-micro text-plomb transition hover:text-plomb-noir">
            ← Tous les ateliers
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <Reveal effet="fondu">
                <Eyebrow>Atelier</Eyebrow>
              </Reveal>
              <h1 className="mt-6 text-affiche">
                <Lettres texte={categorie.nom} depart={120} pas={28} />
              </h1>
              <Reveal effet="monte" delai={260}>
                <p className="plomb-texte max-w-lg text-lg">{categorie.description}</p>
              </Reveal>
              <Reveal effet="monte" delai={400} className="mt-9 flex flex-wrap gap-4">
                <Magnetique>
                  <Link href="/devis" className="btn-encre brillance">
                    Demander un prix
                  </Link>
                </Magnetique>
                <Magnetique amplitude={10}>
                  <Link href="/boutique" className="btn-contour">
                    Voir la boutique
                  </Link>
                </Magnetique>
              </Reveal>
            </div>

            <Reveal effet="volet" delai={200} as="figure">
              <Parallaxe force={0.05}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-plaque shadow-flottant">
                  <Image
                    src={visuelAtelier(categorie.slug)}
                    alt={categorie.nom}
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              </Parallaxe>
            </Reveal>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          {categorie.services.map((s, i) => (
            <Reveal key={s.id} effet="monte" delai={i * 80} as="article" className="plaque brillance flex flex-col p-8">
              <h2 className="text-sous">{s.nom}</h2>
              {s.description && <p className="plomb-texte mt-3">{s.description}</p>}

              {s.options.length > 0 && (
                <ul className="mt-6 space-y-2.5 border-t border-plomb-noir/[0.08] pt-5">
                  {s.options.map((o) => (
                    <li key={o.id} className="flex justify-between gap-4 text-[0.9375rem]">
                      <span className="text-plomb">{o.nom}</span>
                      <span className="font-medium text-plomb-noir">
                        + {formatMontant(o.supplement, s.devise)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-auto flex items-center justify-between gap-4 pt-7">
                <p className="text-[1.0625rem] font-medium text-encre">
                  {s.surDevis || s.prixBase === null
                    ? "Sur devis"
                    : `${formatMontant(s.prixBase, s.devise)} / ${s.unite}`}
                </p>
                <Link
                  href={s.vendableEnLigne ? "/boutique" : `/devis?service=${s.slug}`}
                  className="btn-contour btn-petit"
                >
                  {s.vendableEnLigne ? "Commander" : "Demander un prix"}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}

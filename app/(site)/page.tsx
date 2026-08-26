import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { getReglages, reglage, numeroWhatsapp } from "@/lib/settings";
import { visuelAtelier, VISUELS_ATELIER } from "@/lib/visuels";
import { Surimpression, Eyebrow, Section, EnteteSection, BonDeTravail } from "@/components/ui";
import { Logo, RubanCmjn } from "@/components/logo";
import { Reveal, Lettres, Parallaxe, Magnetique, Compteur } from "@/components/anim";

// Les etapes sont une vraie sequence de production : la numerotation porte
// une information, elle ne decore pas.
const ETAPES = [
  {
    numero: "01",
    titre: "Vous deposez l'idee",
    texte: "Un croquis, un logo, une photo, ou juste une explication au comptoir.",
  },
  {
    numero: "02",
    titre: "On cale la maquette",
    texte: "Conception, choix du support, bon a tirer valide avec vous avant tout tirage.",
  },
  {
    numero: "03",
    titre: "On tire",
    texte: "Impression, serigraphie ou gravure selon le support choisi.",
  },
  {
    numero: "04",
    titre: "Vous recuperez",
    texte: "Controle piece par piece, puis retrait au 60 Rue Dessalines.",
  },
];

export default async function Accueil() {
  const r = await getReglages();
  const [categories, realisations] = await Promise.all([
    prisma.serviceCategory.findMany({
      where: { visible: true },
      orderBy: { ordre: "asc" },
      include: { services: { where: { visible: true }, orderBy: { ordre: "asc" }, take: 4 } },
    }),
    prisma.galleryItem.findMany({ where: { visible: true }, orderBy: { ordre: "asc" }, take: 6 }),
  ]);

  const wa = numeroWhatsapp(reglage(r, "contact.whatsapp1", "+50942712891"));
  const vitrine =
    realisations.length > 0
      ? realisations.map((g) => ({ titre: g.titre, image: g.image }))
      : VISUELS_ATELIER;

  return (
    <>
      {/* ---------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        {/* Halo qui respire, tres faible : de la vie sans distraction. */}
        <div
          aria-hidden
          className="respire pointer-events-none absolute -right-32 -top-40 h-[38rem] w-[38rem] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(27,92,224,0.16) 0%, rgba(27,92,224,0) 68%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-16 sm:px-8 md:pb-28 md:pt-24">
          <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <Reveal effet="fondu">
                <Eyebrow>Petit-Goave, Haiti - 60, Rue Dessalines</Eyebrow>
              </Reveal>

              <h1 className="mt-7 text-affiche">
                <Lettres texte="L'atelier qui " depart={250} />
                <span className="italic text-encre">
                  <Lettres texte="imprime" depart={700} />
                </span>
                <br />
                <Lettres texte="votre " depart={1000} />
                <Surimpression survol>image</Surimpression>.
              </h1>

              <Reveal effet="monte" delai={200}>
                <p className="plomb-texte mt-8 max-w-lg text-lg">
                  {reglage(
                    r,
                    "hero.texte",
                    "Informatique, conception, impression, photographie et serigraphie.",
                  )}
                </p>
              </Reveal>

              <Reveal effet="monte" delai={340}>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Magnetique>
                    <Link href="/devis" className="btn-encre brillance">
                      {reglage(r, "hero.cta", "Demander un devis")}
                    </Link>
                  </Magnetique>
                  <Magnetique amplitude={10}>
                    <a
                      href={`https://wa.me/${wa}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-contour"
                    >
                      Ecrire sur WhatsApp
                    </a>
                  </Magnetique>
                </div>
              </Reveal>

              <Reveal effet="monte" delai={480}>
                <dl className="mt-14 grid max-w-lg grid-cols-3 gap-8 border-t border-plomb-noir/[0.08] pt-8">
                  <div>
                    <dt className="font-display text-4xl text-encre">
                      <Compteur valeur={5} />
                    </dt>
                    <dd className="mt-1.5 text-micro leading-snug text-plomb">
                      ateliers sous un toit
                    </dd>
                  </div>
                  <div>
                    <dt className="font-display text-4xl text-encre">
                      <Compteur valeur={24} suffixe=" h" />
                    </dt>
                    <dd className="mt-1.5 text-micro leading-snug text-plomb">delai courant</dd>
                  </div>
                  <div>
                    <dt className="font-display text-4xl text-encre">Gratuit</dt>
                    <dd className="mt-1.5 text-micro leading-snug text-plomb">
                      le devis, toujours
                    </dd>
                  </div>
                </dl>
              </Reveal>
            </div>

            {/* Mosaique : un visuel plein revele par volet, un second flottant. */}
            <div className="relative">
              <Reveal effet="volet" delai={350}>
                <Parallaxe force={0.06}>
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-plaque shadow-flottant">
                    <Image
                      src="/visuels/serigraphie.svg"
                      alt="Serigraphie a l'atelier OSPM"
                      fill
                      priority
                      className="object-cover"
                    />
                  </div>
                </Parallaxe>
              </Reveal>

              <Reveal
                effet="echelle"
                delai={900}
                className="absolute -bottom-8 -left-6 hidden w-56 sm:block"
              >
                <div className="overflow-hidden rounded-plaque border-4 border-creme shadow-releve">
                  <Image
                    src="/visuels/badges.svg"
                    alt="Badges imprimes"
                    width={400}
                    height={300}
                    className="h-auto w-full object-cover"
                  />
                </div>
              </Reveal>

              <Reveal
                effet="echelle"
                delai={1100}
                className="absolute -right-4 -top-6 hidden md:block"
              >
                <span className="block rounded-full bg-white px-5 py-3 shadow-releve">
                  <span className="ref text-rouge">Depuis Petit-Goave</span>
                </span>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Ateliers */}
      <Section id="services">
        <EnteteSection
          eyebrow="Cinq ateliers"
          titre={
            <>
              Tout ce qui s&apos;imprime,
              <br />
              sous un seul toit
            </>
          }
          texte="Du badge d'employe a l'habillage de vitrine, en passant par le reseau informatique de votre bureau."
          action={
            <Link href="/services" className="btn-contour btn-petit">
              Voir le catalogue
            </Link>
          }
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Reveal key={c.id} effet="monte" delai={i * 90} className="flex">
            <Link href={`/services/${c.slug}`} className="carte-lien brillance group flex w-full flex-col">
              <div className="relative aspect-[5/3] overflow-hidden">
                <Image
                  src={visuelAtelier(c.slug)}
                  alt={c.nom}
                  fill
                  className="object-cover transition duration-500 ease-douce group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-7">
                <h3 className="text-sous">{c.nom}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-plomb">{c.description}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {c.services.slice(0, 3).map((s) => (
                    <li key={s.id} className="rounded-full bg-creme px-3 py-1 text-micro text-plomb">
                      {s.nom}
                    </li>
                  ))}
                </ul>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[0.9375rem] font-medium text-encre transition group-hover:text-rouge">
                  Voir l&apos;atelier
                  <span className="transition-transform duration-300 ease-douce group-hover:translate-x-1.5">
                    →
                  </span>
                </span>
              </div>
            </Link>
            </Reveal>
          ))}

          <Reveal effet="monte" delai={categories.length * 90} className="flex">
          <div className="flex w-full flex-col justify-between rounded-plaque bg-encre-nuit p-8 text-creme shadow-releve">
            <div>
              <RubanCmjn className="max-w-[7rem]" />
              <h3 className="mt-6 text-sous text-white">
                Un travail qui n&apos;est pas dans la liste ?
              </h3>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-creme/70">
                Decrivez-le, on vous dit franchement si on le fait, a quel prix et en combien de
                temps.
              </p>
            </div>
            <Magnetique className="mt-8 self-start">
              <Link href="/devis" className="btn-rouge brillance">
                Decrire le travail
              </Link>
            </Magnetique>
          </div>
          </Reveal>
        </div>
      </Section>

      {/* --------------------------------------------------- Realisations */}
      <Section className="border-y border-plomb-noir/[0.08] bg-white">
        <EnteteSection
          eyebrow="Sorties d'atelier"
          titre="Ce qui passe par nos presses"
          action={
            <Link href="/galerie" className="btn-contour btn-petit">
              Toutes les realisations
            </Link>
          }
        />

        <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
          {vitrine.slice(0, 6).map((v, i) => (
            <Reveal key={v.titre} effet="volet" delai={i * 110}>
            <figure className="carte-lien">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={v.image}
                  alt={v.titre}
                  fill
                  className="object-cover transition duration-500 ease-douce hover:scale-105"
                />
              </div>
              <figcaption className="px-5 py-4 text-[0.9375rem] text-plomb-noir">
                {v.titre}
              </figcaption>
            </figure>
            </Reveal>
          ))}
        </div>

        {realisations.length === 0 && (
          <p className="mt-8 text-micro text-plomb-clair">
            Compositions d&apos;atelier — les photos des vraies realisations les remplacent depuis
            l&apos;administration.
          </p>
        )}
      </Section>

      {/* ------------------------------------------------------ Processus */}
      <Section>
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Eyebrow>De l&apos;idee au tirage</Eyebrow>
            <h2 className="mt-5 text-titre">Quatre etapes, dans cet ordre</h2>
            <p className="plomb-texte mt-6">
              Rien ne part en production avant votre validation. C&apos;est la seule facon
              d&apos;eviter un tirage a refaire.
            </p>
            <Reveal effet="echelle" delai={150} className="mt-10">
              <BonDeTravail
                reference="OSPM-0001"
                lignes={[
                  { label: "Supports", valeur: "Papier, PVC, textile, metal" },
                  { label: "Delai courant", valeur: "24 a 72 heures" },
                  { label: "Acompte", valeur: "50 % a la commande" },
                  { label: "Retrait", valeur: "60, Rue Dessalines" },
                ]}
              />
            </Reveal>
          </div>

          <ol>
            {ETAPES.map((e, i) => (
              <Reveal
                key={e.numero}
                effet="cote"
                delai={i * 120}
                as="li"
                className="grid grid-cols-[auto_1fr] gap-7 border-t border-plomb-noir/10 py-8 last:border-b"
              >
                <span className="ref pt-1.5 text-rouge">{e.numero}</span>
                <div>
                  <h3 className="text-sous">{e.titre}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-plomb">{e.texte}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {/* ---------------------------------------------------------- Appel */}
      <Section className="pb-0">
        <Reveal effet="echelle">
        <div className="relative overflow-hidden rounded-plaque bg-encre-nuit px-8 py-16 text-creme shadow-flottant sm:px-14 md:py-20">
          <div
            aria-hidden
            className="respire pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(27,92,224,0.55) 0%, rgba(27,92,224,0) 70%)",
            }}
          />
          <div className="relative flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
            <div className="max-w-xl">
              <Logo hauteur={46} variante="plaque" />
              <h2 className="mt-8 text-titre text-white">
                Passez au comptoir, ou envoyez votre fichier
              </h2>
              <p className="mt-5 text-creme/70">
                {reglage(r, "contact.adresse")} · {reglage(r, "contact.horaires")}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Magnetique>
                <Link href="/devis" className="btn-clair brillance">
                  Envoyer un fichier
                </Link>
              </Magnetique>
              <Magnetique amplitude={10}>
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-rouge"
                >
                  {reglage(r, "contact.whatsapp1")}
                </a>
              </Magnetique>
            </div>
          </div>
        </div>
        </Reveal>
      </Section>
    </>
  );
}

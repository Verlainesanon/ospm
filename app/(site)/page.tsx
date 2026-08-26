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

interface ServiceItem {
  id: string;
  nom: string;
  slug?: string;
}

interface CategorieAvecServices {
  id: string;
  slug: string;
  nom: string;
  icone: string;
  description: string;
  couleur: string;
  ordre: number;
  visible: boolean;
  services: ServiceItem[];
}

export default async function Accueil() {
  const r = await getReglages();
  let categories: CategorieAvecServices[] = [];
  let realisations: any[] = [];

  try {
    [categories, realisations] = await Promise.all([
      prisma.serviceCategory.findMany({
        where: { visible: true },
        orderBy: { ordre: "asc" },
        include: { services: { where: { visible: true }, orderBy: { ordre: "asc" }, take: 4 } },
      }),
      prisma.galleryItem.findMany({ where: { visible: true }, orderBy: { ordre: "asc" }, take: 6 }),
    ]);
  } catch (e) {
    console.error("Erreur chargement donnees accueil BDD:", e);
  }

  const wa = numeroWhatsapp(reglage(r, "contact.whatsapp1", "+50942712891"));
  const vitrine =
    realisations.length > 0
      ? realisations.map((g) => ({ titre: g.titre, image: g.image }))
      : VISUELS_ATELIER;

  return (
    <>
      {/* ---------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden pt-4">
        {/* Halos lumineux d'ambiance premium */}
        <div
          aria-hidden
          className="respire pointer-events-none absolute -right-32 -top-40 h-[42rem] w-[42rem] rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle, rgba(27,92,224,0.18) 0%, rgba(197,160,89,0.08) 45%, rgba(0,0,0,0) 70%)",
          }}
        />
        <div
          aria-hidden
          className="respire pointer-events-none absolute -left-32 top-1/2 h-[36rem] w-[36rem] -translate-y-1/2 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(214,32,39,0.12) 0%, rgba(27,92,224,0.05) 50%, rgba(0,0,0,0) 70%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-12 sm:px-8 md:pb-28 md:pt-20">
          <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <Reveal effet="fondu">
                <div className="inline-flex items-center gap-2 rounded-full border border-or/40 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-or animate-pulse" />
                  <span className="text-micro font-medium uppercase tracking-[0.1em] text-encre-nuit">
                    Atelier Artisanal & Impression High-Tech • Petit-Goâve
                  </span>
                </div>
              </Reveal>

              <h1 className="mt-6 text-affiche">
                <Lettres texte="L'atelier qui " depart={250} />
                <span className="italic text-encre">
                  <Lettres texte="imprime" depart={700} />
                </span>
                <br />
                <Lettres texte="votre " depart={1000} />
                <Surimpression survol>image</Surimpression>.
              </h1>

              <Reveal effet="monte" delai={200}>
                <p className="plomb-texte mt-7 max-w-lg text-lg leading-relaxed text-plomb-noir/80">
                  {reglage(
                    r,
                    "hero.texte",
                    "Informatique, conception graphique, impression grand format, photographie et sérigraphie d'art.",
                  )}
                </p>
              </Reveal>

              <Reveal effet="monte" delai={340}>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Magnetique>
                    <Link href="/devis" className="btn-encre brillance shadow-releve">
                      ✨ {reglage(r, "hero.cta", "Demander un devis gratuit")}
                    </Link>
                  </Magnetique>
                  <Magnetique amplitude={10}>
                    <a
                      href={`https://wa.me/${wa}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-contour"
                    >
                      💬 Écrire sur WhatsApp
                    </a>
                  </Magnetique>
                </div>
              </Reveal>

              <Reveal effet="monte" delai={480}>
                <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 rounded-2xl border border-black/[0.06] bg-white/60 p-6 shadow-sm backdrop-blur-sm">
                  <div>
                    <dt className="font-display text-4xl font-semibold text-encre">
                      <Compteur valeur={5} />
                    </dt>
                    <dd className="mt-1 text-micro leading-snug text-plomb font-medium">
                      Ateliers sous un toit
                    </dd>
                  </div>
                  <div>
                    <dt className="font-display text-4xl font-semibold text-rouge">
                      <Compteur valeur={24} suffixe=" h" />
                    </dt>
                    <dd className="mt-1 text-micro leading-snug text-plomb font-medium">Délais de tirage</dd>
                  </div>
                  <div>
                    <dt className="font-display text-4xl font-semibold text-or-sombre">100%</dt>
                    <dd className="mt-1 text-micro leading-snug text-plomb font-medium">
                      Bon à tirer garanti
                    </dd>
                  </div>
                </dl>
              </Reveal>
            </div>

            {/* Mosaïque Visuelle Premium */}
            <div className="relative">
              <Reveal effet="volet" delai={350}>
                <Parallaxe force={0.06}>
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-plaque border-2 border-or/20 bg-white shadow-flottant">
                    <Image
                      src="/visuels/serigraphie.svg"
                      alt="Sérigraphie à l'atelier OSPM"
                      fill
                      priority
                      className="object-cover transition duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-encre-nuit/60 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <p className="text-micro uppercase tracking-widest text-or-clair">Atelier de Sérigraphie</p>
                      <h3 className="font-display text-2xl font-normal text-white mt-1">L&apos;Excellence du Tirage</h3>
                    </div>
                  </div>
                </Parallaxe>
              </Reveal>

              <Reveal
                effet="echelle"
                delai={900}
                className="absolute -bottom-8 -left-6 hidden w-60 sm:block"
              >
                <div className="overflow-hidden rounded-plaque border-4 border-white shadow-releve">
                  <Image
                    src="/visuels/badges.svg"
                    alt="Badges imprimés"
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
                <span className="inline-flex items-center gap-2 rounded-full border border-or/40 bg-encre-nuit px-5 py-2.5 text-white shadow-flottant backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-rouge" />
                  <span className="font-mono text-micro font-medium uppercase text-white/90">60, Rue Dessalines</span>
                </span>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Ateliers */}
      <Section id="services">
        <EnteteSection
          eyebrow="Cinq Ateliers Spécialisés"
          titre={
            <>
              L&apos;Artisanat Graphique & Impression,
              <br />
              sur tous vos supports
            </>
          }
          texte="Du badge d'employé haute précision à l'habillage complet de vitrine, découvrez la qualité d'impression OSPM."
          action={
            <Link href="/services" className="btn-contour btn-petit">
              Catalogue complet →
            </Link>
          }
        />

        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Reveal key={c.id} effet="monte" delai={i * 90} className="flex">
            <Link href={`/services/${c.slug}`} className="carte-premium group flex w-full flex-col">
              <div className="relative aspect-[5/3] overflow-hidden rounded-t-[10px]">
                <Image
                  src={visuelAtelier(c.slug)}
                  alt={c.nom}
                  fill
                  className="object-cover transition duration-700 ease-douce group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition" />
                <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-micro font-semibold uppercase tracking-wider text-encre-nuit backdrop-blur-md shadow-sm">
                  Atelier #{i + 1}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-7">
                <h3 className="text-sous group-hover:text-encre transition-colors">{c.nom}</h3>
                <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-plomb">{c.description}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {c.services.slice(0, 3).map((s: ServiceItem) => (
                    <li key={s.id} className="rounded-full border border-black/[0.06] bg-creme/80 px-3 py-1 text-micro text-plomb-noir font-medium">
                      {s.nom}
                    </li>
                  ))}
                </ul>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[0.9375rem] font-medium text-encre transition group-hover:text-rouge">
                  Explorer l&apos;atelier
                  <span className="transition-transform duration-300 ease-douce group-hover:translate-x-1.5">
                    →
                  </span>
                </span>
              </div>
            </Link>
            </Reveal>
          ))}

          <Reveal effet="monte" delai={categories.length * 90} className="flex">
          <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-plaque bg-encre-profond p-8 text-creme shadow-flottant border border-or/30">
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-or/10 blur-2xl pointer-events-none" />
            <div>
              <RubanCmjn className="max-w-[7rem]" />
              <h3 className="mt-6 text-sous font-normal text-white">
                Un projet ou travail sur-mesure ?
              </h3>
              <p className="mt-3.5 text-[0.9375rem] leading-relaxed text-creme/75">
                Une création spéciale, un format hors-norme ou une commande urgente ? Décrivez votre projet, nous calons le tarif et le délai immédiatement.
              </p>
            </div>
            <Magnetique className="mt-8 self-start">
              <Link href="/devis" className="btn-or brillance">
                ✨ Demander un devis sur-mesure
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

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {vitrine.slice(0, 6).map((v, i) => (
            <Reveal key={v.titre} effet="volet" delai={i * 110}>
            <figure className="carte-premium group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-[10px]">
                <Image
                  src={v.image}
                  alt={v.titre}
                  fill
                  className="object-cover transition duration-700 ease-douce group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition" />
              </div>
              <figcaption className="px-5 py-4 text-[0.9375rem] font-medium text-plomb-noir group-hover:text-encre transition-colors">
                {v.titre}
              </figcaption>
            </figure>
            </Reveal>
          ))}
        </div>

        {realisations.length === 0 && (
          <p className="mt-8 text-micro text-plomb-clair">
            Compositions d&apos;atelier — les photos des vraies réalisations les remplacent depuis l&apos;administration.
          </p>
        )}
      </Section>

      {/* ------------------------------------------------------ Processus */}
      <Section>
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Eyebrow>De l&apos;idée au tirage d&apos;art</Eyebrow>
            <h2 className="mt-5 text-titre">Quatre étapes, la garantie du zéro défaut</h2>
            <p className="plomb-texte mt-6">
              Rien ne part en production avant votre validation formelle (Bon à Tirer). C&apos;est l&apos;assurance d&apos;un résultat irréprochable.
            </p>
            <Reveal effet="echelle" delai={150} className="mt-10">
              <BonDeTravail
                reference="OSPM-2026-0001"
                lignes={[
                  { label: "Supports", valeur: "Papier, PVC, textile, métal" },
                  { label: "Délai courant", valeur: "24 à 72 heures" },
                  { label: "Acompte", valeur: "50 % à la commande" },
                  { label: "Retrait Atelier", valeur: "60, Rue Dessalines" },
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
                className="grid grid-cols-[auto_1fr] gap-7 border-t border-plomb-noir/10 py-8 last:border-b group"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-or/40 bg-or/10 font-mono text-micro font-bold text-or-sombre transition duration-300 group-hover:bg-or group-hover:text-encre-nuit">
                  {e.numero}
                </span>
                <div>
                  <h3 className="text-sous font-normal group-hover:text-encre transition-colors">{e.titre}</h3>
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
        <div className="relative overflow-hidden rounded-plaque border border-or/30 bg-encre-profond px-8 py-16 text-creme shadow-flottant sm:px-14 md:py-20">
          <div
            aria-hidden
            className="respire pointer-events-none absolute -right-24 -top-24 h-[30rem] w-[30rem] rounded-full opacity-50"
            style={{
              background: "radial-gradient(circle, rgba(27,92,224,0.6) 0%, rgba(197,160,89,0.2) 40%, rgba(0,0,0,0) 70%)",
            }}
          />
          <div className="relative flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
            <div className="max-w-xl">
              <Logo hauteur={48} variante="plaque" />
              <h2 className="mt-8 text-titre text-white">
                Passez au comptoir, ou envoyez vos fichiers en ligne
              </h2>
              <p className="mt-5 text-creme/80 text-lg">
                📍 {reglage(r, "contact.adresse")} <br />
                🕒 {reglage(r, "contact.horaires")}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Magnetique>
                <Link href="/devis" className="btn-or brillance shadow-releve">
                  ✨ Demander un devis en ligne
                </Link>
              </Magnetique>
              <Magnetique amplitude={10}>
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-rouge"
                >
                  💬 WhatsApp Direct
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

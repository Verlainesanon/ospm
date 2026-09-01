import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { getReglages, reglage, numeroWhatsapp } from "@/lib/settings";
import { visuelAtelier, VISUELS_ATELIER } from "@/lib/visuels";
import { Surimpression, Eyebrow, BonDeTravail } from "@/components/ui";
import { RubanCmjn } from "@/components/logo";
import { Reveal, Compteur, Magnetique } from "@/components/anim";
import { TitrePresse } from "@/components/titre-presse";
import { Plaque3D } from "@/components/plaque-3d";
import { LigneCommande } from "@/components/ligne-commande";
import { SceauAtelier } from "@/components/sceau-atelier";
import { IconeWhatsApp, IconeAtelier } from "@/components/icones";

// Une encre process par atelier. Le ruban CMJN du logo devient la cle de
// lecture du site : chaque atelier a sa plaque, comme sur une presse.
const ENCRES = [
  { texte: "text-encre", fond: "bg-encre" },
  { texte: "text-rouge", fond: "bg-rouge" },
  { texte: "text-or", fond: "bg-or" },
] as const;

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
      {/* ---------------------------------------------------------- Hero
          Typographie seule sur le noir riche. Mettre une image en fond ici la
          condamnait au voile — donc a la tache. Les images ont leur place plus
          bas, dans la liste des ateliers et dans la galerie, ou elles sont le
          sujet et pas un decor. */}
      <section className="relative flex min-h-[92svh] flex-col justify-end overflow-hidden">
        <div className="relative mx-auto w-full max-w-[104rem] px-5 pt-36 sm:px-8">
          {/* Cadre elargi pour l'enseigne : a la taille voulue, quatre mots ne
              tiennent pas dans une colonne de texte. */}
          <div className="max-w-6xl pb-16">
            <Reveal effet="fondu">
              <div className="flex items-center gap-5">
                <SceauAtelier />
                <LigneCommande texte="Petit-Goâve — 60, Rue Dessalines" vitesse={38} delai={200} />
              </div>
            </Reveal>

            {/* Structure reprise des maquettes de reference : le nom en grand,
                puis une accroche courte avec un verbe. La periphrase qui etait
                la ("L'atelier qui imprime votre image") disait la meme chose en
                deux fois plus de mots. */}
            <h1 className="mt-7">
              {/* Le nom est coupe a la main en deux lignes : laisse libre, il
                  se briserait n'importe ou selon la largeur de l'ecran. */}
              <span className="block text-enseigne">
                <TitrePresse texte="Official Services" depart={180} pas={22} />
                <br />
                <TitrePresse texte="Printing and More" depart={560} pas={22} />
              </span>
              <span className="mt-3 block text-titre text-encre">
                <TitrePresse texte="imprime vos" depart={1000} pas={26} />
                &nbsp;
                <Surimpression survol>idées</Surimpression>.
              </span>
            </h1>

            <Reveal effet="monte" delai={200}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-plomb">
                {reglage(
                  r,
                  "hero.texte",
                  "Informatique, conception graphique, impression grand format, photographie et sérigraphie d'art.",
                )}
              </p>
            </Reveal>

            <Reveal effet="monte" delai={340}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Magnetique>
                  <Link href="/devis" className="btn-encre">
                    {reglage(r, "hero.cta", "Demander un devis")}
                  </Link>
                </Magnetique>
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp"
                >
                  <IconeWhatsApp taille={17} />
                  Écrire sur WhatsApp
                </a>
              </div>
            </Reveal>
          </div>

          {/* Les chiffres tiennent sur une ligne reglee. La boite arrondie a
              fond translucide etait le detail le plus generique de la page. */}
          <Reveal effet="monte" delai={480}>
            <dl className="grid grid-cols-3 border-t border-plomb-noir/20">
              <div className="py-7 pr-5">
                <dt className="font-display text-4xl font-semibold text-encre sm:text-5xl">
                  <Compteur valeur={5} />
                </dt>
                <dd className="mt-2 max-w-[14rem] text-micro leading-snug text-plomb">
                  Ateliers sous un toit
                </dd>
              </div>
              <div className="border-l border-plomb-noir/20 py-7 pl-5 pr-5 sm:pl-8">
                <dt className="font-display text-4xl font-semibold text-rouge sm:text-5xl">
                  <Compteur valeur={24} suffixe=" h" />
                </dt>
                <dd className="mt-2 max-w-[14rem] text-micro leading-snug text-plomb">
                  Délai de tirage courant
                </dd>
              </div>
              <div className="border-l border-plomb-noir/20 py-7 pl-5 pr-5 sm:pl-8">
                <dt className="font-display text-4xl font-semibold text-or sm:text-5xl">100 %</dt>
                <dd className="mt-2 max-w-[14rem] text-micro leading-snug text-plomb">
                  Bon à tirer validé avant presse
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ Ateliers
          Liste editoriale plutot que grille de cartes : chaque atelier occupe
          toute la largeur, porte son numero et une des trois encres. */}
      <section id="services" className="mx-auto w-full max-w-[104rem] px-5 pt-28 sm:px-8 md:pt-36">
        <div className="flex flex-wrap items-end justify-between gap-6 pb-12">
          <Reveal effet="monte" className="max-w-2xl">
            <Eyebrow>Cinq ateliers, un seul toit</Eyebrow>
            <h2 className="mt-5 text-titre">Du badge à l&apos;habillage de vitrine</h2>
          </Reveal>
          <Reveal effet="fondu" delai={220}>
            <Link href="/services" className="btn-contour btn-petit">
              Catalogue complet
            </Link>
          </Reveal>
        </div>

        <ol className="border-t border-plomb-noir/15">
          {categories.map((c, i) => {
            const encre = ENCRES[i % ENCRES.length];
            return (
              <Reveal
                key={c.id}
                as="li"
                effet="monte"
                delai={i * 70}
                className="group border-b border-plomb-noir/15"
              >
                <Link
                  href={`/services/${c.slug}`}
                  className="grid items-center gap-8 py-10 lg:grid-cols-[4rem_1fr_24rem] lg:py-12"
                >
                  <span className={`flex flex-col items-start gap-3 ${encre.texte}`}>
                    <IconeAtelier nom={c.icone} taille={26} />
                    <span className="font-mono text-micro tracking-[0.14em]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </span>

                  <div className="max-w-xl">
                    <h3 className="text-titre">{c.nom}</h3>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-plomb">
                      {c.description}
                    </p>
                    {/* Rangees de services facon "badge" : un libelle, un
                        filet d'encre au bout. Le mono garde la voix technique. */}
                    <ul className="mt-6 max-w-md">
                      {c.services.slice(0, 3).map((s: ServiceItem) => (
                        <li
                          key={s.id}
                          className="flex items-center justify-between gap-4 border-b border-plomb-noir/10 py-2.5 last:border-b-0"
                        >
                          <span className="font-mono text-micro tracking-[0.06em] text-plomb">
                            {s.nom}
                          </span>
                          <span aria-hidden className={`h-px w-6 shrink-0 ${encre.fond}`} />
                        </li>
                      ))}
                    </ul>
                    <span className="mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-plomb-noir">
                      Explorer l&apos;atelier
                      <span className="transition-transform duration-300 ease-douce group-hover:translate-x-1.5">
                        →
                      </span>
                    </span>
                  </div>

                  <Plaque3D className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={visuelAtelier(c.slug)}
                      alt={c.nom}
                      fill
                      className="object-cover transition duration-700 ease-douce group-hover:scale-[1.04]"
                    />
                    {/* Filet d'encre tire sous l'image au survol : le meme
                        geste que la raclette, en beaucoup plus discret. */}
                    <span
                      aria-hidden
                      className={`absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-500 ease-douce group-hover:scale-x-100 ${encre.fond}`}
                    />
                  </Plaque3D>
                </Link>
              </Reveal>
            );
          })}
        </ol>

        <Reveal effet="monte" className="mt-14">
          <div className="flex flex-col items-start justify-between gap-8 border-t-2 border-encre pt-10 md:flex-row md:items-end">
            <div className="max-w-xl">
              <RubanCmjn className="max-w-[7rem]" />
              <h3 className="mt-6 text-sous">Un format hors-norme, une commande urgente ?</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-plomb">
                Décrivez votre projet : nous calons le tarif et le délai dans la journée.
              </p>
            </div>
            <Link href="/devis" className="btn-encre">
              Demander un devis sur-mesure
            </Link>
          </div>
        </Reveal>
      </section>

      {/* --------------------------------------------------- Realisations
          La galerie : images bord a bord, separees par un filet d'un pixel.
          Aucune carte, aucun arrondi — le travail occupe tout l'espace. */}
      <section className="mt-28 border-y border-plomb-noir/15 md:mt-36">
        <div className="mx-auto flex w-full max-w-[104rem] flex-wrap items-end justify-between gap-6 px-5 py-12 sm:px-8">
          <Reveal effet="monte" className="max-w-2xl">
            <Eyebrow>Sorties d&apos;atelier</Eyebrow>
            <h2 className="mt-5 text-titre">Ce qui passe par nos presses</h2>
          </Reveal>
          <Reveal effet="fondu" delai={220}>
            <Link href="/galerie" className="btn-contour btn-petit">
              Toutes les réalisations
            </Link>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-px bg-plomb-noir/15 md:grid-cols-3">
          {vitrine.slice(0, 6).map((v, i) => (
            <Reveal key={v.titre} effet="fondu" delai={i * 90}>
              <figure className="group relative aspect-[4/3] overflow-hidden bg-creme">
                <Image
                  src={v.image}
                  alt={v.titre}
                  fill
                  className="object-cover transition duration-700 ease-douce group-hover:scale-[1.04]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-creme/95 px-5 py-3.5 text-micro uppercase tracking-[0.14em] text-plomb-noir transition-transform duration-300 ease-douce group-hover:translate-y-0">
                  {v.titre}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        {realisations.length === 0 && (
          <p className="mx-auto max-w-[104rem] px-5 py-5 text-micro text-plomb-clair sm:px-8">
            Compositions d&apos;atelier — les photos des vraies réalisations les remplacent depuis
            l&apos;administration.
          </p>
        )}
      </section>

      {/* ------------------------------------------------------ Processus
          La numerotation reste : c'est une vraie sequence de production,
          l'ordre porte une information que le lecteur doit avoir. */}
      <section className="mx-auto w-full max-w-[104rem] px-5 py-28 sm:px-8 md:py-36">
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Eyebrow>De l&apos;idée au tirage</Eyebrow>
            <h2 className="mt-5 text-titre">Quatre étapes, zéro mauvaise surprise</h2>
            <p className="mt-6 text-[1.0625rem] leading-relaxed text-plomb">
              Rien ne part en production avant votre bon à tirer. Vous validez ce que vous recevrez.
            </p>
            <Reveal effet="monte" delai={150} className="mt-10">
              <BonDeTravail
                reference="OSPM-2026-0001"
                lignes={[
                  { label: "Supports", valeur: "Papier, PVC, textile, métal" },
                  { label: "Délai courant", valeur: "24 à 72 heures" },
                  { label: "Acompte", valeur: "50 % à la commande" },
                  { label: "Retrait atelier", valeur: "60, Rue Dessalines" },
                ]}
              />
            </Reveal>
          </div>

          <ol className="border-t border-plomb-noir/15">
            {ETAPES.map((e, i) => (
              <Reveal
                key={e.numero}
                effet="monte"
                delai={i * 100}
                as="li"
                className="grid grid-cols-[3rem_1fr] gap-6 border-b border-plomb-noir/15 py-8"
              >
                <span className="font-mono text-micro tracking-[0.14em] text-encre">{e.numero}</span>
                <div>
                  <h3 className="text-sous">{e.titre}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-plomb">{e.texte}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------------------------------------- Appel */}
      <section className="border-t-2 border-encre bg-creme-fonce">
        <div className="mx-auto w-full max-w-[104rem] px-5 py-20 sm:px-8 md:py-28">
          <Reveal effet="monte">
            <div className="flex flex-col items-start justify-between gap-12 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <h2 className="text-titre">Passez au comptoir, ou envoyez vos fichiers</h2>
                <dl className="mt-8 grid gap-x-10 gap-y-3 text-[0.9375rem] sm:grid-cols-2">
                  <div>
                    <dt className="text-micro uppercase tracking-[0.14em] text-plomb-clair">
                      Adresse
                    </dt>
                    <dd className="mt-1 text-plomb-noir">{reglage(r, "contact.adresse")}</dd>
                  </div>
                  <div>
                    <dt className="text-micro uppercase tracking-[0.14em] text-plomb-clair">
                      Horaires
                    </dt>
                    <dd className="mt-1 text-plomb-noir">{reglage(r, "contact.horaires")}</dd>
                  </div>
                </dl>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/devis" className="btn-encre">
                  Demander un devis
                </Link>
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp"
                >
                  <IconeWhatsApp taille={17} />
                  WhatsApp direct
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

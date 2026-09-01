import Link from "next/link";
import { getReglages, reglage, numeroWhatsapp } from "@/lib/settings";
import { prisma } from "@/lib/db";
import { Logo, RubanCmjn } from "@/components/logo";
import { MenuMobile } from "@/components/menu-mobile";
import { EcranChargement } from "@/components/ecran-chargement";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurseurCalage } from "@/components/curseur-calage";
import { LumiereAtelier } from "@/components/lumiere-atelier";
import {
  IconeServices,
  IconeGalerie,
  IconeBoutique,
  IconeContact,
  IconeDevis,
  IconeAtelier,
} from "@/components/icones";

// Tout le site public lit la base (contenu editable depuis l'admin) : rendu a
// la demande, jamais fige au build.
export const dynamic = "force-dynamic";

// `icone` est une cle, pas un composant : ces liens traversent la frontiere
// serveur -> client (MenuMobile), et React n'y laisse pas passer de fonction.
const LIENS = [
  { href: "/services", label: "Services", icone: "services" as const },
  { href: "/galerie", label: "Réalisations", icone: "galerie" as const },
  { href: "/boutique", label: "Boutique", icone: "boutique" as const },
  { href: "/contact", label: "Contact", icone: "contact" as const },
];

const ICONES_NAV = {
  services: IconeServices,
  galerie: IconeGalerie,
  boutique: IconeBoutique,
  contact: IconeContact,
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const r = await getReglages();
  let categories: { slug: string; nom: string; icone: string }[] = [];
  try {
    categories = await prisma.serviceCategory.findMany({
      where: { visible: true },
      orderBy: { ordre: "asc" },
      select: { slug: true, nom: true, icone: true },
    });
  } catch (e) {
    console.error("Erreur chargement categories layout:", e);
  }
  const wa = numeroWhatsapp(reglage(r, "contact.whatsapp1", "+50942712891"));

  return (
    <CurseurCalage>
    {/* La lanterne est posee en fond fixe du site : elle accompagne toutes les
        pages, pas seulement l'accueil. Le contenu passe au-dessus (`relative`). */}
    <LumiereAtelier />

    <div className="relative flex min-h-screen flex-col">
      <EcranChargement />

      <header className="sans-impression sticky top-0 z-40 border-b border-plomb-noir/[0.08] bg-creme/95 backdrop-blur-sm dark:border-white/[0.08]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3.5" aria-label="Accueil OSPM">
            <Logo hauteur={36} priority />
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {LIENS.map((l) => {
              const Icone = ICONES_NAV[l.icone];
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group inline-flex items-center gap-2 text-[0.9375rem] text-plomb transition-colors hover:text-encre"
                >
                  <Icone
                    taille={17}
                    className="text-plomb-clair transition-colors group-hover:text-encre"
                  />
                  {l.label}
                </Link>
              );
            })}
            <Link href="/devis" className="btn-encre btn-petit">
              <IconeDevis taille={16} />
              Demander un devis
            </Link>
            <ThemeToggle />
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <MenuMobile liens={LIENS} whatsapp={wa} />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Le pied de page suit le theme comme le reste : plus de `zone-sombre`
          qui le clouait en noir en plein jour. Il etait aussi ecrit en
          `text-creme` — or `creme` designe desormais la SURFACE, donc ce texte
          rendait noir sur noir. C'est la qu'etaient les elements invisibles.
          Structure : un ourlet quadri, puis trois colonnes reglees au filet. */}
      <footer className="sans-impression mt-28 bg-creme-fonce">
        <RubanCmjn className="max-w-none" />

        <div className="mx-auto w-full max-w-[104rem] px-5 sm:px-8">
          <div className="grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1.2fr] md:py-20">
            <div>
              <Logo hauteur={44} />
              <p className="mt-7 max-w-sm text-[1.0625rem] leading-relaxed text-plomb">
                {reglage(r, "site.slogan")}
              </p>
            </div>

            <div>
              <p className="font-mono text-micro uppercase tracking-[0.18em] text-encre">
                Ateliers
              </p>
              <ul className="mt-6">
                {categories.map((c) => (
                  <li key={c.slug} className="border-b border-plomb-noir/10 last:border-b-0">
                    <Link
                      href={`/services/${c.slug}`}
                      className="group flex items-center gap-2.5 py-2.5 text-[0.9375rem] text-plomb transition-colors hover:text-encre"
                    >
                      <IconeAtelier
                        nom={c.icone}
                        taille={16}
                        className="text-plomb-clair transition-colors group-hover:text-encre"
                      />
                      {c.nom}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono text-micro uppercase tracking-[0.18em] text-encre">
                Nous trouver
              </p>
              <address className="mt-6 not-italic">
                <p className="text-[0.9375rem] leading-relaxed text-plomb-noir">
                  {reglage(r, "contact.adresse")}
                </p>
                <dl className="mt-5 space-y-2.5 font-mono text-micro">
                  <div className="flex items-baseline justify-between gap-4 border-b border-plomb-noir/10 pb-2.5">
                    <dt className="text-plomb-clair">WhatsApp</dt>
                    <dd>
                      <a
                        href={`https://wa.me/${wa}`}
                        className="text-plomb transition-colors hover:text-encre"
                      >
                        {reglage(r, "contact.whatsapp1")}
                      </a>
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-b border-plomb-noir/10 pb-2.5">
                    <dt className="text-plomb-clair">Courriel</dt>
                    <dd>
                      <a
                        href={`mailto:${reglage(r, "contact.email")}`}
                        className="text-plomb transition-colors hover:text-encre"
                      >
                        {reglage(r, "contact.email")}
                      </a>
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-plomb-clair">Instagram</dt>
                    <dd className="text-plomb">@company.ospm</dd>
                  </div>
                </dl>
              </address>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-plomb-noir/15 py-7 font-mono text-micro text-plomb-clair sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} OSPM · Petit-Goâve, Haïti</span>
            <Link href="/admin" className="transition-colors hover:text-encre">
              Espace administration
            </Link>
          </div>
        </div>
      </footer>
    </div>
    </CurseurCalage>
  );
}

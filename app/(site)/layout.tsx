import Link from "next/link";
import { getReglages, reglage, numeroWhatsapp } from "@/lib/settings";
import { prisma } from "@/lib/db";
import { Logo, RubanCmjn } from "@/components/logo";
import { MenuMobile } from "@/components/menu-mobile";
import { EcranChargement } from "@/components/ecran-chargement";

// Tout le site public lit la base (contenu editable depuis l'admin) : rendu a
// la demande, jamais fige au build.
export const dynamic = "force-dynamic";

const LIENS = [
  { href: "/services", label: "Services" },
  { href: "/galerie", label: "Realisations" },
  { href: "/boutique", label: "Boutique" },
  { href: "/contact", label: "Contact" },
];

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const r = await getReglages();
  let categories: { slug: string; nom: string }[] = [];
  try {
    categories = await prisma.serviceCategory.findMany({
      where: { visible: true },
      orderBy: { ordre: "asc" },
      select: { slug: true, nom: true },
    });
  } catch (e) {
    console.error("Erreur chargement categories layout:", e);
  }
  const wa = numeroWhatsapp(reglage(r, "contact.whatsapp1", "+50942712891"));

  return (
    <div className="flex min-h-screen flex-col">
      <EcranChargement />

      <header className="sans-impression sticky top-0 z-40 border-b border-plomb-noir/[0.08] bg-creme/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3.5" aria-label="Accueil OSPM">
            <Logo hauteur={36} priority />
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {LIENS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[0.9375rem] text-plomb transition-colors hover:text-plomb-noir"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/devis" className="btn-encre btn-petit">
              Demander un devis
            </Link>
          </nav>

          <MenuMobile liens={LIENS} whatsapp={wa} />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="sans-impression mt-24 bg-encre-nuit text-creme">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo hauteur={48} variante="plaque" />
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-creme/75">
              {reglage(r, "site.slogan")}
            </p>
            <RubanCmjn className="mt-8 max-w-[9rem]" />
          </div>

          <div>
            <p className="text-micro font-medium uppercase tracking-[0.08em] text-creme/45">
              Ateliers
            </p>
            <ul className="mt-5 space-y-3">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/services/${c.slug}`}
                    className="text-[0.9375rem] text-creme/75 transition-colors hover:text-white"
                  >
                    {c.nom}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-micro font-medium uppercase tracking-[0.08em] text-creme/45">
              Nous trouver
            </p>
            <address className="mt-5 space-y-3 text-[0.9375rem] not-italic text-creme/75">
              <p>{reglage(r, "contact.adresse")}</p>
              <p>
                <a href={`https://wa.me/${wa}`} className="transition-colors hover:text-white">
                  {reglage(r, "contact.whatsapp1")}
                </a>
                <br />
                {reglage(r, "contact.whatsapp2")}
              </p>
              <a
                href={`mailto:${reglage(r, "contact.email")}`}
                className="block transition-colors hover:text-white"
              >
                {reglage(r, "contact.email")}
              </a>
              <p className="pt-1 text-creme/45">@company.ospm</p>
            </address>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-6 text-micro text-creme/45 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <span>© {new Date().getFullYear()} OSPM · Petit-Goave, Haiti</span>
            <Link href="/admin" className="transition-colors hover:text-creme">
              Espace administration
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

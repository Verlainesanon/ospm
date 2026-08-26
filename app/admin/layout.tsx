import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, can, type Role } from "@/lib/auth";
import { deconnexion } from "./actions";
import { Logo } from "@/components/logo";

export const metadata = { title: "Administration" };

const NAV: { titre: string; zone: string; liens: { href: string; label: string }[] }[] = [
  {
    titre: "Pilotage",
    zone: "rapports",
    liens: [
      { href: "/admin", label: "Tableau de bord" },
      { href: "/admin/rapports", label: "Rapports" },
    ],
  },
  {
    titre: "Travail",
    zone: "commandes",
    liens: [
      { href: "/admin/devis", label: "Devis" },
      { href: "/admin/commandes", label: "Commandes" },
      { href: "/admin/clients", label: "Clients" },
      { href: "/admin/messages", label: "Messages" },
    ],
  },
  {
    titre: "Finance",
    zone: "finance",
    liens: [
      { href: "/admin/factures", label: "Factures & recus" },
      { href: "/admin/caisse", label: "Caisse" },
      { href: "/admin/depenses", label: "Depenses" },
    ],
  },
  {
    titre: "Atelier",
    zone: "stock",
    liens: [
      { href: "/admin/stock", label: "Stock" },
      { href: "/admin/materiel", label: "Materiel" },
      { href: "/admin/impression", label: "Impression" },
    ],
  },
  {
    titre: "Site",
    zone: "contenu",
    liens: [
      { href: "/admin/services", label: "Services & prix" },
      { href: "/admin/galerie", label: "Galerie" },
      { href: "/admin/pages", label: "Pages" },
      { href: "/admin/reglages", label: "Reglages du site" },
      { href: "/admin/utilisateurs", label: "Utilisateurs" },
    ],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const role = session.role as Role;
  const sections = NAV.filter((s) => can(role, s.zone));

  return (
    <div className="flex min-h-screen bg-creme">
      <aside className="sans-impression hidden w-60 shrink-0 border-r border-plomb-noir/[0.08] bg-creme lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <Link href="/admin" className="block border-b border-plomb-noir/[0.08] px-5 py-5">
            <Logo hauteur={30} />
            <span className="mt-2 block text-micro text-plomb">
              Administration
            </span>
          </Link>

          <nav className="flex-1 overflow-y-auto px-3 py-5">
            {sections.map((s) => (
              <div key={s.titre} className="mb-6">
                <p className="px-3 text-micro font-medium uppercase tracking-[0.08em] text-plomb-clair">{s.titre}</p>
                <ul className="mt-2 space-y-0.5">
                  {s.liens.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="block rounded-douce px-3 py-2 text-[0.9375rem] text-plomb transition-colors hover:bg-white hover:text-encre"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="border-t border-plomb-noir/[0.08] px-5 py-4">
            <p className="text-sm font-medium text-plomb-noir">{session.nom}</p>
            <p className="text-micro text-plomb">{session.role}</p>
            <form action={deconnexion} className="mt-3">
              <button className="text-micro font-medium text-rouge hover:underline">
                Se deconnecter
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sans-impression flex items-center justify-between gap-4 border-b border-plomb-noir/[0.08] px-5 py-3 lg:hidden">
          <Link href="/admin" aria-label="Tableau de bord">
            <Logo hauteur={26} />
          </Link>
          <form action={deconnexion}>
            <button className="text-micro font-medium text-rouge">Quitter</button>
          </form>
        </header>

        <div className="entree-admin mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">{children}</div>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";

export function TitrePage({
  titre,
  sousTitre,
  action,
}: {
  titre: string;
  sousTitre?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        <h1 className="text-titre">{titre}</h1>
        {sousTitre && <p className="mt-3 text-[0.9375rem] leading-relaxed text-plomb">{sousTitre}</p>}
      </div>
      {action}
    </div>
  );
}

export function Carte({
  titre,
  children,
  action,
  className = "",
}: {
  titre?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`plaque ${className}`}>
      {(titre || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-plomb-noir/[0.08] px-6 py-4">
          {titre && <h2 className="text-[0.9375rem] font-medium text-plomb-noir">{titre}</h2>}
          {action}
        </header>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}

// Tableau responsive : le conteneur defile horizontalement, jamais la page.
export function Tableau({ colonnes, children }: { colonnes: string[]; children: ReactNode }) {
  return (
    <div className="-mx-2 overflow-x-auto px-2">
      <table className="w-full min-w-[38rem] border-collapse text-[0.9375rem]">
        <thead>
          <tr className="border-b border-plomb-noir/10 text-left">
            {colonnes.map((c) => (
              <th key={c} className="px-3 pb-3 text-micro font-medium text-plomb">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-plomb-noir/[0.06]">{children}</tbody>
      </table>
    </div>
  );
}

// Ligne de formulaire dense : chaque champ garde son intitule au-dessus, ce qui
// evite les rangees d'inputs muets qui rendent l'admin illisible.
export function Champ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="etiquette">{label}</span>
      {children}
    </label>
  );
}

const TEINTES: Record<string, string> = {
  bleu: "bg-encre/[0.08] text-encre",
  rouge: "bg-rouge/10 text-rouge-sombre",
  vert: "bg-emerald-600/10 text-emerald-700",
  gris: "bg-plomb/10 text-plomb",
  ambre: "bg-amber-500/15 text-amber-700",
};

export function Statut({ valeur }: { valeur: string }) {
  const teinte =
    {
      NOUVEAU: "ambre",
      NOUVELLE: "ambre",
      ENVOYE: "bleu",
      CONFIRMEE: "bleu",
      EN_PRODUCTION: "bleu",
      PRETE: "vert",
      ACCEPTE: "vert",
      LIVREE: "vert",
      PAYEE: "vert",
      EMISE: "bleu",
      PARTIELLE: "ambre",
      BROUILLON: "gris",
      REFUSE: "rouge",
      ANNULEE: "rouge",
      EXPIRE: "gris",
      OK: "vert",
      MAINTENANCE: "ambre",
      PANNE: "rouge",
      HORS_SERVICE: "gris",
      EN_ATTENTE: "ambre",
      IMPRIME: "vert",
      ERREUR: "rouge",
    }[valeur] ?? "gris";

  const libelle = valeur.charAt(0) + valeur.slice(1).toLowerCase().replace(/_/g, " ");

  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-micro font-medium ${TEINTES[teinte]}`}
    >
      {libelle}
    </span>
  );
}

export function Chiffre({
  label,
  valeur,
  detail,
  accent = "encre",
}: {
  label: string;
  valeur: string;
  detail?: string;
  accent?: "encre" | "rouge" | "plomb";
}) {
  const couleur =
    accent === "rouge" ? "text-rouge" : accent === "plomb" ? "text-plomb-noir" : "text-encre";
  return (
    <div className="plaque p-6">
      <p className="text-micro text-plomb">{label}</p>
      <p className={`mt-2.5 font-display text-3xl leading-none ${couleur}`}>{valeur}</p>
      {detail && <p className="mt-2 text-micro text-plomb-clair">{detail}</p>}
    </div>
  );
}

export function Vide({ texte, lien }: { texte: string; lien?: { href: string; label: string } }) {
  return (
    <div className="rounded-douce border border-dashed border-plomb-noir/[0.12] px-4 py-12 text-center">
      <p className="text-[0.9375rem] text-plomb">{texte}</p>
      {lien && (
        <Link href={lien.href} className="btn-contour btn-petit mt-5">
          {lien.label}
        </Link>
      )}
    </div>
  );
}

// Petite action textuelle (supprimer, relancer) : discrete mais cliquable.
export function LienAction({
  children,
  danger = false,
}: {
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      className={`text-micro font-medium transition-colors ${
        danger ? "text-rouge hover:text-rouge-sombre" : "text-encre hover:text-encre-vif"
      }`}
    >
      {children}
    </button>
  );
}

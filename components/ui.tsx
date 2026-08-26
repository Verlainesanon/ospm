import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "./anim";

// Titre en surimpression : trois calques du meme mot, bleu et rouge decales,
// qui se calent a l'arrivee. Reserve a un ou deux mots par page.
export function Surimpression({
  children,
  className = "",
  survol = false,
}: {
  children: string;
  className?: string;
  survol?: boolean;
}) {
  return (
    <span className={`surimpression ${survol ? "surimpression-hover" : ""} ${className}`}>
      <span aria-hidden className="calque calque-bleu">
        {children}
      </span>
      <span aria-hidden className="calque calque-rouge">
        {children}
      </span>
      <span className="calque-texte">{children}</span>
    </span>
  );
}

export function Repere({ rouge = false, className = "" }: { rouge?: boolean; className?: string }) {
  return <span aria-hidden className={`repere ${rouge ? "repere-rouge" : ""} ${className}`} />;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow flex items-center gap-2.5">
      <Repere rouge className="h-2 w-2" />
      {children}
    </p>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-5 py-24 sm:px-8 md:py-32 ${className}`}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

// En-tete de section : oeil-de-boeuf, titre serif, texte d'appui optionnel.
export function EnteteSection({
  eyebrow,
  titre,
  texte,
  action,
}: {
  eyebrow: string;
  titre: ReactNode;
  texte?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
      <Reveal effet="monte" className="max-w-2xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-5 text-titre">{titre}</h2>
        {texte && <p className="plomb-texte mt-5">{texte}</p>}
      </Reveal>
      {action && (
        <Reveal effet="fondu" delai={220}>
          {action}
        </Reveal>
      )}
    </div>
  );
}

export function Bouton({
  href,
  children,
  variante = "encre",
  type,
  externe = false,
}: {
  href?: string;
  children: ReactNode;
  variante?: "encre" | "rouge" | "contour" | "clair";
  type?: "submit" | "button";
  externe?: boolean;
}) {
  const classe = `btn-${variante}`;

  if (href && externe) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classe}>
        {children}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={classe}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type ?? "button"} className={classe}>
      {children}
    </button>
  );
}

// Encadre "bon de travail" : la fiche papier de l'atelier, en plus soigne.
export function BonDeTravail({
  reference,
  lignes,
}: {
  reference: string;
  lignes: { label: string; valeur: string }[];
}) {
  return (
    <div className="plaque w-full max-w-sm p-7">
      <div className="mb-5 flex items-center justify-between border-b border-plomb-noir/[0.08] pb-4">
        <span className="text-micro font-medium uppercase tracking-[0.08em] text-plomb">
          Bon de travail
        </span>
        <span className="ref text-rouge">{reference}</span>
      </div>
      <dl className="space-y-3.5">
        {lignes.map((l) => (
          <div key={l.label} className="flex items-baseline justify-between gap-5">
            <dt className="text-micro text-plomb">{l.label}</dt>
            <dd className="text-right text-[0.9375rem] font-medium text-plomb-noir">{l.valeur}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

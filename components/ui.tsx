import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "./anim";

// Separation quadri : le meme mot tire quatre fois — une plaque par encre
// process, plus le noir. Les trois plaques arrivent hors repere et se calent.
// C'est la signature du site : un seul mot par page, jamais deux.
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
      <span aria-hidden className="calque calque-cyan">
        {children}
      </span>
      <span aria-hidden className="calque calque-magenta">
        {children}
      </span>
      <span aria-hidden className="calque calque-jaune">
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

export function BonDeTravail({
  reference,
  lignes,
}: {
  reference: string;
  lignes: { label: string; valeur: string }[];
}) {
  return (
    <div className="relative overflow-hidden rounded-plaque border border-or/30 bg-carte p-7 shadow-releve">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-encre via-or to-rouge" />
      <div className="mb-5 flex items-center justify-between border-b border-plomb-noir/[0.08] pb-4">
        <span className="inline-flex items-center gap-1.5 text-micro font-medium uppercase tracking-[0.1em] text-encre">
          <span className="h-1.5 w-1.5 rounded-full bg-or" />
          Fiche d&apos;Atelier Officielle
        </span>
        <span className="ref rounded bg-rouge/10 px-2 py-0.5 font-mono text-rouge font-semibold">{reference}</span>
      </div>
      <dl className="space-y-3.5">
        {lignes.map((l) => (
          <div key={l.label} className="flex items-baseline justify-between gap-5 border-b border-dashed border-plomb-noir/[0.06] pb-2 last:border-b-0">
            <dt className="text-micro text-plomb">{l.label}</dt>
            <dd className="text-right text-[0.9375rem] font-semibold text-plomb-noir">{l.valeur}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex items-center justify-between text-micro text-plomb-clair pt-2">
        <span>Sceau d&apos;Impression OSPM</span>
        <span className="font-mono">✓ 100% Validé</span>
      </div>
    </div>
  );
}

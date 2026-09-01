"use client";

import { useEffect, useMemo, useState } from "react";
import { formatMontant } from "@/lib/money";
import { passerCommande } from "./actions";

export type ArticleBoutique = {
  slug: string;
  nom: string;
  description: string;
  categorie: string;
  prix: number;
  devise: string;
  unite: string;
  image: string | null;
};

const CLE_PANIER = "ospm_panier";

export function Boutique({ articles }: { articles: ArticleBoutique[] }) {
  const [panier, setPanier] = useState<Record<string, number>>({});
  const [charge, setCharge] = useState(false);
  const [erreur, setErreur] = useState("");
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  // Le panier survit a un rafraichissement, mais reste local au navigateur.
  useEffect(() => {
    try {
      const brut = localStorage.getItem(CLE_PANIER);
      if (brut) setPanier(JSON.parse(brut));
    } catch {
      /* stockage indisponible : on repart d'un panier vide */
    }
    setCharge(true);
  }, []);

  useEffect(() => {
    if (!charge) return;
    try {
      localStorage.setItem(CLE_PANIER, JSON.stringify(panier));
    } catch {
      /* rien a faire : le panier reste en memoire */
    }
  }, [panier, charge]);

  const lignes = useMemo(
    () =>
      Object.entries(panier)
        .map(([slug, quantite]) => {
          const a = articles.find((x) => x.slug === slug);
          return a ? { ...a, quantite } : null;
        })
        .filter((l): l is ArticleBoutique & { quantite: number } => l !== null),
    [panier, articles],
  );

  const total = lignes.reduce((s, l) => s + l.prix * l.quantite, 0);
  const devise = lignes[0]?.devise ?? "HTG";

  function ajuster(slug: string, delta: number) {
    setPanier((p) => {
      const q = (p[slug] ?? 0) + delta;
      const suite = { ...p };
      if (q <= 0) delete suite[slug];
      else suite[slug] = q;
      return suite;
    });
  }

  async function envoyer(form: FormData) {
    setErreur("");
    setEnvoi(true);
    const reponse = await passerCommande({
      nomContact: form.get("nomContact"),
      telephone: form.get("telephone"),
      email: form.get("email"),
      adresse: form.get("adresse"),
      notes: form.get("notes"),
      lignes: lignes.map((l) => ({ slug: l.slug, quantite: l.quantite })),
    });
    setEnvoi(false);

    if (!reponse.ok) {
      setErreur(reponse.message);
      return;
    }
    setPanier({});
    setConfirmation(reponse.numero ?? "");
  }

  if (confirmation) {
    return (
      <div className="plaque p-10 text-center">
        <p className="text-micro font-medium text-rouge">Commande {confirmation}</p>
        <h2 className="mt-4 text-titre">
          Commande enregistree
        </h2>
        <p className="mt-3 text-plomb">
          On vous appelle pour confirmer le delai et l'acompte. Gardez le numero{" "}
          {confirmation}.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <div className="grid gap-px overflow-hidden rounded-douce border border-plomb-noir/10 bg-creme-fonce sm:grid-cols-2">
        {articles.map((a) => (
          <article key={a.slug} className="flex flex-col border border-plomb-noir/10 bg-carte p-6">
            <span className="text-micro text-plomb">{a.categorie}</span>
            <h2 className="mt-2 text-sous">
              {a.nom}
            </h2>
            {a.description && <p className="mt-2 text-sm text-plomb">{a.description}</p>}
            <div className="mt-auto flex items-end justify-between gap-4 pt-5">
              <p className="text-[1.0625rem] font-medium text-encre">
                {formatMontant(a.prix, a.devise)}
                <span className="text-micro text-plomb"> / {a.unite}</span>
              </p>
              <button onClick={() => ajuster(a.slug, 1)} className="btn-contour px-4 py-2">
                {panier[a.slug] ? `Ajoute (${panier[a.slug]})` : "Ajouter"}
              </button>
            </div>
          </article>
        ))}
      </div>

      <aside className="plaque p-6 lg:sticky lg:top-28">
        <h2 className="text-sous">
          Votre panier
        </h2>

        {lignes.length === 0 ? (
          <p className="mt-4 text-sm text-plomb">
            Le panier est vide. Ajoutez un article pour commander, ou passez par le devis
            pour un travail sur mesure.
          </p>
        ) : (
          <>
            <ul className="mt-5 divide-y divide-creme-fonce border-y border-plomb-noir/[0.08]">
              {lignes.map((l) => (
                <li key={l.slug} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-plomb-noir">{l.nom}</p>
                    <p className="text-micro text-plomb">
                      {formatMontant(l.prix * l.quantite, l.devise)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => ajuster(l.slug, -1)}
                      aria-label={`Retirer un ${l.nom}`}
                      className="h-8 w-8 rounded-full border border-plomb-noir/[0.12] text-[0.9375rem] transition hover:border-encre hover:text-encre"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-[0.9375rem]">{l.quantite}</span>
                    <button
                      onClick={() => ajuster(l.slug, 1)}
                      aria-label={`Ajouter un ${l.nom}`}
                      className="h-8 w-8 rounded-full border border-plomb-noir/[0.12] text-[0.9375rem] transition hover:border-encre hover:text-encre"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-5 flex items-baseline justify-between border-t border-plomb-noir/[0.08] pt-4">
              <span className="text-micro text-plomb">Total</span>
              <span className="font-display text-2xl text-encre">{formatMontant(total, devise)}</span>
            </p>

            <form action={envoyer} className="mt-6 space-y-4">
              {erreur && (
                <p className="rounded-plaque border border-rouge/30 bg-rouge/5 px-3 py-2 text-sm text-rouge-sombre">
                  {erreur}
                </p>
              )}
              <div>
                <label className="etiquette" htmlFor="nomContact">
                  Nom
                </label>
                <input id="nomContact" name="nomContact" className="champ" required />
              </div>
              <div>
                <label className="etiquette" htmlFor="telephone">
                  Telephone / WhatsApp
                </label>
                <input id="telephone" name="telephone" className="champ" required />
              </div>
              <div>
                <label className="etiquette" htmlFor="email">
                  E-mail (facultatif)
                </label>
                <input id="email" name="email" type="email" className="champ" />
              </div>
              <div>
                <label className="etiquette" htmlFor="notes">
                  Precisions (texte a imprimer, couleurs, date)
                </label>
                <textarea id="notes" name="notes" rows={3} className="champ" />
              </div>
              <button type="submit" disabled={envoi} className="btn-encre w-full disabled:opacity-60">
                {envoi ? "Envoi en cours" : "Envoyer la commande"}
              </button>
              <p className="text-micro text-plomb">
                Paiement au comptoir ou par MonCash a la confirmation.
              </p>
            </form>
          </>
        )}
      </aside>
    </div>
  );
}

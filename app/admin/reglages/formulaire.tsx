"use client";

import { useFormState, useFormStatus } from "react-dom";
import { enregistrerReglages, type EtatReglages } from "./actions";

export type ChampReglage = {
  key: string;
  value: string;
  label: string;
  type: string;
  groupe: string;
};

const TITRES: Record<string, string> = {
  general: "Identite de l'entreprise",
  accueil: "Page d'accueil",
  contact: "Coordonnees",
  reseaux: "Reseaux sociaux",
  finance: "Finance et facturation",
};

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-encre disabled:opacity-60">
      {pending ? "Enregistrement" : "Enregistrer les reglages"}
    </button>
  );
}

export function FormulaireReglages({ champs }: { champs: ChampReglage[] }) {
  const [etat, action] = useFormState(enregistrerReglages, {
    ok: false,
    message: "",
  } as EtatReglages);

  const groupes = Array.from(new Set(champs.map((c) => c.groupe)));

  return (
    <form action={action} className="space-y-8">
      {etat.message && (
        <p className="rounded-plaque border border-encre/30 bg-encre/5 px-4 py-3 text-sm text-encre">
          {etat.message}
        </p>
      )}

      {groupes.map((g) => (
        <section key={g} className="plaque">
          <header className="border-b border-plomb-noir/[0.08] px-5 py-3">
            <h2 className="text-micro text-plomb">{TITRES[g] ?? g}</h2>
          </header>
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            {champs
              .filter((c) => c.groupe === g)
              .map((c) => (
                <div key={c.key} className={c.type === "textarea" ? "sm:col-span-2" : ""}>
                  <label className="etiquette" htmlFor={c.key}>
                    {c.label}
                  </label>
                  {c.type === "textarea" ? (
                    <textarea
                      id={c.key}
                      name={c.key}
                      defaultValue={c.value}
                      rows={3}
                      className="champ"
                    />
                  ) : (
                    <input
                      id={c.key}
                      name={c.key}
                      type={c.type === "number" ? "number" : "text"}
                      step={c.type === "number" ? "any" : undefined}
                      defaultValue={c.value}
                      className="champ"
                    />
                  )}
                  <p className="mt-1 ref/60">{c.key}</p>
                </div>
              ))}
          </div>
        </section>
      ))}

      <Bouton />
    </form>
  );
}

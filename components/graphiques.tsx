import { formatMontant } from "@/lib/money";

// Palette de graphiques validee (separation daltonisme et contraste verifies) :
// bleu vif, rouge OSPM, sarcelle. Assignee dans cet ordre, jamais recyclee.
export const SERIES = {
  encaisse: "#1B5CE0",
  depense: "#D62027",
  benefice: "#0D9488",
} as const;

export type PointMensuel = { mois: string; encaisse: number; depense: number };

function Legende({ entrees }: { entrees: [string, string][] }) {
  return (
    <div className="mb-6 flex flex-wrap gap-6">
      {entrees.map(([label, couleur]) => (
        <span key={label} className="flex items-center gap-2 text-micro text-plomb">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: couleur }} />
          {label}
        </span>
      ))}
    </div>
  );
}

// Barres groupees : deux series de meme unite, un seul axe.
export function BarresMensuelles({
  points,
  devise = "HTG",
}: {
  points: PointMensuel[];
  devise?: string;
}) {
  const maximum = Math.max(...points.flatMap((p) => [p.encaisse, p.depense]), 0);
  const vide = maximum === 0;
  const echelle = Math.max(1, maximum);

  return (
    <figure>
      <Legende
        entrees={[
          ["Encaisse", SERIES.encaisse],
          ["Depense", SERIES.depense],
        ]}
      />

      {vide ? (
        <div className="rounded-douce border border-dashed border-plomb-noir/[0.12] px-4 py-14 text-center">
          <p className="text-[0.9375rem] text-plomb">
            Aucun encaissement ni depense sur les six derniers mois.
          </p>
          <p className="mt-1.5 text-micro text-plomb-clair">
            Le graphique se remplit des le premier paiement enregistre.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex min-w-[32rem] items-end gap-5" style={{ height: 210 }}>
            {points.map((p) => (
              <div key={p.mois} className="flex h-full flex-1 flex-col justify-end">
                <div className="flex h-full items-end justify-center gap-1.5">
                  <div
                    title={`Encaisse ${p.mois} : ${formatMontant(p.encaisse, devise)}`}
                    className="w-full max-w-[2.25rem] rounded-t-[4px] transition-opacity hover:opacity-80"
                    style={{
                      height: `${Math.max(1.5, (p.encaisse / echelle) * 100)}%`,
                      backgroundColor: SERIES.encaisse,
                    }}
                  />
                  <div
                    title={`Depense ${p.mois} : ${formatMontant(p.depense, devise)}`}
                    className="w-full max-w-[2.25rem] rounded-t-[4px] transition-opacity hover:opacity-80"
                    style={{
                      height: `${Math.max(1.5, (p.depense / echelle) * 100)}%`,
                      backgroundColor: SERIES.depense,
                    }}
                  />
                </div>
                <span className="mt-3 block text-center text-micro capitalize text-plomb">
                  {p.mois}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <figcaption className="sr-only">
        Encaissements et depenses par mois, en {devise}.
      </figcaption>

      {/* Vue tableau : lisible sans couleur, et imprimable. */}
      <details className="mt-5">
        <summary className="cursor-pointer text-micro text-plomb transition-colors hover:text-encre">
          Voir les chiffres
        </summary>
        <table className="mt-4 w-full border-collapse text-[0.9375rem]">
          <thead>
            <tr className="border-b border-plomb-noir/10 text-left">
              {["Mois", "Encaisse", "Depense", "Solde"].map((c) => (
                <th key={c} className="px-2 pb-2 text-micro font-medium text-plomb">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-plomb-noir/[0.06]">
            {points.map((p) => (
              <tr key={p.mois}>
                <td className="px-2 py-2 capitalize">{p.mois}</td>
                <td className="px-2 py-2">{formatMontant(p.encaisse, devise)}</td>
                <td className="px-2 py-2">{formatMontant(p.depense, devise)}</td>
                <td className="px-2 py-2">{formatMontant(p.encaisse - p.depense, devise)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

// Barres horizontales pour un classement (services, clients).
export function Classement({
  lignes,
  devise = "HTG",
  couleur = SERIES.encaisse,
}: {
  lignes: { label: string; valeur: number }[];
  devise?: string;
  couleur?: string;
}) {
  const max = Math.max(1, ...lignes.map((l) => l.valeur));

  return (
    <ul className="space-y-4">
      {lignes.map((l) => (
        <li key={l.label}>
          <div className="flex items-baseline justify-between gap-4">
            <span className="truncate text-[0.9375rem] text-plomb-noir">{l.label}</span>
            <span className="text-[0.9375rem] font-medium text-plomb-noir">
              {formatMontant(l.valeur, devise)}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-creme">
            <div
              className="h-2 rounded-full"
              style={{ width: `${(l.valeur / max) * 100}%`, backgroundColor: couleur }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

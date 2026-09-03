"use client";

import Link from "next/link";
import { useEffect } from "react";

// Filet propre a l'administration. Les 22 ecrans interrogent la base sans
// filet individuel : plutot que d'entourer quarante requetes de try/catch —
// illisible, et facile a oublier au prochain ecran ajoute — on rattrape ici.
//
// La difference avec l'ecran d'erreur du site public : ici l'utilisateur est
// un collegue au comptoir, pas un client. Il a besoin de savoir quoi faire,
// et de garder la main sur le reste de l'outil.
export default function ErreurAdmin({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erreur ecran admin:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-full max-w-lg border border-plomb-noir/15 bg-carte p-8">
        <p className="font-mono text-micro uppercase tracking-[0.18em] text-rouge">
          Écran indisponible
        </p>

        <h1 className="mt-4 text-sous">Les données ne se chargent pas</h1>

        <p className="mt-4 text-[0.9375rem] leading-relaxed text-plomb">
          La base de données n&apos;a pas répondu. Le reste de l&apos;administration
          reste accessible : cet écran seul est touché.
        </p>

        {error.digest && (
          <p className="mt-4 font-mono text-micro text-plomb-clair">
            Référence : {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn-encre">
            Réessayer
          </button>
          <Link href="/admin" className="btn-contour">
            Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}

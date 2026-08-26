'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erreur serveur Next.js:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-[#f7f5f0] text-[#1b1c1e]">
      <div className="max-w-md rounded-2xl bg-white p-8 shadow-lg border border-black/5">
        <h2 className="text-2xl font-bold text-[#dc2626] mb-3">Une erreur est survenue</h2>
        <p className="text-sm text-[#475569] mb-6">
          L&apos;application initialise ses services ou tente de se connecter à la base de données.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="rounded-full bg-[#111827] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-black"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="rounded-full border border-black/10 px-6 py-2.5 text-sm font-medium text-[#111827] transition hover:bg-black/5"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

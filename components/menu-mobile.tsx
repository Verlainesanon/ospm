"use client";

import Link from "next/link";
import { useState } from "react";

export function MenuMobile({
  liens,
  whatsapp,
}: {
  liens: { href: string; label: string }[];
  whatsapp: string;
}) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOuvert(!ouvert)}
        className="btn-contour btn-petit"
        aria-expanded={ouvert}
        aria-controls="menu-mobile"
      >
        {ouvert ? "Fermer" : "Menu"}
      </button>

      {ouvert && (
        <div
          id="menu-mobile"
          className="absolute inset-x-0 top-full border-b border-plomb-noir/[0.08] bg-creme px-5 pb-7 pt-3 shadow-releve"
        >
          <nav className="flex flex-col">
            {liens.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOuvert(false)}
                className="border-b border-plomb-noir/[0.08] py-4 text-lg text-plomb-noir"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/devis" onClick={() => setOuvert(false)} className="btn-encre">
                Demander un devis
              </Link>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="btn-contour"
              >
                Ecrire sur WhatsApp
              </a>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

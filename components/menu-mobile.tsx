"use client";

import Link from "next/link";
import { useState } from "react";
import {
  IconeWhatsApp,
  IconeDevis,
  IconeServices,
  IconeGalerie,
  IconeBoutique,
  IconeContact,
} from "./icones";

// Le gabarit ne transmet qu'une cle : le trace est resolu ici, cote client.
const ICONES = {
  services: IconeServices,
  galerie: IconeGalerie,
  boutique: IconeBoutique,
  contact: IconeContact,
};

export function MenuMobile({
  liens,
  whatsapp,
}: {
  liens: { href: string; label: string; icone: keyof typeof ICONES }[];
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
            {liens.map((l) => {
              const Icone = ICONES[l.icone];
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOuvert(false)}
                  className="flex items-center gap-3.5 border-b border-plomb-noir/[0.08] py-4 text-lg text-plomb-noir"
                >
                  <Icone taille={20} className="text-encre" />
                  {l.label}
                </Link>
              );
            })}
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/devis" onClick={() => setOuvert(false)} className="btn-encre">
                <IconeDevis taille={17} />
                Demander un devis
              </Link>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp"
              >
                <IconeWhatsApp taille={17} />
                Écrire sur WhatsApp
              </a>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

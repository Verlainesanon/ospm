import type { Metadata } from "next";
import { Lilita_One, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Trois voix, tirees des deux references retenues :
//
//  - Lilita One porte les titres : display epaisse et arrondie, beaucoup de
//    caractere. Les grotesques neutres essayees avant (Inter Tight, Bricolage)
//    ne disaient rien — c'est cette epaisseur-la qui manquait.
//  - IBM Plex Sans tient le texte courant : lisible et chaleureuse, elle ne
//    rivalise pas avec les titres.
//  - JetBrains Mono est la voix technique de l'atelier — libelles, numeros de
//    bon, references, adresses. Elle passe au premier plan plutot que de rester
//    cantonnee aux details.
//
// latin-ext est indispensable : sans lui, les accents francais (é, à, ô)
// tombent en police de secours.
const display = Lilita_One({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Official Services Printing and More - Petit-Goave",
    template: "%s - OSPM",
  },
  description:
    "Informatique, graphic design, impression, serigraphie, photographie et papeterie a Petit-Goave. 60, Rue Dessalines.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        {/* Sombre par defaut : une galerie sombre qui s'ouvre en blanc casse sa
            promesse des la premiere seconde. Le clair reste un choix explicite,
            applique avant le premier rendu pour eviter tout flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('ospm-theme')!=='light')document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

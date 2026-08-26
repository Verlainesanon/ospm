import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SETTINGS = [
  ["site.nom", "Official Services Printing and More", "general", "Nom de l'entreprise", "text"],
  ["site.sigle", "OSPM", "general", "Sigle", "text"],
  [
    "site.slogan",
    "Le leader de la bonne conception et de la bonne impression",
    "general",
    "Slogan",
    "text",
  ],
  [
    "site.baseline",
    "Votre satisfaction, notre priorite",
    "general",
    "Signature de bas de page",
    "text",
  ],
  [
    "hero.titre",
    "Besoin de services professionnels... et de qualite ?",
    "accueil",
    "Titre du hero",
    "text",
  ],
  [
    "hero.texte",
    "En informatique, en conception, en impression, en photographie et en serigraphie, vous avez un seul choix : Official Services Printing and More !",
    "accueil",
    "Texte du hero",
    "textarea",
  ],
  ["hero.cta", "Demander un devis", "accueil", "Bouton principal", "text"],
  ["contact.adresse", "60, Rue Dessalines, Petit-Goave, Haiti", "contact", "Adresse", "text"],
  ["contact.whatsapp1", "+509 42-71-28-91", "contact", "WhatsApp 1", "text"],
  ["contact.whatsapp2", "+509 34-08-44-43", "contact", "WhatsApp 2", "text"],
  ["contact.email", "company.ospm@gmail.com", "contact", "E-mail", "text"],
  ["contact.horaires", "Lundi - Samedi : 8h00 - 17h00", "contact", "Horaires", "text"],
  ["social.facebook", "https://facebook.com/company.ospm", "reseaux", "Facebook", "text"],
  ["social.instagram", "https://instagram.com/company.ospm", "reseaux", "Instagram", "text"],
  ["social.tiktok", "https://tiktok.com/@company.ospm", "reseaux", "TikTok", "text"],
  ["social.twitter", "https://x.com/company.ospm", "reseaux", "Twitter / X", "text"],
  ["finance.devise", "HTG", "finance", "Devise par defaut", "text"],
  ["finance.tauxUsd", "132", "finance", "Taux : 1 USD en HTG", "number"],
  ["finance.taxe", "0", "finance", "Taxe appliquee (%)", "number"],
  ["finance.mentionFacture", "Merci de votre confiance.", "finance", "Mention sur facture", "textarea"],
] as const;

const CATEGORIES = [
  {
    slug: "informatique",
    nom: "Informatique",
    icone: "laptop",
    couleur: "bleu",
    description:
      "Bases de donnees clients, reseaux, maintenance et securite pour votre entreprise.",
    services: [
      ["bases-de-donnees-clients", "Creation de bases de donnees clients", true],
      ["installation-reseaux", "Installation et configuration de reseaux", true],
      ["maintenance-informatique", "Maintenance informatique", true],
      ["securite-systemes", "Securite et protection des systemes", true],
    ],
  },
  {
    slug: "graphic-design-impression",
    nom: "Graphic Design & Impression",
    icone: "palette",
    couleur: "rouge",
    description: "Conception graphique et impression grand format, du badge a la vitrine.",
    services: [
      ["badge-simple", "Badge simple", false],
      ["badge-lamine", "Badge lamine", false],
      ["badge-hologramme", "Badge avec hologramme", false],
      ["flyers", "Flyers", false],
      ["bannieres", "Bannieres", true],
      ["habillage-vitrines", "Habillage de vitrines", true],
    ],
  },
  {
    slug: "serigraphie",
    nom: "Serigraphie",
    icone: "shirt",
    couleur: "bleu",
    description: "Maillots, kepis, tasses et plaques d'honneur personnalises.",
    services: [
      ["maillots", "Maillots personnalises", false],
      ["kepis", "Kepis", false],
      ["tasses", "Tasses personnalisees", false],
      ["plaques-honneur", "Plaques d'honneur", false],
    ],
  },
  {
    slug: "photographie",
    nom: "Photographie",
    icone: "camera",
    couleur: "rouge",
    description: "Toutes occasions, identite, shooting, albums et tirages sur supports.",
    services: [
      ["photos-occasions", "Photos pour toutes occasions", true],
      ["photos-identite", "Photos d'identite", false],
      ["photo-shoot", "Photo Shoot", true],
      ["photos-pvc", "Photos sur PVC", false],
      ["photos-plaques-metalliques", "Photos sur plaques metalliques", false],
      ["albums-souvenirs", "Albums de souvenirs", true],
      ["albums-graduation", "Albums de graduation", true],
    ],
  },
  {
    slug: "papeterie",
    nom: "Papeterie",
    icone: "folder",
    couleur: "creme",
    description:
      "Services de papeterie pour particuliers, entreprises, ecoles et institutions.",
    services: [
      ["fournitures-scolaires", "Fournitures scolaires et de bureau", false],
      ["reliure-plastification", "Reliure et plastification", false],
      ["photocopie-scan", "Photocopie et numerisation", false],
      ["saisie-documents", "Saisie et mise en page de documents", false],
    ],
  },
];

const TEMPLATE_FACTURE = `<div class="doc">
  <header>
    <div>
      <img src="{{logo}}" alt="" class="logo" />
      <h1>{{entreprise}}</h1>
      <p>{{adresse}}</p>
      <p>{{telephone}} - {{email}}</p>
    </div>
    <div class="meta">
      <h2>{{type}} {{numero}}</h2>
      <p>Date : {{date}}</p>
      <p>Client : {{client}}</p>
    </div>
  </header>
  <table>
    <thead><tr><th>Designation</th><th>Qte</th><th>P.U.</th><th>Montant</th></tr></thead>
    <tbody>{{lignes}}</tbody>
  </table>
  <div class="totaux">
    <p>Sous-total : {{sousTotal}}</p>
    <p>Remise : {{remise}}</p>
    <p class="grand">Total : {{total}}</p>
  </div>
  <footer><p>{{mention}}</p></footer>
</div>`;

const TEMPLATE_RECU = `<div class="recu">
  <img src="{{logo}}" alt="" class="logo" />
  <h1>{{entreprise}}</h1>
  <p>{{adresse}}</p>
  <hr />
  <p>RECU {{numero}}</p>
  <p>{{date}}</p>
  <p>Client : {{client}}</p>
  <hr />
  {{lignes}}
  <hr />
  <p class="grand">TOTAL {{total}}</p>
  <p>Paye par {{methode}}</p>
  <p>Merci !</p>
</div>`;

const TEMPLATE_BADGE = `<div class="badge">
  <img src="{{photo}}" alt="" class="photo" />
  <h1>{{nom}}</h1>
  <p class="fonction">{{fonction}}</p>
  <p class="org">{{organisation}}</p>
  <p class="id">{{identifiant}}</p>
</div>`;

async function main() {
  // --- Utilisateurs
  const users = [
    ["admin@ospm.ht", "Administrateur OSPM", "ADMIN", "admin123"],
    ["gestion@ospm.ht", "Gestionnaire", "GESTIONNAIRE", "gestion123"],
    ["caisse@ospm.ht", "Caissier", "CAISSIER", "caisse123"],
  ];
  for (const [email, nom, role, motDePasse] of users) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, nom, role, password: bcrypt.hashSync(motDePasse, 10) },
    });
  }

  // --- Parametres du site
  for (const [key, value, groupe, label, type] of SETTINGS) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { label, groupe, type },
      create: { key, value, groupe, label, type },
    });
  }

  // --- Services
  let ordreCat = 0;
  for (const cat of CATEGORIES) {
    const categorie = await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: { nom: cat.nom, icone: cat.icone, description: cat.description, couleur: cat.couleur },
      create: {
        slug: cat.slug,
        nom: cat.nom,
        icone: cat.icone,
        description: cat.description,
        couleur: cat.couleur,
        ordre: ordreCat++,
      },
    });
    let ordre = 0;
    for (const [slug, nom, surDevis] of cat.services) {
      await prisma.service.upsert({
        where: { slug: slug as string },
        update: { nom: nom as string, categorieId: categorie.id },
        create: {
          slug: slug as string,
          nom: nom as string,
          surDevis: surDevis as boolean,
          categorieId: categorie.id,
          ordre: ordre++,
        },
      });
    }
  }

  // --- Tarifs de depart pour les travaux a prix fixe (modifiables dans l'admin)
  const TARIFS = [
    ["photos-identite", 250, "jeu de 4", true],
    ["badge-simple", 350, "unite", true],
    ["badge-lamine", 500, "unite", true],
    ["badge-hologramme", 750, "unite", true],
    ["flyers", 35, "unite", true],
    ["tasses", 900, "unite", true],
    ["maillots", 1250, "unite", true],
    ["kepis", 850, "unite", true],
    ["photocopie-scan", 15, "page", true],
    ["reliure-plastification", 200, "document", true],
  ] as const;
  for (const [slug, prixBase, unite, vendableEnLigne] of TARIFS) {
    await prisma.service.updateMany({
      where: { slug },
      data: { prixBase, unite, vendableEnLigne, surDevis: false },
    });
  }

  // --- Pages editoriales
  const pages = [
    ["a-propos", "A propos", "Official Services Printing and More est un atelier de conception, d'impression et de photographie base a Petit-Goave."],
    ["mentions-legales", "Mentions legales", "Contenu a completer depuis l'administration."],
  ];
  for (const [slug, titre, contenu] of pages) {
    await prisma.page.upsert({
      where: { slug },
      update: {},
      create: { slug, titre, contenu },
    });
  }

  // --- Categories de depenses
  for (const [nom, couleur] of [
    ["Fournitures", "#1d4ed8"],
    ["Encre et consommables", "#dc2626"],
    ["Electricite / carburant", "#b45309"],
    ["Salaires", "#0f766e"],
    ["Loyer", "#6d28d9"],
    ["Transport", "#475569"],
    ["Maintenance materiel", "#be123c"],
  ]) {
    await prisma.expenseCategory.upsert({
      where: { nom },
      update: { couleur },
      create: { nom, couleur },
    });
  }

  // --- Gabarits d'impression
  const templates = [
    ["facture-a4", "Facture A4", "FACTURE", 210, 297, TEMPLATE_FACTURE],
    ["recu-80mm", "Recu thermique 80mm", "RECU", 80, 200, TEMPLATE_RECU],
    ["badge-standard", "Badge standard 54x86", "BADGE", 54, 86, TEMPLATE_BADGE],
  ] as const;
  for (const [cle, nom, type, largeurMm, hauteurMm, html] of templates) {
    await prisma.printTemplate.upsert({
      where: { cle },
      update: {},
      create: { cle, nom, type, largeurMm, hauteurMm, html },
    });
  }

  // --- Materiel de depart
  const imprimante = await prisma.equipment.findFirst({ where: { nom: "Imprimante comptoir" } });
  if (!imprimante) {
    const eq = await prisma.equipment.create({
      data: {
        nom: "Imprimante comptoir",
        type: "IMPRIMANTE",
        marque: "A renseigner",
        emplacement: "Comptoir",
      },
    });
    await prisma.printer.create({
      data: { nom: "Comptoir (navigateur)", equipmentId: eq.id, transport: "BROWSER", parDefaut: true },
    });
    await prisma.printer.create({
      data: { nom: "Ticket 80mm (agent local)", transport: "ESCPOS", cible: "USB", largeurMm: 80 },
    });
  }

  // --- Stock de depart
  const stock = [
    ["PAP-A4", "Papier A4 (rame)", "fourniture", "rame", 20, 5, 450],
    ["ENC-NOIR", "Cartouche encre noire", "consommable", "unite", 4, 2, 2500],
    ["PVC-BADGE", "Carte PVC vierge", "fourniture", "unite", 200, 50, 45],
    ["TSH-BLANC", "T-shirt blanc", "fourniture", "unite", 60, 15, 350],
  ] as const;
  for (const [reference, nom, categorie, unite, quantite, seuilAlerte, prixAchat] of stock) {
    await prisma.stockItem.upsert({
      where: { reference },
      update: {},
      create: { reference, nom, categorie, unite, quantite, seuilAlerte, prixAchat },
    });
  }

  console.log("Seed OSPM termine.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

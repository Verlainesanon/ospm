# CV de Projet — OSPM (Official Services Printing and More)

**Date** : 23 août 2026
**Répertoire** : `C:\Users\User\Documents\Glip\Site Marie Flore`

## Objectif initial

Créer un site web ultra stylisé pour Official Services Printing and More (Petit-Goâve, Haïti) — informatique, graphic design, impression, sérigraphie, photographie, papeterie — accompagné d'un back-office complet permettant de piloter le site de A à Z, de gérer la finance et le stock, et de connecter des imprimantes. Palette imposée : bleu, rouge, blanc, crème.

## Skills et outils utilisés

| Ordre | Skill / outil | Rôle dans le projet |
|-------|---------------|----------------------|
| 1 | outils standards | Fondations Next.js 14 + Prisma + PostgreSQL, schéma de 30 modèles, seed |
| 2 | `frontend-design` | Direction visuelle « Hors repère », design system, site public |
| 3 | outils standards | Authentification, CMS, commandes, devis, finance, stock, matériel, impression |
| 4 | `dataviz` | Palette de graphiques validée par script, tableau de bord et rapports |
| 5 | outils standards | Tests vitest, build de production, configuration Render, documentation |

## Résultats par étape

### Étape 1 — Fondations
Next.js 14 (App Router), Prisma, Tailwind, vitest. Schéma de **30 modèles** couvrant utilisateurs et rôles, contenu du site, services, devis, commandes, factures, paiements, caisse, dépenses, stock, fournisseurs, matériel, maintenances, imprimantes, gabarits d'impression, file d'attente, journal d'audit et compteurs de numérotation.

Aucun PostgreSQL n'était installé sur la machine : un conteneur Docker `ospm-postgres` (postgres:16, volume persistant) a été monté, la base créée et remplie par le seed (3 comptes, 5 ateliers × 21 services repris du flyer, 20 réglages, 7 postes de dépense, 3 gabarits, 4 articles de stock, tarifs de départ).

### Étape 2 — Design system « Hors repère »
Le bleu et le rouge ne sont pas juxtaposés : ils se **surimpriment en décalé**, comme une sérigraphie mal calée, puis se recalent à l'arrivée sur la page. Les croix de repérage de l'imprimeur servent de séparateurs structurels. Le crème est traité comme du papier, pas comme un fond éditorial générique.

Typographies : **Bricolage Grotesque** (titres), **Instrument Sans** (texte), **Space Mono** (numéros de bon, prix, références — la langue de l'atelier). Tokens Tailwind nommés en vocabulaire d'atelier : `encre`, `rouge`, `creme`, `plomb`.

### Étape 3 — Site public
Accueil (hero en surimpression + fiche « bon de travail », grille des cinq ateliers, séquence de production en quatre étapes, galerie, appel à l'action), pages Services et détail par atelier, Réalisations, Boutique avec panier persistant, Devis avec upload de fichiers (5 fichiers, 10 Mo, types filtrés), Contact, pages éditoriales `/p/{slug}`. Responsive, focus clavier visible, `prefers-reduced-motion` respecté.

### Étape 4 — Authentification et CMS
Session JWT en cookie httpOnly, mots de passe bcrypt, **quatre rôles** (ADMIN, GESTIONNAIRE, CAISSIER, TECHNICIEN) avec une carte de permissions par zone appliquée à la fois sur la navigation et sur chaque action serveur. Éditables depuis l'admin : réglages du site (coordonnées, réseaux, textes d'accueil, taux de change), pages, galerie, ateliers, services, prix, utilisateurs.

### Étape 5 — Devis et commandes
Devis reçus du site, lignes modifiables, statuts, conversion en commande en un clic. Commandes avec workflow NOUVELLE → CONFIRMEE → EN_PRODUCTION → PRETE → LIVREE, historique horodaté, priorité, assignation, date de livraison, remise, notes d'atelier, bon de travail imprimable A5.

### Étape 6 — Finance
Factures / proformas / reçus numérotés par année (`FAC-2026-0001`), HTG et USD, remise et taxe, statut suivi automatiquement (émise / partielle / payée). **Chaque paiement crée une entrée de caisse**, chaque dépense en espèces une sortie — une seule saisie, deux effets. Sessions de caisse avec fond d'ouverture et solde de clôture calculé. Dépenses par poste avec répartition visuelle. Stock avec seuil d'alerte et mouvements tracés (entrée / sortie / ajustement).

### Étape 7 — Matériel et imprimantes
Parc d'équipements (imprimantes, presses, appareils photo…) avec état, emplacement, garantie, interventions de maintenance datées et coût, prochaine échéance, et consommables rattachés aux articles de stock — l'encre d'une imprimante donnée est visible depuis sa fiche.

### Étape 8 — Tableau de bord et rapports
Palette de graphiques **validée par le script du skill dataviz** (`#1B5CE0`, `#D62027`, `#0D9488` — séparation daltonisme et contraste OK en clair comme en sombre). Tableau de bord : encaissé et dépensé du jour, reste à encaisser, travail en cours, alertes de stock, six derniers mois en barres groupées. Rapports par période : encaissements, dépenses, solde, services les plus vendus, meilleurs clients, méthodes de paiement, postes de dépense. Chaque graphique a sa vue tableau dépliable.

### Étape 9 — Impression
Deux chemins :
1. **Navigateur** — gabarits rendus puis dialogue d'impression automatique (facture A4, bon de travail A5, reçu, badge). Fonctionne avec n'importe quelle imprimante installée.
2. **Agent local ESC/POS** — les tickets partent dans une file, un agent Node tournant sur le PC de la boutique interroge `/api/impression` toutes les 5 secondes et imprime en réseau (`IP:9100`) ou via la file Windows. Authentification par jeton partagé ; statut et erreurs remontent dans l'admin, avec relance possible.

Les gabarits sont éditables dans l'admin (HTML + placeholders `{{numero}}`, `{{client}}`, `{{lignes}}`, `{{total}}`…), les valeurs client échappées.

### Étape 10 — Tests et déploiement
20 tests vitest verts (monnaie, totaux, conversion, rendu et échappement des gabarits, ticket, permissions par rôle). `npm run build` passe. `render.yaml` déclare le service web et la base Postgres. README complet.

## Fichiers produits

- `prisma/schema.prisma` — 30 modèles
- `prisma/seed.ts` — comptes, services, réglages, gabarits, stock
- `app/(site)/` — site public (accueil, services, galerie, boutique, devis, contact, pages)
- `app/admin/` — back-office (18 écrans) et actions serveur
- `app/api/impression/route.ts` — API de l'agent
- `agent/agent-impression.mjs` — agent d'impression thermique
- `lib/` — `db`, `auth`, `money`, `numbering`, `settings`, `upload`, `print`, `rapports`
- `components/` — `ui`, `admin`, `graphiques`, `menu-mobile`
- `tests/` — 3 fichiers, 20 tests
- `README.md`, `render.yaml`, `.env.example`, `CLAUDE.md`, `HOMIE-MEMOIRE.md`

## Point de vigilance

La base tourne dans Docker. **Si Docker Desktop n'est pas démarré, toutes les pages qui lisent la base renvoient 500.** Séquence de reprise :

```bash
docker start ospm-postgres
npm run dev
```

## Prochaines étapes recommandées

1. **Changer les trois mots de passe du seed** avant toute mise en ligne (`/admin/utilisateurs`).
2. **Intégrer le logo** `Logo.jpeg` dans l'en-tête, le pied de page et les gabarits d'impression.
3. **Remplir la galerie** avec de vraies photos d'atelier — c'est ce qui vend le mieux ce métier.
4. **Ajuster les tarifs** de la boutique dans `/admin/services` : ceux du seed sont des ordres de grandeur, pas vos prix.
5. **Déployer sur Render** puis relancer `npm run db:push && npm run db:seed` sur la base distante.
6. **Tester l'agent d'impression** avec l'imprimante thermique réelle de la boutique et noter sa cible exacte dans `/admin/impression`.
7. Optionnel : sauvegarde automatique de la base (`pg_dump` planifié) — un atelier qui facture ne peut pas perdre ses données.

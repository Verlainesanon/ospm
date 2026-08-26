# CV de Projet — OSPM · Refonte UI/UX

**Date** : 23 août 2026
**Répertoire** : `C:\Users\User\Documents\Glip\Site Marie Flore`

## Objectif initial

Le site OSPM était fonctionnel mais jugé **médiocre et archaïque** : vide, pas assez coloré, pas assez « wow », et un admin pénible à utiliser. Objectif : une direction **épurée et chic mais riche**, où la richesse vient des images et de la typographie plutôt que de l'empilement d'éléments — palette bleu / rouge / blanc / crème conservée.

## Skills et outils utilisés

| Ordre | Skill / outil | Rôle dans le projet |
|-------|---------------|----------------------|
| 1 | `frontend-design` | Diagnostic de l'effet « archaïque », nouveau socle visuel, refonte du site public et de l'admin |
| 2 | `ai-skills:imagen` | Visuels d'atelier — **non exécutable** (pas de clé ni de compte Gemini) ; remplacé par des compositions SVG |
| 3 | `example-skills:webapp-testing` | Captures Playwright sur 20 écrans, détection de défauts réels, contrôle du débordement horizontal |
| 4 | outils standards | Génération des visuels, corrections en masse, build, tests |

## Résultats par étape

### Étape 1 — Socle visuel
Diagnostic en quatre points de ce qui datait le site : Space Mono en majuscules partout, radius 2px universel, aucune profondeur, échelle typographique trop timide.

Nouveau socle : **Instrument Serif** (titres, éditorial), **Inter Tight** (texte), **JetBrains Mono** réduit aux seules références techniques. Radius 10–14px, boutons en pilules, ombres à deux couches (contact net + diffusion large), titres jusqu'à 7rem, animations d'entrée respectant `prefers-reduced-motion`. La signature « hors repère » (surimpression bleu/rouge décalée) est conservée mais réservée à un ou deux mots par page.

### Étape 2 — Visuels : compositions vectorielles
`GEMINI_API_KEY` absente, et l'utilisateur n'a pas de compte Gemini : les visuels IA sont écartés définitivement, pas reportés. Solution retenue : six compositions vectorielles aux couleurs de marque (badges, sérigraphie, impression grand format, studio photo, réseau informatique, papeterie), générées par `scripts/visuels.mjs`. Ce ne sont pas de fausses photos — rien ne prétend être une réalisation réelle.

### Étape 3 — Site public
Hero éditorial : titre serif, mot en surimpression, mosaïque de visuels superposés, trois chiffres clés. Cartes d'ateliers illustrées avec zoom au survol, sections alternées, page Services en rythme image/texte inversé, galerie qui affiche les compositions tant qu'aucune photo n'est publiée, en-tête translucide et pied de page repensé.

### Étape 4 — Admin
Cartes à ombre douce sur fond crème, tableaux aérés, statuts en pastilles capitalisées (fini `EN_PRODUCTION` en capitales), boutons pilules, formulaires respirables. **Les six pages à formulaires ont été entièrement refaites** — Stock, Clients, Utilisateurs, Services & prix, Matériel, Impression : les formulaires empilés dans des cellules de tableau, où les en-têtes ne correspondaient plus aux champs, sont devenus des fiches avec intitulés explicites.

Détails par page : Services affiche chaque atelier avec sa fiche puis ses services en cartes dépliées et un ajout rapide en bas ; Matériel sépare la fiche d'équipement, les consommables rattachés au stock (avec alerte de seuil visible) et le journal d'interventions ; Impression regroupe imprimantes en fiches, file d'attente en tableau, gabarits en accordéons avec la liste des champs disponibles en pastilles cliquables du regard.

### Étape 5 — Vérification visuelle
Captures Playwright sur 7 pages publiques (desktop + mobile) et 13 pages admin, avec connexion automatique. Quatre défauts réels trouvés :

1. **CSS entièrement cassé** — Tailwind 3 rejette les opacités hors échelle (`/6`, `/8`, `/12`) ; 25 fichiers corrigés en syntaxe crochets. Sans les captures, le site partait sans styles.
2. **Stock illisible** — colonnes désalignées des champs, nom écrasé dans une boîte de 40px.
3. **Graphique** — légende en mono capitale et barres réduites à des traits quand tout est à zéro ; état vide explicite ajouté.
4. **Sélecteur écrasé** sur Matériel — le menu « Type d'intervention » affichait « Preven… » dans une colonne de 110px ; formulaire réorganisé.

Aucun débordement horizontal sur aucun des 20 écrans, desktop comme mobile ; les 13 pages admin répondent en 200. Build de production OK, 20 tests vitest verts.

## Fichiers produits ou refaits

- `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx` — le socle visuel
- `components/ui.tsx`, `components/admin.tsx`, `components/graphiques.tsx`, `components/logo.tsx`, `components/menu-mobile.tsx`
- `app/(site)/` — accueil, services, atelier, galerie, layout
- `app/admin/stock`, `clients`, `utilisateurs`, `services`, `materiel`, `impression` — refaits en fiches
- `scripts/visuels.mjs` + `public/visuels/*.svg` — les six compositions
- `lib/visuels.ts` — association atelier → visuel

## Prochaines étapes recommandées

1. **Photographier l'atelier** — badges, t-shirts sérigraphiés, bannières, comptoir. C'est ce qui fera passer le site de « joli » à « crédible », plus que n'importe quel réglage CSS.
2. **Changer les mots de passe du seed** avant mise en ligne — toujours en attente depuis le premier projet.
3. Vérifier les rendus d'impression (facture, bon de travail) avec la nouvelle typographie sur une vraie imprimante.

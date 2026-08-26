# CV de Projet — OSPM · Premium & animations

**Date** : 24 août 2026
**Répertoire** : `C:\Users\User\Documents\Glip\Site Marie Flore`

## Objectif initial

Le site était propre mais **statique** : rien ne bougeait au défilement, aucune transition entre les pages, deux animations en tout. Objectif : un rendu **premium clair et raffiné** (le crème reste), avec une chorégraphie d'animations poussée au-delà du « spectaculaire », et les pages qui se chargent avec le **loader 3×3 fourni par l'utilisateur**. Périmètre : tout le site public, accent sur l'accueil, plus l'administration.

## Skills et outils utilisés

| Ordre | Skill / outil | Rôle dans le projet |
|-------|---------------|----------------------|
| 1 | `frontend-design` | Socle d'animation, chorégraphie de l'accueil et des pages publiques |
| 2 | `example-skills:webapp-testing` | Playwright : détection de trois bugs réels, mesures CLS / fluidité / mode animations réduites |
| 3 | outils standards | `loading.tsx`, transitions admin, optimisations, build, tests |

## Résultats par étape

### Étape 1 — Socle d'animation
Six effets de révélation (montée, fondu, volet, deux latéraux, échelle), titre composé lettre par lettre, parallaxe au défilement, boutons magnétiques, compteurs animés, filet lumineux au survol, soulignement qui se trace. **Zéro librairie ajoutée** : CSS natif et quelques composants clients dans `components/anim.tsx`. Tout est neutralisé si l'appareil demande « animations réduites ».

### Étape 2 — Chargement de page avec le loader fourni
La grille 3×3 sert désormais à trois moments : voile d'ouverture (une seule fois par session, via `sessionStorage`), transition entre pages du site (`app/(site)/loading.tsx`), transition dans l'administration (`app/admin/loading.tsx`).

### Étape 3 — Accueil premium
Titre « L'atelier qui imprime votre image » composé lettre par lettre en cascade, visuel principal révélé par volet avec parallaxe, vignette et pastille qui arrivent en décalé, halo bleu qui respire, chiffres clés qui montent de 0 à leur valeur, boutons qui suivent le curseur, flèches qui glissent au survol des cartes.

### Étape 4 — Reste du site public
Services (ateliers en alternance gauche/droite, cartes en cascade), page atelier (titre composé, visuel en parallaxe), galerie (révélation par volet en cascade), boutique, devis, contact, pages libres. Les en-têtes de section se révèlent avant leur contenu, jamais l'inverse.

### Étape 5 — Administration
Chaque écran entre d'un souffle, les cartes se relèvent au survol, les lignes de tableau se surlignent progressivement, le libellé d'un champ prend la couleur d'encre quand on y écrit, et **45 boutons de soumission** affichent la grille animée pendant que l'action serveur travaille.

### Étape 6 — Vérification
Trois bugs réels trouvés par les captures, pas par la lecture du code :

1. **Le hero ne s'affichait jamais.** Un élément entièrement masqué par `clip-path` n'intersecte plus l'écran aux yeux de Chrome : l'`IntersectionObserver` ne se déclenchait pas, donc l'image restait invisible pour toujours. Le masquage porte désormais sur l'enfant, pas sur l'élément observé.
2. **Mots coupés en fin de ligne** (« L'atelier qu / i imprime ») : chaque lettre étant un bloc, la ligne se cassait au milieu des mots. Les lettres sont maintenant regroupées par mot insécable.
3. **Éléments dépassés restés invisibles** : un contenu franchi trop vite (lien d'ancre, retour arrière, restauration de position) ne se révélait jamais. Rattrapage ajouté.

Mesures finales : révélations **29/29** sur l'accueil et **37/37** sur services, **zéro** erreur JavaScript, **zéro** débordement horizontal, décalage cumulé de mise en page **0,0001** (seuil de qualité 0,1), **zéro** élément invisible en mode animations réduites. Build de production et 20 tests verts.

**Optimisations appliquées** : parallaxe sans lecture de mise en page pendant le défilement (elle provoquait un recalcul à chaque image), désactivée sous 1024 px ; halo animé en opacité seule au lieu d'un redimensionnement de grand dégradé ; flou d'arrière-plan de l'en-tête allégé ; `will-change` relâché après révélation ; volet passé de `clip-path` à une translation composée par le GPU.

## Incident : disque plein

Le build a cassé sur `ENOSPC: no space left on device` — **0 Go libre** sur C:. Débloqué par `npm cache clean --force` (3,7 Go récupérés, cache entièrement reconstructible). À surveiller : `Docker WSL` ≈ 4,3 Go et `Temp` ≈ 3,2 Go.

## Fichiers produits ou modifiés

- `components/anim.tsx` — Reveal, Lettres, Parallaxe, Magnetique, Compteur
- `components/ecran-chargement.tsx` — voile d'ouverture
- `app/(site)/loading.tsx`, `app/admin/loading.tsx` — transitions entre pages
- `app/globals.css` — socle d'animation, effets de survol, transitions admin
- `app/(site)/` — accueil, services, atelier, galerie, boutique, devis, contact, pages libres
- 16 pages d'administration — boutons à état de chargement

## Prochaines étapes recommandées

1. **Juger la fluidité sur ta machine, pas sur mes mesures** : mon navigateur de test tourne sans carte graphique et donnait de 24 à 35 images/s sur une configuration identique — c'est trop instable pour conclure. Si le défilement accroche chez toi, dis-le-moi : les premiers leviers sont la parallaxe du hero et le halo.
2. **Faire de la place sur le disque** — il est reparti de zéro, 3,7 Go ne tiendront pas longtemps.
3. **Changer les mots de passe du seed** avant mise en ligne (toujours en attente depuis le premier projet).
4. **Photographier l'atelier** : les animations mettent en valeur des images — de vraies photos les serviraient mieux que les compositions actuelles.

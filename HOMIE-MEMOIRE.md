# Mémoire Homie — OSPM · Premium & animations
**Dernière mise à jour** : 2026-08-24
**Statut global** : terminé — voir `CV-PROJET-OSPM-PREMIUM.md`

## Objectif
Le site est propre mais statique : rien ne bouge au défilement, aucune transition entre les pages.
Objectif : passage **premium clair et raffiné** (on garde le crème) avec une **chorégraphie d'animations
poussée** — au-delà du « spectaculaire » : titres composés lettre par lettre, images révélées par volets,
parallaxe, compteurs, boutons magnétiques. Les pages se chargent avec le **loader 3×3 fourni par l'utilisateur**.
Périmètre : tout le site public (accent sur l'accueil) + l'admin.

## Plan validé
| # | Étape | Skill | Statut | Résultat |
|---|-------|-------|--------|----------|
| 1 | Socle d'animation (révélation, parallaxe, reduced-motion) | frontend-design | ✅ fait | 6 effets + lettres, parallaxe, magnétique, compteurs, en CSS natif |
| 2 | Chargement de page avec le loader 3×3 | standards | ✅ fait | Voile d'ouverture (1×/session) + `loading.tsx` site et admin |
| 3 | Accueil premium | frontend-design | ✅ fait | Titre composé, volet + parallaxe, compteurs, boutons magnétiques, halo |
| 4 | Reste du site public | frontend-design | ✅ fait | Services, atelier, galerie, boutique, devis, contact, pages libres |
| 5 | Admin : transitions et retours visuels | standards | ✅ fait | Entrée d'écran + 45 boutons passés en état de chargement animé |
| 6 | Captures Playwright + perfs | webapp-testing | ✅ fait | 3 bugs réels corrigés ; CLS 0,0001 ; reveals 100 % ; disque saturé débloqué |
| 7 | Mémoire + CV de projet | standards | ✅ fait | `CV-PROJET-OSPM-PREMIUM.md` |

## Notes de reprise
- Contrainte posée : **zéro librairie d'animation**, tout en CSS natif + petits composants clients
- `prefers-reduced-motion` doit tout neutraliser (connexions et appareils modestes à Petit-Goâve)
- Base = conteneur Docker `ospm-postgres`. Si Docker Desktop ne démarre pas :
  `wsl -d docker-desktop --exec /bin/echo ok` puis `docker start ospm-postgres` (c'est ce qui a marché)
- Tailwind 3 : opacités hors échelle à écrire `/[0.08]`, jamais `/8`
- Scripts de capture dans le scratchpad : `captures.py`, `admin2.py`, `loader2.py`, `verif2.py`, `fps.py`
- **Piège Chrome** : un élément entièrement masqué par `clip-path` n'intersecte plus l'écran →
  l'IntersectionObserver ne se déclenche jamais. Le masquage doit porter sur l'enfant, pas sur l'observé.
- **Disque plein le 24/08** (0 Go libre) : build cassé par `ENOSPC`. Débloqué par `npm cache clean --force`
  (3,7 Go). Surveiller : `Docker WSL` ~4,3 Go, `Temp` ~3,2 Go.
- Mesure de fluidité non fiable en navigateur headless sans GPU (24 à 35 img/s sur config identique) :
  à juger sur la vraie machine, pas sur mes captures.

## Projets précédents
- **OSPM — site + admin complet** (23 août 2026) — terminé — voir `CV-PROJET-OSPM.md`
- **OSPM — refonte UI/UX** (23 août 2026) — terminé — voir `CV-PROJET-OSPM-UIUX.md`

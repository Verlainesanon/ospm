# OSPM — Official Services Printing and More

Site public + back-office complet pour l'atelier OSPM (60, Rue Dessalines, Petit-Goâve).

**Stack** : Next.js 14 (App Router) · Prisma · PostgreSQL · Tailwind · Vitest.

---

## Démarrer en local

```bash
# 1. Base de données (Docker)
docker run -d --name ospm-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ospm \
  -p 5432:5432 \
  -v ospm-pgdata:/var/lib/postgresql/data \
  postgres:16

# 2. Variables d'environnement
cp .env.example .env
# → Éditez .env et renseignez DATABASE_URL, SESSION_SECRET, etc.

# 3. Dépendances, schéma, données de départ
npm install
npm run db:push
npm run db:seed

# 4. Lancer
npm run dev      # http://localhost:3000
```

Comptes créés par le seed — **à changer avant toute mise en ligne** :

| E-mail | Mot de passe | Rôle |
|---|---|---|
| admin@ospm.ht | admin123 | ADMIN |
| gestion@ospm.ht | gestion123 | GESTIONNAIRE |
| caisse@ospm.ht | caisse123 | CAISSIER |

---

## Déploiement sur Render

### 1. Créer le dépôt et le connecter

Connectez votre dépôt GitHub sur [render.com](https://render.com).
Le fichier `render.yaml` déclare automatiquement :
- un **service web** Node.js (plan gratuit)
- une **base de données PostgreSQL 16** (plan gratuit)

Render injecte `DATABASE_URL` automatiquement depuis la base liée.

### 2. Variables d'environnement à définir manuellement

Dans le tableau de bord Render → votre service → **Environment** :

| Variable | Valeur |
|---|---|
| `OSPM_URL` | `https://votre-service.onrender.com` (après le 1er déploiement) |

`SESSION_SECRET` et `OSPM_AGENT_TOKEN` sont générés automatiquement par `render.yaml`.

### 3. Après le premier déploiement

Dans le **Shell** de Render (onglet "Shell") :

```bash
npx prisma migrate deploy   # ou : npm run db:push
npm run db:seed
```

> ⚠️ **Changez les mots de passe par défaut** immédiatement après le seed dans `/admin/utilisateurs`.

---

## Structure

```
app/(site)      site public : accueil, services, galerie, boutique, devis, contact
app/admin       back-office (protégé par session)
app/api         API de l'agent d'impression
agent/          agent d'impression local (thermique ESC/POS)
lib/            base de données, auth, monnaie, numérotation, impression, rapports
prisma/         schéma + seed
tests/          vitest
```

## Rôles

| Rôle | Accès |
|---|---|
| ADMIN | tout |
| GESTIONNAIRE | contenu, commandes, devis, clients, finance, stock, matériel, impression, rapports |
| CAISSIER | commandes, devis, clients, finance, impression |
| TECHNICIEN | commandes, stock, matériel, impression |

## Impression

Deux chemins, tous les deux pilotés depuis `/admin/impression` :

1. **Navigateur** — `/admin/impression/facture/{id}` et `/admin/impression/bon/{id}` rendent le gabarit et ouvrent la boîte d'impression. Marche avec n'importe quelle imprimante installée.
2. **Agent local (thermique)** — un ticket est mis en file, puis :

```bash
set OSPM_URL=https://votre-service.onrender.com
set OSPM_AGENT_TOKEN=le-jeton-du-tableau-bord-render
node agent/agent-impression.mjs
```

## Tests

```bash
npm test
```

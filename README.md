# OSPM — Official Services Printing and More

Site public + back-office complet pour l'atelier OSPM (60, Rue Dessalines, Petit-Goâve).

**Stack** : Next.js 14 (App Router) · Prisma · PostgreSQL · Tailwind · vitest.

---

## Démarrer en local

```bash
# 1. Base de données (Docker)
docker start ospm-postgres     # ou : docker run -d --name ospm-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ospm -p 5432:5432 -v ospm-pgdata:/var/lib/postgresql/data postgres:16

# 2. Dépendances, schéma, données de départ
npm install
npm run db:push
npm run db:seed

# 3. Lancer
npm run dev      # http://localhost:3000
```

Comptes créés par le seed — **à changer avant toute mise en ligne** :

| E-mail | Mot de passe | Rôle |
|---|---|---|
| admin@ospm.ht | admin123 | ADMIN |
| gestion@ospm.ht | gestion123 | GESTIONNAIRE |
| caisse@ospm.ht | caisse123 | CAISSIER |

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
set OSPM_URL=http://localhost:3000
set OSPM_AGENT_TOKEN=le-jeton-du-.env
node agent/agent-impression.mjs
```

L'agent interroge `/api/impression` toutes les 5 s. Cible d'imprimante acceptée : `192.168.1.50:9100` (réseau) ou un nom de partage / port Windows (`\\PC\TICKET`, `USB001`).

Les gabarits (facture A4, reçu 80 mm, badge) sont modifiables dans l'admin, champs `{{numero}}`, `{{client}}`, `{{lignes}}`, `{{total}}`…

## Finance

- Facture / proforma / reçu, numérotation `FAC-2026-0001` par année.
- Chaque paiement saisi crée automatiquement une entrée de caisse ; chaque dépense en espèces crée une sortie.
- Caisse par session : ouverture avec fond, clôture avec solde calculé.
- Stock avec seuil d'alerte, mouvements tracés, consommables rattachés aux équipements.

## Déploiement (Render)

`render.yaml` déclare le service web et la base. Après le premier déploiement :

```bash
npx prisma migrate deploy   # ou npm run db:push
npm run db:seed
```

## Tests

```bash
npm test
```

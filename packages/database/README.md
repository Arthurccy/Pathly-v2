# @pathly/database — schéma Prisma, migrations et seed

Responsable : Ishak. Toute modification du schéma passe par une migration relue (voir `CONTRIBUTING.md`).

## Base de développement locale

Utiliser une base dédiée, jamais une base partagée ni la production. Exemple avec Docker (port 5433 pour ne pas gêner un PostgreSQL déjà installé) :

```bash
docker run -d --name pathly-pg-dev -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pathly_dev -p 5433:5432 postgres:15
```

Créer `packages/database/.env` (ignoré par Git) :

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/pathly_dev
DIRECT_URL=postgresql://postgres:postgres@localhost:5433/pathly_dev
```

## Commandes

| Commande (racine) | Effet |
| --- | --- |
| `pnpm db:generate` | Génère le client Prisma |
| `pnpm db:migrate:deploy` | Applique les migrations du dépôt, sans en créer |
| `pnpm --filter @pathly/database db:migrate -- --name <nom>` | Crée une migration après modification du schéma (base locale uniquement) |
| `pnpm db:seed` | Crée ou remet à jour le persona fictif « Alex » |

Ne plus utiliser `db:push` sur une base partagée : il ne laisse pas d'historique. Si une base partagée a été créée avec `db push`, marquer la migration initiale comme appliquée (`prisma migrate resolve --applied <dossier_init>`) avec Arthur, avant tout `migrate deploy`.

## Migrations

1. `…_init` : schéma tel qu'il existait avant S2 (point de départ de l'historique).
2. `…_add_connection_source_and_account_links` : ajouts uniquement, aucune donnée supprimée.
   - `BankConnection.source` (`POWENS` par défaut, `MANUAL`, `FILE_IMPORT`) : un compte importé ou saisi garde la chaîne de propriété compte → connexion → utilisateur.
   - `BankAccount.currentBalance` nullable : `null` = solde inconnu, jamais remplacé par 0.
   - `InvestmentPosition.accountId` et `LoanCredit.accountId` (optionnels) : relient positions et crédits à leur compte pour éviter le double comptage du patrimoine.

## Seed

`prisma/seed.mjs` (JavaScript, sans dépendance supplémentaire) crée le persona fictif « Alex » :

- identifiants déterministes et `upsert` : deux exécutions donnent le même état ;
- ne supprime rien et ne touche aucune autre donnée ;
- refuse une base distante (sauf `SEED_ALLOW_REMOTE=true`) et un e-mail déjà associé à un autre profil ;
- `SEED_PERSONA_USER_ID` / `SEED_PERSONA_EMAIL` : utiliser l'id d'un utilisateur Supabase de test (`UserProfile.id` = `auth.users.id`).

Synthèse attendue : trésorerie 2 000 € + investissements 5 000 € + biens 10 000 € − dettes 3 000 € = **14 000 €**. Le PEA (compte `INVESTMENT` + positions liées) et le crédit auto (compte `LOAN` + `LoanCredit` lié) ne doivent être comptés qu'une fois.

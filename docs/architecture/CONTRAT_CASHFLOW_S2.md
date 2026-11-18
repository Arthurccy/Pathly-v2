# S2 — Contrat Safe-to-Spend et API comptes/transactions

Producteur : Victor · Consommateurs : Loris (dashboard), Jeremy (visualisations), Ishak (client API).
Types : `packages/shared-types/src/cashflow.ts`. Statut : **validé isolément** (dépôts et identité simulés) ; raccordement Prisma + Supabase V2 à vérifier.

## `GET /api/v1/cashflow/summary`

Authentification requise (`Authorization: Bearer <token Supabase>`). L'utilisateur provient de la session validée, jamais d'un paramètre.

| Paramètre                    | Type             | Règle                                                                    |
| ---------------------------- | ---------------- | ------------------------------------------------------------------------ |
| `month`                      | `YYYY-MM`        | Facultatif, défaut : mois courant (Europe/Paris). Seul le mois courant est accepté en S2 (pas d'historique de solde) → sinon 400 |
| `remainingCommittedExpenses` | euros, ≥ 0, 2 déc. max | Charges restant à débiter sur la période. **Paramètre de simulation** en S2 |
| `savingsReserve`             | euros, ≥ 0, 2 déc. max | Réserve d'épargne à préserver. **Paramètre de simulation** en S2           |

Règle : **solde des comptes courants − charges restantes − réserve**. Calcul en centimes entiers, résultat en euros.

- Solde disponible = somme des `currentBalance` des comptes `CHECKING` de l'utilisateur. Livrets, titres-restaurant, investissements et prêts sont exclus.
- Les charges déjà débitées sont déjà dans le solde : ne fournir que les charges restantes.
- Pas d'équivalent journalier en S2.

| Statut       | Condition                    | `safeToSpendPeriod`     |
| ------------ | ---------------------------- | ----------------------- |
| `AVAILABLE`  | estimation ≥ 0               | montant                 |
| `SHORTFALL`  | estimation < 0               | montant négatif réel (jamais ramené à 0) |
| `INCOMPLETE` | une donnée manque            | `null` + `incompleteReasons` |

`incompleteReasons` : `AVAILABLE_BALANCE_MISSING` (aucun compte courant), `UNSUPPORTED_CURRENCY` (compte courant hors EUR, pas de conversion implicite), `REMAINING_COMMITTED_EXPENSES_MISSING`, `SAVINGS_RESERVE_MISSING`.

Exemple : `?remainingCommittedExpenses=800&savingsReserve=200` avec un compte courant à 1 500 € →

```json
{ "success": true, "data": { "month": "2026-10", "asOfDate": "2026-10-15", "safeToSpendPeriod": 500, "status": "AVAILABLE", "currency": "EUR" } }
```

## Comptes et transactions

| Route                        | Réponse                              | Erreurs                                                       |
| ---------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| `GET /accounts`              | `ApiResponse<BankAccountDto[]>`      | 401 sans session                                              |
| `GET /accounts/:id`          | `ApiResponse<BankAccountDto>`        | 400 id non UUID · 404 compte inexistant **ou d'un autre utilisateur** (choix 404 : ne pas révéler l'existence) |
| `GET /transactions?limit&cursor` | `ApiResponse<BankTransactionDto[]>` | 400 si `limit` ∉ [1, 100] entier, `cursor` non UUID ou paramètre inconnu |

- Montants en euros (`number`), dépense négative, revenu positif ; date de transaction `YYYY-MM-DD`.
- Transactions triées par date puis id décroissants ; `cursor` = id de la dernière transaction de la page précédente. Défaut `limit=50`.
- **Changement** par rapport à l'état initial : les réponses suivent désormais exactement `BankAccountDto` / `BankTransactionDto` (plus d'objet Prisma brut ni de `connection`/`account` imbriqués).

## Limites connues

- Les erreurs suivent encore le format NestJS par défaut (`statusCode`, `message`), pas encore la cible `success: false, error.code` (PR ciblée à prévoir).
- Charges restantes et réserve sont saisies, pas encore extraites des transactions récurrentes ni persistées (préférences : Yann, S7).

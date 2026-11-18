# Visualisations financières — composants

Responsable : Jeremy · Intégration dashboard : Loris · Statut S2 : **validé isolément** (fixtures), montage restant.

Composants autonomes : aucun appel réseau ni Supabase. L'intégrateur fournit un état typé `VisualState<T>`.
Page de développement isolée : `/dev/visualisation` (non indexée), avec tous les états, thème sombre et mode sans mouvement.

## Utilisation

```tsx
import { FinancialHealth, NetWorthBreakdown } from '@/components/visualisation';

<FinancialHealth state={{ status: 'ready', data: cashflowSummary }} tone="light" />
<NetWorthBreakdown state={{ status: 'loading' }} />
```

## Props communes

| Prop          | Type                                   | Défaut    | Rôle                                                                 |
| ------------- | -------------------------------------- | --------- | -------------------------------------------------------------------- |
| `state`       | `VisualState<T>`                       | requis    | `loading`, `empty` (aucune donnée), `error` (+ `message`) ou `ready` |
| `tone`        | `'light' \| 'dark'`                    | `'light'` | Suit le mode clair/sombre du conteneur                               |
| `motion`      | `'auto' \| 'reduced'`                  | `'auto'`  | `auto` respecte `prefers-reduced-motion` ; `reduced` force le statique |
| `sourceLabel` | `string`                               | —         | Badge affiché, ex. « Données fictives » pour une fixture ou la démo  |

`empty` signifie « pas de donnée » ; ce n'est jamais converti en 0 €.

## `NetWorthBreakdown` — `state: VisualState<NetWorthSummaryDto>`

Consomme le type existant de `packages/shared-types` sans le modifier. Champs utilisés :
`liquidCash`, `investedAssets`, `tangibleAssets`, `totalAssets`, `totalLiabilities`, `netWorth`.

- Barre des actifs empilée (trésorerie, investissements, biens) et barre des dettes **séparée**, sur une échelle commune.
  Les dettes ne sont jamais une part négative des actifs.
- Chaque série a une texture en plus de sa couleur ; toutes les valeurs sont écrites en clair.
- Incohérences signalées sans correction : somme des catégories ≠ `totalAssets`, `totalAssets − totalLiabilities ≠ netWorth`,
  catégorie ou dette négative (exclue de la barre). Les valeurs reçues restent affichées.

## `FinancialHealth` — `state: VisualState<CashflowSummaryView>`

Compatible avec `CashflowSummaryDto` de `GET /api/v1/cashflow/summary` (Victor, PR #2 en brouillon,
`docs/architecture/CONTRAT_CASHFLOW_S2.md`) : `month`, `asOfDate`, `safeToSpendPeriod: number | null`,
`status: 'AVAILABLE' | 'SHORTFALL' | 'INCOMPLETE'`, `currency: 'EUR'`, `incompleteReasons?`.
Les types de statut et de raison sont recopiés localement tant que la PR #2 n'est pas fusionnée.

Ajout **proposé, à confirmer avec Victor et Ishak** : bloc optionnel `inputs` (`availableBalance`, `remainingCommittedExpenses`,
`savingsReserve`, chacun `number | null`) pour expliquer le calcul. Charges et réserve sont déjà des paramètres envoyés par le
dashboard ; seul le solde disponible n'est pas renvoyé par l'API.

- Avec `inputs` complets : cascade solde → − charges → − réserve → reste à dépenser. Un déficit reste négatif, à gauche d'un repère 0 €.
- Sans `inputs` (réponse actuelle de l'API) : résultat seul. Statut INCOMPLETE : `incompleteReasons` traduites en libellés
  (code inconnu affiché tel quel), montant « Indisponible ». Avec une entrée `null` dans `inputs` : même affichage.
- Le libellé d'état reprend uniquement le statut reçu (pas de seuil « tendu » inventé).
- Incohérences signalées : écart entre `safeToSpendPeriod` et le calcul des entrées, statut contradictoire avec le signe du montant.

## Calculs et arrondis

`compute.ts` (fonctions pures) : euros → centimes entiers arrondis au centime le plus proche avant toute opération, retour en euros
pour l'affichage uniquement. Tests : `pnpm --filter @pathly/web test` (runner natif Node ≥ 22.18, sans dépendance ajoutée).

## Montage dans le dashboard (avec Loris)

À faire dans une PR de raccordement ciblée : réserver deux emplacements dans le dashboard, passer `tone` selon `isDarkMode`,
et alimenter `state` depuis la source de données retenue (fixture identifiée tant que l'API n'est pas raccordée).

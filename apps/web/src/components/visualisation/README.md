# Visualisations financières — composants

Ticket : `S02-JEREMY-visualisation` · Responsable : Jeremy · Intégration dashboard : Loris · Statut S2 : **validé isolément**.

Composants autonomes : aucun appel réseau ni Supabase. L'intégrateur fournit un état typé `VisualState<T>`.
Page de développement isolée : `/dev/visualisation` (non indexée), avec tous les états, un changement de données en direct,
le thème sombre et le mode sans mouvement. Emplacement `components/visualisation/` confirmé par Loris.

## Props communes

| Prop          | Type                  | Défaut    | Rôle                                                                   |
| ------------- | --------------------- | --------- | ---------------------------------------------------------------------- |
| `state`       | `VisualState<T>`      | requis    | `loading`, `empty` (aucune donnée), `error` (+ `message`) ou `ready`   |
| `tone`        | `'light' \| 'dark' \| 'auto'` | `'light'` | Thème imposé, ou `auto` : suit la classe `dark` du document (dashboard) |
| `frame`       | `'card' \| 'none'`    | `'card'`  | `none` : sans cadre ni titre, pour un conteneur qui les fournit (`WidgetSlot`) |
| `motion`      | `'auto' \| 'reduced'` | `'auto'`  | `auto` respecte `prefers-reduced-motion` ; `reduced` force le statique |
| `sourceLabel` | `string`              | —         | Badge affiché, ex. « Données fictives » pour une fixture ou la démo    |

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

- Réponse du contrat actuel : résultat seul. Un déficit reste négatif ; INCOMPLETE affiche « Indisponible » et les
  `incompleteReasons` traduites (code inconnu affiché tel quel).
- Le libellé d'état reprend uniquement le statut reçu (pas de seuil « tendu » inventé).
- Incohérences signalées : statut contradictoire avec le signe du montant, INCOMPLETE sans raison.

**Proposition à valider avec Victor et Ishak** : bloc optionnel `inputs` (`availableBalance`, `remainingCommittedExpenses`,
`savingsReserve`, chacun `number | null`). Charges et réserve sont déjà des paramètres envoyés par le dashboard ; seul le
solde n'est pas renvoyé. Avec `inputs` complets, le composant affiche la cascade solde → − charges → − réserve → reste à
dépenser, avec un repère 0 € si le résultat est négatif, et signale un écart entre `safeToSpendPeriod` et le calcul des entrées.

## Adaptateur `apiResponseToVisualState`

Fonction pure : `ApiResponse<T>` (renvoyée par `ApiClient`) → `VisualState<T>`.
`success: true` + données → `ready` ; `success: true` sans données → `empty` ; `success: false` → `error` avec `error.message`.

## Calculs, arrondis et tests

`compute.ts` (fonctions pures) : euros → centimes entiers arrondis au centime le plus proche avant toute opération, retour en
euros pour l'affichage uniquement. Tests (runner natif de Node, sans dépendance), depuis la racine du dépôt :

```bash
node --experimental-strip-types --test apps/web/test/visualisation.test.ts
```

## Montage dans le dashboard

`DashboardWithVisualisations.tsx` (composant client) monte les deux composants dans les emplacements réservés par Loris
(`financial-health`, `wealth-breakdown`) avec `tone="auto"` et `frame="none"` ; `apps/web/src/app/page.tsx` l'affiche.
Un composant client est nécessaire : `page.tsx`, composant serveur, ne peut pas transmettre de fonctions à `DashboardView`.

- Démo avec comptes chargés : fixtures conformes aux contrats, badge « Données fictives ». Leurs montants diffèrent des
  données de démonstration du dashboard.
- Démo vide, en erreur, chargement ou source API : état « aucune donnée », jamais de montant inventé.
- Raccordement réel ensuite : `state={apiResponseToVisualState(réponse)}` à partir de `GET /cashflow/summary` (Victor) et de
  la synthèse patrimoniale (Ishak), avec `state={{ status: 'loading' }}` pendant la requête.

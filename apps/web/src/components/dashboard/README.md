# Dashboard — structure et emplacements de widgets

Responsable : Loris. Point d'entrée : [`DashboardView`](./DashboardView.tsx), monté par `apps/web/src/app/page.tsx`.

## Structure

| Fichier | Rôle |
| --- | --- |
| `DashboardView.tsx` | Compose la page, porte la source de données, le mois sélectionné et les emplacements |
| `DashboardHeader.tsx`, `DataSourceControl.tsx`, `ThemeToggle.tsx` | En-tête, choix de la source, thème clair/sombre |
| `DataModeBanner.tsx` | Indique si les données sont fictives (démo) ou issues de l'API |
| `MonthSelector.tsx`, `MonthSummary.tsx` | Période et totaux calculés sur les opérations chargées |
| `AccountsSection.tsx`, `TransactionsSection.tsx` | Comptes et opérations avec états chargement / vide / erreur |
| `WidgetSlot.tsx`, `widget-slots.ts` | Emplacements réservés, contexte et callbacks transmis aux widgets |
| `PhysicalAssetsSection.tsx`, `PhysicalAssetForm.tsx` | Liste des biens physiques et formulaire d'ajout (voir « Biens physiques ») |

Données : `apps/web/src/lib/dashboard/` (`use-dashboard-data.ts`, `demo-source.ts`, `api-source.ts`, `session.ts`, `use-physical-assets.ts`, `physical-asset-source.ts`, `physical-asset-form.ts`).

## Sources de données

- **Démo** (défaut) : fixtures fictives et déterministes exposées en `BankAccountDto` / `BankTransactionDto`, avec trois scénarios (nominal, vide, erreur simulée). Le bandeau « Données de démonstration fictives » reste affiché.
- **API réelle** : `ApiClient.getAccounts` / `getTransactions`. Il faut un jeton fourni par `lib/dashboard/session.ts` (`getAccessToken`), à raccorder au fournisseur de session de Yann. Tant qu'il renvoie `null`, la source API affiche l'erreur `SESSION_REQUIRED` sans appeler le serveur.
- L'API renvoie aujourd'hui les lignes Prisma brutes (montants `Decimal` en chaîne, date ISO complète, IBAN non masqué). `api-source.ts` valide et normalise chaque entrée ; une entrée invalide produit l'erreur `INVALID_RESPONSE`, jamais une ligne ignorée. Les transactions sont limitées à 50 (pas de pagination).

## Emplacements de widgets

`DashboardView` accepte `widgets?: Partial<Record<WidgetSlotId, (context) => ReactNode>>`. Un emplacement sans widget affiche un repère « pas encore raccordé ». Chaque widget est isolé par une barrière d'erreur : une exception d'affichage ne casse pas le reste.

| Id | Titre | Producteur | Contenu attendu |
| --- | --- | --- | --- |
| `cashflow` | Trésorerie (reste à dépenser) | Victor | Résultat de `GET /cashflow/summary?month=YYYY-MM` |
| `net-worth` | Patrimoine net | Ishak / Victor | `NetWorthSummaryDto` |
| `financial-health` | Santé financière | Jeremy | Composant de visualisation à props typées |
| `wealth-breakdown` | Répartition du patrimoine | Jeremy | Répartition des actifs, dettes présentées à part |

Contexte reçu par chaque widget (`DashboardWidgetContext`) :

| Champ | Description |
| --- | --- |
| `month` | `YYYY-MM` ou `ALL` |
| `isDemo` | `true` tant que les données sont fictives |
| `accounts`, `transactions` | Données chargées (tableaux vides tant que non prêtes) |
| `onDataChanged()` | Callback de mise à jour : à appeler après une mutation réussie, le dashboard recharge comptes et opérations |

Montage d'un composant (PR de raccordement ciblée, sans modifier les autres emplacements) :

```tsx
// apps/web/src/app/page.tsx
<DashboardView
  widgets={{
    'financial-health': ({ accounts, month }) => <FinancialHealth accounts={accounts} month={month} />,
  }}
/>
```

Les widgets ne font pas leurs propres appels Supabase ; le dashboard leur transmet les données.

## Biens physiques (P1)

Section `#biens` : liste des biens et formulaire « Ajouter un bien » (`PhysicalAssetDto`, contrat existant).

- **Validation** (`lib/dashboard/physical-asset-form.ts`, fonction pure) : nom 2 à 100 caractères ; catégorie parmi `AssetCategory` ; valeur estimée obligatoire et > 0 ; prix d'achat facultatif ; montants en euros avec virgule ou point, au plus 2 décimales (une saisie à 3 décimales est refusée, jamais arrondie), maximum `9 999 999 999,99` (colonne `Decimal(12, 2)`) ; date d'achat facultative, réelle, entre 1900 et aujourd'hui ; notes ≤ 500 caractères. Les erreurs s'affichent par champ, le focus va sur le premier champ invalide.
- **Enregistrement** : une erreur d'enregistrement conserve les saisies et réactive le bouton ; un succès ferme le formulaire et ajoute le bien en tête de liste.
  - **Démo** : le bien est conservé en mémoire seulement et disparaît au rechargement ou au changement de source ; la liste de démonstration contient un exemple fictif de 10 000 € (aligné sur l'exemple patrimonial de référence). Le scénario « erreur simulée » fait échouer lecture et écriture.
  - **API réelle** : aucun endpoint n'existe dans `apps/api` pour les biens physiques. La liste et l'enregistrement renvoient l'erreur explicite `NOT_AVAILABLE` ; aucun succès n'est simulé.
- **Contrat proposé** (à valider avec Victor / Ishak, non implémenté) : `GET /api/v1/physical-assets` → `ApiResponse<PhysicalAssetDto[]>` et `POST /api/v1/physical-assets` avec le corps `PhysicalAssetInput` (`name`, `category`, `estimatedValue`, `purchasePrice | null`, `purchaseDate | null`, `currency: 'EUR'`, `notes | null`) → `ApiResponse<PhysicalAssetDto>`. L'utilisateur provient de la session validée (jamais d'un `userId` du navigateur), l'API revalide les mêmes règles ; 400 si invalide, 401 sans session. Le raccordement se fait dans `physical-asset-source.ts` (`loadApiAssets`, `createApiAsset`).
- Les biens ne sont pas encore transmis aux widgets (`DashboardWidgetContext`) ni agrégés : la synthèse patrimoniale appartient à Ishak.

## Tests unitaires

`pnpm --filter @pathly/web test:unit` exécute les tests `*.test.ts` avec le lanceur intégré de Node (`node --test`, import de fichiers `.ts` : Node ≥ 22.18 ou 24 requis ; `allowImportingTsExtensions` est activé dans `tsconfig.json`). Les modules testés ne doivent pas importer d'alias `@/` à l'exécution. Couverture actuelle : validation du formulaire de bien physique.

## Limites connues

- Les totaux « Revenus / Dépenses / Solde des opérations » sont informatifs : ils excluent les virements internes (catégorie `Virement Interne`) et les opérations `isExcluded`, et ne remplacent pas le calcul de trésorerie de Victor.
- Les tests automatisés ne couvrent que la validation du formulaire de bien physique ; le reste est vérifié manuellement (voir le rapport de séance).
- Les logos externes (`institutions.ts`) ne sont pas chargés : l'interface affiche des initiales colorées (P2).

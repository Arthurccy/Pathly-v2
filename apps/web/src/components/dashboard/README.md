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

Données : `apps/web/src/lib/dashboard/` (`use-dashboard-data.ts`, `demo-source.ts`, `api-source.ts`, `session.ts`).

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

## Limites connues

- Les totaux « Revenus / Dépenses / Solde des opérations » sont informatifs : ils excluent les virements internes (catégorie `Virement Interne`) et les opérations `isExcluded`, et ne remplacent pas le calcul de trésorerie de Victor.
- Aucun test automatisé n'existe côté `apps/web` (pas de runner configuré) ; la vérification est décrite dans le rapport de séance.
- Les logos externes (`institutions.ts`) ne sont pas chargés : l'interface affiche des initiales colorées (P2).

import type { ReactNode } from 'react';
import type { BankAccountDto, BankTransactionDto } from '@pathly/shared-types';

export type WidgetSlotId = 'cashflow' | 'net-worth' | 'financial-health' | 'wealth-breakdown';

/** Données et callbacks que le dashboard transmet à chaque widget monté dans un emplacement. */
export interface DashboardWidgetContext {
  /** Mois sélectionné au format `YYYY-MM`, ou `ALL` pour la vue globale. */
  month: string;
  /** Vrai tant que les données viennent du jeu de démonstration fictif. */
  isDemo: boolean;
  accounts: BankAccountDto[];
  transactions: BankTransactionDto[];
  /** À appeler par un widget après une mutation réussie : le dashboard recharge comptes et opérations. */
  onDataChanged: () => void;
}

export type DashboardWidgets = Partial<Record<WidgetSlotId, (context: DashboardWidgetContext) => ReactNode>>;

export interface WidgetSlotDefinition {
  id: WidgetSlotId;
  title: string;
  owner: string;
  expected: string;
}

/** Emplacements documentés dans `components/dashboard/README.md`. L'ordre est l'ordre d'affichage. */
export const WIDGET_SLOTS: WidgetSlotDefinition[] = [
  {
    id: 'cashflow',
    title: 'Trésorerie (reste à dépenser)',
    owner: 'Victor',
    expected: 'Résultat de GET /cashflow/summary?month=YYYY-MM (statuts AVAILABLE, SHORTFALL, INCOMPLETE).',
  },
  {
    id: 'net-worth',
    title: 'Patrimoine net',
    owner: 'Ishak / Victor',
    expected: 'NetWorthSummaryDto issu de la synthèse patrimoniale.',
  },
  {
    id: 'financial-health',
    title: 'Santé financière',
    owner: 'Jeremy',
    expected: 'Composant de visualisation alimenté par des props typées.',
  },
  {
    id: 'wealth-breakdown',
    title: 'Répartition du patrimoine',
    owner: 'Jeremy',
    expected: 'Composant de répartition (actifs) avec dettes présentées séparément.',
  },
];

'use client';

import React from 'react';
import { DashboardView } from '@/components/dashboard/DashboardView';
import type { DashboardWidgetContext, DashboardWidgets } from '@/components/dashboard/widget-slots';
import { FinancialHealth } from './FinancialHealth';
import { NetWorthBreakdown } from './NetWorthBreakdown';
import { FIXTURE_LABEL, healthResultOnly, netWorthHealthy } from './fixtures';

/**
 * Montage des visualisations dans les emplacements réservés du dashboard (Loris).
 *
 * Le contexte des emplacements fournit comptes et opérations, pas encore la réponse de
 * `GET /cashflow/summary` (Victor) ni la synthèse `NetWorthSummaryDto` (Ishak) :
 * - en mode démo, lorsque le dashboard a chargé ses comptes, les composants affichent des fixtures conformes
 *   aux contrats, identifiées « Données fictives » ;
 * - sinon (API, démo vide ou en erreur, chargement), ils affichent l'état « aucune donnée » : aucun montant
 *   n'est montré quand le dashboard n'a pas de données, et aucun montant n'est recalculé à partir des comptes.
 */
function showFixtures({ isDemo, accounts }: DashboardWidgetContext): boolean {
  return isDemo && accounts.length > 0;
}

const VISUALISATION_WIDGETS: DashboardWidgets = {
  'financial-health': (context) => (
    <FinancialHealth
      state={showFixtures(context) ? healthResultOnly : { status: 'empty' }}
      tone="auto"
      frame="none"
      sourceLabel={showFixtures(context) ? FIXTURE_LABEL : undefined}
    />
  ),
  'wealth-breakdown': (context) => (
    <NetWorthBreakdown
      state={showFixtures(context) ? netWorthHealthy : { status: 'empty' }}
      tone="auto"
      frame="none"
      sourceLabel={showFixtures(context) ? FIXTURE_LABEL : undefined}
    />
  ),
};

export function DashboardWithVisualisations(): React.JSX.Element {
  return <DashboardView widgets={VISUALISATION_WIDGETS} />;
}

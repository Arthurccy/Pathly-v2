import type { SubscriptionOptimizationDto } from "@pathly/shared-types";

/**
 * Module pur de vérification des sources et de simulation tarifaire pédagogique (Séance 2 — Mathias Bouclon).
 *
 * Conventions respectées (docs/architecture/CONTRATS_SEANCE_2.md) :
 * - Calculs effectués en centimes entiers puis convertis en euros à la frontière (arrondi au centime le plus proche).
 * - Une donnée requise absente ne produit jamais silencieusement un zéro : le statut retourne 'INCOMPLETE_DATA'
 *   avec la liste des variables manquantes.
 * - Aucune promesse de gain réel n'est émise à partir du seul libellé bancaire d'un fournisseur.
 */

export type PowerKva = 3 | 6 | 9 | 12;
export type ElectricityTariffOption = "BASE" | "HP_HC";

export interface VerifiedTariffSource {
  id: string;
  domain: "ENERGY" | "TELECOM";
  title: string;
  publisher: string;
  url: string;
  referenceDate: string;
  license: string;
  granularity: string;
  requiredVariables: string[];
  exploitableAutomaticallyFromBankLine: boolean;
  verdictForApi: string;
}

export const VERIFIED_TARIFF_SOURCES: VerifiedTariffSource[] = [
  {
    id: "src-cre-trv-elec",
    domain: "ENERGY",
    title:
      "Tarifs réglementés de vente d’électricité (TRV — Option Base & Heures Pleines / Heures Creuses)",
    publisher: "data.gouv.fr / Commission de Régulation de l’Énergie (CRE)",
    url: "https://www.data.gouv.fr/fr/datasets/tarifs-reglementes-de-vente-delectricite/",
    referenceDate: "Barème de référence S2 (2026)",
    license: "Licence Ouverte / Open Licence 2.0 (Etalab)",
    granularity:
      "Abonnement annuel TTC par puissance (3 à 36 kVA) et prix TTC par kWh selon option tarifaire.",
    requiredVariables: [
      "Puissance souscrite (kVA)",
      "Option tarifaire (Base ou Heures Pleines / Heures Creuses)",
      "Consommation annuelle estimée (kWh/an)",
      "Mensualité actuelle observée (€/mois)",
    ],
    exploitableAutomaticallyFromBankLine: false,
    verdictForApi:
      'Exploitable uniquement en simulation déclarative après saisie de la puissance (kVA) et de la consommation (kWh). Inexploitable sur une simple ligne bancaire "EDF -74,50 €".',
  },
  {
    id: "src-mne-comparateur",
    domain: "ENERGY",
    title:
      "Comparateur officiel du Médiateur National de l’Énergie (energie-info)",
    publisher: "Médiateur National de l’Énergie",
    url: "https://comparateur-offres.energie-info.fr/",
    referenceDate: "Vérification S2 (2026)",
    license:
      "Service public d’information — Pas d’API Open Data libre pour redistribuer les offres privées temps réel",
    granularity:
      "Consultation web par code postal, puissance kVA et consommation annuelle.",
    requiredVariables: [
      "Code postal (zone GRD)",
      "Puissance (kVA)",
      "Consommation annuelle (kWh)",
    ],
    exploitableAutomaticallyFromBankLine: false,
    verdictForApi:
      "Non exploitable en appel API automatique en S2. Résultat de recherche documenté : ne pas inventer ni scraper de catalogue d’offres privées.",
  },
  {
    id: "src-arcep-telecom",
    domain: "TELECOM",
    title:
      "Observatoire des marchés des communications électroniques et Open Data ARCEP",
    publisher:
      "ARCEP (Autorité de Régulation des Communications Électroniques, des Postes et de la Distribution de la Presse)",
    url: "https://www.arcep.fr/cartes-et-donnees/nos-publications-chiffrees.html",
    referenceDate: "Vérification S2 (2026)",
    license:
      "Licence Ouverte / Open Licence 2.0 (Etalab) pour les indicateurs agrégés",
    granularity:
      "Moyennes statistiques sectorielles et couverture ; pas de catalogue Open Data des offres commerciales.",
    requiredVariables: [
      "Mensualité actuelle hors promotion (€/mois)",
      "Mensualité de l’offre cible hors promotion (€/mois)",
      "Frais de résiliation de l’opérateur actuel (€)",
      "Frais de mise en service / activation de la cible (€)",
    ],
    exploitableAutomaticallyFromBankLine: false,
    verdictForApi:
      "Un prix moyen sectoriel ne garantit aucune économie individuelle. Exploitable uniquement en calculateur de seuil de rentabilité avec frais de changement explicites.",
  },
];

interface TrvGridEntry {
  annualSubscriptionCents: number;
  baseKwhPriceEuro: number;
  hpKwhPriceEuro?: number;
  hcKwhPriceEuro?: number;
}

/**
 * Grille de référence TRV (abonnements en centimes d'euro TTC/an et prix du kWh TTC en euros).
 * Exemple de référence S2 : 6 kVA Base -> 12,68 €/mois (152,16 €/an) et 0,2516 €/kWh.
 */
export const TRV_ELECTRICITY_REFERENCE_GRID: Record<
  PowerKva,
  { BASE: TrvGridEntry; HP_HC: TrvGridEntry }
> = {
  3: {
    BASE: { annualSubscriptionCents: 12000, baseKwhPriceEuro: 0.2516 },
    HP_HC: {
      annualSubscriptionCents: 12600,
      baseKwhPriceEuro: 0.2516,
      hpKwhPriceEuro: 0.27,
      hcKwhPriceEuro: 0.2068,
    },
  },
  6: {
    BASE: { annualSubscriptionCents: 15216, baseKwhPriceEuro: 0.2516 },
    HP_HC: {
      annualSubscriptionCents: 15888,
      baseKwhPriceEuro: 0.2516,
      hpKwhPriceEuro: 0.27,
      hcKwhPriceEuro: 0.2068,
    },
  },
  9: {
    BASE: { annualSubscriptionCents: 19092, baseKwhPriceEuro: 0.2516 },
    HP_HC: {
      annualSubscriptionCents: 20148,
      baseKwhPriceEuro: 0.2516,
      hpKwhPriceEuro: 0.27,
      hcKwhPriceEuro: 0.2068,
    },
  },
  12: {
    BASE: { annualSubscriptionCents: 23028, baseKwhPriceEuro: 0.2516 },
    HP_HC: {
      annualSubscriptionCents: 24240,
      baseKwhPriceEuro: 0.2516,
      hpKwhPriceEuro: 0.27,
      hcKwhPriceEuro: 0.2068,
    },
  },
};

export interface ElectricitySimulationInput {
  detectedProviderLabel: string;
  observedMonthlyAmountEur: number | null;
  powerKva: PowerKva | null;
  tariffOption: ElectricityTariffOption | null;
  annualConsumptionKwh: number | null;
  simulatedKwhDiscountPercent: number;
  offPeakSharePercent?: number;
}

export interface SimulationIncompleteResult {
  status: "INCOMPLETE_DATA";
  code: "MISSING_REQUIRED_VARIABLES";
  message: string;
  missingVariables: string[];
}

export interface SimulationInvalidResult {
  status: "INVALID_INPUT";
  code: "INVALID_NUMERIC_VALUE";
  message: string;
}

export interface ElectricitySimulationSuccessResult {
  status: "SIMULATED";
  dataNature: "SIMULATION_PEDAGOGIQUE";
  assumptionsSummary: string;
  observedMonthlyAmountEur: number;
  observedAnnualCostEur: number;
  referenceTrvAnnualCostEur: number;
  referenceTrvMonthlyCostEur: number;
  simulatedTargetAnnualCostEur: number;
  simulatedTargetMonthlyCostEur: number;
  annualDeltaVsObservedEur: number;
  monthlyDeltaVsObservedEur: number;
  annualDeltaVsTrvEur: number;
  unitKwhReferenceEur: number;
  unitKwhSimulatedEur: number;
  annualSubscriptionEur: number;
  optimizationDto: SubscriptionOptimizationDto;
}

export type ElectricitySimulationResult =
  | SimulationIncompleteResult
  | SimulationInvalidResult
  | ElectricitySimulationSuccessResult;

function centsToEur(cents: number): number {
  return Math.round(cents) / 100;
}

function eurToCents(eur: number): number {
  return Math.round(eur * 100);
}

/**
 * Simule un écart tarifaire électrique uniquement si les paramètres physiques du compteur sont renseignés.
 */
export function simulateElectricityComparison(
  input: ElectricitySimulationInput,
): ElectricitySimulationResult {
  const missingVariables: string[] = [];

  if (
    input.observedMonthlyAmountEur === null ||
    Number.isNaN(input.observedMonthlyAmountEur)
  ) {
    missingVariables.push("Mensualité actuelle observée (€/mois)");
  }
  if (input.powerKva === null) {
    missingVariables.push("Puissance souscrite du compteur (kVA)");
  }
  if (input.tariffOption === null) {
    missingVariables.push(
      "Option tarifaire (Base ou Heures Pleines / Heures Creuses)",
    );
  }
  if (
    input.annualConsumptionKwh === null ||
    Number.isNaN(input.annualConsumptionKwh)
  ) {
    missingVariables.push("Consommation annuelle estimée (kWh/an)");
  }

  if (missingVariables.length > 0) {
    return {
      status: "INCOMPLETE_DATA",
      code: "MISSING_REQUIRED_VARIABLES",
      message:
        "Informations insuffisantes : le seul libellé bancaire (« " +
        (input.detectedProviderLabel || "Fournisseur") +
        " ») ne permet pas d’estimer une économie sans connaître votre compteur et votre consommation.",
      missingVariables,
    };
  }

  const observedMonthly = input.observedMonthlyAmountEur!;
  const kwh = input.annualConsumptionKwh!;
  const discount = input.simulatedKwhDiscountPercent;

  if (
    observedMonthly <= 0 ||
    kwh <= 0 ||
    kwh > 100000 ||
    discount < 0 ||
    discount > 30
  ) {
    return {
      status: "INVALID_INPUT",
      code: "INVALID_NUMERIC_VALUE",
      message:
        "Valeurs hors bornes : la mensualité (> 0 €), la consommation annuelle (1 à 100 000 kWh/an) et la remise simulée (0 % à 30 %) doivent être valides.",
    };
  }

  const grid =
    TRV_ELECTRICITY_REFERENCE_GRID[input.powerKva!][input.tariffOption!];
  const annualSubCents = grid.annualSubscriptionCents;

  let weightedRefKwhEur = grid.baseKwhPriceEuro;
  if (
    input.tariffOption === "HP_HC" &&
    grid.hpKwhPriceEuro &&
    grid.hcKwhPriceEuro
  ) {
    const offPeakRatio =
      Math.min(100, Math.max(0, input.offPeakSharePercent ?? 40)) / 100;
    weightedRefKwhEur =
      grid.hpKwhPriceEuro * (1 - offPeakRatio) +
      grid.hcKwhPriceEuro * offPeakRatio;
  }

  const unitKwhSimulatedEur = Number(
    (weightedRefKwhEur * (1 - discount / 100)).toFixed(4),
  );

  const observedMonthlyCents = eurToCents(observedMonthly);
  const observedAnnualCents = observedMonthlyCents * 12;

  const refConsumptionCents = Math.round(kwh * weightedRefKwhEur * 100);
  const referenceTrvAnnualCents = annualSubCents + refConsumptionCents;
  const referenceTrvMonthlyCents = Math.round(referenceTrvAnnualCents / 12);

  const simConsumptionCents = Math.round(kwh * unitKwhSimulatedEur * 100);
  const simulatedTargetAnnualCents = annualSubCents + simConsumptionCents;
  const simulatedTargetMonthlyCents = Math.round(
    simulatedTargetAnnualCents / 12,
  );

  const annualDeltaVsObservedCents =
    observedAnnualCents - simulatedTargetAnnualCents;
  const monthlyDeltaVsObservedCents = Math.round(
    annualDeltaVsObservedCents / 12,
  );
  const annualDeltaVsTrvCents =
    referenceTrvAnnualCents - simulatedTargetAnnualCents;

  const annualDeltaVsObservedEur = centsToEur(annualDeltaVsObservedCents);
  const simulatedTargetMonthlyEur = centsToEur(simulatedTargetMonthlyCents);

  const optimizationDto: SubscriptionOptimizationDto = {
    id: "sim-energy-elec-s2",
    category: "ENERGY",
    detectedSubscriptionName: `${input.detectedProviderLabel} (observé : ${observedMonthly.toFixed(2)} €/mois)`,
    currentMonthlyCost: centsToEur(observedMonthlyCents),
    recommendedProvider: `Simulation barème ${input.powerKva} kVA ${input.tariffOption === "BASE" ? "Base" : "HP/HC"} (-${discount}% kWh)`,
    recommendedPlanName: `${kwh} kWh/an · Abonnement ${centsToEur(annualSubCents).toFixed(2)} €/an + ${unitKwhSimulatedEur.toFixed(4)} €/kWh`,
    recommendedMonthlyCost: simulatedTargetMonthlyEur,
    annualSavings: annualDeltaVsObservedEur,
    switchDifficulty: "EASY",
    savingsBadgeText:
      annualDeltaVsObservedEur > 0
        ? `Simulation : +${annualDeltaVsObservedEur.toFixed(2)} €/an d’écart théorique`
        : `Simulation : mensualité actuelle déjà inférieure ou égale (${annualDeltaVsObservedEur.toFixed(2)} €/an)`,
    comparisonSource:
      "Simulation pédagogique sur hypothèses saisies — Grille TRV CRE / data.gouv.fr (Licence Ouverte Etalab 2.0)",
  };

  return {
    status: "SIMULATED",
    dataNature: "SIMULATION_PEDAGOGIQUE",
    assumptionsSummary: `Compteur ${input.powerKva} kVA (${input.tariffOption === "BASE" ? "Option Base" : "Option HP/HC"}), consommation déclarée de ${kwh} kWh/an, remise simulée de ${discount} % sur le prix du kWh TTC de référence.`,
    observedMonthlyAmountEur: centsToEur(observedMonthlyCents),
    observedAnnualCostEur: centsToEur(observedAnnualCents),
    referenceTrvAnnualCostEur: centsToEur(referenceTrvAnnualCents),
    referenceTrvMonthlyCostEur: centsToEur(referenceTrvMonthlyCents),
    simulatedTargetAnnualCostEur: centsToEur(simulatedTargetAnnualCents),
    simulatedTargetMonthlyCostEur: simulatedTargetMonthlyEur,
    annualDeltaVsObservedEur,
    monthlyDeltaVsObservedEur: centsToEur(monthlyDeltaVsObservedCents),
    annualDeltaVsTrvEur: centsToEur(annualDeltaVsTrvCents),
    unitKwhReferenceEur: Number(weightedRefKwhEur.toFixed(4)),
    unitKwhSimulatedEur,
    annualSubscriptionEur: centsToEur(annualSubCents),
    optimizationDto,
  };
}

export interface TelecomSimulationInput {
  detectedProviderLabel: string;
  observedMonthlyCostEur: number | null;
  targetMonthlyCostEur: number | null;
  terminationFeeEur: number | null;
  activationFeeEur: number | null;
}

export interface TelecomSimulationSuccessResult {
  status: "SIMULATED";
  dataNature: "SIMULATION_PEDAGOGIQUE";
  assumptionsSummary: string;
  observedMonthlyCostEur: number;
  observedAnnualCostEur: number;
  targetMonthlyCostEur: number;
  targetAnnualCostEur: number;
  grossMonthlySavingsEur: number;
  grossAnnualSavingsEur: number;
  totalSwitchingFeesEur: number;
  netFirstYearSavingsEur: number;
  breakEvenMonths: number | null;
  optimizationDto: SubscriptionOptimizationDto;
}

export type TelecomSimulationResult =
  | SimulationIncompleteResult
  | SimulationInvalidResult
  | TelecomSimulationSuccessResult;

/**
 * Simule le seuil de rentabilité d'un changement d'offre télécom en déduisant les frais fixes de transition.
 */
export function simulateTelecomComparison(
  input: TelecomSimulationInput,
): TelecomSimulationResult {
  const missingVariables: string[] = [];

  if (
    input.observedMonthlyCostEur === null ||
    Number.isNaN(input.observedMonthlyCostEur)
  ) {
    missingVariables.push("Mensualité actuelle observée (€/mois)");
  }
  if (
    input.targetMonthlyCostEur === null ||
    Number.isNaN(input.targetMonthlyCostEur)
  ) {
    missingVariables.push("Mensualité hors promo de l’offre cible (€/mois)");
  }
  if (
    input.terminationFeeEur === null ||
    Number.isNaN(input.terminationFeeEur)
  ) {
    missingVariables.push("Frais de résiliation de l’opérateur actuel (€)");
  }
  if (input.activationFeeEur === null || Number.isNaN(input.activationFeeEur)) {
    missingVariables.push("Frais de mise en service du nouvel opérateur (€)");
  }

  if (missingVariables.length > 0) {
    return {
      status: "INCOMPLETE_DATA",
      code: "MISSING_REQUIRED_VARIABLES",
      message:
        "Informations insuffisantes : le prélèvement « " +
        (input.detectedProviderLabel || "Opérateur Télécom") +
        " » ne précise ni l’éligibilité, ni le tarif cible hors promotion, ni les frais de résiliation/activation.",
      missingVariables,
    };
  }

  const currentMonthly = input.observedMonthlyCostEur!;
  const targetMonthly = input.targetMonthlyCostEur!;
  const terminationFee = input.terminationFeeEur!;
  const activationFee = input.activationFeeEur!;

  if (
    currentMonthly <= 0 ||
    targetMonthly <= 0 ||
    terminationFee < 0 ||
    activationFee < 0
  ) {
    return {
      status: "INVALID_INPUT",
      code: "INVALID_NUMERIC_VALUE",
      message:
        "Valeurs invalides : les mensualités doivent être strictement positives et les frais positifs ou nuls.",
    };
  }

  const currentMonthlyCents = eurToCents(currentMonthly);
  const targetMonthlyCents = eurToCents(targetMonthly);
  const terminationFeeCents = eurToCents(terminationFee);
  const activationFeeCents = eurToCents(activationFee);

  const grossMonthlySavingsCents = currentMonthlyCents - targetMonthlyCents;
  const grossAnnualSavingsCents = grossMonthlySavingsCents * 12;
  const totalSwitchingFeesCents = terminationFeeCents + activationFeeCents;
  const netFirstYearSavingsCents =
    grossAnnualSavingsCents - totalSwitchingFeesCents;

  const breakEvenMonths =
    grossMonthlySavingsCents > 0
      ? Number((totalSwitchingFeesCents / grossMonthlySavingsCents).toFixed(1))
      : null;

  const netFirstYearSavingsEur = centsToEur(netFirstYearSavingsCents);

  const optimizationDto: SubscriptionOptimizationDto = {
    id: "sim-telecom-fibre-s2",
    category: "TELECOM",
    detectedSubscriptionName: `${input.detectedProviderLabel} (observé : ${centsToEur(currentMonthlyCents).toFixed(2)} €/mois)`,
    currentMonthlyCost: centsToEur(currentMonthlyCents),
    recommendedProvider: "Simulation Offre Télécom Cible (saisie utilisateur)",
    recommendedPlanName: `Cible à ${centsToEur(targetMonthlyCents).toFixed(2)} €/mois (frais fixes ${centsToEur(totalSwitchingFeesCents).toFixed(2)} € déduits)`,
    recommendedMonthlyCost: centsToEur(targetMonthlyCents),
    annualSavings: netFirstYearSavingsEur,
    switchDifficulty: "MODERATE",
    savingsBadgeText:
      netFirstYearSavingsEur > 0
        ? `Simulation : +${netFirstYearSavingsEur.toFixed(2)} € nets la 1re année`
        : `Simulation : non rentable sur 12 mois (${netFirstYearSavingsEur.toFixed(2)} € après frais)`,
    comparisonSource:
      "Simulation pédagogique de seuil de rentabilité (méthodologie ARCEP — frais de résiliation et d’activation déduits)",
  };

  return {
    status: "SIMULATED",
    dataNature: "SIMULATION_PEDAGOGIQUE",
    assumptionsSummary: `Passage de ${centsToEur(currentMonthlyCents).toFixed(2)} €/mois à ${centsToEur(targetMonthlyCents).toFixed(2)} €/mois avec ${centsToEur(totalSwitchingFeesCents).toFixed(2)} € de frais fixes de transition (${centsToEur(terminationFeeCents).toFixed(2)} € résiliation + ${centsToEur(activationFeeCents).toFixed(2)} € activation).`,
    observedMonthlyCostEur: centsToEur(currentMonthlyCents),
    observedAnnualCostEur: centsToEur(currentMonthlyCents * 12),
    targetMonthlyCostEur: centsToEur(targetMonthlyCents),
    targetAnnualCostEur: centsToEur(targetMonthlyCents * 12),
    grossMonthlySavingsEur: centsToEur(grossMonthlySavingsCents),
    grossAnnualSavingsEur: centsToEur(grossAnnualSavingsCents),
    totalSwitchingFeesEur: centsToEur(totalSwitchingFeesCents),
    netFirstYearSavingsEur,
    breakEvenMonths,
    optimizationDto,
  };
}

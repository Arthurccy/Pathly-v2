import assert from "node:assert/strict";
import test from "node:test";
import {
  VERIFIED_TARIFF_SOURCES,
  simulateElectricityComparison,
  simulateTelecomComparison,
} from "./tariff-simulator.ts";
import robots from "../robots.ts";
import sitemap from "../sitemap.ts";

test("Énergie — Cas nominal recalculable à la main (6 kVA Base, 2 400 kWh/an, remise 10 %)", () => {
  const result = simulateElectricityComparison({
    detectedProviderLabel: "EDF Électricité",
    observedMonthlyAmountEur: 74.5,
    powerKva: 6,
    tariffOption: "BASE",
    annualConsumptionKwh: 2400,
    simulatedKwhDiscountPercent: 10,
  });

  // Oracle indépendant vérifié à la main :
  // Observé annuel = 74,50 * 12 = 894,00 €
  // TRV annuel = 152,16 + (2400 * 0,2516) = 152,16 + 603,84 = 756,00 €
  // Cible simulée (-10% kWh -> 0,2264 €/kWh) = 152,16 + (2400 * 0,2264) = 152,16 + 543,36 = 695,52 €
  // Écart vs observé = 894,00 - 695,52 = 198,48 €
  // Écart vs TRV = 756,00 - 695,52 = 60,48 €
  assert.equal(result.status, "SIMULATED");
  if (result.status === "SIMULATED") {
    assert.equal(result.observedAnnualCostEur, 894.0);
    assert.equal(result.referenceTrvAnnualCostEur, 756.0);
    assert.equal(result.simulatedTargetAnnualCostEur, 695.52);
    assert.equal(result.annualDeltaVsObservedEur, 198.48);
    assert.equal(result.monthlyDeltaVsObservedEur, 16.54);
    assert.equal(result.annualDeltaVsTrvEur, 60.48);
    assert.equal(result.optimizationDto.category, "ENERGY");
    assert.equal(result.optimizationDto.annualSavings, 198.48);
  }
});

test("Énergie — Cas limite : une ligne bancaire seule sans kVA ni kWh retourne INCOMPLETE_DATA", () => {
  const result = simulateElectricityComparison({
    detectedProviderLabel: "EDF Électricité",
    observedMonthlyAmountEur: 74.5,
    powerKva: null,
    tariffOption: null,
    annualConsumptionKwh: null,
    simulatedKwhDiscountPercent: 10,
  });

  assert.equal(result.status, "INCOMPLETE_DATA");
  if (result.status === "INCOMPLETE_DATA") {
    assert.equal(result.missingVariables.length, 3);
    assert.ok(result.message.includes("Informations insuffisantes"));
  }
});

test("Énergie — Cas d’erreur : consommation nulle ou négative refusée avec INVALID_INPUT", () => {
  const result = simulateElectricityComparison({
    detectedProviderLabel: "EDF Électricité",
    observedMonthlyAmountEur: 74.5,
    powerKva: 6,
    tariffOption: "BASE",
    annualConsumptionKwh: 0,
    simulatedKwhDiscountPercent: 10,
  });

  assert.equal(result.status, "INVALID_INPUT");
});

test("Télécom — Cas nominal avec amortissement des frais fixes de changement (98 €)", () => {
  const result = simulateTelecomComparison({
    detectedProviderLabel: "Forfait Fibre Freebox",
    observedMonthlyCostEur: 49.99,
    targetMonthlyCostEur: 29.99,
    terminationFeeEur: 49.0,
    activationFeeEur: 49.0,
  });

  // Oracle indépendant :
  // Économie brute = (49,99 - 29,99) * 12 = 240,00 €/an
  // Frais fixes = 49 + 49 = 98,00 €
  // Gain net 1re année = 240,00 - 98,00 = 142,00 €
  // Seuil de rentabilité = 98 / 20 = 4,9 mois
  assert.equal(result.status, "SIMULATED");
  if (result.status === "SIMULATED") {
    assert.equal(result.grossMonthlySavingsEur, 20.0);
    assert.equal(result.grossAnnualSavingsEur, 240.0);
    assert.equal(result.totalSwitchingFeesEur, 98.0);
    assert.equal(result.netFirstYearSavingsEur, 142.0);
    assert.equal(result.breakEvenMonths, 4.9);
  }
});

test("Sources et SEO public — Sources documentées et exclusion des routes privées dans robots/sitemap", () => {
  assert.equal(VERIFIED_TARIFF_SOURCES.length, 3);
  for (const src of VERIFIED_TARIFF_SOURCES) {
    assert.equal(src.exploitableAutomaticallyFromBankLine, false);
    assert.ok(src.url.startsWith("https://"));
  }

  const sitemapEntries = sitemap();
  assert.equal(sitemapEntries.length, 1);
  assert.equal(sitemapEntries[0]?.url, "https://pathly.app/landing");

  const robotsConfig = robots();
  const rules = Array.isArray(robotsConfig.rules)
    ? robotsConfig.rules[0]
    : robotsConfig.rules;
  assert.deepEqual(rules?.allow, ["/landing"]);
  assert.deepEqual(rules?.disallow, ["/api/", "/connexion", "/parametres"]);
});

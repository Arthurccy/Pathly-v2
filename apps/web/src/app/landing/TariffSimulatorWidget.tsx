"use client";

import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  FileWarning,
  Info,
  SlidersHorizontal,
  Zap,
  Wifi,
} from "lucide-react";
import {
  ElectricityTariffOption,
  PowerKva,
  simulateElectricityComparison,
  simulateTelecomComparison,
} from "./tariff-simulator";

type SimulatorTab = "ENERGY" | "TELECOM";

export default function TariffSimulatorWidget(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<SimulatorTab>("ENERGY");

  // État Énergie — Par défaut sur l'exemple de référence vérifié (6 kVA, Base, 2400 kWh/an)
  const [energyProviderLabel, setEnergyProviderLabel] =
    useState<string>("EDF Électricité");
  const [energyObservedMonthly, setEnergyObservedMonthly] =
    useState<string>("74.50");
  const [energyPowerKva, setEnergyPowerKva] = useState<string>("6");
  const [energyTariffOption, setEnergyTariffOption] = useState<string>("BASE");
  const [energyAnnualKwh, setEnergyAnnualKwh] = useState<string>("2400");
  const [energyDiscountPct, setEnergyDiscountPct] = useState<string>("10");

  // État Télécom — Par défaut sur l'exemple de référence vérifié (49,99 € -> 29,99 € avec 98 € de frais)
  const [telecomProviderLabel, setTelecomProviderLabel] = useState<string>(
    "Forfait Fibre Freebox",
  );
  const [telecomObservedMonthly, setTelecomObservedMonthly] =
    useState<string>("49.99");
  const [telecomTargetMonthly, setTelecomTargetMonthly] =
    useState<string>("29.99");
  const [telecomTerminationFee, setTelecomTerminationFee] =
    useState<string>("49.00");
  const [telecomActivationFee, setTelecomActivationFee] =
    useState<string>("49.00");

  // Scénarios de démonstration rapides (P0 / P1 : cas nominal et cas d'insuffisance des informations)
  const applyPresetBankLineOnly = () => {
    setActiveTab("ENERGY");
    setEnergyProviderLabel("EDF Électricité (Ligne CSV importée seule)");
    setEnergyObservedMonthly("74.50");
    setEnergyPowerKva("");
    setEnergyTariffOption("");
    setEnergyAnnualKwh("");
    setEnergyDiscountPct("10");
  };

  const applyPresetEnergyReference = () => {
    setActiveTab("ENERGY");
    setEnergyProviderLabel("EDF Électricité");
    setEnergyObservedMonthly("74.50");
    setEnergyPowerKva("6");
    setEnergyTariffOption("BASE");
    setEnergyAnnualKwh("2400");
    setEnergyDiscountPct("10");
  };

  const applyPresetTelecomReference = () => {
    setActiveTab("TELECOM");
    setTelecomProviderLabel("Forfait Fibre Freebox");
    setTelecomObservedMonthly("49.99");
    setTelecomTargetMonthly("29.99");
    setTelecomTerminationFee("49.00");
    setTelecomActivationFee("49.00");
  };

  const energyResult = useMemo(() => {
    const parsedMonthly =
      energyObservedMonthly.trim() === ""
        ? null
        : Number(energyObservedMonthly);
    const parsedKva =
      energyPowerKva === "3" ||
      energyPowerKva === "6" ||
      energyPowerKva === "9" ||
      energyPowerKva === "12"
        ? (Number(energyPowerKva) as PowerKva)
        : null;
    const parsedOption =
      energyTariffOption === "BASE" || energyTariffOption === "HP_HC"
        ? (energyTariffOption as ElectricityTariffOption)
        : null;
    const parsedKwh =
      energyAnnualKwh.trim() === "" ? null : Number(energyAnnualKwh);
    const parsedDiscount =
      energyDiscountPct.trim() === "" ? 0 : Number(energyDiscountPct);

    return simulateElectricityComparison({
      detectedProviderLabel: energyProviderLabel,
      observedMonthlyAmountEur: parsedMonthly,
      powerKva: parsedKva,
      tariffOption: parsedOption,
      annualConsumptionKwh: parsedKwh,
      simulatedKwhDiscountPercent: parsedDiscount,
    });
  }, [
    energyProviderLabel,
    energyObservedMonthly,
    energyPowerKva,
    energyTariffOption,
    energyAnnualKwh,
    energyDiscountPct,
  ]);

  const telecomResult = useMemo(() => {
    const parsedCurrent =
      telecomObservedMonthly.trim() === ""
        ? null
        : Number(telecomObservedMonthly);
    const parsedTarget =
      telecomTargetMonthly.trim() === "" ? null : Number(telecomTargetMonthly);
    const parsedTermination =
      telecomTerminationFee.trim() === ""
        ? null
        : Number(telecomTerminationFee);
    const parsedActivation =
      telecomActivationFee.trim() === "" ? null : Number(telecomActivationFee);

    return simulateTelecomComparison({
      detectedProviderLabel: telecomProviderLabel,
      observedMonthlyCostEur: parsedCurrent,
      targetMonthlyCostEur: parsedTarget,
      terminationFeeEur: parsedTermination,
      activationFeeEur: parsedActivation,
    });
  }, [
    telecomProviderLabel,
    telecomObservedMonthly,
    telecomTargetMonthly,
    telecomTerminationFee,
    telecomActivationFee,
  ]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-6">
      {/* En-tête et sélecteur de scénarios de vérification */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Calculator className="w-3.5 h-3.5" />
            <span>
              Simulateur Pédagogique S2 — Données & Hypothèses Explicites
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Vérifier un écart tarifaire sans promesse trompeuse
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Testez les exemples de référence du contrat S2 ou vérifiez le
            blocage lorsque seul le libellé bancaire est connu.
          </p>
        </div>

        {/* Boutons de scénarios prêts à tester */}
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Scénarios de test rapide"
        >
          <button
            type="button"
            onClick={applyPresetEnergyReference}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            1. Exemple Énergie vérifié (6 kVA · 2 400 kWh)
          </button>
          <button
            type="button"
            onClick={applyPresetBankLineOnly}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            2. Cas limite : Ligne bancaire seule (Incomplet)
          </button>
          <button
            type="button"
            onClick={applyPresetTelecomReference}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            3. Exemple Télécom (Frais de transition inclus)
          </button>
        </div>
      </div>

      {/* Onglets Énergie / Télécom */}
      <div
        className="flex items-center gap-3"
        role="tablist"
        aria-label="Catégorie de simulation"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "ENERGY"}
          onClick={() => setActiveTab("ENERGY")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
            activeTab === "ENERGY"
              ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md"
              : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Électricité (Référence TRV CRE / data.gouv.fr)</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "TELECOM"}
          onClick={() => setActiveTab("TELECOM")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
            activeTab === "TELECOM"
              ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md"
              : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800"
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>Télécom Fibre (Seuil de rentabilité)</span>
        </button>
      </div>

      {activeTab === "ENERGY" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Formulaire Énergie */}
          <div className="lg:col-span-6 space-y-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>Variables d’entrée (Observées vs Déclaratives)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="energy-label"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  Libellé observé (relevé CSV)
                </label>
                <input
                  id="energy-label"
                  type="text"
                  value={energyProviderLabel}
                  onChange={(e) => setEnergyProviderLabel(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label
                  htmlFor="energy-monthly"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  Mensualité observée (€/mois)
                </label>
                <input
                  id="energy-monthly"
                  type="number"
                  step="0.01"
                  value={energyObservedMonthly}
                  onChange={(e) => setEnergyObservedMonthly(e.target.value)}
                  placeholder="Ex: 74.50"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label
                  htmlFor="energy-kva"
                  className="block text-xs font-semibold text-amber-300 mb-1"
                >
                  Puissance compteur (kVA — requis)
                </label>
                <select
                  id="energy-kva"
                  value={energyPowerKva}
                  onChange={(e) => setEnergyPowerKva(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">-- Non renseigné (Relevé seul) --</option>
                  <option value="3">3 kVA (Petit logement)</option>
                  <option value="6">
                    6 kVA (Standard — 152,16 €/an en Base)
                  </option>
                  <option value="9">
                    9 kVA (Grand logement / chauffage élec.)
                  </option>
                  <option value="12">12 kVA (Maison équipée)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="energy-option"
                  className="block text-xs font-semibold text-amber-300 mb-1"
                >
                  Option tarifaire (requis)
                </label>
                <select
                  id="energy-option"
                  value={energyTariffOption}
                  onChange={(e) => setEnergyTariffOption(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">-- Non renseignée --</option>
                  <option value="BASE">Option Base (0,2516 €/kWh réf.)</option>
                  <option value="HP_HC">Heures Pleines / Heures Creuses</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="energy-kwh"
                  className="block text-xs font-semibold text-amber-300 mb-1"
                >
                  Consommation annuelle (kWh/an — requis)
                </label>
                <input
                  id="energy-kwh"
                  type="number"
                  step="50"
                  value={energyAnnualKwh}
                  onChange={(e) => setEnergyAnnualKwh(e.target.value)}
                  placeholder="Non disponible sur le CSV bancaire"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label
                  htmlFor="energy-discount"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  Hypothèse de remise sur kWh (%)
                </label>
                <input
                  id="energy-discount"
                  type="number"
                  min="0"
                  max="30"
                  step="1"
                  value={energyDiscountPct}
                  onChange={(e) => setEnergyDiscountPct(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Les champs en ambre ne figurent jamais dans un fichier CSV ou OFX
              bancaire. Sans eux, le simulateur bloque toute promesse
              d’économie.
            </p>
          </div>

          {/* Résultat Énergie */}
          <div className="lg:col-span-6 space-y-4">
            {energyResult.status === "INCOMPLETE_DATA" && (
              <div
                role="alert"
                className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-3 text-amber-100"
              >
                <div className="flex items-center gap-2.5 text-amber-300 font-extrabold text-base">
                  <FileWarning className="w-5 h-5 shrink-0" />
                  <span>
                    Informations insuffisantes pour calculer une économie
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                  {energyResult.message}
                </p>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Variables manquantes à compléter :
                  </p>
                  <ul className="list-disc list-inside text-xs space-y-1 text-amber-200">
                    {energyResult.missingVariables.map((v) => (
                      <li key={v}>{v}</li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={applyPresetEnergyReference}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition"
                  >
                    Renseigner les hypothèses de l’exemple de référence (6 kVA ·
                    2 400 kWh)
                  </button>
                </div>
              </div>
            )}

            {energyResult.status === "INVALID_INPUT" && (
              <div
                role="alert"
                className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5 space-y-2 text-rose-200"
              >
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>Paramètres hors bornes</span>
                </div>
                <p className="text-xs sm:text-sm">{energyResult.message}</p>
              </div>
            )}

            {energyResult.status === "SIMULATED" && (
              <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/90 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Résultat recalculable (Simulation pédagogique)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Contrat : SubscriptionOptimizationDto
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[11px] font-bold uppercase text-slate-400">
                      1. Donnée observée
                    </p>
                    <p className="text-lg font-black text-white mt-0.5">
                      {energyResult.observedAnnualCostEur.toFixed(2)} €/an
                    </p>
                    <p className="text-xs text-slate-400">
                      ({energyResult.observedMonthlyAmountEur.toFixed(2)} €/mois
                      prélevés)
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[11px] font-bold uppercase text-slate-400">
                      2. Barème TRV réf.
                    </p>
                    <p className="text-lg font-black text-slate-200 mt-0.5">
                      {energyResult.referenceTrvAnnualCostEur.toFixed(2)} €/an
                    </p>
                    <p className="text-xs text-slate-400">
                      ({energyResult.referenceTrvMonthlyCostEur.toFixed(2)}{" "}
                      €/mois à {energyResult.unitKwhReferenceEur} €/kWh)
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-[11px] font-bold uppercase text-emerald-300">
                      3. Cible simulée
                    </p>
                    <p className="text-lg font-black text-emerald-300 mt-0.5">
                      {energyResult.simulatedTargetAnnualCostEur.toFixed(2)}{" "}
                      €/an
                    </p>
                    <p className="text-xs text-emerald-200/80">
                      ({energyResult.simulatedTargetMonthlyCostEur.toFixed(2)}{" "}
                      €/mois à {energyResult.unitKwhSimulatedEur} €/kWh)
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <p className="font-bold text-slate-200">
                    Détail de la formule vérifiable à la main :
                  </p>
                  <p className="font-mono text-slate-300">
                    Abonnement fixe (
                    {energyResult.annualSubscriptionEur.toFixed(2)} €/an) +
                    Consommation ({energyAnnualKwh} kWh ×{" "}
                    {energyResult.unitKwhSimulatedEur} €/kWh) ={" "}
                    <strong className="text-emerald-300">
                      {energyResult.simulatedTargetAnnualCostEur.toFixed(2)}{" "}
                      €/an
                    </strong>
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <span className="text-slate-300">
                      Écart vs mensualités observées :{" "}
                      <strong className="text-emerald-400">
                        {energyResult.annualDeltaVsObservedEur >= 0 ? "+" : ""}
                        {energyResult.annualDeltaVsObservedEur.toFixed(2)} €/an
                      </strong>{" "}
                      ({energyResult.monthlyDeltaVsObservedEur.toFixed(2)}{" "}
                      €/mois)
                    </span>
                    <span className="text-slate-400">
                      Écart vs TRV :{" "}
                      <strong className="text-slate-200">
                        +{energyResult.annualDeltaVsTrvEur.toFixed(2)} €/an
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-[11px] text-slate-400">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Hypothèses retenues :</strong>{" "}
                    {energyResult.assumptionsSummary} Une mensualité bancaire
                    élevée peut aussi refléter un échéancier surestimé
                    régularisé en fin d’année.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Formulaire Télécom */}
          <div className="lg:col-span-6 space-y-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>
                Variables Télécom (Avec frais de résiliation et d’activation)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="telecom-label"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  Libellé observé (relevé CSV)
                </label>
                <input
                  id="telecom-label"
                  type="text"
                  value={telecomProviderLabel}
                  onChange={(e) => setTelecomProviderLabel(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label
                  htmlFor="telecom-current"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  Mensualité actuelle observée (€/mois)
                </label>
                <input
                  id="telecom-current"
                  type="number"
                  step="0.01"
                  value={telecomObservedMonthly}
                  onChange={(e) => setTelecomObservedMonthly(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label
                  htmlFor="telecom-target"
                  className="block text-xs font-semibold text-amber-300 mb-1"
                >
                  Offre cible hors promo (€/mois — requis)
                </label>
                <input
                  id="telecom-target"
                  type="number"
                  step="0.01"
                  value={telecomTargetMonthly}
                  onChange={(e) => setTelecomTargetMonthly(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label
                  htmlFor="telecom-termination"
                  className="block text-xs font-semibold text-amber-300 mb-1"
                >
                  Frais de résiliation (€ — requis)
                </label>
                <input
                  id="telecom-termination"
                  type="number"
                  step="1"
                  value={telecomTerminationFee}
                  onChange={(e) => setTelecomTerminationFee(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label
                  htmlFor="telecom-activation"
                  className="block text-xs font-semibold text-amber-300 mb-1"
                >
                  Frais de mise en service (€ — requis)
                </label>
                <input
                  id="telecom-activation"
                  type="number"
                  step="1"
                  value={telecomActivationFee}
                  onChange={(e) => setTelecomActivationFee(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Résultat Télécom */}
          <div className="lg:col-span-6 space-y-4">
            {telecomResult.status === "INCOMPLETE_DATA" && (
              <div
                role="alert"
                className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-3 text-amber-100"
              >
                <div className="flex items-center gap-2.5 text-amber-300 font-extrabold text-base">
                  <FileWarning className="w-5 h-5 shrink-0" />
                  <span>Informations insuffisantes pour le calcul télécom</span>
                </div>
                <p className="text-xs sm:text-sm">{telecomResult.message}</p>
                <ul className="list-disc list-inside text-xs space-y-1 text-amber-200">
                  {telecomResult.missingVariables.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </div>
            )}

            {telecomResult.status === "INVALID_INPUT" && (
              <div
                role="alert"
                className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5 space-y-2 text-rose-200"
              >
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>Valeurs invalides</span>
                </div>
                <p className="text-xs sm:text-sm">{telecomResult.message}</p>
              </div>
            )}

            {telecomResult.status === "SIMULATED" && (
              <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/90 p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Seuil de rentabilité calculé (frais déduits)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[11px] font-bold uppercase text-slate-400">
                      Économie brute / an
                    </p>
                    <p className="text-lg font-black text-white mt-0.5">
                      {telecomResult.grossAnnualSavingsEur.toFixed(2)} €
                    </p>
                    <p className="text-xs text-slate-400">
                      ({telecomResult.grossMonthlySavingsEur.toFixed(2)} €/mois)
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[11px] font-bold uppercase text-rose-300">
                      Frais fixes changement
                    </p>
                    <p className="text-lg font-black text-rose-300 mt-0.5">
                      -{telecomResult.totalSwitchingFeesEur.toFixed(2)} €
                    </p>
                    <p className="text-xs text-slate-400">
                      Résiliation + activation
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-[11px] font-bold uppercase text-emerald-300">
                      Gain net Année 1
                    </p>
                    <p className="text-lg font-black text-emerald-300 mt-0.5">
                      {telecomResult.netFirstYearSavingsEur >= 0 ? "+" : ""}
                      {telecomResult.netFirstYearSavingsEur.toFixed(2)} €
                    </p>
                    <p className="text-xs text-emerald-200/80">
                      {telecomResult.breakEvenMonths !== null
                        ? `Rentable dès ${telecomResult.breakEvenMonths} mois`
                        : "Non rentable"}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
                  <p className="font-bold text-slate-200">
                    Vérification manuelle :
                  </p>
                  <p className="font-mono text-slate-300">
                    12 × ({telecomResult.observedMonthlyCostEur.toFixed(2)} € −{" "}
                    {telecomResult.targetMonthlyCostEur.toFixed(2)} €) −{" "}
                    {telecomResult.totalSwitchingFeesEur.toFixed(2)} € ={" "}
                    <strong className="text-emerald-300">
                      {telecomResult.netFirstYearSavingsEur.toFixed(2)} € nets
                      sur 12 mois
                    </strong>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

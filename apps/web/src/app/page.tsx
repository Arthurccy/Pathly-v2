'use client';

import React, { useState, useMemo } from 'react';
import {
  MOCK_ACCOUNTS,
  MOCK_MONTHS,
  MOCK_TRANSACTIONS,
  formatCurrency,
  getTotalPatrimoine,
  Transaction,
} from '@/lib/mock-data';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  CreditCard,
  Calendar,
  Search,
  Sparkles,
  AlertCircle,
  Building2,
  PlusCircle,
  ArrowRightLeft,
  CheckCircle2,
  Moon,
  Sun,
  FileSpreadsheet,
  ShieldCheck,
  Info,
} from 'lucide-react';

export default function DashboardPage(): React.JSX.Element {
  // Toggle Mode Sombre (Dark) / Mode Clair (Light)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false); // Par défaut en White Mode

  // Mois sélectionné : par défaut le mois en cours (Octobre 2026)
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Transactions dynamiques
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [simulationFeedback, setSimulationFeedback] = useState<string | null>(null);

  // Données du mois sélectionné
  const currentMonthInfo = useMemo(() => {
    return MOCK_MONTHS.find((m) => m.monthKey === selectedMonth) || MOCK_MONTHS[0];
  }, [selectedMonth]);

  // Filtrage des transactions pour l'affichage
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchMonth = selectedMonth === 'ALL' || t.month === selectedMonth;
      const matchSearch =
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
      return matchMonth && matchSearch && matchCategory;
    });
  }, [transactions, selectedMonth, searchQuery, selectedCategory]);

  // Catégories uniques pour le filtre
  const categories = useMemo(() => {
    const set = new Set(transactions.map((t) => t.category));
    return ['ALL', ...Array.from(set)];
  }, [transactions]);

  // Simulation d'une dépense manuelle
  const handleSimulateExpense = (amount: number, description: string, category: Transaction['category']) => {
    const newTx: Transaction = {
      id: `tx-sim-${Date.now()}`,
      accountId: 'acc-checking',
      date: new Date().toISOString().split('T')[0],
      month: selectedMonth === 'ALL' ? '2026-10' : selectedMonth,
      amount: -amount,
      description: `[Saisie Manuelle] ${description}`,
      category,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setSimulationFeedback(`Dépense manuelle de ${formatCurrency(amount)} ajoutée avec succès !`);
    setTimeout(() => setSimulationFeedback(null), 4000);
  };

  // Simulation d'un virement d'équilibrage manuel
  const handleSimulateTransfer = () => {
    const transferAmount = 300;
    const now = new Date().toISOString().split('T')[0];
    const month = selectedMonth === 'ALL' ? '2026-10' : selectedMonth;

    const txOut: Transaction = {
      id: `tx-sim-out-${Date.now()}`,
      accountId: 'acc-savings',
      date: now,
      month,
      amount: -transferAmount,
      description: '[Virement Manuel] Vers Compte Courant',
      category: 'Virement Interne',
      isTransfer: true,
    };

    const txIn: Transaction = {
      id: `tx-sim-in-${Date.now()}`,
      accountId: 'acc-checking',
      date: now,
      month,
      amount: transferAmount,
      description: '[Virement Manuel] Reçu depuis Livret A',
      category: 'Virement Interne',
      isTransfer: true,
    };

    setTransactions((prev) => [txIn, txOut, ...prev]);
    setSimulationFeedback(`Arbitrage manuel de ${formatCurrency(transferAmount)} exécuté entre Livret A et Compte Courant.`);
    setTimeout(() => setSimulationFeedback(null), 4000);
  };

  // Simulation de l'import CSV / OFX
  const handleSimulateImport = () => {
    setSimulationFeedback('Moteur d’import intelligent prêt : analyse des formats BoursoBank, BNP, CA et Revolut (CSV/OFX) sans doublon.');
    setTimeout(() => setSimulationFeedback(null), 5000);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDarkMode ? 'bg-[#070b14] text-slate-100' : 'bg-slate-100/90 text-slate-900'
      }`}
    >
      {/* ==================== BARRE DE NAVIGATION SUPÉRIEURE ==================== */}
      <header
        className={`border-b sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors duration-200 ${
          isDarkMode
            ? 'border-slate-800 bg-[#090e1a]/95 backdrop-blur-md text-white'
            : 'border-slate-200 bg-white/95 backdrop-blur-md text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-black text-xl shadow-lg shadow-emerald-500/25">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-extrabold text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Pathly
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                100% MANUEL & IMPORTS
              </span>
            </div>
            <p className={`text-xs font-medium hidden sm:block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Gestion Financière Souveraine • Zéro API Bancaire Payante
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* BOUTON TOGGLE JOUR / NUIT */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border shadow-sm ${
              isDarkMode
                ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            title="Basculer entre Mode Clair et Mode Sombre"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span>Mode Jour</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>Mode Nuit</span>
              </>
            )}
          </button>

          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
              isDarkMode
                ? 'bg-slate-800/90 border-slate-700 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Données privées locales (Sans API externe)
          </div>

          <div className="flex items-center gap-2.5 pl-1">
            <div
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow-sm ${
                isDarkMode
                  ? 'bg-slate-800 border-emerald-500/40 text-slate-100'
                  : 'bg-emerald-50 border-emerald-500 text-emerald-800'
              }`}
            >
              AC
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Arthur Courchay</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Compte Démo (5 mois)</p>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== CORPS DU DASHBOARD ==================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* ==================== BANNIÈRE EXPLICATIVE : CHOIX TECHNIQUE & MANUEL ==================== */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 transition-colors shadow-sm ${
            isDarkMode
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-amber-50/80 border-amber-300 text-amber-900'
          }`}
        >
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
            <p className="font-bold">
              Positionnement Technique de Pathly V2 : Gestion Manuelle & Import de Relevés
            </p>
            <p className={`${isDarkMode ? 'text-amber-200/90' : 'text-amber-800'}`}>
              Après étude approfondie de l’écosystème Open Banking (DSP2 / Powens), les APIs d'agrégation bancaire automatique se sont avérées inaccessibles et financièrement prohibitives. 
              <strong> Pathly V2 assume donc un modèle 100% manuel et souverain :</strong> aucune connexion bancaire automatique, pas de partage de vos identifiants bancaires avec des tiers, mais un <strong>moteur d'import intelligent de vos exports bancaires (CSV & OFX natifs BoursoBank, BNP, Crédit Agricole, Revolut...)</strong> pour alimenter vos tableaux et vos prédictions en toute sécurité.
            </p>
          </div>
        </div>

        {/* BANNER NOTIFICATION SIMULATION */}
        {simulationFeedback && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-sm font-semibold flex items-center gap-3 shadow-md animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{simulationFeedback}</span>
          </div>
        )}

        {/* ==================== SÉLECTEUR DE MOIS HISTORIQUE & ACTIONS ==================== */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl border transition-colors shadow-sm ${
            isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 py-0.5">
            <span
              className={`text-xs font-bold px-2 flex items-center gap-1.5 shrink-0 uppercase tracking-wider ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-500" />
              Mois :
            </span>
            {MOCK_MONTHS.map((m) => {
              const isSelected = selectedMonth === m.monthKey;
              return (
                <button
                  key={m.monthKey}
                  onClick={() => setSelectedMonth(m.monthKey)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/25 scale-[1.02]'
                      : isDarkMode
                      ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-black'
                  }`}
                >
                  {m.monthLabel.split(' ')[0]}
                  {m.netCashFlow > 0 ? (
                    <span className="ml-1.5 text-[11px]">🟢</span>
                  ) : (
                    <span className="ml-1.5 text-[11px]">🔴</span>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => setSelectedMonth('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                selectedMonth === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/25 scale-[1.02]'
                  : isDarkMode
                  ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-black'
              }`}
            >
              Vue Globale (5 mois)
            </button>
          </div>

          {/* BOUTONS D'ACTIONS : IMPORTS ET SAISIES MANUELLES */}
          <div className="flex flex-wrap items-center gap-2 px-1">
            <button
              onClick={handleSimulateImport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
              title="Importer un fichier de relevé bancaire (CSV ou OFX)"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Importer Relevé (CSV/OFX)</span>
            </button>
            <button
              onClick={() => handleSimulateExpense(45.5, 'Courses Express Monoprix', 'Alimentation')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border shadow-sm ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-600'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>+ Saisie Dépense</span>
            </button>
            <button
              onClick={handleSimulateTransfer}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border shadow-sm ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-600'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
              <span>Virement Manuel (+300€)</span>
            </button>
          </div>
        </div>

        {/* ==================== CARTE DE CONTEXTE INTELLIGENTE (AI ADVISOR) ==================== */}
        <div
          className={`p-5 rounded-2xl border flex items-start sm:items-center gap-4 shadow-sm transition-colors ${
            isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1 flex-1 text-sm">
            <div className="flex items-center gap-2">
              <span className={`font-extrabold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Analyse de Trésorerie • {currentMonthInfo.monthLabel}
              </span>
              {currentMonthInfo.netCashFlow >= 0 ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                  Mois Excédentaire
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold border border-rose-500/30 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Mois Déficitaire
                </span>
              )}
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {currentMonthInfo.story}
            </p>
          </div>
        </div>

        {/* ==================== BANDEAU DE KPIS FINANCIERS ==================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* PATRIMOINE GLOBAL */}
          <div
            className={`p-5 rounded-2xl border shadow-sm space-y-2 transition-colors ${
              isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-200'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span>Patrimoine Global Net</span>
              <Wallet className="w-4 h-4 text-emerald-500" />
            </div>
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {formatCurrency(getTotalPatrimoine())}
            </div>
            <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Total consolidé de vos 4 comptes
            </p>
          </div>

          {/* REVENUS DU MOIS */}
          <div
            className={`p-5 rounded-2xl border shadow-sm space-y-2 transition-colors ${
              isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-200'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span>Revenus Encaissés</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(currentMonthInfo.totalIncome)}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Salaires et versements saisis</p>
          </div>

          {/* DÉPENSES DU MOIS */}
          <div
            className={`p-5 rounded-2xl border shadow-sm space-y-2 transition-colors ${
              isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-200'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span>Dépenses Réalisées</span>
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-rose-600 dark:text-rose-400">
              -{formatCurrency(currentMonthInfo.totalExpenses)}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Charges fixes + variables</p>
          </div>

          {/* CASHFLOW NET */}
          <div
            className={`p-5 rounded-2xl border shadow-sm space-y-2 transition-colors ${
              isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-200'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span>Cash-Flow Net</span>
              {currentMonthInfo.netCashFlow >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              ) : (
                <ArrowDownLeft className="w-4 h-4 text-rose-500" />
              )}
            </div>
            <div
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                currentMonthInfo.netCashFlow >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {currentMonthInfo.netCashFlow >= 0 ? '+' : ''}
              {formatCurrency(currentMonthInfo.netCashFlow)}
            </div>
            <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Taux d'épargne :{' '}
              <strong
                className={
                  currentMonthInfo.savingsRate >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }
              >
                {currentMonthInfo.savingsRate}%
              </strong>
            </p>
          </div>
        </div>

        {/* ==================== GRILLE DES COMPTES BANCAIRES ==================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Building2 className="w-5 h-5 text-emerald-500" />
              Mes Comptes Suivis (4) — Gestion Manuelle & Imports
            </h2>
            <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Alimenté par Saisie Manuelle et Fichiers CSV / OFX
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_ACCOUNTS.map((acc) => {
              const pctOfTotal = ((acc.balance / getTotalPatrimoine()) * 100).toFixed(1);
              return (
                <div
                  key={acc.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 shadow-sm ${
                    isDarkMode
                      ? 'bg-[#0f172a] border-slate-700 hover:border-slate-500'
                      : 'bg-white border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black tracking-wider uppercase ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {acc.institution}
                    </span>
                    <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: acc.color }}></span>
                  </div>

                  <div className="space-y-1">
                    <h3 className={`font-bold text-sm truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {acc.name}
                    </h3>
                    <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {formatCurrency(acc.balance)}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className={`flex items-center justify-between text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>{acc.ibanMasked}</span>
                      <span>{pctOfTotal}%</span>
                    </div>
                    {/* BARRE DE PROGRESSION VISUELLE */}
                    <div className={`w-full h-2 rounded-full overflow-hidden border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pctOfTotal}%`,
                          backgroundColor: acc.color,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================== HISTORIQUE VISUEL DES 5 MOIS (CASHFLOW COMPARISON) ==================== */}
        <div
          className={`p-6 rounded-2xl border space-y-4 shadow-sm transition-colors ${
            isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <PiggyBank className="w-5 h-5 text-emerald-500" />
                Évolution du Cash-Flow sur 5 Mois (Juin — Octobre 2026)
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Visualisation des mois positifs (épargne) vs mois de vacances/déficit (arbitrage Livret A)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 shadow-sm"></span> Revenus
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <span className="w-3.5 h-3.5 rounded-sm bg-rose-500 shadow-sm"></span> Dépenses
              </span>
            </div>
          </div>

          {/* GRAPHIQUE COMPARATIF EN BARRES */}
          <div className={`grid grid-cols-5 gap-2 sm:gap-6 pt-4 items-end h-44 border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            {[...MOCK_MONTHS].reverse().map((m) => {
              const maxVal = 4000;
              const incomeHeight = `${(m.totalIncome / maxVal) * 100}%`;
              const expenseHeight = `${(m.totalExpenses / maxVal) * 100}%`;
              const isCurrent = m.monthKey === selectedMonth;

              return (
                <div
                  key={m.monthKey}
                  onClick={() => setSelectedMonth(m.monthKey)}
                  className={`flex flex-col items-center gap-2 h-full justify-end cursor-pointer group p-2.5 rounded-xl transition ${
                    isCurrent
                      ? isDarkMode
                        ? 'bg-slate-800 ring-2 ring-emerald-500 shadow-lg'
                        : 'bg-emerald-50 ring-2 ring-emerald-500 shadow-sm'
                      : isDarkMode
                      ? 'hover:bg-slate-800/60'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-end gap-1.5 h-32 w-full justify-center">
                    {/* BARRE REVENU */}
                    <div
                      className="w-3.5 sm:w-7 bg-emerald-500 rounded-t-md transition-all group-hover:brightness-110 shadow-sm"
                      style={{ height: incomeHeight }}
                      title={`Revenus: ${formatCurrency(m.totalIncome)}`}
                    ></div>
                    {/* BARRE DÉPENSE */}
                    <div
                      className="w-3.5 sm:w-7 bg-rose-500 rounded-t-md transition-all group-hover:brightness-110 shadow-sm"
                      style={{ height: expenseHeight }}
                      title={`Dépenses: ${formatCurrency(m.totalExpenses)}`}
                    ></div>
                  </div>
                  <span
                    className={`text-xs font-bold truncate ${
                      isCurrent
                        ? 'text-emerald-600 dark:text-emerald-400 scale-105'
                        : isDarkMode
                        ? 'text-slate-400'
                        : 'text-slate-600'
                    }`}
                  >
                    {m.monthLabel.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================== TABLEAU DES TRANSACTIONS DÉTAILLÉES ==================== */}
        <div
          className={`p-6 rounded-2xl border space-y-4 shadow-sm transition-colors ${
            isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <CreditCard className="w-5 h-5 text-emerald-500" />
                Opérations Financières (Imports & Saisies Manuelles)
              </h2>
              <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {filteredTransactions.length} transaction(s) affichée(s)
              </p>
            </div>

            {/* BARRE DE RECHERCHE ET FILTRE */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher une opération..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 w-full sm:w-60 shadow-inner ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:border-emerald-500 shadow-inner ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-600 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    {cat === 'ALL' ? 'Toutes catégories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LISTE DES TRANSACTIONS */}
          <div className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {filteredTransactions.length === 0 ? (
              <div className={`py-12 text-center text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Aucune transaction ne correspond à vos filtres.
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const isPositive = tx.amount > 0;
                const isInternalTransfer = tx.isTransfer || tx.category === 'Virement Interne';

                return (
                  <div
                    key={tx.id}
                    className={`py-3.5 flex items-center justify-between gap-4 px-3 rounded-xl transition ${
                      isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* ICÔNE DE CATÉGORIE */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                          isInternalTransfer
                            ? isDarkMode
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                              : 'bg-blue-50 text-blue-600 border border-blue-200'
                            : isPositive
                            ? isDarkMode
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : isDarkMode
                            ? 'bg-slate-800 text-slate-200 border border-slate-600'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isInternalTransfer ? (
                          <ArrowRightLeft className="w-4 h-4" />
                        ) : isPositive ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-rose-500" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-bold text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {tx.description}
                          </p>
                          {isInternalTransfer && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30 hidden sm:inline">
                              Virement Interne
                            </span>
                          )}
                        </div>
                        <div className={`flex items-center gap-2 text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span>{tx.date}</span>
                          <span>•</span>
                          <span className={isDarkMode ? 'text-slate-300 font-semibold' : 'text-slate-700 font-semibold'}>
                            {tx.category}
                          </span>
                          {tx.notes && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600 dark:text-amber-300 text-xs italic hidden md:inline">
                                {tx.notes}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* MONTANT FORMATÉ */}
                    <div className="text-right shrink-0">
                      <span
                        className={`font-black text-sm sm:text-base ${
                          isInternalTransfer
                            ? 'text-blue-600 dark:text-blue-400'
                            : isPositive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* ==================== PIED DE PAGE ==================== */}
      <footer
        className={`border-t py-6 px-4 text-center text-xs space-y-1 transition-colors ${
          isDarkMode ? 'border-slate-800 bg-[#070b14] text-slate-400' : 'border-slate-200 bg-white text-slate-500'
        }`}
      >
        <p className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          Pathly V2 • Plateforme de Gestion Financière 100% Manuelle & Souveraine
        </p>
        <p className={`text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Aucune API d'agrégation bancaire payante • Imports de fichiers de banques (CSV / OFX) & Saisies manuelles
        </p>
      </footer>
    </div>
  );
}

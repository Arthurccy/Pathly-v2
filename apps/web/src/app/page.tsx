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
} from 'lucide-react';

export default function DashboardPage(): React.JSX.Element {
  // Mois sélectionné : par défaut le mois en cours (Octobre 2026)
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Transactions dynamiques (permet de simuler l'ajout de nouvelles dépenses en live)
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

  // Simulation d'une dépense en direct
  const handleSimulateExpense = (amount: number, description: string, category: Transaction['category']) => {
    const newTx: Transaction = {
      id: `tx-sim-${Date.now()}`,
      accountId: 'acc-checking',
      date: new Date().toISOString().split('T')[0],
      month: selectedMonth === 'ALL' ? '2026-10' : selectedMonth,
      amount: -amount,
      description: `[Simulation] ${description}`,
      category,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setSimulationFeedback(`Dépense de ${formatCurrency(amount)} ajoutée au compte courant !`);
    setTimeout(() => setSimulationFeedback(null), 4000);
  };

  // Simulation d'un virement d'équilibrage depuis l'épargne
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
      description: '[Simulation] Virement vers Compte Courant',
      category: 'Virement Interne',
      isTransfer: true,
    };

    const txIn: Transaction = {
      id: `tx-sim-in-${Date.now()}`,
      accountId: 'acc-checking',
      date: now,
      month,
      amount: transferAmount,
      description: '[Simulation] Réception depuis Livret A',
      category: 'Virement Interne',
      isTransfer: true,
    };

    setTransactions((prev) => [txIn, txOut, ...prev]);
    setSimulationFeedback(`Arbitrage de ${formatCurrency(transferAmount)} exécuté entre le Livret A et le Compte Courant.`);
    setTimeout(() => setSimulationFeedback(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* ==================== BARRE DE NAVIGATION SUPÉRIEURE ==================== */}
      <header className="border-b border-slate-700/80 bg-[#090e1a]/95 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-black text-xl shadow-lg shadow-emerald-500/25">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                Pathly
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                V2 LIVE
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <Moon className="w-3 h-3 text-emerald-400" />
                Mode Nuit Actif
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium hidden sm:block">Agrégation Bancaire & Optimisation Prédictive</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-medium text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Flux bancaires synchronisés (5 mois)
          </div>
          <div className="flex items-center gap-2.5 pl-2">
            <div className="w-9 h-9 rounded-full bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center text-xs font-bold text-slate-100 shadow-sm">
              AC
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-bold text-slate-100">Arthur Courchay</p>
              <p className="text-[11px] text-emerald-400 font-medium">Compte Premium FinTech</p>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== CORPS DU DASHBOARD ==================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* BANNER NOTIFICATION SIMULATION */}
        {simulationFeedback && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-sm font-medium flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{simulationFeedback}</span>
          </div>
        )}

        {/* ==================== SÉLECTEUR DE MOIS HISTORIQUE ==================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl bg-[#0f172a] border border-slate-700 shadow-md">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 py-0.5">
            <span className="text-xs font-bold text-slate-300 px-2 flex items-center gap-1.5 shrink-0 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-emerald-400" />
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
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.02]'
                      : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:text-white hover:bg-slate-700'
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
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.02]'
                  : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:text-white hover:bg-slate-700'
              }`}
            >
              Vue Globale (5 mois)
            </button>
          </div>

          {/* BOUTONS D'INTERACTIONS RAPIDES */}
          <div className="flex items-center gap-2.5 px-1">
            <button
              onClick={() => handleSimulateExpense(45.5, 'Courses Express Monoprix', 'Alimentation')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 transition border border-slate-600 shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-rose-400" />
              <span>Simuler -45,50 €</span>
            </button>
            <button
              onClick={handleSimulateTransfer}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 transition border border-slate-600 shadow-sm"
            >
              <ArrowRightLeft className="w-4 h-4 text-blue-400" />
              <span>Arbitrage Épargne (+300€)</span>
            </button>
          </div>
        </div>

        {/* ==================== CARTE DE CONTEXTE INTELLIGENTE (AI ADVISOR) ==================== */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-700 flex items-start sm:items-center gap-4 shadow-xl">
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1 flex-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base">Analyse de Trésorerie • {currentMonthInfo.monthLabel}</span>
              {currentMonthInfo.netCashFlow >= 0 ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Mois Excédentaire
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Mois Déficitaire
                </span>
              )}
            </div>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">{currentMonthInfo.story}</p>
          </div>
        </div>

        {/* ==================== BANDEAU DE KPIS FINANCIERS ==================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* PATRIMOINE GLOBAL */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-700 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold uppercase tracking-wider">
              <span>Patrimoine Global</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {formatCurrency(getTotalPatrimoine())}
            </div>
            <p className="text-xs text-slate-300 font-medium">Total consolidé de vos 4 comptes</p>
          </div>

          {/* REVENUS DU MOIS */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-700 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold uppercase tracking-wider">
              <span>Revenus Encaissés</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-400">
              +{formatCurrency(currentMonthInfo.totalIncome)}
            </div>
            <p className="text-xs text-emerald-400 font-medium">Salaire et primes nettes</p>
          </div>

          {/* DÉPENSES DU MOIS */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-700 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold uppercase tracking-wider">
              <span>Dépenses Réalisées</span>
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-rose-400">
              -{formatCurrency(currentMonthInfo.totalExpenses)}
            </div>
            <p className="text-xs text-rose-300 font-medium">Charges fixes + variables</p>
          </div>

          {/* CASHFLOW NET */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-700 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold uppercase tracking-wider">
              <span>Cash-Flow Net</span>
              {currentMonthInfo.netCashFlow >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowDownLeft className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                currentMonthInfo.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {currentMonthInfo.netCashFlow >= 0 ? '+' : ''}
              {formatCurrency(currentMonthInfo.netCashFlow)}
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Taux d'épargne :{' '}
              <strong className={currentMonthInfo.savingsRate >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {currentMonthInfo.savingsRate}%
              </strong>
            </p>
          </div>
        </div>

        {/* ==================== GRILLE DES COMPTES BANCAIRES ==================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Mes Comptes Connectés (4)
            </h2>
            <span className="text-xs text-slate-300 font-medium">Agrégation Bancaire Souveraine</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_ACCOUNTS.map((acc) => {
              const pctOfTotal = ((acc.balance / getTotalPatrimoine()) * 100).toFixed(1);
              return (
                <div
                  key={acc.id}
                  className="p-5 rounded-2xl bg-[#0f172a] border border-slate-700 hover:border-slate-500 transition-all space-y-3 group shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-300 tracking-wider uppercase">
                      {acc.institution}
                    </span>
                    <span
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: acc.color }}
                    ></span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-100 truncate">{acc.name}</h3>
                    <div className="text-2xl font-black text-white">{formatCurrency(acc.balance)}</div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                      <span>{acc.ibanMasked}</span>
                      <span>{pctOfTotal}%</span>
                    </div>
                    {/* BARRE DE PROGRESSION VISUELLE */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
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
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-700 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-emerald-400" />
                Évolution du Cash-Flow sur 5 Mois (Juin — Octobre 2026)
              </h2>
              <p className="text-xs text-slate-300">
                Visualisation des mois positifs (épargne) vs mois de vacances/déficit (arbitrage Livret A)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 shadow-sm"></span> Revenus
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-3.5 h-3.5 rounded-sm bg-rose-500 shadow-sm"></span> Dépenses
              </span>
            </div>
          </div>

          {/* GRAPHIQUE COMPARATIF EN BARRES */}
          <div className="grid grid-cols-5 gap-2 sm:gap-6 pt-4 items-end h-44 border-b border-slate-700 pb-2">
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
                    isCurrent ? 'bg-slate-800 ring-2 ring-emerald-500 shadow-lg' : 'hover:bg-slate-800/60'
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
                      isCurrent ? 'text-emerald-400 scale-105' : 'text-slate-300'
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
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-700 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Opérations & Mouvements Financiers
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                {filteredTransactions.length} transaction(s) affichée(s)
              </p>
            </div>

            {/* BARRE DE RECHERCHE ET FILTRE */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher une opération..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 w-full sm:w-60 shadow-inner"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-600 text-xs text-white font-medium focus:outline-none focus:border-emerald-400 shadow-inner"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat === 'ALL' ? 'Toutes catégories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LISTE DES TRANSACTIONS */}
          <div className="divide-y divide-slate-800">
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-300 text-sm font-medium">
                Aucune transaction ne correspond à vos filtres.
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const isPositive = tx.amount > 0;
                const isInternalTransfer = tx.isTransfer || tx.category === 'Virement Interne';

                return (
                  <div
                    key={tx.id}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-800/50 px-3 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* ICÔNE DE CATÉGORIE */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                          isInternalTransfer
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                            : isPositive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-200 border border-slate-600'
                        }`}
                      >
                        {isInternalTransfer ? (
                          <ArrowRightLeft className="w-4 h-4" />
                        ) : isPositive ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-rose-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-white truncate">{tx.description}</p>
                          {isInternalTransfer && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 hidden sm:inline">
                              Virement Interne
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                          <span className="text-slate-400">{tx.date}</span>
                          <span>•</span>
                          <span className="text-slate-200 font-semibold">{tx.category}</span>
                          {tx.notes && (
                            <>
                              <span>•</span>
                              <span className="text-amber-300 text-xs italic hidden md:inline">
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
                            ? 'text-blue-400'
                            : isPositive
                            ? 'text-emerald-400'
                            : 'text-rose-400'
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
      <footer className="border-t border-slate-800 bg-[#070b14] py-6 px-4 text-center text-xs text-slate-400 space-y-1">
        <p className="font-medium text-slate-300">
          Pathly V2 FinTech Platform • Développé par l'équipe de 8 ingénieurs YDays
        </p>
        <p className="text-[11px] text-slate-500">
          Simulation d'ingestion bancaire Open Banking • Données de démonstration 5 mois (Juin — Octobre 2026)
        </p>
      </footer>
    </div>
  );
}

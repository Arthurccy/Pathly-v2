// ========================================================
// PATHLY V2 — MOCK ENGINE FINTECH AVANCÉ (5 MOIS D'HISTORIQUE)
// ========================================================

export interface Account {
  id: string;
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'PAYMENT';
  institution: string;
  balance: number;
  currency: string;
  ibanMasked: string;
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string; // YYYY-MM-DD
  month: string; // "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"
  amount: number;
  description: string;
  category:
    | 'Revenus'
    | 'Logement'
    | 'Alimentation'
    | 'Abonnements'
    | 'Transports'
    | 'Vacances & Loisirs'
    | 'Santé'
    | 'Shopping'
    | 'Épargne & Investissement'
    | 'Virement Interne';
  isTransfer?: boolean;
  notes?: string;
}

export interface MonthSummary {
  monthKey: string; // "2026-10"
  monthLabel: string; // "Octobre 2026"
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number; // percentage
  story: string; // Contexte financier du mois
}

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'acc-checking',
    name: 'Compte Courant Principal',
    type: 'CHECKING',
    institution: 'BoursoBank',
    balance: 2485.3,
    currency: 'EUR',
    ibanMasked: 'FR76 •••• •••• 4892',
    color: '#10b981', // Emerald
  },
  {
    id: 'acc-savings',
    name: 'Livret A — Épargne de Précaution',
    type: 'SAVINGS',
    institution: 'BoursoBank',
    balance: 14350.0,
    currency: 'EUR',
    ibanMasked: 'FR76 •••• •••• 1093',
    color: '#3b82f6', // Blue
  },
  {
    id: 'acc-pea',
    name: 'PEA (ETF World & S&P 500)',
    type: 'INVESTMENT',
    institution: 'Bourse Direct',
    balance: 8920.0,
    currency: 'EUR',
    ibanMasked: 'FR76 •••• •••• 7714',
    color: '#8b5cf6', // Violet
  },
  {
    id: 'acc-revolut',
    name: 'Revolut — Dépenses du Quotidien',
    type: 'PAYMENT',
    institution: 'Revolut',
    balance: 340.5,
    currency: 'EUR',
    ibanMasked: 'LT44 •••• •••• 5521',
    color: '#f59e0b', // Amber
  },
];

export const MOCK_MONTHS: MonthSummary[] = [
  {
    monthKey: '2026-10',
    monthLabel: 'Octobre 2026',
    totalIncome: 3350.0,
    totalExpenses: 2510.2,
    netCashFlow: 839.8,
    savingsRate: 25.1,
    story: 'Mois très positif : prime de projet (+500€) et versement de 300€ sur le PEA.',
  },
  {
    monthKey: '2026-09',
    monthLabel: 'Septembre 2026',
    totalIncome: 2850.0,
    totalExpenses: 3030.0,
    netCashFlow: -180.0,
    savingsRate: 0,
    story: 'Mois déficitaire (Rentrée) : assurance auto annuelle (-450€) et matériel tech (-280€).',
  },
  {
    monthKey: '2026-08',
    monthLabel: 'Août 2026',
    totalIncome: 2850.0,
    totalExpenses: 2690.0,
    netCashFlow: 160.0,
    savingsRate: 5.6,
    story: 'Mois à l’équilibre : reprise du rythme de croisière avec dépenses modérées.',
  },
  {
    monthKey: '2026-07',
    monthLabel: 'Juillet 2026',
    totalIncome: 2850.0,
    totalExpenses: 3720.0,
    netCashFlow: -870.0,
    savingsRate: -30.5,
    story: 'Grandes vacances d’été : déficit comblé par un déblocage de 600€ du Livret A.',
  },
  {
    monthKey: '2026-06',
    monthLabel: 'Juin 2026',
    totalIncome: 2850.0,
    totalExpenses: 2210.0,
    netCashFlow: 640.0,
    savingsRate: 22.5,
    story: 'Mois vertueux : dépenses sous contrôle et virement de 500€ placé sur le Livret A.',
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  // ==================== OCTOBRE 2026 (Mois en cours / Positif) ====================
  {
    id: 'tx-oct-01',
    accountId: 'acc-checking',
    date: '2026-10-27',
    month: '2026-10',
    amount: 2850.0,
    description: 'Virement Salaire TechCorp SAS',
    category: 'Revenus',
  },
  {
    id: 'tx-oct-02',
    accountId: 'acc-checking',
    date: '2026-10-27',
    month: '2026-10',
    amount: 500.0,
    description: 'Prime de Performance Q3',
    category: 'Revenus',
  },
  {
    id: 'tx-oct-03',
    accountId: 'acc-checking',
    date: '2026-10-05',
    month: '2026-10',
    amount: -980.0,
    description: 'Prélèvement Loyer Appartement',
    category: 'Logement',
  },
  {
    id: 'tx-oct-04',
    accountId: 'acc-checking',
    date: '2026-10-08',
    month: '2026-10',
    amount: -74.5,
    description: 'EDF Électricité',
    category: 'Logement',
  },
  {
    id: 'tx-oct-05',
    accountId: 'acc-checking',
    date: '2026-10-12',
    month: '2026-10',
    amount: -128.4,
    description: 'Courses Carrefour Market',
    category: 'Alimentation',
  },
  {
    id: 'tx-oct-06',
    accountId: 'acc-revolut',
    date: '2026-10-14',
    month: '2026-10',
    amount: -45.0,
    description: 'Restaurant Le Bistrot Parisien',
    category: 'Vacances & Loisirs',
  },
  {
    id: 'tx-oct-07',
    accountId: 'acc-checking',
    date: '2026-10-16',
    month: '2026-10',
    amount: -49.99,
    description: 'Forfait Fibre Freebox',
    category: 'Abonnements',
  },
  {
    id: 'tx-oct-08',
    accountId: 'acc-checking',
    date: '2026-10-17',
    month: '2026-10',
    amount: -17.99,
    description: 'Netflix Premium 4K',
    category: 'Abonnements',
  },
  {
    id: 'tx-oct-09',
    accountId: 'acc-checking',
    date: '2026-10-20',
    month: '2026-10',
    amount: -300.0,
    description: 'Virement DCA vers PEA Bourse Direct',
    category: 'Épargne & Investissement',
    isTransfer: true,
  },
  {
    id: 'tx-oct-10',
    accountId: 'acc-pea',
    date: '2026-10-20',
    month: '2026-10',
    amount: 300.0,
    description: 'Dépôt PEA (Achat ETF MSCI World)',
    category: 'Épargne & Investissement',
    isTransfer: true,
  },
  {
    id: 'tx-oct-11',
    accountId: 'acc-revolut',
    date: '2026-10-22',
    month: '2026-10',
    amount: -62.3,
    description: 'Plein Essence TotalEnergies',
    category: 'Transports',
  },

  // ==================== SEPTEMBRE 2026 (Déficitaire - Rentrée) ====================
  {
    id: 'tx-sep-01',
    accountId: 'acc-checking',
    date: '2026-09-28',
    month: '2026-09',
    amount: 2850.0,
    description: 'Virement Salaire TechCorp SAS',
    category: 'Revenus',
  },
  {
    id: 'tx-sep-02',
    accountId: 'acc-checking',
    date: '2026-09-05',
    month: '2026-09',
    amount: -980.0,
    description: 'Prélèvement Loyer Appartement',
    category: 'Logement',
  },
  {
    id: 'tx-sep-03',
    accountId: 'acc-checking',
    date: '2026-09-07',
    month: '2026-09',
    amount: -450.0,
    description: 'Cotisation Annuelle Assurance Auto Macif',
    category: 'Transports',
    notes: 'Charge annuelle imprévue',
  },
  {
    id: 'tx-sep-04',
    accountId: 'acc-checking',
    date: '2026-09-10',
    month: '2026-09',
    amount: -280.0,
    description: 'Fnac — Écran de télétravail',
    category: 'Shopping',
  },
  {
    id: 'tx-sep-05',
    accountId: 'acc-checking',
    date: '2026-09-15',
    month: '2026-09',
    amount: -185.0,
    description: 'Abonnement Salle de Sport BasicFit (Annuel)',
    category: 'Abonnements',
  },
  {
    id: 'tx-sep-06',
    accountId: 'acc-checking',
    date: '2026-09-18',
    month: '2026-09',
    amount: -145.2,
    description: 'Courses Biocoop',
    category: 'Alimentation',
  },
  {
    id: 'tx-sep-07',
    accountId: 'acc-revolut',
    date: '2026-09-22',
    month: '2026-09',
    amount: -89.8,
    description: 'Pass Navigo Mensuel',
    category: 'Transports',
  },

  // ==================== AOÛT 2026 (Équilibre) ====================
  {
    id: 'tx-aug-01',
    accountId: 'acc-checking',
    date: '2026-08-28',
    month: '2026-08',
    amount: 2850.0,
    description: 'Virement Salaire TechCorp SAS',
    category: 'Revenus',
  },
  {
    id: 'tx-aug-02',
    accountId: 'acc-checking',
    date: '2026-08-05',
    month: '2026-08',
    amount: -980.0,
    description: 'Prélèvement Loyer Appartement',
    category: 'Logement',
  },
  {
    id: 'tx-aug-03',
    accountId: 'acc-checking',
    date: '2026-08-11',
    month: '2026-08',
    amount: -160.0,
    description: 'Courses Grand Frais',
    category: 'Alimentation',
  },
  {
    id: 'tx-aug-04',
    accountId: 'acc-checking',
    date: '2026-08-15',
    month: '2026-08',
    amount: -75.0,
    description: 'Pharmacie et Soins',
    category: 'Santé',
  },
  {
    id: 'tx-aug-05',
    accountId: 'acc-revolut',
    date: '2026-08-20',
    month: '2026-08',
    amount: -125.0,
    description: 'Sortie Festival de Musique',
    category: 'Vacances & Loisirs',
  },

  // ==================== JUILLET 2026 (Vacances & Pioche Épargne) ====================
  {
    id: 'tx-jul-01',
    accountId: 'acc-checking',
    date: '2026-07-28',
    month: '2026-07',
    amount: 2850.0,
    description: 'Virement Salaire TechCorp SAS',
    category: 'Revenus',
  },
  {
    id: 'tx-jul-02',
    accountId: 'acc-checking',
    date: '2026-07-02',
    month: '2026-07',
    amount: -1150.0,
    description: 'Airbnb — Location Villa Sud de la France',
    category: 'Vacances & Loisirs',
    notes: 'Dépense vacances',
  },
  {
    id: 'tx-jul-03',
    accountId: 'acc-checking',
    date: '2026-07-05',
    month: '2026-07',
    amount: -980.0,
    description: 'Prélèvement Loyer Appartement',
    category: 'Logement',
  },
  {
    id: 'tx-jul-04',
    accountId: 'acc-checking',
    date: '2026-07-08',
    month: '2026-07',
    amount: -240.0,
    description: 'Billets SNCF TGV Aller-Retour Nice',
    category: 'Transports',
  },
  {
    id: 'tx-jul-05',
    accountId: 'acc-checking',
    date: '2026-07-15',
    month: '2026-07',
    amount: -350.0,
    description: 'Restaurants et Activités d’été',
    category: 'Vacances & Loisirs',
  },
  // PIOCHE SUR LE LIVRET A POUR ÉVITER LE DÉCOUVERT !
  {
    id: 'tx-jul-06',
    accountId: 'acc-savings',
    date: '2026-07-16',
    month: '2026-07',
    amount: -600.0,
    description: 'Virement vers Compte Courant (Ajustement Trésorerie)',
    category: 'Virement Interne',
    isTransfer: true,
  },
  {
    id: 'tx-jul-07',
    accountId: 'acc-checking',
    date: '2026-07-16',
    month: '2026-07',
    amount: 600.0,
    description: 'Virement reçu depuis Livret A',
    category: 'Virement Interne',
    isTransfer: true,
  },

  // ==================== JUIN 2026 (Mois Positif & Épargne) ====================
  {
    id: 'tx-jun-01',
    accountId: 'acc-checking',
    date: '2026-06-28',
    month: '2026-06',
    amount: 2850.0,
    description: 'Virement Salaire TechCorp SAS',
    category: 'Revenus',
  },
  {
    id: 'tx-jun-02',
    accountId: 'acc-checking',
    date: '2026-06-05',
    month: '2026-06',
    amount: -980.0,
    description: 'Prélèvement Loyer Appartement',
    category: 'Logement',
  },
  {
    id: 'tx-jun-03',
    accountId: 'acc-checking',
    date: '2026-06-10',
    month: '2026-06',
    amount: -140.0,
    description: 'Courses Carrefour',
    category: 'Alimentation',
  },
  {
    id: 'tx-jun-04',
    accountId: 'acc-checking',
    date: '2026-06-15',
    month: '2026-06',
    amount: -500.0,
    description: 'Virement d’épargne vers Livret A',
    category: 'Virement Interne',
    isTransfer: true,
  },
  {
    id: 'tx-jun-05',
    accountId: 'acc-savings',
    date: '2026-06-15',
    month: '2026-06',
    amount: 500.0,
    description: 'Virement reçu depuis Compte Courant',
    category: 'Virement Interne',
    isTransfer: true,
  },
];

// Fonctions utilitaires de calcul et de filtrage
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getTotalPatrimoine(): number {
  return MOCK_ACCOUNTS.reduce((sum, acc) => sum + acc.balance, 0);
}

export function getTransactionsForMonth(monthKey: string): Transaction[] {
  if (monthKey === 'ALL') {
    return MOCK_TRANSACTIONS;
  }
  return MOCK_TRANSACTIONS.filter((t) => t.month === monthKey);
}

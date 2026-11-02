// ==========================================
// PATHLY V2 - SHARED FINTECH INTERFACES & DTOS
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export type ConnectionStatus =
  | 'CONNECTED'
  | 'SYNCING'
  | 'DISCONNECTED'
  | 'ACTION_NEEDED'
  | 'EXPIRED';

export type AccountType =
  | 'CHECKING'
  | 'SAVINGS'
  | 'LOAN'
  | 'INVESTMENT'
  | 'MEAL_VOUCHER'
  | 'OTHER';

export interface BankAccountDto {
  id: string;
  powensAccountId?: number | null;
  name: string;
  type: AccountType;
  currentBalance: number;
  currency: string;
  iban?: string | null;
  institutionName: string;
  institutionLogo?: string | null;
  isFavorite: boolean;
  updatedAt: string;
}

export interface BankTransactionDto {
  id: string;
  accountId: string;
  powensTransactionId?: number | null;
  date: string;
  amount: number;
  currency: string;
  rawDescription: string;
  cleanedDescription?: string | null;
  category?: string | null;
  isPredicted: boolean;
  isExcluded: boolean;
}

// --- BIENS PHYSIQUES & ACTIFS TANGIBLES ---

export type AssetCategory =
  | 'REAL_ESTATE'
  | 'VEHICLE'
  | 'WATCH'
  | 'JEWELRY'
  | 'ART'
  | 'TECH'
  | 'OTHER';

export interface PhysicalAssetDto {
  id: string;
  userId: string;
  name: string;
  category: AssetCategory;
  estimatedValue: number;
  purchasePrice?: number | null;
  purchaseDate?: string | null;
  currency: string;
  notes?: string | null;
}

// --- CRÉDITS & EMPRUNTS ---

export type LoanType =
  | 'MORTGAGE'
  | 'AUTO'
  | 'STUDENT'
  | 'CONSUMER'
  | 'REVOLVING';

export interface LoanCreditDto {
  id: string;
  userId: string;
  name: string;
  lenderInstitution: string;
  institutionLogo?: string | null;
  loanType: LoanType;
  initialAmount: number;
  remainingCapital: number;
  interestRate: number; // en % (ex: 3.45)
  monthlyPayment: number;
  startDate: string;
  endDate: string;
  insuranceMonthlyPayment?: number | null;
}

// --- BOURSE, INVESTISSEMENTS & CRYPTO ---

export type InvestmentAccountType =
  | 'PEA'
  | 'CTO'
  | 'CRYPTO'
  | 'ASSURANCE_VIE'
  | 'PER';

export interface InvestmentPositionDto {
  id: string;
  userId: string;
  accountId?: string | null;
  brokerInstitution: string; // ex: 'Trade Republic', 'Binance', 'Bourse Direct'
  institutionLogo?: string | null;
  accountType: InvestmentAccountType;
  symbol: string; // ex: 'AIR.PA', 'CW8', 'BTC', 'ETH'
  name: string; // ex: 'Air Liquide', 'Amundi MSCI World', 'Bitcoin'
  quantity: number;
  unitBuyPrice: number; // PRU
  currentPrice: number;
  currency: string;
  totalInvested: number; // quantity * unitBuyPrice
  currentValue: number; // quantity * currentPrice
  unrealizedGainLoss: number; // currentValue - totalInvested
  unrealizedGainLossPercent: number;
}

// --- PROJETS DE VIE & SIMULATIONS ---

export type ProjectCategory =
  | 'REAL_ESTATE'
  | 'TRAVEL'
  | 'VEHICLE'
  | 'BUSINESS'
  | 'EMERGENCY_FUND'
  | 'WEDDING'
  | 'OTHER';

export interface LifeProjectDto {
  id: string;
  userId: string;
  title: string;
  category: ProjectCategory;
  targetAmount: number;
  currentSaved: number;
  targetDate: string;
  monthlyAllocation: number;
  completionPercentage: number;
  projectedCompletionDate?: string | null;
}

// --- PATRIMOINE GLOBAL & NET WORTH ---

export interface NetWorthSummaryDto {
  totalAssets: number; // Trésorerie + Bourse + Biens Physiques
  totalLiabilities: number; // Dettes et crédits restants
  netWorth: number; // totalAssets - totalLiabilities
  liquidCash: number; // Comptes courants + Livrets
  investedAssets: number; // Bourse + PEA + CTO + Crypto
  tangibleAssets: number; // Immo, Voitures, Montres
  totalDebt: number; // Reste à payer des crédits
  monthlyDebtPayment: number; // Total mensualités
  debtToIncomeRatio?: number | null;
}

// --- LOGOS & INSTITUTIONS FINANCIÈRES ---

export interface InstitutionInfo {
  id: string;
  name: string;
  category: 'BANK' | 'BROKER' | 'CRYPTO' | 'NEOBANK';
  logoUrl: string;
  primaryColor: string;
  keywords: string[];
}

// --- KPI & DASHBOARD ---

export interface DashboardSummaryDto {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  safeToSpendToday: number;
  currency: string;
  accounts: BankAccountDto[];
  netWorthSummary?: NetWorthSummaryDto;
}


// --- OPTIMISEUR D'ABONNEMENTS & COMPARATEUR DE FACTURES (OPEN DATA) ---

export type OptimizationCategory =
  | 'ENERGY'
  | 'TELECOM'
  | 'STREAMING'
  | 'INSURANCE'
  | 'BANKING';

export interface SubscriptionOptimizationDto {
  id: string;
  category: OptimizationCategory;
  detectedSubscriptionName: string;
  currentMonthlyCost: number;
  recommendedProvider: string;
  recommendedPlanName: string;
  recommendedMonthlyCost: number;
  annualSavings: number;
  switchDifficulty: 'INSTANT' | 'EASY' | 'MODERATE';
  savingsBadgeText: string;
  comparisonSource: string;
  actionUrl?: string;
}

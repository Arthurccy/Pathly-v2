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
  powensAccountId: number;
  name: string;
  type: AccountType;
  currentBalance: number;
  currency: string;
  iban?: string | null;
  institutionName: string;
  isFavorite: boolean;
  updatedAt: string;
}

export interface BankTransactionDto {
  id: string;
  accountId: string;
  powensTransactionId: number;
  date: string;
  amount: number;
  currency: string;
  rawDescription: string;
  cleanedDescription?: string | null;
  category?: string | null;
  isPredicted: boolean;
  isExcluded: boolean;
}

// --- POWENS OPEN BANKING INTEGRATION ---

export interface PowensConnectUrlRequestDto {
  redirectUri: string;
  institutionId?: number;
}

export interface PowensConnectUrlResponseDto {
  connectUrl: string;
}

export interface PowensWebhookPayload {
  event: 'item.created' | 'item.updated' | 'item.deleted' | 'accounts.synced';
  itemId: number;
  userId?: string;
  timestamp: string;
  status?: string;
}

// --- KPI & DASHBOARD ---

export interface DashboardSummaryDto {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  currency: string;
  accounts: BankAccountDto[];
}

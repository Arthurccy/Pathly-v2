// =====================================================================
// PATHLY V2 — RESOLVEUR INTELLIGENT DE LOGOS ET INSTITUTIONS FINANCIÈRES
// =====================================================================

export interface FinancialInstitution {
  id: string;
  name: string;
  shortName: string;
  category: 'BANK' | 'BROKER' | 'CRYPTO' | 'NEOBANK';
  primaryColor: string;
  textColor: string;
  logoSvgUrl: string;
  keywords: string[];
}

export const FINANCIAL_INSTITUTIONS: FinancialInstitution[] = [
  // --- BANQUES TRADITIONNELLES FRANÇAISES ---
  {
    id: 'cic',
    name: 'Crédit Industriel et Commercial (CIC)',
    shortName: 'CIC',
    category: 'BANK',
    primaryColor: '#002D72',
    textColor: '#FFFFFF',
    logoSvgUrl: 'https://logo.clearbit.com/cic.fr',
    keywords: ['cic', 'credit industriel', 'banque cic'],
  },
  {
    id: 'bnp',
    name: 'BNP Paribas',
    shortName: 'BNP',
    category: 'BANK',
    primaryColor: '#00915A',
    textColor: '#FFFFFF',
    logoSvgUrl: 'https://logo.clearbit.com/mabanque.bnpparibas',
    keywords: ['bnp', 'paribas', 'bnp paribas', 'hello bank'],
  },
  {
    id: 'credit-agricole',
    name: 'Crédit Agricole',
    shortName: 'Crédit Agricole',
    category: 'BANK',
    primaryColor: '#007A63',
    textColor: '#FFFFFF',
    logoSvgUrl: 'https://logo.clearbit.com/credit-agricole.fr',
    keywords: ['ca', 'credit agricole', 'crédit agricole'],
  },
  {
    id: 'societe-generale',
    name: 'Société Générale',
    shortName: 'SocGen',
    category: 'BANK',
    primaryColor: '#E60028',
    textColor: '#FFFFFF',
    logoSvgUrl: 'https://logo.clearbit.com/societegenerale.fr',
    keywords: ['sg', 'societe generale', 'société générale'],
  },
  {
    id: 'boursobank',
    name: 'BoursoBank (ex-Boursorama)',
    shortName: 'BoursoBank',
    category: 'NEOBANK',
    primaryColor: '#D70077',
    textColor: '#FFFFFF',
    logoSvgUrl: 'https://logo.clearbit.com/boursobank.com',
    keywords: ['bourso', 'boursobank', 'boursorama'],
  },
  {
    id: 'revolut',
    name: 'Revolut',
    shortName: 'Revolut',
    category: 'NEOBANK',
    primaryColor: '#191C1F',
    textColor: '#FFFFFF',
    logoSvgUrl: 'https://logo.clearbit.com/revolut.com',
    keywords: ['revolut', 'revo'],
  },
  {
    id: 'n26',
    name: 'N26',
    shortName: 'N26',
    category: 'NEOBANK',
    primaryColor: '#36A18B',
    textColor: '#FFFFFF',
    logoSvgUrl: 'https://logo.clearbit.com/n26.com',
    keywords: ['n26'],
  },

  // --- COURTIERS, PEA & CTO ---
  {
    id: 'trade-republic',
    name: 'Trade Republic',
    shortName: 'Trade Republic',
    category: 'BROKER',
    primaryColor: '#000000',
    textColor: '#FFFFFF',
    logoSvgUrl: 'https://logo.clearbit.com/traderepublic.com',
    keywords: ['trade republic', 'tr', 'trade'],
  },
  {
    id: 'degiro',
    name: 'DEGIRO',
    shortName: 'DEGIRO',
    category: 'BROKER',
    primaryColor: '#009EE0',
    textColor: '#FFFFFF',
    logoSvgUrl: 'https://logo.clearbit.com/degiro.fr',
    keywords: ['degiro'],
  },
  {
    id: 'bourse-direct',
    name: 'Bourse Direct',
    shortName: 'Bourse Direct',
    category: 'BROKER',
    primaryColor: '#003366',
    textColor: '#FFFFFF',
    logoSvgUrl: 'https://logo.clearbit.com/boursedirect.fr',
    keywords: ['bourse direct', 'bd'],
  },
  {
    id: 'interactive-brokers',
    name: 'Interactive Brokers',
    shortName: 'IBKR',
    category: 'BROKER',
    primaryColor: '#D32F2F',
    textColor: '#FFFFFF',
    logoSvgUrl: 'https://logo.clearbit.com/interactivebrokers.com',
    keywords: ['interactive brokers', 'ibkr'],
  },
  {
    id: 'finary',
    name: 'Finary Invest',
    shortName: 'Finary',
    category: 'BROKER',
    primaryColor: '#6366F1',
    textColor: '#FFFFFF',
    logoSvgUrl: 'https://logo.clearbit.com/finary.com',
    keywords: ['finary'],
  },

  // --- CRYPTO EXCHANGES ---
  {
    id: 'binance',
    name: 'Binance',
    shortName: 'Binance',
    category: 'CRYPTO',
    primaryColor: '#F0B90B',
    textColor: '#000000',
    logoSvgUrl: 'https://logo.clearbit.com/binance.com',
    keywords: ['binance', 'bnb'],
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    shortName: 'Coinbase',
    category: 'CRYPTO',
    primaryColor: '#0052FF',
    textColor: '#FFFFFF',
    logoSvgUrl: 'https://logo.clearbit.com/coinbase.com',
    keywords: ['coinbase'],
  },
  {
    id: 'kraken',
    name: 'Kraken',
    shortName: 'Kraken',
    category: 'CRYPTO',
    primaryColor: '#5741D9',
    textColor: '#FFFFFF',
    logoSvgUrl: 'https://logo.clearbit.com/kraken.com',
    keywords: ['kraken'],
  },
  {
    id: 'bitpanda',
    name: 'Bitpanda',
    shortName: 'Bitpanda',
    category: 'CRYPTO',
    primaryColor: '#0AC18E',
    textColor: '#FFFFFF',
    logoSvgUrl: 'https://logo.clearbit.com/bitpanda.com',
    keywords: ['bitpanda'],
  },
];

/**
 * Résout automatiquement une institution financière à partir d'un texte
 * (ex: nom de compte "Compte Courant CIC" ou "Mon PEA Trade Republic")
 */
export function resolveInstitution(query: string): FinancialInstitution | null {
  if (!query) return null;
  const clean = query.toLowerCase().trim();

  for (const inst of FINANCIAL_INSTITUTIONS) {
    if (inst.keywords.some((k) => clean.includes(k))) {
      return inst;
    }
  }
  return null;
}

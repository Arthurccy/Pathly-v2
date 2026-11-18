import type { CashflowSummaryInput } from '@pathly/shared-types';
import { computeSafeToSpend, InvalidCashflowInputError } from './safe-to-spend';

// Les résultats attendus sont calculés à la main, pas avec la formule du code.
const reference: CashflowSummaryInput = {
  month: '2026-10',
  asOfDate: '2026-10-15',
  availableBalance: 1500,
  remainingCommittedExpenses: 800,
  savingsReserve: 200,
  currency: 'EUR',
};

describe('computeSafeToSpend', () => {
  it('exemple de référence S2 : 1500 − 800 − 200 = 500 → AVAILABLE', () => {
    expect(computeSafeToSpend(reference)).toEqual({
      month: '2026-10',
      asOfDate: '2026-10-15',
      safeToSpendPeriod: 500,
      status: 'AVAILABLE',
      currency: 'EUR',
    });
  });

  it('charges supérieures au solde : 1500 − 1800 − 200 = −500 → SHORTFALL, déficit non masqué', () => {
    const result = computeSafeToSpend({ ...reference, remainingCommittedExpenses: 1800 });
    expect(result.safeToSpendPeriod).toBe(-500);
    expect(result.status).toBe('SHORTFALL');
  });

  it('solde déjà négatif : −120,50 − 0 − 0 = −120,50 → SHORTFALL', () => {
    const result = computeSafeToSpend({
      ...reference,
      availableBalance: -120.5,
      remainingCommittedExpenses: 0,
      savingsReserve: 0,
    });
    expect(result.safeToSpendPeriod).toBe(-120.5);
    expect(result.status).toBe('SHORTFALL');
  });

  it('charges nulles : 1500 − 0 − 200 = 1300', () => {
    const result = computeSafeToSpend({ ...reference, remainingCommittedExpenses: 0 });
    expect(result.safeToSpendPeriod).toBe(1300);
    expect(result.status).toBe('AVAILABLE');
  });

  it('résultat exactement nul : 1000 − 800 − 200 = 0 → AVAILABLE (0 et non −0)', () => {
    const result = computeSafeToSpend({ ...reference, availableBalance: 1000 });
    expect(Object.is(result.safeToSpendPeriod, 0)).toBe(true);
    expect(result.status).toBe('AVAILABLE');
  });

  it('centimes sans erreur de flottant : 0,30 − 0,10 − 0,10 = 0,10', () => {
    // En flottant naïf : 0.3 - 0.1 - 0.1 = 0.09999999999999998
    const result = computeSafeToSpend({
      ...reference,
      availableBalance: 0.3,
      remainingCommittedExpenses: 0.1,
      savingsReserve: 0.1,
    });
    expect(result.safeToSpendPeriod).toBe(0.1);
  });

  it('montants avec centimes : 2 345,67 − 1 234,56 − 100,01 = 1 011,10', () => {
    const result = computeSafeToSpend({
      ...reference,
      availableBalance: 2345.67,
      remainingCommittedExpenses: 1234.56,
      savingsReserve: 100.01,
    });
    expect(result.safeToSpendPeriod).toBe(1011.1);
  });

  describe('données incomplètes', () => {
    it('solde manquant → INCOMPLETE, montant null (jamais 0)', () => {
      const result = computeSafeToSpend({ ...reference, availableBalance: null });
      expect(result).toEqual({
        month: '2026-10',
        asOfDate: '2026-10-15',
        safeToSpendPeriod: null,
        status: 'INCOMPLETE',
        currency: 'EUR',
        incompleteReasons: ['AVAILABLE_BALANCE_MISSING'],
      });
    });

    it('liste toutes les données manquantes', () => {
      const result = computeSafeToSpend({
        ...reference,
        remainingCommittedExpenses: null,
        savingsReserve: null,
      });
      expect(result.status).toBe('INCOMPLETE');
      expect(result.incompleteReasons).toEqual([
        'REMAINING_COMMITTED_EXPENSES_MISSING',
        'SAVINGS_RESERVE_MISSING',
      ]);
    });

    it('valide quand même les valeurs fournies', () => {
      expect(() =>
        computeSafeToSpend({ ...reference, availableBalance: null, savingsReserve: -1 }),
      ).toThrow(InvalidCashflowInputError);
    });
  });

  describe('entrées invalides', () => {
    it.each([
      ['charges négatives', 'remainingCommittedExpenses', { remainingCommittedExpenses: -10 }],
      ['réserve négative', 'savingsReserve', { savingsReserve: -0.01 }],
      ['plus de 2 décimales', 'availableBalance', { availableBalance: 10.005 }],
      ['NaN', 'availableBalance', { availableBalance: Number.NaN }],
      ['Infinity', 'remainingCommittedExpenses', { remainingCommittedExpenses: Number.POSITIVE_INFINITY }],
      ['mois mal formé', 'month', { month: '2026-13' }],
      ['date mal formée', 'asOfDate', { asOfDate: '15/10/2026' }],
      ['date hors du mois', 'asOfDate', { asOfDate: '2026-11-01' }],
      ['devise non EUR', 'currency', { currency: 'USD' }],
    ])('%s → erreur sur %s', (_label, field, override) => {
      const input = { ...reference, ...override } as CashflowSummaryInput;
      try {
        computeSafeToSpend(input);
        throw new Error('aurait dû lever une erreur');
      } catch (err) {
        expect(err).toBeInstanceOf(InvalidCashflowInputError);
        expect((err as InvalidCashflowInputError).field).toBe(field);
      }
    });
  });
});

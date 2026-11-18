import { BadRequestException, Injectable } from '@nestjs/common';
import type { CashflowSummaryDto } from '@pathly/shared-types';
import { AccountsRepository } from '../accounts/accounts.repository';
import { BusinessClock } from './business-clock';
import type { CashflowSummaryQuery } from './cashflow-summary.query';
import { computeSafeToSpend, InvalidCashflowInputError } from './safe-to-spend';

/**
 * Assemble les entrées du calcul Safe-to-Spend pour l'utilisateur connecté.
 *
 * - Solde disponible : somme des soldes actuels des comptes CHECKING de l'utilisateur.
 *   Livrets (SAVINGS), titres-restaurant, investissements et prêts sont exclus.
 * - Aucun compte courant → solde indisponible (INCOMPLETE), pas 0.
 * - Un compte courant hors EUR → INCOMPLETE (UNSUPPORTED_CURRENCY), pas de conversion implicite.
 * - Charges restantes et réserve : paramètres de simulation en S2 (aucune source persistée à ce stade).
 * - Le solde étant le solde actuel, seul le mois courant est accepté.
 */
@Injectable()
export class CashflowService {
  constructor(
    private readonly accounts: AccountsRepository,
    private readonly clock: BusinessClock,
  ) {}

  async getSummary(userId: string, query: CashflowSummaryQuery): Promise<CashflowSummaryDto> {
    const asOfDate = this.clock.today();
    const currentMonth = asOfDate.slice(0, 7);
    const month = query.month ?? currentMonth;

    if (month !== currentMonth) {
      throw new BadRequestException(
        `Seul le mois courant (${currentMonth}) est calculable : aucun historique de solde en S2`,
      );
    }

    const checking = (await this.accounts.findByUser(userId)).filter((a) => a.type === 'CHECKING');
    const unsupportedCurrency = checking.some((a) => a.currency !== 'EUR');

    let availableBalance: number | null = null;
    if (checking.length > 0 && !unsupportedCurrency) {
      const cents = checking.reduce((sum, a) => sum + Math.round(a.currentBalance * 100), 0);
      availableBalance = cents / 100;
    }

    let result: CashflowSummaryDto;
    try {
      result = computeSafeToSpend({
        month,
        asOfDate,
        availableBalance,
        remainingCommittedExpenses: query.remainingCommittedExpenses ?? null,
        savingsReserve: query.savingsReserve ?? null,
        currency: 'EUR',
      });
    } catch (err) {
      if (err instanceof InvalidCashflowInputError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }

    if (unsupportedCurrency && result.incompleteReasons) {
      result.incompleteReasons = [
        'UNSUPPORTED_CURRENCY',
        ...result.incompleteReasons.filter((r) => r !== 'AVAILABLE_BALANCE_MISSING'),
      ];
    }
    return result;
  }
}

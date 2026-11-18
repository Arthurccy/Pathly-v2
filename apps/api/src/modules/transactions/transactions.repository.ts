import { Injectable } from '@nestjs/common';
import { prisma } from '@pathly/database';
import type { BankTransactionDto } from '@pathly/shared-types';

export interface TransactionPage {
  limit: number;
  cursor?: string;
}

/**
 * Accès aux transactions, toujours filtré par propriétaire (via compte → connexion → userId).
 * Ordre : date décroissante puis id décroissant, pour une pagination par curseur stable.
 */
export abstract class TransactionsRepository {
  abstract findByUser(userId: string, page: TransactionPage): Promise<BankTransactionDto[]>;
}

type PrismaTransactionRow = {
  id: string;
  accountId: string;
  powensTransactionId: number | null;
  date: Date;
  amount: { toString(): string };
  currency: string;
  rawDescription: string;
  cleanedDescription: string | null;
  category: string | null;
  isPredicted: boolean;
  isExcluded: boolean;
};

export function toBankTransactionDto(row: PrismaTransactionRow): BankTransactionDto {
  return {
    id: row.id,
    accountId: row.accountId,
    powensTransactionId: row.powensTransactionId,
    // Colonne @db.Date : Prisma renvoie minuit UTC, on garde la date métier YYYY-MM-DD
    date: row.date.toISOString().slice(0, 10),
    amount: Number(row.amount.toString()),
    currency: row.currency,
    rawDescription: row.rawDescription,
    cleanedDescription: row.cleanedDescription,
    category: row.category,
    isPredicted: row.isPredicted,
    isExcluded: row.isExcluded,
  };
}

@Injectable()
export class PrismaTransactionsRepository extends TransactionsRepository {
  async findByUser(userId: string, { limit, cursor }: TransactionPage): Promise<BankTransactionDto[]> {
    const rows = await prisma.bankTransaction.findMany({
      // Le filtre propriétaire s'applique aussi au curseur : un curseur d'un autre
      // utilisateur ne fait apparaître aucune de ses données.
      where: { account: { connection: { userId } } },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });
    return rows.map(toBankTransactionDto);
  }
}

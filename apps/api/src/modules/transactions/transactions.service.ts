import { Injectable } from '@nestjs/common';
import type { BankTransactionDto } from '@pathly/shared-types';
import { TRANSACTIONS_DEFAULT_LIMIT } from './list-transactions.query';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(private readonly transactions: TransactionsRepository) {}

  getTransactionsByUser(
    userId: string,
    limit = TRANSACTIONS_DEFAULT_LIMIT,
    cursor?: string,
  ): Promise<BankTransactionDto[]> {
    return this.transactions.findByUser(userId, { limit, cursor });
  }
}

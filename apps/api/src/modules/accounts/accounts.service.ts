import { Injectable, NotFoundException } from '@nestjs/common';
import type { BankAccountDto } from '@pathly/shared-types';
import { AccountsRepository } from './accounts.repository';

@Injectable()
export class AccountsService {
  constructor(private readonly accounts: AccountsRepository) {}

  getAccountsByUser(userId: string): Promise<BankAccountDto[]> {
    return this.accounts.findByUser(userId);
  }

  /**
   * 404 aussi bien pour un compte inexistant que pour le compte d'un autre utilisateur :
   * on ne révèle pas l'existence d'une ressource tierce.
   */
  async getAccountById(userId: string, accountId: string): Promise<BankAccountDto> {
    const account = await this.accounts.findByIdForUser(userId, accountId);
    if (!account) {
      throw new NotFoundException('Compte introuvable');
    }
    return account;
  }
}

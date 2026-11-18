import { Injectable } from '@nestjs/common';
import { prisma } from '@pathly/database';
import type { BankAccountDto } from '@pathly/shared-types';

/**
 * Accès aux comptes bancaires, toujours filtré par propriétaire.
 * L'implémentation réelle est PrismaAccountsRepository ; les tests injectent un dépôt en mémoire.
 */
export abstract class AccountsRepository {
  abstract findByUser(userId: string): Promise<BankAccountDto[]>;
  /** Renvoie null si le compte n'existe pas OU appartient à un autre utilisateur. */
  abstract findByIdForUser(userId: string, accountId: string): Promise<BankAccountDto | null>;
}

type PrismaAccountRow = {
  id: string;
  powensAccountId: number | null;
  name: string;
  type: BankAccountDto['type'];
  currentBalance: { toString(): string };
  currency: string;
  iban: string | null;
  institutionName: string | null;
  institutionLogo: string | null;
  isFavorite: boolean;
  updatedAt: Date;
  connection: { institutionName: string; institutionLogo: string | null };
};

export function toBankAccountDto(row: PrismaAccountRow): BankAccountDto {
  return {
    id: row.id,
    powensAccountId: row.powensAccountId,
    name: row.name,
    type: row.type,
    // Decimal(12,2) → number en euros : exact pour ces bornes
    currentBalance: Number(row.currentBalance.toString()),
    currency: row.currency,
    iban: row.iban,
    institutionName: row.institutionName ?? row.connection.institutionName,
    institutionLogo: row.institutionLogo ?? row.connection.institutionLogo,
    isFavorite: row.isFavorite,
    updatedAt: row.updatedAt.toISOString(),
  };
}

const connectionSelect = { select: { institutionName: true, institutionLogo: true } } as const;

@Injectable()
export class PrismaAccountsRepository extends AccountsRepository {
  async findByUser(userId: string): Promise<BankAccountDto[]> {
    const rows = await prisma.bankAccount.findMany({
      where: { connection: { userId } },
      include: { connection: connectionSelect },
      orderBy: [{ currentBalance: 'desc' }, { id: 'asc' }],
    });
    return rows.map(toBankAccountDto);
  }

  async findByIdForUser(userId: string, accountId: string): Promise<BankAccountDto | null> {
    const row = await prisma.bankAccount.findFirst({
      where: { id: accountId, connection: { userId } },
      include: { connection: connectionSelect },
    });
    return row ? toBankAccountDto(row) : null;
  }
}

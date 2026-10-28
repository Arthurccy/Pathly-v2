import { Injectable } from '@nestjs/common';
import { prisma } from '@pathly/database';

@Injectable()
export class AccountsService {
  async getAccountsByUser(userId: string) {
    return prisma.bankAccount.findMany({
      where: {
        connection: {
          userId,
        },
      },
      include: {
        connection: {
          select: {
            institutionName: true,
            status: true,
          },
        },
      },
      orderBy: {
        currentBalance: 'desc',
      },
    });
  }

  async getAccountById(userId: string, accountId: string) {
    return prisma.bankAccount.findFirst({
      where: {
        id: accountId,
        connection: {
          userId,
        },
      },
      include: {
        connection: true,
      },
    });
  }
}

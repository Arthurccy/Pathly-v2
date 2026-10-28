import { Injectable } from '@nestjs/common';
import { prisma } from '@pathly/database';

@Injectable()
export class TransactionsService {
  async getTransactionsByUser(userId: string, limit = 50, cursor?: string) {
    return prisma.bankTransaction.findMany({
      where: {
        account: {
          connection: {
            userId,
          },
        },
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        date: 'desc',
      },
      include: {
        account: {
          select: {
            name: true,
            currency: true,
          },
        },
      },
    });
  }
}

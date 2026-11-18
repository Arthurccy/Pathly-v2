import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaTransactionsRepository, TransactionsRepository } from './transactions.repository';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, { provide: TransactionsRepository, useClass: PrismaTransactionsRepository }],
  exports: [TransactionsService],
})
export class TransactionsModule {}

import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { AccountsRepository, PrismaAccountsRepository } from './accounts.repository';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService, { provide: AccountsRepository, useClass: PrismaAccountsRepository }],
  exports: [AccountsService, AccountsRepository],
})
export class AccountsModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PowensModule } from './modules/powens/powens.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { SyncModule } from './modules/sync/sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '../../.env'],
    }),
    SyncModule,
    PowensModule,
    AccountsModule,
    TransactionsModule,
  ],
})
export class AppModule {}

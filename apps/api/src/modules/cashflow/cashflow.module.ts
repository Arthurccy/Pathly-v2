import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { BusinessClock, ParisBusinessClock } from './business-clock';
import { CashflowController } from './cashflow.controller';
import { CashflowService } from './cashflow.service';

@Module({
  imports: [AccountsModule],
  controllers: [CashflowController],
  providers: [CashflowService, { provide: BusinessClock, useClass: ParisBusinessClock }],
})
export class CashflowModule {}

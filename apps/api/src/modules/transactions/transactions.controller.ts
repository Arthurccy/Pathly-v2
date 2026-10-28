import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@ApiTags('Bank Transactions')
@Controller('transactions')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste les transactions bancaires avec pagination par curseur' })
  async list(
    @Req() req: any,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ) {
    const data = await this.transactionsService.getTransactionsByUser(
      req.user.id,
      limit ? Number(limit) : 50,
      cursor,
    );
    return { success: true, data };
  }
}

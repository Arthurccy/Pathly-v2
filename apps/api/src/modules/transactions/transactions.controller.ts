import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBadRequestResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { ApiResponse, BankTransactionDto } from '@pathly/shared-types';
import { TransactionsService } from './transactions.service';
import { ListTransactionsQuery } from './list-transactions.query';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request';

@ApiTags('Bank Transactions')
@Controller('transactions')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Session absente, invalide ou expirée' })
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: "Liste les transactions de l'utilisateur connecté (pagination par curseur)" })
  @ApiBadRequestResponse({ description: 'limit hors de [1, 100] ou cursor non UUID' })
  async list(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListTransactionsQuery,
  ): Promise<ApiResponse<BankTransactionDto[]>> {
    const data = await this.transactionsService.getTransactionsByUser(req.user.id, query.limit, query.cursor);
    return { success: true, data };
  }
}

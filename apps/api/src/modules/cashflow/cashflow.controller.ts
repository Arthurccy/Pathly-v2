import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { ApiResponse, CashflowSummaryDto } from '@pathly/shared-types';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request';
import { CashflowSummaryQuery } from './cashflow-summary.query';
import { CashflowService } from './cashflow.service';

@ApiTags('Cashflow')
@Controller('cashflow')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Session absente, invalide ou expirée' })
export class CashflowController {
  constructor(private readonly cashflowService: CashflowService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Reste-à-dépenser de la période (simulation S2)',
    description:
      'solde des comptes courants − charges restantes − réserve. Statuts : AVAILABLE (≥ 0), SHORTFALL (< 0), INCOMPLETE (donnée manquante, montant null).',
  })
  @ApiBadRequestResponse({ description: 'Paramètre invalide ou mois autre que le mois courant' })
  async summary(
    @Req() req: AuthenticatedRequest,
    @Query() query: CashflowSummaryQuery,
  ): Promise<ApiResponse<CashflowSummaryDto>> {
    const data = await this.cashflowService.getSummary(req.user.id, query);
    return { success: true, data };
  }
}

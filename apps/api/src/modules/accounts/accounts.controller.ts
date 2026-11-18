import { Controller, Get, Param, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiNotFoundResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { ApiResponse, BankAccountDto } from '@pathly/shared-types';
import { AccountsService } from './accounts.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request';

@ApiTags('Bank Accounts')
@Controller('accounts')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Session absente, invalide ou expirée' })
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: "Récupère tous les comptes bancaires de l'utilisateur connecté" })
  async list(@Req() req: AuthenticatedRequest): Promise<ApiResponse<BankAccountDto[]>> {
    const data = await this.accountsService.getAccountsByUser(req.user.id);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: "Détails d'un compte bancaire de l'utilisateur connecté" })
  @ApiNotFoundResponse({ description: "Compte inexistant ou appartenant à un autre utilisateur" })
  async getOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ApiResponse<BankAccountDto>> {
    const data = await this.accountsService.getAccountById(req.user.id, id);
    return { success: true, data };
  }
}

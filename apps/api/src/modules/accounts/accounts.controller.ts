import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@ApiTags('Bank Accounts')
@Controller('accounts')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupère tous les comptes bancaires agrégés de l\'utilisateur' })
  async list(@Req() req: any) {
    const data = await this.accountsService.getAccountsByUser(req.user.id);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d\'un compte bancaire' })
  async getOne(@Req() req: any, @Param('id') id: string) {
    const data = await this.accountsService.getAccountById(req.user.id, id);
    return { success: true, data };
  }
}

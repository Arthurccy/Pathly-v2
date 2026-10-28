import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PowensService } from './powens.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@ApiTags('Powens Open Banking')
@Controller('powens')
export class PowensController {
  constructor(private readonly powensService: PowensService) {}

  @Post('connect-url')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Génère une URL de connexion Powens sécurisée' })
  async getConnectUrl(@Req() req: any, @Body() body: { redirectUri: string }) {
    const userId = req.user.id;
    const connectUrl = await this.powensService.generateConnectUrl(userId, body.redirectUri);
    return { success: true, data: { connectUrl } };
  }
}

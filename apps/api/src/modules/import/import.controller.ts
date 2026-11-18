import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ImportService } from './import.service';
import {
  ImportCommitRequestDto,
  ImportPreviewRequestDto,
} from './dto/import-preview.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@ApiTags('Bank Import')
@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Prévisualise un relevé bancaire (CSV / OFX) sans persistance ni session',
    description:
      'Parse le contenu brut, normalise les montants et les dates, et liste les erreurs éventuelles ligne par ligne.',
  })
  @ApiResponse({
    status: 200,
    description: 'Prévisualisation réussie avec transactions normalisées et anomalies identifiées.',
  })
  preview(@Body() dto: ImportPreviewRequestDto) {
    const data = this.importService.preview(dto);
    return { success: true, data };
  }

  @Post('commit')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enregistre les transactions normalisées dans le compte de l’utilisateur connecté',
    description:
      'Exige une session valide et vérifie que le compte bancaire cible appartient à l’utilisateur connecté.',
  })
  @ApiResponse({
    status: 201,
    description: 'Transactions importées et persistées avec succès.',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié : token manquant ou expiré.',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé : compte cible non possédé par l’utilisateur.',
  })
  async commit(@Req() req: any, @Body() dto: ImportCommitRequestDto) {
    const data = await this.importService.commit(req.user.id, dto);
    return { success: true, data };
  }
}

import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Logger,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PowensService } from './powens.service';
import { SyncService } from '../sync/sync.service';

@ApiTags('Powens Webhook')
@Controller('powens/webhook')
export class PowensWebhookController {
  private readonly logger = new Logger(PowensWebhookController.name);

  constructor(
    private readonly powensService: PowensService,
    private readonly syncService: SyncService,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Réception asynchrone des événements bancaires Powens' })
  async handleWebhook(
    @Headers('x-powens-signature') signature: string,
    @Body() payload: any,
  ) {
    this.logger.log(`Webhook Powens reçu: ${payload?.event || 'unknown'}`);

    // En production, vérification obligatoire de la signature HMAC
    if (process.env.NODE_ENV === 'production') {
      const isValid = this.powensService.verifyWebhookSignature(
        JSON.stringify(payload),
        signature,
      );
      if (!isValid) {
        throw new UnauthorizedException('Signature de webhook Powens invalide');
      }
    }

    // Traitement asynchrone pour répondre < 500ms au webhook
    setImmediate(async () => {
      try {
        await this.syncService.handleSyncEvent(payload);
      } catch (err) {
        this.logger.error(`Erreur lors du traitement asynchrone du webhook`, err);
      }
    });

    return { received: true };
  }
}

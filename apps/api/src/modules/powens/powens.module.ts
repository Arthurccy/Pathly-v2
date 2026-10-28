import { Module } from '@nestjs/common';
import { PowensService } from './powens.service';
import { PowensController } from './powens.controller';
import { PowensWebhookController } from './powens-webhook.controller';
import { EncryptionService } from '../../common/security/encryption.service';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [SyncModule],
  controllers: [PowensController, PowensWebhookController],
  providers: [PowensService, EncryptionService],
  exports: [PowensService],
})
export class PowensModule {}

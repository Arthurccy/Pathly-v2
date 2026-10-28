import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@pathly/database';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  /**
   * Pipeline d'ingestion bancaire asynchrone suite à un événement Powens
   */
  async handleSyncEvent(payload: any): Promise<void> {
    const startTime = Date.now();
    const itemId = payload.itemId || payload.id;
    this.logger.log(`Début du pipeline de synchronisation pour l'item Powens #${itemId}`);

    try {
      // 1. Récupération de la connexion bancaire liée
      const connection = await prisma.bankConnection.findFirst({
        where: { powensItemId: Number(itemId) },
      });

      if (!connection) {
        this.logger.warn(`Aucune connexion locale trouvée pour l'item #${itemId}`);
        return;
      }

      // 2. Mettre à jour le statut en SYNCING
      await prisma.bankConnection.update({
        where: { id: connection.id },
        data: { status: 'SYNCING', lastSyncAttempt: new Date() },
      });

      // 3. Modélisation de l'ingestion (Victor & Rémy brancheront ici la récupération granulaire)
      // Ex: powensService.getAccounts -> upsert prisma.bankAccount
      // Ex: powensService.getTransactions -> upsert prisma.bankTransaction

      const durationMs = Date.now() - startTime;

      // 4. Mettre à jour le statut en CONNECTED et consigner le log d'audit
      await prisma.bankConnection.update({
        where: { id: connection.id },
        data: {
          status: 'CONNECTED',
          lastSuccessfulSync: new Date(),
          errorMessage: null,
        },
      });

      await prisma.syncLog.create({
        data: {
          connectionId: connection.id,
          status: 'SUCCESS',
          transactionsCount: 0,
          durationMs,
          details: `Sync terminée avec succès pour l'événement: ${payload?.event || 'webhook'}`,
        },
      });

      this.logger.log(`Synchronisation de l'item #${itemId} terminée avec succès en ${durationMs}ms`);
    } catch (error: any) {
      this.logger.error(`Échec du pipeline de synchronisation pour l'item #${itemId}`, error);
      // Consignation d'audit d'erreur
      await prisma.syncLog.create({
        data: {
          connectionId: itemId ? String(itemId) : 'unknown',
          status: 'ERROR',
          durationMs: Date.now() - startTime,
          details: error?.message || 'Erreur inconnue',
        },
      }).catch(() => {});
    }
  }
}

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { EncryptionService } from '../../common/security/encryption.service';
import { createHmac } from 'crypto';

@Injectable()
export class PowensService {
  private readonly logger = new Logger(PowensService.name);
  private readonly apiUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly webhookSecret: string;

  constructor(private readonly encryptionService: EncryptionService) {
    this.apiUrl = process.env.POWENS_API_URL || 'https://api.bridgeapi.io';
    this.clientId = process.env.POWENS_CLIENT_ID || '';
    this.clientSecret = process.env.POWENS_CLIENT_SECRET || '';
    this.webhookSecret = process.env.POWENS_WEBHOOK_SECRET || '';
  }

  /**
   * En-têtes bancaires sécurisés (Server-to-Server)
   * Aucune clé secrète n'est exposée au client !
   */
  private getHeaders(accessToken?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Client-Id': this.clientId,
      'Client-Secret': this.clientSecret,
      'Bridge-Version': '2025-01-15',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }

  /**
   * Génère une URL de connexion Powens Connect sécurisée pour l'utilisateur
   */
  async generateConnectUrl(userId: string, redirectUri: string): Promise<string> {
    this.logger.log(`Génération Powens Connect URL pour l'utilisateur : ${userId}`);

    // Appel à l'API Powens Connect
    const response = await fetch(`${this.apiUrl}/v2/connect/items/add/url`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        redirect_url: redirectUri,
        // user_uuid interne pour lier la session Powens
        context: { user_id: userId },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Erreur Powens Connect: ${errorText}`);
      throw new BadRequestException('Impossible d\'initialiser la session de connexion bancaire');
    }

    const data = await response.json();
    return data.redirect_url;
  }

  /**
   * Récupère les comptes d'une connexion bancaire Powens
   */
  async getAccounts(encryptedAccessToken: string) {
    const decryptedToken = this.encryptionService.decrypt(encryptedAccessToken);

    const response = await fetch(`${this.apiUrl}/v2/accounts`, {
      method: 'GET',
      headers: this.getHeaders(decryptedToken),
    });

    if (!response.ok) {
      throw new BadRequestException('Erreur lors de la récupération des comptes bancaires');
    }

    return response.json();
  }

  /**
   * Récupère les transactions d'un compte avec pagination
   */
  async getTransactions(encryptedAccessToken: string, accountId: number, sinceDate?: string) {
    const decryptedToken = this.encryptionService.decrypt(encryptedAccessToken);
    const query = sinceDate ? `?since=${sinceDate}&limit=100` : '?limit=100';

    const response = await fetch(`${this.apiUrl}/v2/accounts/${accountId}/transactions${query}`, {
      method: 'GET',
      headers: this.getHeaders(decryptedToken),
    });

    if (!response.ok) {
      throw new BadRequestException('Erreur lors de la récupération des transactions');
    }

    return response.json();
  }

  /**
   * Valide la signature cryptographique du Webhook Powens (HMAC-SHA256)
   */
  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
    if (!this.webhookSecret || !signatureHeader) return false;
    const computedSignature = createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');
    return computedSignature === signatureHeader;
  }
}

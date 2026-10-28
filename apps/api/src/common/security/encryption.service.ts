import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const rawKey = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    // S'assure d'avoir exactement 32 octets pour AES-256
    this.key = Buffer.from(rawKey.slice(0, 64), 'hex');
    if (this.key.length !== 32) {
      this.key = Buffer.alloc(32, rawKey);
    }
  }

  /**
   * Chiffre un texte sensible (ex: token bancaire) en AES-256-GCM
   * Format de sortie: iv:authTag:encryptedContent (hex)
   */
  encrypt(text: string): string {
    try {
      const iv = randomBytes(16);
      const cipher = createCipheriv(this.algorithm, this.key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag();

      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new InternalServerErrorException('Erreur de chiffrement du token bancaire');
    }
  }

  /**
   * Déchiffre une chaîne chiffrée
   */
  decrypt(cipherText: string): string {
    try {
      const [ivHex, authTagHex, encryptedData] = cipherText.split(':');
      if (!ivHex || !authTagHex || !encryptedData) {
        throw new Error('Format de texte chiffré invalide');
      }

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new InternalServerErrorException('Erreur de déchiffrement du token bancaire');
    }
  }
}

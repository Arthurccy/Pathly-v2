import type { Request } from 'express';

/**
 * Requête après passage du SupabaseAuthGuard (zone de Yann) : `user` provient
 * de la session validée côté API, jamais d'un identifiant fourni par le navigateur.
 */
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email?: string;
    metadata?: Record<string, unknown>;
  };
}

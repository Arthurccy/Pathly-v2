import type {
  ApiResponse,
  BankAccountDto,
  BankTransactionDto,
  ImportCommitRequestDto,
  ImportCommitResult,
  ImportPreviewRequestDto,
  ImportPreviewResult,
  UpdateProfileDto,
  UserProfileDto,
} from '@pathly/shared-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Codes d'erreur produits par le client lorsque le serveur n'en fournit pas.
 * Si la réponse d'erreur suit le contrat ApiResponse (`error.code`), ce code est conservé
 * tel quel (ex. PROFILE_EMAIL_CONFLICT). Le statut HTTP est toujours dans `error.details.status`.
 */
export type ApiClientErrorCode =
  | 'SESSION_REQUIRED' // aucun jeton : la requête n'est pas envoyée
  | 'UNAUTHORIZED' // 401 : session absente, invalide ou expirée
  | 'FORBIDDEN' // 403 : ressource d'un autre utilisateur
  | 'NOT_FOUND' // 404
  | 'CONFLICT' // 409
  | 'VALIDATION_ERROR' // 400 / 422
  | 'SERVER_ERROR' // 5xx
  | 'INVALID_RESPONSE' // réponse non conforme au contrat ApiResponse
  | 'TIMEOUT_EXCEEDED'
  | 'NETWORK_ERROR'
  | `HTTP_${number}`;

export interface ApiErrorDetails {
  status?: number;
  body?: unknown;
}

type Json = Record<string, unknown>;

function isRecord(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function codeForStatus(status: number): ApiClientErrorCode {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 400 || status === 422) return 'VALIDATION_ERROR';
  if (status >= 500) return 'SERVER_ERROR';
  return `HTTP_${status}`;
}

const DEFAULT_MESSAGES: Partial<Record<ApiClientErrorCode, string>> = {
  UNAUTHORIZED: 'Session absente ou expirée : reconnectez-vous.',
  FORBIDDEN: 'Accès refusé à cette ressource.',
  NOT_FOUND: 'Ressource introuvable.',
  CONFLICT: 'Conflit avec des données existantes.',
  VALIDATION_ERROR: 'Données envoyées invalides.',
  SERVER_ERROR: 'Erreur du serveur API.',
};

/** NestJS renvoie `message` en chaîne ou en tableau (erreurs de validation). */
function messageFrom(value: unknown): string | null {
  if (typeof value === 'string' && value.trim() !== '') return value;
  if (Array.isArray(value)) {
    const parts = value.filter((part): part is string => typeof part === 'string' && part.trim() !== '');
    return parts.length > 0 ? parts.join(' ; ') : null;
  }
  return null;
}

function failure<T>(code: string, message: string, details?: ApiErrorDetails): ApiResponse<T> {
  return { success: false, error: { code, message, ...(details ? { details } : {}) } };
}

/** Transforme une réponse HTTP en erreur du contrat, en gardant le code serveur s'il existe. */
function errorFromHttp<T>(status: number, body: unknown): ApiResponse<T> {
  const fallbackCode = codeForStatus(status);
  const contractError = isRecord(body) && isRecord(body.error) ? body.error : null;
  const code = (contractError && typeof contractError.code === 'string' && contractError.code) || fallbackCode;
  const message =
    messageFrom(contractError?.message) ??
    (isRecord(body) ? messageFrom(body.message) : null) ??
    DEFAULT_MESSAGES[fallbackCode] ??
    `Erreur HTTP ${status}.`;
  return failure<T>(code, message, { status, body });
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.trim() === '') return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Jeton de session Supabase. `requireAuth` → SESSION_REQUIRED sans appel réseau s'il manque. */
  jwtToken?: string | null;
  requireAuth?: boolean;
  timeoutMs?: number;
}

export class ApiClient {
  static async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', body, jwtToken, requireAuth = true, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

    if (requireAuth && !jwtToken) {
      return failure<T>('SESSION_REQUIRED', 'Connexion requise : aucune session utilisateur disponible.');
    }

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (jwtToken) headers['Authorization'] = `Bearer ${jwtToken}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      const payload = await readBody(response);

      if (!response.ok) return errorFromHttp<T>(response.status, payload);

      // Succès sans contenu (204) : pas de données, pas d'erreur.
      if (payload === undefined) return { success: true };

      if (!isRecord(payload) || typeof payload.success !== 'boolean') {
        return failure<T>('INVALID_RESPONSE', 'Réponse du serveur non conforme au contrat ApiResponse.', {
          status: response.status,
          body: payload,
        });
      }
      return payload as unknown as ApiResponse<T>;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return failure<T>('TIMEOUT_EXCEEDED', `Le serveur API n'a pas répondu en ${timeoutMs / 1000} s.`);
      }
      const message = error instanceof Error && error.message ? error.message : 'Impossible de joindre le serveur API.';
      return failure<T>('NETWORK_ERROR', message);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // --- COMPTES & OPÉRATIONS (Victor) ---
  // L'API convertit les montants Decimal en nombres (repositories de Victor) ;
  // lib/dashboard/api-source.ts reste tolérant aux deux formes.

  static async getAccounts(jwtToken: string | null) {
    return this.request<BankAccountDto[]>('/accounts', { jwtToken });
  }

  static async getTransactions(jwtToken: string | null, limit = 50, cursor?: string) {
    const query = new URLSearchParams({ limit: String(limit) });
    if (cursor) query.set('cursor', cursor);
    return this.request<BankTransactionDto[]>(`/transactions?${query.toString()}`, { jwtToken });
  }

  // --- PROFIL COURANT (Yann) — contrat packages/shared-types/src/me.ts ---

  static async getMe(jwtToken: string | null) {
    return this.request<UserProfileDto>('/me', { jwtToken });
  }

  static async updateMe(jwtToken: string | null, update: UpdateProfileDto) {
    return this.request<UserProfileDto>('/me', { method: 'PATCH', body: update, jwtToken });
  }

  // --- IMPORT DE RELEVÉS (Rémy) — contrat packages/shared-types/src/import.ts ---

  /** Prévisualisation sans persistance : la session n'est pas exigée, mais transmise si présente. */
  static async previewImport(request: ImportPreviewRequestDto, jwtToken?: string | null) {
    return this.request<ImportPreviewResult>('/import/preview', {
      method: 'POST',
      body: request,
      jwtToken,
      requireAuth: false,
    });
  }

  static async commitImport(jwtToken: string | null, request: ImportCommitRequestDto) {
    return this.request<ImportCommitResult>('/import/commit', { method: 'POST', body: request, jwtToken });
  }

  // --- POWENS CONNECT ---
  static async getConnectUrl(jwtToken: string | null, redirectUri: string) {
    return this.request<{ connectUrl: string }>('/powens/connect-url', {
      method: 'POST',
      body: { redirectUri },
      jwtToken,
    });
  }
}

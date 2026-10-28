import { ApiResponse, BankAccountDto, BankTransactionDto } from '@pathly/shared-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    jwtToken?: string,
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: json?.message || 'Erreur lors de la requête API',
            details: json,
          },
        };
      }

      return json;
    } catch (error: any) {
      clearTimeout(timeoutId);
      return {
        success: false,
        error: {
          code: error.name === 'AbortError' ? 'TIMEOUT_EXCEEDED' : 'NETWORK_ERROR',
          message: error.message || 'Impossible de joindre le serveur API NestJS',
        },
      };
    }
  }

  // --- BANK ACCOUNTS ---
  static async getAccounts(jwtToken: string) {
    return this.request<BankAccountDto[]>('/accounts', { method: 'GET' }, jwtToken);
  }

  // --- TRANSACTIONS ---
  static async getTransactions(jwtToken: string, limit = 50, cursor?: string) {
    const query = cursor ? `?limit=${limit}&cursor=${cursor}` : `?limit=${limit}`;
    return this.request<BankTransactionDto[]>(`/transactions${query}`, { method: 'GET' }, jwtToken);
  }

  // --- POWENS CONNECT ---
  static async getConnectUrl(jwtToken: string, redirectUri: string) {
    return this.request<{ connectUrl: string }>(
      '/powens/connect-url',
      {
        method: 'POST',
        body: JSON.stringify({ redirectUri }),
      },
      jwtToken,
    );
  }
}

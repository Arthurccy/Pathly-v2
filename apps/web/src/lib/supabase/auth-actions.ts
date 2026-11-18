import type { ApiResponse, BankAccountDto } from '@pathly/shared-types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AccountsApiPort {
  getAccounts(jwtToken: string): Promise<ApiResponse<BankAccountDto[]>>;
}

export interface SupabaseAuthPort {
  signInWithPassword(credentials: LoginCredentials): Promise<{
    data: {
      user: { email?: string | null } | null;
      session: { access_token: string } | null;
    };
    error: { message: string } | null;
  }>;
  signOut(): Promise<{
    error: { message: string } | null;
  }>;
}

export type AuthActionResult =
  | { success: true; email: string; accounts: BankAccountDto[] }
  | { success: false; message: string };

export type SignOutResult =
  | { success: true }
  | { success: false; message: string };

export type AccountsLoadResult =
  | { success: true; accounts: BankAccountDto[] }
  | { success: false; message: string };

export async function loadAccounts(
  api: AccountsApiPort,
  accessToken: string,
): Promise<AccountsLoadResult> {
  const response = await api.getAccounts(accessToken);

  if (!response.success) {
    return {
      success: false,
      message: response.error?.message ?? 'Impossible de charger vos comptes.',
    };
  }

  if (!response.data) {
    return {
      success: false,
      message: 'La réponse de l’API comptes est incomplète.',
    };
  }

  return { success: true, accounts: response.data };
}

export async function signIn(
  auth: SupabaseAuthPort,
  api: AccountsApiPort,
  credentials: LoginCredentials,
): Promise<AuthActionResult> {
  const { data, error } = await auth.signInWithPassword(credentials);

  if (error) {
    return { success: false, message: error.message };
  }

  if (!data.session || !data.user) {
    return {
      success: false,
      message: 'La connexion n’a pas établi de session utilisateur.',
    };
  }

  const accountsResult = await loadAccounts(api, data.session.access_token);
  if (!accountsResult.success) {
    return accountsResult;
  }

  return {
    success: true,
    email: data.user.email ?? credentials.email,
    accounts: accountsResult.accounts,
  };
}

export async function signOut(
  auth: SupabaseAuthPort,
): Promise<SignOutResult> {
  const { error } = await auth.signOut();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}

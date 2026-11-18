export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SupabaseAuthPort {
  signInWithPassword(credentials: LoginCredentials): Promise<{
    data: {
      user: { email?: string | null } | null;
      session: object | null;
    };
    error: { message: string } | null;
  }>;
  signOut(): Promise<{
    error: { message: string } | null;
  }>;
}

export type AuthActionResult =
  | { success: true; email: string }
  | { success: false; message: string };

export type SignOutResult =
  | { success: true }
  | { success: false; message: string };

export async function signIn(
  auth: SupabaseAuthPort,
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

  return {
    success: true,
    email: data.user.email ?? credentials.email,
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

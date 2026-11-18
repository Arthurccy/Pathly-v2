/**
 * Mutation optimiste isolée.
 * La confirmation recopie la valeur affichée en mémoire. Elle ne persiste rien :
 * aucun endpoint d'écriture n'est appelé ici.
 * Le raccordement réel consiste à passer la vraie mutation au moment où elle existe.
 */

export type MutationPhase = 'idle' | 'pending' | 'confirmed' | 'rolled_back';

export interface ServerRefusal {
  kind: 'server_refusal';
  code: string;
  message: string;
}

export interface NetworkFailure {
  kind: 'network_error';
  message: string;
}

export type MutationFailure = ServerRefusal | NetworkFailure;

export interface OptimisticState<T> {
  confirmed: T;
  displayed: T;
  phase: MutationPhase;
  failure: MutationFailure | null;
}

export class ServerRefusalError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ServerRefusalError';
    this.code = code;
  }
}

export class NetworkErrorException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkErrorException';
  }
}

export function idleState<T>(value: T): OptimisticState<T> {
  return {
    confirmed: value,
    displayed: value,
    phase: 'idle',
    failure: null,
  };
}

/** La valeur affichée doit être une nouvelle valeur. L'état confirmé n'est pas modifié. */
export function applyOptimistic<T>(state: OptimisticState<T>, displayed: T): OptimisticState<T> {
  return {
    confirmed: state.confirmed,
    displayed,
    phase: 'pending',
    failure: null,
  };
}

export function failureFromApiError(error: { code: string; message: string }): MutationFailure {
  if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT_EXCEEDED') {
    return { kind: 'network_error', message: error.message };
  }
  return { kind: 'server_refusal', code: error.code, message: error.message };
}

export function classifyMutationError(error: unknown): MutationFailure {
  if (error instanceof ServerRefusalError) {
    return { kind: 'server_refusal', code: error.code, message: error.message };
  }
  if (error instanceof NetworkErrorException) {
    return { kind: 'network_error', message: error.message };
  }
  if (isApiError(error)) {
    return failureFromApiError(error);
  }
  const message = error instanceof Error ? error.message : 'Erreur inconnue';
  return { kind: 'network_error', message };
}

function isApiError(error: unknown): error is { code: string; message: string } {
  if (typeof error !== 'object' || error === null) return false;
  const candidate = error as { code?: unknown; message?: unknown };
  return typeof candidate.code === 'string' && typeof candidate.message === 'string';
}

function rolledBack<T>(state: OptimisticState<T>, failure: MutationFailure): OptimisticState<T> {
  return {
    confirmed: state.confirmed,
    displayed: state.confirmed,
    phase: 'rolled_back',
    failure,
  };
}

/**
 * `mutate` résout si l'écriture simulée est acceptée, ou rejette.
 * Un rejet restaure la valeur confirmée. La valeur optimiste n'est pas conservée.
 */
export async function settleOptimistic<T>(
  state: OptimisticState<T>,
  mutate: () => Promise<void>,
): Promise<OptimisticState<T>> {
  if (state.phase !== 'pending') {
    throw new Error('settleOptimistic attend une mutation en cours');
  }

  try {
    await mutate();
    return {
      confirmed: state.displayed,
      displayed: state.displayed,
      phase: 'confirmed',
      failure: null,
    };
  } catch (error) {
    return rolledBack(state, classifyMutationError(error));
  }
}

type ApiWriteResult =
  | { success: true }
  | { success: false; error: { code: string; message: string } };

/**
 * Adapte un résultat déjà normalisé (succès ou erreur), sans ouvrir de route.
 * Une exception levée par `request` est traitée comme une erreur réseau.
 */
export async function settleFromApiResult<T>(
  state: OptimisticState<T>,
  request: () => Promise<ApiWriteResult>,
): Promise<OptimisticState<T>> {
  return settleOptimistic(state, async () => {
    let result: ApiWriteResult;
    try {
      result = await request();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de joindre le serveur';
      throw new NetworkErrorException(message);
    }

    if (!result.success) {
      const failure = failureFromApiError(result.error);
      if (failure.kind === 'network_error') {
        throw new NetworkErrorException(failure.message);
      }
      throw new ServerRefusalError(failure.code, failure.message);
    }
  });
}

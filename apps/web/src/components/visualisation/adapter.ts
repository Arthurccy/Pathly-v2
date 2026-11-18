/**
 * Adaptateur pur : réponse `ApiResponse<T>` (contrat existant de `packages/shared-types`, renvoyée
 * par `ApiClient` de `apps/web/src/lib/api-client.ts`) → état `VisualState<T>` des composants.
 *
 * Aucun appel réseau ici : l'intégrateur appelle l'API, puis passe la réponse à cet adaptateur.
 * Une erreur n'est jamais transformée en donnée vide ou en zéro.
 */
import type { ApiResponse } from '@pathly/shared-types';
import type { VisualState } from './contracts';

export const DEFAULT_ERROR_MESSAGE = 'Données indisponibles (erreur de la requête).';

export function apiResponseToVisualState<T>(response: ApiResponse<T>): VisualState<T> {
  if (!response.success) {
    return { status: 'error', message: response.error?.message || DEFAULT_ERROR_MESSAGE };
  }
  if (response.data === undefined || response.data === null) {
    return { status: 'empty' };
  }
  return { status: 'ready', data: response.data };
}

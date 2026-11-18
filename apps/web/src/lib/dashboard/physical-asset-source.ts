import type { PhysicalAssetDto } from '@pathly/shared-types';
import type { PhysicalAssetInput } from './physical-asset-form';
import type { DataResult, DemoScenario } from './types';

const DEMO_USER_ID = 'demo-user';
const DEMO_LATENCY_MS = 350;

/** Exemple fictif aligné sur l'exemple patrimonial de référence (10 000 € de biens). */
export const DEMO_PHYSICAL_ASSETS: PhysicalAssetDto[] = [
  {
    id: 'demo-asset-1',
    userId: DEMO_USER_ID,
    name: 'Véhicule (exemple fictif)',
    category: 'VEHICLE',
    estimatedValue: 10000,
    purchasePrice: 14500,
    purchaseDate: '2022-03-15',
    currency: 'EUR',
    notes: 'Valeur fictive de démonstration.',
  },
];

/** Aucun endpoint d'écriture ou de lecture des biens physiques n'existe dans `apps/api` : on ne simule pas un succès. */
const NOT_AVAILABLE_READ = {
  code: 'NOT_AVAILABLE',
  message: 'Lecture indisponible : aucun endpoint API pour les biens physiques n’est encore livré.',
};
const NOT_AVAILABLE_WRITE = {
  code: 'NOT_AVAILABLE',
  message: 'Enregistrement indisponible : aucun endpoint API pour les biens physiques n’est encore livré.',
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function loadDemoAssets(scenario: DemoScenario): Promise<DataResult<PhysicalAssetDto[]>> {
  await wait(DEMO_LATENCY_MS);
  if (scenario === 'error') {
    return { ok: false, error: { code: 'DEMO_ERROR', message: 'Erreur simulée : la liste des biens est indisponible.' } };
  }
  return { ok: true, data: scenario === 'empty' ? [] : DEMO_PHYSICAL_ASSETS };
}

let demoSequence = 0;

/** Enregistrement de démonstration : en mémoire uniquement, perdu au rechargement. */
export async function createDemoAsset(
  input: PhysicalAssetInput,
  scenario: DemoScenario,
): Promise<DataResult<PhysicalAssetDto>> {
  await wait(DEMO_LATENCY_MS);
  if (scenario === 'error') {
    return { ok: false, error: { code: 'DEMO_ERROR', message: 'Erreur simulée : le bien n’a pas été enregistré.' } };
  }
  demoSequence += 1;
  return { ok: true, data: { id: `demo-asset-new-${demoSequence}`, userId: DEMO_USER_ID, ...input } };
}

export async function loadApiAssets(): Promise<DataResult<PhysicalAssetDto[]>> {
  return { ok: false, error: NOT_AVAILABLE_READ };
}

export async function createApiAsset(): Promise<DataResult<PhysicalAssetDto>> {
  return { ok: false, error: NOT_AVAILABLE_WRITE };
}

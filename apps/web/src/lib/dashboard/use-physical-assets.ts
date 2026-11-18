'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PhysicalAssetDto } from '@pathly/shared-types';
import type { PhysicalAssetInput } from './physical-asset-form';
import { createApiAsset, createDemoAsset, loadApiAssets, loadDemoAssets } from './physical-asset-source';
import type { DataResult, DataSourceChoice, DemoScenario, RemoteState } from './types';

export interface PhysicalAssetsData {
  assets: RemoteState<PhysicalAssetDto[]>;
  create: (input: PhysicalAssetInput) => Promise<DataResult<PhysicalAssetDto>>;
  reload: () => void;
}

export function usePhysicalAssets(source: DataSourceChoice): PhysicalAssetsData {
  const [assets, setAssets] = useState<RemoteState<PhysicalAssetDto[]>>({ status: 'loading' });
  const [reloadCount, setReloadCount] = useState(0);
  const scenario = source === 'api' ? null : (source.slice('demo:'.length) as DemoScenario);

  useEffect(() => {
    let cancelled = false;
    setAssets({ status: 'loading' });

    const request = scenario === null ? loadApiAssets() : loadDemoAssets(scenario);
    request
      .then((result) => {
        if (cancelled) return;
        if (!result.ok || !result.data) {
          setAssets({
            status: 'error',
            code: result.error?.code ?? 'UNKNOWN_ERROR',
            message: result.error?.message ?? 'Erreur inconnue.',
          });
        } else {
          setAssets(result.data.length === 0 ? { status: 'empty' } : { status: 'ready', data: result.data });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAssets({ status: 'error', code: 'UNEXPECTED_ERROR', message: 'Une erreur inattendue est survenue.' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [scenario, reloadCount]);

  const create = useCallback(
    async (input: PhysicalAssetInput): Promise<DataResult<PhysicalAssetDto>> => {
      const result = scenario === null ? await createApiAsset() : await createDemoAsset(input, scenario);
      const created = result.ok ? result.data : undefined;
      if (created) {
        setAssets((previous) => ({
          status: 'ready',
          data: [created, ...(previous.status === 'ready' ? previous.data : [])],
        }));
      }
      return result;
    },
    [scenario],
  );

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  return { assets, create, reload };
}

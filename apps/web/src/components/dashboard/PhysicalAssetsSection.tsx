'use client';

import React, { useId, useRef, useState } from 'react';
import { CheckCircle2, Gem, PlusCircle } from 'lucide-react';
import type { PhysicalAssetDto } from '@pathly/shared-types';
import { formatCurrency, formatDate } from '@/lib/dashboard/format';
import { ASSET_CATEGORY_LABELS, type PhysicalAssetInput } from '@/lib/dashboard/physical-asset-form';
import type { DataResult, RemoteState } from '@/lib/dashboard/types';
import { PhysicalAssetForm } from './PhysicalAssetForm';
import { SkeletonRows, StateMessage } from './StateMessage';
import { BUTTON_SECONDARY, CARD, MUTED_TEXT } from './styles';

function AssetCard({ asset }: { asset: PhysicalAssetDto }): React.JSX.Element {
  return (
    <li className={`${CARD} space-y-2 p-5`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">{asset.name}</h3>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {ASSET_CATEGORY_LABELS[asset.category]}
        </span>
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">
        {formatCurrency(asset.estimatedValue, asset.currency)}
        <span className={`ml-2 text-xs font-medium ${MUTED_TEXT}`}>valeur estimée</span>
      </p>
      {(asset.purchasePrice != null || asset.purchaseDate) && (
        <p className={`text-xs ${MUTED_TEXT}`}>
          {asset.purchasePrice != null && <>Acheté {formatCurrency(asset.purchasePrice, asset.currency)}</>}
          {asset.purchasePrice != null && asset.purchaseDate && ' · '}
          {asset.purchaseDate && <time dateTime={asset.purchaseDate}>{formatDate(asset.purchaseDate)}</time>}
        </p>
      )}
      {asset.notes && <p className={`text-xs italic ${MUTED_TEXT}`}>{asset.notes}</p>}
    </li>
  );
}

interface PhysicalAssetsSectionProps {
  state: RemoteState<PhysicalAssetDto[]>;
  isDemo: boolean;
  onCreate: (input: PhysicalAssetInput) => Promise<DataResult<PhysicalAssetDto>>;
  onRetry: () => void;
}

export function PhysicalAssetsSection({
  state,
  isDemo,
  onCreate,
  onRetry,
}: PhysicalAssetsSectionProps): React.JSX.Element {
  const formId = useId();
  const [formOpen, setFormOpen] = useState(false);
  const [savedName, setSavedName] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeForm = (): void => {
    setFormOpen(false);
    toggleRef.current?.focus();
  };

  return (
    <section id="biens" aria-labelledby="biens-title" className="scroll-mt-28 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="biens-title" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <Gem className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          Biens physiques
        </h2>
        {state.status !== 'loading' && (
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={formOpen}
            aria-controls={formOpen ? formId : undefined}
            onClick={() => {
              setSavedName(null);
              setFormOpen((open) => !open);
            }}
            className={BUTTON_SECONDARY}
          >
            <PlusCircle className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            {formOpen ? 'Fermer le formulaire' : 'Ajouter un bien'}
          </button>
        )}
      </div>

      <div role="status" aria-live="polite">
        {savedName && (
          <p className="flex items-start gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Bien « {savedName} » ajouté
              {isDemo ? ' (démonstration : conservé en mémoire seulement, non enregistré en base).' : '.'}
            </span>
          </p>
        )}
      </div>

      {formOpen && (
        <PhysicalAssetForm
          formId={formId}
          isDemo={isDemo}
          onSubmit={onCreate}
          onSaved={(input) => {
            setSavedName(input.name);
            closeForm();
          }}
          onCancel={closeForm}
        />
      )}

      {state.status === 'loading' && (
        <div role="status" aria-label="Chargement des biens">
          <SkeletonRows rows={1} />
        </div>
      )}
      {state.status === 'empty' && (
        <StateMessage
          kind="empty"
          title="Aucun bien renseigné"
          description="Ajoutez un bien (logement, véhicule, montre…) pour le suivre ici."
        />
      )}
      {state.status === 'error' && (
        <StateMessage kind="error" title="Impossible d’afficher les biens" description={state.message} onRetry={onRetry} />
      )}
      {state.status === 'ready' && (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.data.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </ul>
      )}
    </section>
  );
}

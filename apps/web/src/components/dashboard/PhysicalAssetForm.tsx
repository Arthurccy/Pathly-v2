'use client';

import React, { useId, useState, type FormEvent, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import type { AssetCategory } from '@pathly/shared-types';
import {
  ASSET_CATEGORIES,
  ASSET_CATEGORY_LABELS,
  EMPTY_FORM_VALUES,
  NOTES_MAX_LENGTH,
  todayIsoDate,
  validatePhysicalAsset,
  type PhysicalAssetField,
  type PhysicalAssetFormErrors,
  type PhysicalAssetFormValues,
  type PhysicalAssetInput,
} from '@/lib/dashboard/physical-asset-form';
import type { DataResult } from '@/lib/dashboard/types';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, FIELD, FIELD_INVALID } from './styles';

const FIELD_ORDER: PhysicalAssetField[] = [
  'name',
  'category',
  'estimatedValue',
  'purchasePrice',
  'purchaseDate',
  'notes',
];

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: (props: { id: string; invalid: boolean; describedBy: string | undefined }) => ReactNode;
}

function Field({ id, label, required, hint, error, children }: FieldProps): React.JSX.Element {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-bold text-slate-800 dark:text-slate-200">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-rose-600">
            {' '}
            *
          </span>
        ) : (
          <span className="font-medium text-slate-600 dark:text-slate-400"> (facultatif)</span>
        )}
      </label>
      {children({ id, invalid: Boolean(error), describedBy })}
      {hint && (
        <p id={hintId} className="text-[11px] text-slate-600 dark:text-slate-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-semibold text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

interface PhysicalAssetFormProps {
  formId: string;
  isDemo: boolean;
  onSubmit: (input: PhysicalAssetInput) => Promise<DataResult<unknown>>;
  onSaved: (input: PhysicalAssetInput) => void;
  onCancel: () => void;
}

export function PhysicalAssetForm({
  formId,
  isDemo,
  onSubmit,
  onSaved,
  onCancel,
}: PhysicalAssetFormProps): React.JSX.Element {
  const prefix = useId();
  const [values, setValues] = useState<PhysicalAssetFormValues>(EMPTY_FORM_VALUES);
  const [errors, setErrors] = useState<PhysicalAssetFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fieldId = (field: PhysicalAssetField): string => `${prefix}-${field}`;
  const update = (field: PhysicalAssetField, value: string): void => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (submitting) return;
    setSubmitError(null);

    const validation = validatePhysicalAsset(values);
    if (!validation.ok) {
      setErrors(validation.errors);
      const firstInvalid = FIELD_ORDER.find((field) => validation.errors[field]);
      if (firstInvalid) document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmit(validation.input);
      if (result.ok) {
        onSaved(validation.input);
      } else {
        setSubmitError(result.error?.message ?? 'Le bien n’a pas pu être enregistré.');
      }
    } catch {
      setSubmitError('Une erreur inattendue est survenue : le bien n’a pas été enregistré.');
    } finally {
      setSubmitting(false);
    }
  };

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form
      id={formId}
      noValidate
      onSubmit={handleSubmit}
      aria-label="Ajouter un bien physique"
      className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40"
    >
      <p className="text-xs text-slate-600 dark:text-slate-400">
        Les champs marqués d’une étoile sont obligatoires. Montants en euros.{' '}
        {isDemo && 'Mode démonstration : le bien reste en mémoire et disparaît au rechargement.'}
      </p>

      {errorCount > 0 && (
        <p role="alert" className="text-xs font-bold text-rose-700 dark:text-rose-300">
          {errorCount} champ(s) à corriger avant l’enregistrement.
        </p>
      )}
      {submitError && (
        <p
          role="alert"
          className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-900 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100"
        >
          {submitError} Vos saisies sont conservées.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field id={fieldId('name')} label="Nom du bien" required error={errors.name}>
          {({ id, invalid, describedBy }) => (
            <input
              id={id}
              type="text"
              autoComplete="off"
              value={values.name}
              onChange={(event) => update('name', event.target.value)}
              aria-invalid={invalid}
              aria-required="true"
              aria-describedby={describedBy}
              placeholder="Ex. Appartement T3 Rouen"
              className={`${FIELD} w-full ${invalid ? FIELD_INVALID : ''}`}
            />
          )}
        </Field>

        <Field id={fieldId('category')} label="Catégorie" required error={errors.category}>
          {({ id, invalid, describedBy }) => (
            <select
              id={id}
              value={values.category}
              onChange={(event) => update('category', event.target.value)}
              aria-invalid={invalid}
              aria-required="true"
              aria-describedby={describedBy}
              className={`${FIELD} w-full font-semibold ${invalid ? FIELD_INVALID : ''}`}
            >
              {ASSET_CATEGORIES.map((category: AssetCategory) => (
                <option key={category} value={category}>
                  {ASSET_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field
          id={fieldId('estimatedValue')}
          label="Valeur estimée (€)"
          required
          hint="Estimation personnelle, par exemple 12 500,50."
          error={errors.estimatedValue}
        >
          {({ id, invalid, describedBy }) => (
            <input
              id={id}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={values.estimatedValue}
              onChange={(event) => update('estimatedValue', event.target.value)}
              aria-invalid={invalid}
              aria-required="true"
              aria-describedby={describedBy}
              className={`${FIELD} w-full ${invalid ? FIELD_INVALID : ''}`}
            />
          )}
        </Field>

        <Field id={fieldId('purchasePrice')} label="Prix d’achat (€)" error={errors.purchasePrice}>
          {({ id, invalid, describedBy }) => (
            <input
              id={id}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={values.purchasePrice}
              onChange={(event) => update('purchasePrice', event.target.value)}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={`${FIELD} w-full ${invalid ? FIELD_INVALID : ''}`}
            />
          )}
        </Field>

        <Field id={fieldId('purchaseDate')} label="Date d’achat" error={errors.purchaseDate}>
          {({ id, invalid, describedBy }) => (
            <input
              id={id}
              type="date"
              max={todayIsoDate()}
              value={values.purchaseDate}
              onChange={(event) => update('purchaseDate', event.target.value)}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={`${FIELD} w-full ${invalid ? FIELD_INVALID : ''}`}
            />
          )}
        </Field>

        <div className="md:col-span-2">
          <Field
            id={fieldId('notes')}
            label="Notes"
            hint={`${NOTES_MAX_LENGTH} caractères maximum.`}
            error={errors.notes}
          >
            {({ id, invalid, describedBy }) => (
              <textarea
                id={id}
                rows={2}
                value={values.notes}
                onChange={(event) => update('notes', event.target.value)}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={`${FIELD} w-full ${invalid ? FIELD_INVALID : ''}`}
              />
            )}
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={submitting} className={BUTTON_PRIMARY}>
          {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
          {submitting ? 'Enregistrement…' : 'Enregistrer le bien'}
        </button>
        <button type="button" onClick={onCancel} disabled={submitting} className={BUTTON_SECONDARY}>
          Annuler
        </button>
      </div>
    </form>
  );
}

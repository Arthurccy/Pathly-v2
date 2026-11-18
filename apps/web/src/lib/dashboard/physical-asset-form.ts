import type { AssetCategory } from '@pathly/shared-types';

/**
 * Validation pure de la saisie d'un bien physique. Aucun import d'exécution : le module reste testable
 * isolément (`pnpm --filter @pathly/web test:unit`).
 */

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  REAL_ESTATE: 'Immobilier',
  VEHICLE: 'Véhicule',
  WATCH: 'Montre',
  JEWELRY: 'Bijou',
  ART: 'Œuvre d’art',
  TECH: 'Matériel technologique',
  OTHER: 'Autre',
};

export const ASSET_CATEGORIES = Object.keys(ASSET_CATEGORY_LABELS) as AssetCategory[];

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const NOTES_MAX_LENGTH = 500;
/** Limite de la colonne `Decimal(12, 2)` du schéma Prisma. */
export const MAX_AMOUNT = 9_999_999_999.99;
export const MIN_PURCHASE_DATE = '1900-01-01';

export interface PhysicalAssetFormValues {
  name: string;
  category: string;
  estimatedValue: string;
  purchasePrice: string;
  purchaseDate: string;
  notes: string;
}

export type PhysicalAssetField = keyof PhysicalAssetFormValues;

export type PhysicalAssetFormErrors = Partial<Record<PhysicalAssetField, string>>;

export interface PhysicalAssetInput {
  name: string;
  category: AssetCategory;
  estimatedValue: number;
  purchasePrice: number | null;
  purchaseDate: string | null;
  currency: 'EUR';
  notes: string | null;
}

export type PhysicalAssetValidation =
  | { ok: true; input: PhysicalAssetInput }
  | { ok: false; errors: PhysicalAssetFormErrors };

export const EMPTY_FORM_VALUES: PhysicalAssetFormValues = {
  name: '',
  category: 'VEHICLE',
  estimatedValue: '',
  purchasePrice: '',
  purchaseDate: '',
  notes: '',
};

const AMOUNT_HINT = 'chiffres uniquement, au plus 2 décimales (ex. 12500,50)';

/**
 * Convertit un montant saisi en euros (virgule ou point, espaces tolérés) en nombre.
 * Retourne `null` si le format est invalide ; une saisie à plus de 2 décimales est refusée, jamais arrondie.
 */
export function parseEuroAmount(raw: string): number | null {
  const cleaned = raw.replace(/[\s\u00a0\u202f]/g, '').replace(',', '.');
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(cleaned);
  if (!match) return null;
  const euros = match[1] ?? '0';
  const decimals = (match[2] ?? '').padEnd(2, '0');
  const cents = Number(euros) * 100 + Number(decimals);
  const amount = cents / 100;
  return Number.isSafeInteger(cents) && amount <= MAX_AMOUNT ? amount : null;
}

function isRealDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function todayIsoDate(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function validatePhysicalAsset(
  values: PhysicalAssetFormValues,
  today: string = todayIsoDate(),
): PhysicalAssetValidation {
  const errors: PhysicalAssetFormErrors = {};

  const name = values.name.trim();
  if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    errors.name = `Le nom est obligatoire (${NAME_MIN_LENGTH} à ${NAME_MAX_LENGTH} caractères).`;
  }

  const category = ASSET_CATEGORIES.find((candidate) => candidate === values.category);
  if (!category) {
    errors.category = 'Choisissez une catégorie dans la liste.';
  }

  let estimatedValue: number | null = null;
  if (values.estimatedValue.trim() === '') {
    errors.estimatedValue = 'La valeur estimée est obligatoire.';
  } else {
    estimatedValue = parseEuroAmount(values.estimatedValue);
    if (estimatedValue === null) {
      errors.estimatedValue = `Montant invalide : ${AMOUNT_HINT}.`;
    } else if (estimatedValue <= 0) {
      errors.estimatedValue = 'La valeur estimée doit être supérieure à 0.';
    }
  }

  let purchasePrice: number | null = null;
  if (values.purchasePrice.trim() !== '') {
    purchasePrice = parseEuroAmount(values.purchasePrice);
    if (purchasePrice === null) {
      errors.purchasePrice = `Montant invalide : ${AMOUNT_HINT}.`;
    }
  }

  const purchaseDate = values.purchaseDate.trim();
  if (purchaseDate !== '') {
    if (!isRealDate(purchaseDate)) {
      errors.purchaseDate = 'Date invalide : utilisez une date réelle au format AAAA-MM-JJ.';
    } else if (purchaseDate > today) {
      errors.purchaseDate = 'La date d’achat ne peut pas être dans le futur.';
    } else if (purchaseDate < MIN_PURCHASE_DATE) {
      errors.purchaseDate = 'La date d’achat doit être postérieure à 1900.';
    }
  }

  const notes = values.notes.trim();
  if (notes.length > NOTES_MAX_LENGTH) {
    errors.notes = `Les notes sont limitées à ${NOTES_MAX_LENGTH} caractères.`;
  }

  if (Object.keys(errors).length > 0 || !category || estimatedValue === null) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      name,
      category,
      estimatedValue,
      purchasePrice,
      purchaseDate: purchaseDate === '' ? null : purchaseDate,
      currency: 'EUR',
      notes: notes === '' ? null : notes,
    },
  };
}

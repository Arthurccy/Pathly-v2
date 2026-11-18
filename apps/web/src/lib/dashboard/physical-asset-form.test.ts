import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  EMPTY_FORM_VALUES,
  parseEuroAmount,
  validatePhysicalAsset,
  type PhysicalAssetFormValues,
} from './physical-asset-form.ts';

const TODAY = '2026-11-18';

function form(overrides: Partial<PhysicalAssetFormValues>): PhysicalAssetFormValues {
  return { ...EMPTY_FORM_VALUES, name: 'Appartement T3', estimatedValue: '10000', ...overrides };
}

describe('parseEuroAmount', () => {
  it('accepte virgule, point, espaces et convertit sans erreur flottante', () => {
    assert.equal(parseEuroAmount('12 500,50'), 12500.5);
    assert.equal(parseEuroAmount('0.30'), 0.3);
    assert.equal(parseEuroAmount('19,9'), 19.9);
    assert.equal(parseEuroAmount('1\u00a0000'), 1000);
  });

  it('refuse les formats ambigus ou invalides au lieu de les arrondir', () => {
    for (const raw of ['', 'abc', '-5', '12.500', '1e3', '12,345', '1,2,3', '9999999999,99€']) {
      assert.equal(parseEuroAmount(raw), null, raw);
    }
  });

  it('respecte la limite Decimal(12, 2)', () => {
    assert.equal(parseEuroAmount('9999999999,99'), 9999999999.99);
    assert.equal(parseEuroAmount('10000000000'), null);
  });
});

describe('validatePhysicalAsset', () => {
  it('valide une saisie nominale complète et normalise les valeurs', () => {
    const result = validatePhysicalAsset(
      form({
        name: '  Rolex Submariner  ',
        category: 'WATCH',
        estimatedValue: '8 500,00',
        purchasePrice: '7000',
        purchaseDate: '2021-05-04',
        notes: '  Boîte et papiers  ',
      }),
      TODAY,
    );
    assert.deepEqual(result, {
      ok: true,
      input: {
        name: 'Rolex Submariner',
        category: 'WATCH',
        estimatedValue: 8500,
        purchasePrice: 7000,
        purchaseDate: '2021-05-04',
        currency: 'EUR',
        notes: 'Boîte et papiers',
      },
    });
  });

  it('accepte une saisie minimale : champs facultatifs vides donnent null', () => {
    const result = validatePhysicalAsset(form({}), TODAY);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.input.purchasePrice, null);
      assert.equal(result.input.purchaseDate, null);
      assert.equal(result.input.notes, null);
    }
  });

  it('signale tous les champs obligatoires manquants', () => {
    const result = validatePhysicalAsset(EMPTY_FORM_VALUES, TODAY);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(Object.keys(result.errors).sort(), ['estimatedValue', 'name']);
    }
  });

  it('refuse une valeur nulle, négative ou mal formée', () => {
    for (const estimatedValue of ['0', '-100', 'dix mille', '12.345']) {
      const result = validatePhysicalAsset(form({ estimatedValue }), TODAY);
      assert.equal(result.ok, false, estimatedValue);
      if (!result.ok) assert.ok(result.errors.estimatedValue, estimatedValue);
    }
  });

  it('refuse une catégorie inconnue', () => {
    const result = validatePhysicalAsset(form({ category: 'YACHT' }), TODAY);
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.errors.category);
  });

  it('refuse les dates inexistantes, futures ou antérieures à 1900', () => {
    for (const purchaseDate of ['2026-02-30', '2026-13-01', '18/11/2026', '2026-11-19', '1899-12-31']) {
      const result = validatePhysicalAsset(form({ purchaseDate }), TODAY);
      assert.equal(result.ok, false, purchaseDate);
      if (!result.ok) assert.ok(result.errors.purchaseDate, purchaseDate);
    }
    assert.equal(validatePhysicalAsset(form({ purchaseDate: TODAY }), TODAY).ok, true);
    assert.equal(validatePhysicalAsset(form({ purchaseDate: '2024-02-29' }), TODAY).ok, true);
  });

  it('applique les limites de longueur du nom et des notes', () => {
    assert.equal(validatePhysicalAsset(form({ name: ' a ' }), TODAY).ok, false);
    assert.equal(validatePhysicalAsset(form({ name: 'x'.repeat(101) }), TODAY).ok, false);
    assert.equal(validatePhysicalAsset(form({ name: 'x'.repeat(100) }), TODAY).ok, true);
    assert.equal(validatePhysicalAsset(form({ notes: 'n'.repeat(501) }), TODAY).ok, false);
  });
});

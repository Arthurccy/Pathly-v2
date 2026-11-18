/**
 * Utilitaires stricts de parsing et validation pour les relevés bancaires (CSV & OFX).
 * Garantit le principe « aucune perte silencieuse » (Pathly V2).
 */

/**
 * Valide une date de manière stricte (rejet des années hors plage, mois invalides,
 * et jours impossibles comme le 31 février ou les années bissextiles incorrectes).
 */
export function isValidDate(year: number, month: number, day: number): boolean {
  if (year < 1970 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const d = new Date(year, month - 1, day);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}

/**
 * Normalisation stricte de montants monétaires.
 * - Supprime les symboles de monnaie (€, $, £) et les espaces / espaces insécables.
 * - Gère le format comptable entre parenthèses: `(42.50)` -> `-42.50`.
 * - Valide rigoureusement le format via regex (0 à 2 décimales, séparateurs conformes).
 * - Rejette strictement :
 *    - Chaînes avec caractères parasites (ex: `12abc`)
 *    - Plus de 2 décimales (ex: `-42,505`, `0.001`)
 *    - Formats ambigus ou non supportés (ex: `1.234` sans virgule décimale, `12,5,3`)
 * - Renvoie `null` en cas d'invalidité pour lever une erreur explicite `amount`.
 */
export function parseStrictAmount(amountStr: string): number | null {
  if (typeof amountStr !== 'string') return null;

  let cleaned = amountStr.trim();
  if (!cleaned) return null;

  // Supprimer les symboles de devise et les espaces (y compris insécables)
  cleaned = cleaned.replace(/[\s\u00A0\u202F€$£]/g, '');

  // Format comptable avec parenthèses: (42.50) -> -42.50
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    cleaned = '-' + cleaned.slice(1, -1).trim();
  }

  // Signe optionnel
  let sign = 1;
  if (cleaned.startsWith('-')) {
    sign = -1;
    cleaned = cleaned.slice(1);
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }

  if (!cleaned) return null;

  let normalizedNumberStr: string | null = null;

  if (cleaned.includes('.') && cleaned.includes(',')) {
    // Cas 1 : Présence des deux séparateurs
    if (/^\d{1,3}(\.\d{3})+,\d{1,2}$/.test(cleaned)) {
      // Format européen avec milliers en points et décimales en virgule: 1.234,56
      normalizedNumberStr = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (/^\d{1,3}(,\d{3})+\.\d{1,2}$/.test(cleaned)) {
      // Format anglo-saxon avec milliers en virgules et décimales en point: 1,234.56
      normalizedNumberStr = cleaned.replace(/,/g, '');
    } else {
      // Format invalide / corrompu avec les deux séparateurs
      return null;
    }
  } else if (cleaned.includes(',')) {
    // Cas 2 : Uniquement des virgules (décimale européenne)
    // Doit comporter exactement 1 ou 2 décimales après l'unique virgule
    if (/^\d+,\d{1,2}$/.test(cleaned)) {
      normalizedNumberStr = cleaned.replace(',', '.');
    } else {
      return null;
    }
  } else if (cleaned.includes('.')) {
    // Cas 3 : Uniquement des points (décimale standard / US / OFX)
    // Doit comporter exactement 1 ou 2 décimales après l'unique point
    // Note : "1.234" a 3 décimales -> rejeté pour éviter toute corruption de solde
    if (/^\d+\.\d{1,2}$/.test(cleaned)) {
      normalizedNumberStr = cleaned;
    } else {
      return null;
    }
  } else {
    // Cas 4 : Entier pur
    if (/^\d+$/.test(cleaned)) {
      normalizedNumberStr = cleaned;
    } else {
      return null;
    }
  }

  const num = Number(normalizedNumberStr);
  if (isNaN(num)) return null;

  const result = sign * num;
  // Éviter -0
  return Object.is(result, -0) ? 0 : Math.round(result * 100) / 100;
}

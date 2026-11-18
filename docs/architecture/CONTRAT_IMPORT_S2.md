# S2 — Contrat d'Import Bancaire & Réponses pour Ishak

**Auteurs** : Rémi Porquet (Import bancaire) & Ishak (Schéma BDD & Contrats partagés)  
**Séance** : 2  
**Référence** : `docs/architecture/CONTRATS_SEANCE_2.md`  
**Branche implémentée** : `feat/back-bank-statement-parser`  

---

## 1. Modèle de données & Création du compte d'import

- **Validation de la proposition** : **OK à 100 %**.
- L'ajout de `source ConnectionSource @default(POWENS)` avec `POWENS | MANUAL | FILE_IMPORT` sur `BankConnection` est parfait.
- **Qui crée le compte et la connexion ?**
  - **Auto au premier commit & réutilisation intelligente** : dans `POST /api/v1/import/commit`, `accountId` est optionnel :
    - Si `accountId` est fourni : on vérifie que le compte appartient bien à l'utilisateur connecté (rejet 403 sinon).
    - Si `accountId` est omis :
      1. Le service cherche si une connexion d'import (`FILE_IMPORT`) et un compte associé existent déjà pour cet utilisateur.
      2. **S'il existe déjà un compte d'import** : il le réutilise directement (évite la création de comptes doublons et active immédiatement la détection anti-doublon des transactions !).
      3. **S'il n'en existe pas encore** : il crée automatiquement la `BankConnection` et le `BankAccount` (type `CHECKING`).
    - L'`accountId` utilisé est toujours renvoyé dans la réponse `ImportCommitResult.accountId` pour que le frontend puisse le mémoriser.
- **Gestion du solde (`currentBalance`)** :
  - D'accord à 100 % pour rendre `currentBalance` nullable (`Decimal?`) en base.
  - Ajout du champ optionnel `initialBalance?: number` dans `ImportCommitRequestDto` permettant à l'utilisateur de renseigner son vrai solde au moment de l'import. S'il n'est pas saisi, le solde restera `null` (solde inconnu) pour ne pas fausser le Safe-to-Spend de Victor avec un faux 0.

---

## 2. Unités et conventions

- **Montant (`amount`)** : **Nombre décimal en euros** (ex: `-42.5` ou `2100.0`), et non des centimes.
- **Signe** : **Négatif pour une dépense/débit** (`-42.50`), **positif pour un revenu/crédit** (`2100.00`).
- **Devise (`currency`)** : Strictement `"EUR"` par défaut.
- **Date métier (`date`)** : Format strict ISO `"YYYY-MM-DD"`.

---

## 3. Nom de type canonique : `ImportPreviewResult`

On garde **`ImportPreviewResult`** dans `packages/shared-types/src/import.ts`.  
(Un alias de compatibilité `type ParseResult = ImportPreviewResult` a été laissé dans l'API).

```typescript
export interface NormalizedImportTransaction {
  lineNumber: number;
  date: string;                       // Strictement 'YYYY-MM-DD'
  rawDescription: string;             // Libellé original non altéré
  cleanedDescription?: string | null; // Normalisation commerçant (ex: 'Monoprix', 'Salaire')
  amount: number;                     // Nombre décimal en euros (ex: -42.50 ou 2100.00)
  currency: string;                   // 'EUR'
  category?: string | null;           // Ex: 'ALIMENTATION', 'REVENU', 'ENERGIE'
  fingerprint: string;                // Empreinte SHA-256 déterministe avec numéro d'occurrence
}

export interface ImportRowError {
  lineNumber: number;
  rawContent: string;
  field?: 'date' | 'amount' | 'description' | 'format';
  reason: string;
}

export interface ImportPreviewResult {
  totalRows: number;
  validCount: number;
  errorCount: number;
  fileFingerprint: string;
  transactions: NormalizedImportTransaction[];
  errors: ImportRowError[];
}
```

---

## 4. Politique de gestion des erreurs de ligne

- **Mode tolérant (non-destructif)** :
  - Une ligne invalide ne rejette pas l'ensemble du fichier.
  - Les lignes valides sont conservées et retournées dans `transactions`.
  - Les lignes corrompues sont isolées dans `errors` avec `lineNumber`, `rawContent`, `field` et `reason`.
- **Règle pour le `commit`** : `400 Bad Request` uniquement si `validCount === 0`.
- **Atomicité / Transactions BDD** : Bien noté pour la S6.

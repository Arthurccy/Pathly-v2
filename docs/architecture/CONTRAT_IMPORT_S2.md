# S2 — Contrat d'Import Bancaire & Réponses pour Ishak et l'Équipe

**Auteurs** : Rémi Porquet (Import bancaire) & Ishak (Schéma BDD & Contrats partagés)  
**Relecteurs** : Victor Hebert (Core API), Loris Neve (Frontend Web)  
**Séance** : 2  
**Référence** : `docs/architecture/CONTRATS_SEANCE_2.md`  
**Branche implémentée** : `feat/back-bank-statement-parser`  

---

## 1. Modèle de données & Création du compte d'import

- **Validation de la proposition** : **OK à 100 %**.
- **Champ `source`** : L'ajout de `source ConnectionSource @default(POWENS)` avec `POWENS | MANUAL | FILE_IMPORT` sur `BankConnection` est validé et **prévu dans le schéma cible d'Ishak**. En attendant son introduction dans `schema.prisma`, le code identifie la connexion d'import via `institutionName: 'Relevé importé'`.
- **Qui crée le compte et la connexion ?**
  - **Auto au premier commit & réutilisation intelligente** : dans `POST /api/v1/import/commit`, `accountId` est optionnel :
    - Si `accountId` est fourni : vérification stricte UUID (`@IsUUID()`) et contrôle de propriété de l'utilisateur connecté (rejet 403 Forbidden sinon).
    - Si `accountId` est omis :
      1. Le service cherche si une connexion d'import (`institutionName: 'Relevé importé'`) et un compte associé existent déjà pour cet utilisateur.
      2. **S'il existe déjà un compte d'import** : il le réutilise directement (évite la création de comptes doublons et active immédiatement la détection anti-doublon des transactions !).
      3. **S'il n'en existe pas encore** : il crée automatiquement la `BankConnection` et le `BankAccount` (type `CHECKING`).
    - L'`accountId` utilisé est toujours renvoyé dans la réponse `ImportCommitResult.accountId` pour que le frontend puisse le mémoriser.
- **Gestion du solde (`currentBalance`)** :
  - D'accord à 100 % pour rendre `currentBalance` nullable (`Decimal?`) en base.
  - Ajout du champ optionnel `initialBalance?: number` dans `ImportCommitRequestDto` permettant à l'utilisateur de renseigner son vrai solde au moment de l'import. S'il n'est pas saisi, le solde initial par défaut est 0 pour respecter le schéma actuel non-nullable.

---

## 2. Unités, conventions & validation stricte (Revue Victor)

- **Montant (`amount`)** : **Nombre décimal en euros** (ex: `-42.5` ou `2100.0`), et non des centimes.
- **Signe** : **Négatif pour une dépense/débit** (`-42.50`), **positif pour un revenu/crédit** (`2100.00`). Format comptable avec parenthèses pris en charge : `(42.50)` -> `-42.50`.
- **Validation stricte des montants (aucune perte silencieuse)** :
  - Un montant doit comporter au maximum 2 décimales.
  - Rejet systématique en erreur de ligne `amount` pour toute chaîne mal formée : caractères alphabétiques parasites (`12abc`), 3 décimales (`-42,505`, `1.234`), multiples séparateurs (`12,5,3`).
- **Détection des colonnes CSV** :
  - La colonne `solde` (ou `balance`, `valeur`) n'est **jamais** confondue avec le `montant` de l'opération lors de la détection automatique des en-têtes.
  - Fichiers sans en-tête : si la 1ʳᵉ ligne correspond à des données de transaction valides, elle est conservée et traitée comme première transaction (aucune ligne perdue).
- **Format OFX** :
  - Les dates sont strictement validées via `isValidDate` (rejet des dates impossibles comme `20260231` ou des années hors plage `00011012`).
  - Le champ `lineNumber` en OFX correspond au **numéro d'index (1-based) du bloc `<STMTTRN>`**.
- **Contrôle de devise (`currency`)** :
  - Devise par défaut : `"EUR"`.
  - En cas d'incohérence entre la devise du relevé (ou de la transaction) et celle du compte cible, l'import est rejeté en `400 Bad Request` sans aucune conversion implicite.
- **Date métier (`date`)** : Format strict ISO `"YYYY-MM-DD"`.

---

## 3. Types de données & Contrats partagés

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

export interface ImportCommitResult {
  accountId: string;
  totalRead: number;
  importedCount: number;
  skippedDuplicatesCount: number;
  skippedDuplicates: Array<{
    lineNumber: number;
    date: string;
    amount: number;
    rawDescription: string;
  }>;
  errorCount: number;
  errors: Array<{ lineNumber: number; reason: string }>;
  transactions: Array<{
    id: string;
    date: string;
    amount: number;
    currency: string;
    rawDescription: string;
    cleanedDescription?: string | null;
  }>;
}
```

---

## 4. Politique de gestion des erreurs et des doublons

- **Mode tolérant (non-destructif) en prévisualisation** :
  - Une ligne invalide ne rejette pas l'ensemble du fichier.
  - Les lignes valides sont conservées et retournées dans `transactions`.
  - Les lignes corrompues sont isolées dans `errors` avec `lineNumber`, `rawContent`, `field` et `reason`.
- **Règle pour le `commit`** :
  - `400 Bad Request` si `validCount === 0` (aucune transaction exploitable).
  - `400 Bad Request` si écart de devise entre compte cible et relevé.
  - `403 Forbidden` si le compte cible spécifié n'appartient pas à l'utilisateur connecté.
  - Les transactions identifiées comme doublons sont ignorées et listées exhaustivement dans `skippedDuplicates` pour l'affichage frontend (Loris).
- **Persistance atomique / Transactions BDD** :
  - Planifiée pour la **Séance 6** avec `prisma.$transaction`.

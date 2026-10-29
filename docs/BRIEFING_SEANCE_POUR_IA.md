# 📋 PATHLY V2 — BRIEFING & STANDARDS POUR DÉVELOPPEURS ASSISTÉS PAR IA

> **Document de cadrage pour l'équipe (8 membres) et leurs agents IA (Claude 3.5 Sonnet, Gemini 1.5 Pro/Argon, etc.)**  
> **Objectif :** Cadre de rigueur maximale, standards Git stricts, vélocité décuplée par l'IA et livrables lourds finalisés en fin de séance.

---

## 🤖 1. System Prompt Universel pour les IA de chaque développeur

Chaque développeur de l'équipe **DOIT copier-coller ce bloc d'instructions** dans sa session IA avant d'écrire la moindre ligne de code :

```text
TU ES L'AGENT IA DE DÉVELOPPEMENT DÉDIÉ AU PROJET FINTECH "PATHLY V2".
TU COLLABORES AVEC UN DÉVELOPPEUR AU SEIN D'UNE ÉQUIPE DE 8 EXPERTS.
TU DOIS RESPECTER STRICTEMENT LES RÈGLES D'ARCHITECTURE SUIVANTES :

1. ARCHITECTURE MONOREPO :
   - Gestionnaire : pnpm avec Turborepo.
   - N'installe JAMAIS de dépendance à la racine. Utilise toujours :
     `pnpm --filter <app-ou-package> add <nom-du-paquet>`
   - Le Frontend est Next.js 15 (App Router, Tailwind CSS, TypeScript strict).
   - Le Backend est NestJS 11 (Clean Architecture, TypeScript strict, DTOs class-validator).
   - L'ORM est Prisma dans packages/database connecté à Supabase V2.
   - Les contrats d'API et DTOs partagés sont TOUJOURS dans packages/shared-types.

2. RÈGLES DE CODAGE & SÉCURITÉ BANCAIRE :
   - Strict TypeScript : le type `any` est STRICTEMENT INTERDIT. Crée des interfaces précises.
   - Aucune fuite de clé secrète côté client. Les clés bancaires et service_role restent sur apps/api.
   - Chiffrement AES-256-GCM obligatoire pour tout token ou donnée bancaire sensible au repos.
   - Validation systématique des payloads entrants via ValidationPipe et class-validator.
   - Gestion d'erreurs normalisée : retourne toujours ApiResponse<T> ({ success, data, error }).

3. PERFORMANCE & CORE WEB VITALS :
   - Temps de réponse API < 500ms.
   - Utilise la pagination par curseur (cursor-based) pour les transactions.
   - Composants 3D (Three.js / React Three Fiber) chargés dynamiquement avec { ssr: false }.
   - Streaming SSR avec React Suspense et Skeleton screens sur toutes les pages de données.

4. DÉMARCHE DE TRAVAIL :
   - Fournis toujours du code complet et directement exécutable (aucun "TODO: implémenter plus tard").
   - Écris les tests unitaires associés à chaque fonctionnalité.
   - Respecte scrupuleusement la convention des branches et des commits Git de l'équipe.
```

---

## 🌲 2. Standards Git, Branches & Pull Requests

### A. Convention de nommage des branches
Chaque développeur travaille dans sa branche dédiée issue de `main` :

| Rôle | Développeur | Nom de la branche obligatoire |
| :--- | :--- | :--- |
| **Tech Lead / Pilotage** | Arthur COURCHAY | `chore/scrum-ci-rules` |
| **Backend — API & Core** | Victor HUBERT | `feat/back-api-domain-mock` |
| **Backend — Ingestion** | Rémy PORQUET | `feat/back-bank-statement-parser` |
| **Full Stack — Database** | Ishak MESSAOUDI | `feat/fullstack-prisma-seed-bridge` |
| **Frontend — Design System**| Loris NEVE | `feat/front-shadcn-responsive-layout` |
| **Frontend — 3D & Anim** | Jeremy CHAN-FUNG-TING | `feat/front-r3f-canvas-motion` |
| **Web Perf** | Clément LAUMOND | `feat/perf-streaming-bundle-benchmarks`|
| **SEO & Sémantique** | Mathias BOUCLON | `feat/seo-metadata-schema-ld` |

### B. Conventional Commits obligatoires
Tous les commits doivent suivre la syntaxe :
* `feat(scope): message` : Nouvelle fonctionnalité
* `fix(scope): message` : Correction de bug
* `perf(scope): message` : Optimisation de performance
* `refactor(scope): message` : Refactorisation sans modification fonctionnelle
* `test(scope): message` : Ajout ou correction de tests

*Exemples valides :*
* `feat(api): implémentation du parseur OFX universel`
* `feat(web): ajout de la sidebar responsive avec sheet mobile`
* `perf(transactions): migration vers pagination par curseur Prisma`

### C. Règles de Pull Request & Merge sur `main`
1. **Zéro commit direct sur `main`**.
2. Avant d'ouvrir une PR, exécuter localement à la racine :
   ```bash
   pnpm lint
   pnpm build
   ```
3. Tout doit compiler sans la moindre erreur TypeScript ni warning bloquant.
4. Validation par au moins un reviewer (Arthur ou le binôme de spécialité) avant merge.

---

## ⚡ 3. Feuilles de Route Séance 2 — Objectifs Lourds par Spécialité

Puisque toute l'équipe travaille avec l'IA, **la cadence attendue est d'un niveau professionnel supérieur**. Chacun doit avoir livré et mergé son périmètre d'ici la fin de la séance.

---

### 👑 Arthur COURCHAY — Lead Technique & Architecture
* **Mission du jour :** Arbitrage des contrats d'API, gouvernance du monorepo et protection CI.
* **Tâches précises :**
  1. Vérifier la conformité des schémas d'API entre Victor (Back), Rémy (Ingestion) et Ishak (Types partagés).
  2. Mettre en place un script de vérification globale dans la racine `package.json` :
     * `"check-all": "turbo run lint build"`
  3. Mettre en place un hook Git de pré-commit avec Husky + lint-staged (ou règles Turborepo) pour interdire tout commit avec des erreurs de typage ou de formatage.
  4. Réaliser la revue de code des 7 PRs avant intégration dans `main`.

---

### 🛠️ Victor HUBERT — Développeur Backend (Architecture Serveur & Logique Métier)
* **Mission du jour :** Construire l'API métier des comptes et transactions + le générateur de fausses données (Mock Provider) haute performance.
* **Tâches précises :**
  1. **Finaliser `AccountsModule` et `TransactionsModule`** dans `apps/api` :
     * Routes REST complètes documentées Swagger (`@ApiTags`, `@ApiOperation`, `@ApiResponse`).
     * Filtres avancés sur les transactions : par période (`startDate`, `endDate`), par type de compte, par montant minimum/maximum, par catégorie.
  2. **Créer le `MockBankingService`** :
     * Implémenter un service capable de générer à la volée un portefeuille complet (1 Compte Courant, 1 Livret Épargne, 1 Compte Titres) avec 100 transactions réparties sur 6 mois.
     * Permettre la simulation d'événements bancaires (crédit salaire, prélèvement loyer) pour alimenter les graphiques de Loris et Jeremy.
  3. **Tests unitaires :** Écrire les tests Jest sur les calculs de solde et le filtrage des transactions.

---

### 💳 Rémy PORQUET — Développeur Backend (Ingestion Bancaire & Parsers)
* **Mission du jour :** Construire le moteur d'importation universel de relevés bancaires (solution alternative à Powens, 100% gratuite et souveraine).
* **Tâches précises :**
  1. **Créer le module `apps/api/src/modules/import/`** :
     * Créer le service `BankStatementParserService`.
  2. **Implémenter les parseurs multi-formats :**
     * **Format universel OFX (Open Financial Exchange)** : parser les balises `<STMTTRN>`, `<TRNAMT>`, `<DTPOSTED>`, `<NAME>`, `<MEMO>`.
     * **Format CSV auto-adaptatif banques françaises** : détecter automatiquement les formats BoursoBank, Crédit Agricole, BNP Paribas, Société Générale et Revolut via l'en-tête CSV.
  3. **Algorithme de déduplication cryptographique :**
     * Générer un hash unique SHA-256 pour chaque transaction : `SHA256(date + "|" + amount + "|" + rawDescription)`.
     * Si le hash existe déjà en base pour ce compte, ignorer la transaction (empêche tout doublon lors d'imports successifs).
  4. **Endpoint d'upload :** `POST /api/v1/import/upload` avec support multipart/form-data et validation de type de fichier (`.ofx`, `.csv`).

---

### 🔄 Ishak MESSAOUDI — Développeur Full Stack (Passerelle Front/Back & Données)
* **Mission du jour :** Stabiliser la persistance BDD Prisma, automatiser le Seeding et connecter le client API partagé.
* **Tâches précises :**
  1. **Prisma & Supabase V2 (`packages/database`) :**
     * Valider les tables : `user_profiles`, `bank_accounts`, `bank_transactions`, `categories`, `import_hashes`.
     * Créer le script `packages/database/prisma/seed.ts` pour générer en une commande (`pnpm db:seed`) un jeu complet de test.
  2. **Contrats partagés (`packages/shared-types`) :**
     * Exporter toutes les interfaces typées nécessaires à l'équipe : `BankAccountDto`, `BankTransactionDto`, `CreateTransactionDto`, `ImportResultDto`, `KpiSummaryDto`.
  3. **Client API Web (`apps/web/src/lib/api-client.ts`) :**
     * Finaliser les méthodes d'appels typées avec gestion automatique du Bearer token Supabase.
     * Ajouter la gestion de cache et de timeout réseau (< 500ms).

---

### 🎨 Loris NEVE — Frontend UI / UX & Design System
* **Mission du jour :** Mettre en place le Design System shadcn/ui complet et le layout responsive Desktop/Mobile.
* **Tâches précises :**
  1. **Configuration shadcn/ui dans `apps/web` :**
     * Installer et configurer les composants atomiques : `Button`, `Card`, `Badge`, `Dialog`, `Sheet`, `DropdownMenu`, `Tabs`, `Skeleton`, `Table`.
     * Personnaliser la palette graphique FinTech : Dark mode élégant (`#070B14`), accents émeraude (`#10B981`) et dégradés ardoise.
  2. **Shell Applicatif Responsive (Layout) :**
     * **Desktop :** Sidebar rétractable avec état actif des routes (Dashboard, Comptes, Transactions, Simulations, Paramètres).
     * **Mobile :** Bottom Navigation Bar fixe ergonomique avec icônes Lucide-react + Sheet (menu tiroir) pour les réglages.
  3. **Composants FinTech réutilisables :**
     * `BalanceCard` (affichage du solde avec formatage monétaire `Intl.NumberFormat`).
     * `TransactionItem` (icône par catégorie, montant vert/rouge, libellé tronqué proprement).
     * `TrendBadge` (+X.X% par rapport au mois précédent).

---

### 🌐 Jeremy CHAN-FUNG-TING — Frontend Animations & 3D Web
* **Mission du jour :** Monter la scène 3D interactive (React Three Fiber) et le système de micro-interactions Framer Motion.
* **Tâches précises :**
  1. **Mise en place de React Three Fiber dans `apps/web` :**
     * Dépendances : `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`.
     * **Règle vitale Performance & SSR :** Créer un composant wrapper `Dynamic3DCanvas` chargé via `next/dynamic` avec `ssr: false` pour éviter toute désynchronisation du Virtual DOM au rendu serveur.
  2. **Création de la scène 3D FinTech :**
     * Carte bancaire holographique 3D interactive qui pivote doucement avec l'accéléromètre / déplacement du curseur souris.
     * Shaders légers ou matériaux métalliques avec reflets environnementaux optimisés.
  3. **Micro-interactions Framer Motion :**
     * Animation de transition fluide entre les pages de l'application.
     * Animation des chiffres des soldes bancaires au chargement (effet compteur de 0 à la valeur cible).
     * Animation d'entrée échelonnée (stagger) des lignes du tableau de transactions.

---

### 🚀 Clément LAUMOND — Performance Web & Core Web Vitals
* **Mission du jour :** Mettre en place l'infrastructure de mesure et garantir un temps de rendu sous les 500ms.
* **Tâches précises :**
  1. **Mesure & Analyse du bundle :**
     * Installer `@next/bundle-analyzer` dans `apps/web`.
     * Configurer le script `pnpm --filter @pathly/web analyze` pour traquer les dépendances trop lourdes.
  2. **Architecture Streaming SSR (Suspense & Skeletons) :**
     * Créer les composants `loading.tsx` avec Skeleton screens adaptés sur chaque route de `apps/web`.
     * Garantir un **First Contentful Paint (FCP) < 1.0s** et un **Cumulative Layout Shift (CLS) = 0**.
  3. **Audit de performance initial :**
     * Mettre en place un benchmark Lighthouse (Desktop et Mobile) et consigner les premiers scores dans un rapport `docs/PERF_REPORT_SEANCE_2.md`.
     * Vérifier que la compression Gzip/Brotli et les headers de cache HTTP sont bien paramétrés dans `next.config.ts`.

---

### 🔍 Mathias BOUCLON — SEO & Référencement Technique
* **Mission du jour :** Déployer l'architecture SEO technique complète sous Next.js 15 App Router.
* **Tâches précises :**
  1. **Moteur dynamique de métadonnées (`generateMetadata`) :**
     * Définir les titres optimisés, méta-descriptions incitatives et mots-clés FinTech ciblés.
     * Configuration complète des balises **OpenGraph** et **Twitter Cards** pour les partages sur réseaux sociaux.
  2. **Génération automatique des fichiers SEO :**
     * Créer `apps/web/src/app/sitemap.ts` (génération dynamique du sitemap XML).
     * Créer `apps/web/src/app/robots.ts` (directive d'indexation pour les moteurs de recherche).
  3. **Données structurées Schema.org (JSON-LD) :**
     * Intégrer un script JSON-LD de type `SoftwareApplication` et `FinancialService` dans le `RootLayout` pour un affichage enrichi dans les résultats Google (Rich Snippets).
  4. **Structure sémantique HTML :**
     * Vérifier l'arborescence des balises `h1`, `h2`, `h3`, les attributs `alt` sur les images, et l'accessibilité ARIA (`role`, `aria-label`).

---

## 🏁 4. Grille de Validation de Fin de Séance (Definition of Done)

Avant de quitter la séance, chaque développeur doit cocher sa case et soumettre sa PR :

* [ ] **Arthur :** La pipeline `turbo run lint build` s'exécute à 100% sans erreur sur l'ensemble du monorepo.
* [ ] **Victor :** L'API `GET /api/v1/accounts` et `GET /api/v1/transactions` renvoie des données mockées réalistes documentées sur Swagger `/docs`.
* [ ] **Rémy :** Un fichier `.ofx` ou `.csv` envoyé sur `POST /api/v1/import/upload` est parsé sans doublon en BDD.
* [ ] **Ishak :** La commande `pnpm db:seed` remplit la base de test en moins de 3 secondes avec des types partagés stricts.
* [ ] **Loris :** L'application a son layout Dark Mode complet avec navigation mobile responsive et composants shadcn/ui.
* [ ] **Jeremy :** La scène 3D tourne à 60 FPS sans bloquer l'hydratation SSR ni ralentir la page.
* [ ] **Clément :** Le rapport Lighthouse confirme un CLS = 0 et un First Contentful Paint < 1.2s.
* [ ] **Mathias :** Le sitemap.xml, robots.txt et le script Schema.org JSON-LD sont validés par les validateurs de code.

---

> *"L'utilisation de l'IA ne diminue pas la rigueur technique, elle augmente l'exigence de clarté architecturale."*  
> **Bonne séance de code à toute l'équipe Pathly !**

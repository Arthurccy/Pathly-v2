# 📋 PATHLY V2 — BRIEFING TECHNIQUE & FEUILLES DE ROUTE JOURNÉE COMPLÈTE (ÉQUIPE DE 8 ASSISTÉE PAR IA)

> **Document de cadrage officiel pour l'équipe (8 membres) et leurs agents IA (Claude 3.5 Sonnet, Gemini 1.5/2.0 Pro, GPT-4o)**  
> **Chef de Projet / Tech Lead :** Arthur COURCHAY  
> **Format :** Journée d'ingénierie intensive (9h00 – 11h30 | 13h00 – 16h30)  
> **Ambition :** Dépasser le stade du MVP étudiant. Construire une FinTech addictive ("Apple of Personal Finance"), réactive en direct, dotée d'un comparateur d'économies 100% gratuit (Open Data) et prête pour la monétisation auprès des Business Angels.

---

## 🤖 1. System Prompt Universel (À injecter impérativement dans votre session IA)

Chaque développeur de l'équipe **DOIT copier-coller ce bloc d'instructions** dans sa session IA avant d'écrire la moindre ligne de code :

```text
TU ES L'AGENT IA DE DÉVELOPPEMENT DÉDIÉ AU PROJET FINTECH "PATHLY V2".
TU COLLABORES AVEC UN DÉVELOPPEUR AU SEIN D'UNE ÉQUIPE DE 8 EXPERTS TECH.
NOUS NE FABRIQUONS PAS UN SIMPLE PROTOTYPE, MAIS UNE FINTECH DE NIVEAU COMMERCIAL À FORTE RÉTENTION.

TU DOIS RESPECTER STRICTEMENT LES RÈGLES D'ARCHITECTURE SUIVANTES :

1. ARCHITECTURE MONOREPO & WORKSPACES :
   - Gestionnaire : pnpm avec Turborepo.
   - N'installe JAMAIS de dépendance à la racine. Utilise toujours :
     `pnpm --filter <app-ou-package> add <nom-du-paquet>`
   - Frontend : Next.js 15 (App Router, Tailwind CSS, shadcn/ui, TypeScript strict).
   - Backend : NestJS 11 (Clean Architecture, TypeScript strict, class-validator).
   - ORM : Prisma dans `packages/database` connecté à Supabase V2.
   - Contrats partagés : Tous les types, DTOs et enums sont DANS `packages/shared-types`.

2. STANDARDS DE CODAGE & SÉCURITÉ :
   - Strict TypeScript : le mot-clé `any` est FORMELLEMENT PROSCRIT. Types précis exigés.
   - Sécurité bancaire : Chiffrement AES-256-GCM obligatoire pour tout token ou donnée bancaire.
   - Temps réel : Les calculs (Safe-to-Spend, Net Worth) sont calculés EN DIRECT à la volée (< 50ms), jamais en batch nocturne.
   - Validation des payloads via ValidationPipe et gestion d'erreurs ApiResponse<T>.

3. CADENCE DE TRAVAIL "JOURNÉE COMPLÈTE" :
   - Ne fournis JAMAIS de code minimaliste ou incomplet (aucun "TODO: implémenter plus tard").
   - Structure ton travail en 3 Paliers d'intensité pour couvrir la journée :
     * Palier 1 : Socle fonctionnel & Endpoints P0
     * Palier 2 : Moteur métier avancé, Killer Features & Algorithmes P1
     * Palier 3 : Tests unitaires poussés (Jest > 85%), Edge cases, Captures PPTX & Documentation
   - ZÉRO excuse pour s'arrêter après 1 heure : creuse les cas limites, les tests, la robustesse et la documentation.

4. LIVRABLE DE SÉANCE OBLIGATOIRE (.MD) :
   - Chaque PR DOIT inclure son fichier : `docs/seances/seance-2/RAPPORT_<PRENOM>.md` basé sur `docs/chefferie-de-projet/TEMPLATE_RAPPORT_SEANCE.md`.
   - Il doit impérativement comporter : Décisions d'Architecture (ADR), preuves de tests, et la section « 6. Matière pour le Pitch Deck BAs » avec un One-Liner, un chiffre choc, un argument investisseur et une capture HD 16:9 pour le PowerPoint d'Arthur.
```

---

## 🌲 2. Standards Git, Branches & Pull Requests

### A. Convention de nommage des branches
Chaque développeur travaille dans sa branche dédiée issue de `main` :

| Rôle | Développeur | Nom de la branche obligatoire |
| :--- | :--- | :--- |
| **Tech Lead / Pilotage SaaS** | Arthur COURCHAY | `chore/scrum-ci-rules` |
| **Backend — API & Moteurs** | Victor HUBERT | `feat/back-api-domain-mock` |
| **Backend — Ingestion & Cleaning** | Rémy PORQUET | `feat/back-bank-statement-parser` |
| **Full Stack — BDD & Seed** | Ishak MESSAOUDI | `feat/fullstack-prisma-seed-bridge` |
| **Frontend — UI/UX & Logos** | Loris NEVE | `feat/front-shadcn-responsive-layout` |
| **Frontend — 3D & Product Tour** | Jeremy CHAN-FUNG-TING | `feat/front-r3f-canvas-motion` |
| **Web Perf & Réactivité** | Clément LAUMOND | `feat/perf-streaming-bundle-benchmarks`|
| **SEO, Growth & Acquisition** | Mathias BOUCLON | `feat/seo-metadata-schema-ld` |

### B. Règles de Merge sur `main`
1. **Zéro commit direct sur `main`**.
2. Avant d'ouvrir une PR, exécuter localement : `pnpm check-all` (`turbo run lint build`). Tout doit compiler sans erreur.
3. **Présence obligatoire du fichier `docs/seances/seance-2/RAPPORT_<PRENOM>.md`** complété avec la section Kit Pitch BAs.
4. Validation par le Tech Lead (Arthur) avant fusion.

---

## ⚡ 3. Feuilles de Route Séance 2 — Format Journée Complète (3 Paliers par Rôle)

Pour éviter l'écueil de terminer à 10h du matin grâce à la vitesse de l'IA, le travail de chaque membre est découpé en **3 paliers d'intensité progressive** couvrant l'ensemble de la journée.

---

### 👑 Arthur COURCHAY — Tech Lead & Architecture SaaS
* **Objectif de la journée :** Cadrer l'architecture multi-tiers, verrouiller la CI/CD automatisée, piloter les merges et consolider le pitch d'investissement devant les Business Angels.

* **Palier 1 (Matinée 9h00 – 11h30) — Gouvernance & Quotas SaaS :**
  - Valider l'alignement strict des contrats dans `packages/shared-types` (comptes, biens physiques, crédits, positions bourse, projets, optimisations de factures).
  - Définir les quotas et permissions : Offre Découverte (Gratuit) vs **Pathly Black à 9,99 €/mois**.
  - Configurer les hooks locaux Git (Husky + lint-staged) pour interdire tout commit cassant Prettier ou TypeScript.

* **Palier 2 (Début d'après-midi 13h00 – 15h00) — Pipeline CI/CD GitHub Actions :**
  - Mettre en place `.github/workflows/ci.yml` exécutant sur chaque PR : `pnpm install`, typecheck strict, lint Turborepo et build complet.
  - Ajouter un script de contrôle CI vérifiant la présence du fichier `docs/seances/seance-2/RAPPORT_<PRENOM>.md` dans chaque PR.
  - Débloquer les membres de l'équipe sur leurs arbitrages d'architecture.

* **Palier 3 (Fin d'après-midi 15h00 – 16h30) — Revue de Code & Consolidation Pitch BAs :**
  - Réaliser la revue de code des 7 PRs, tester les intégrations et merger sur `main`.
  - Compiler dans `docs/seances/seance-2/RAPPORT_ARTHUR.md` la trame complète de la soutenance investisseurs (Storytelling, ROI 444 € d'économies, Marge brute 95%, Rétention continue).

---

### 🛠️ Victor HUBERT — Backend Core, Moteurs Temps Réel & Optimisation Factures
* **Objectif de la journée :** Construire l'intelligence financière en direct : le Safe-to-Spend à la volée, le calcul du Patrimoine Net global, l'amortissement des crédits et le comparateur d'économies d'énergie/télécoms basé sur l'Open Data français.

* **Palier 1 (Matinée 9h00 – 11h30) — API Core & Safe-to-Spend en direct :**
  - Finaliser `AccountsModule` et `TransactionsModule` dans `apps/api` (Swagger `/docs` exhaustif, DTOs class-validator).
  - Développer l'algorithme **Safe-to-Spend en direct** (`CashflowPredictorService`) : calcul instantané à la volée (< 50ms) du reste-à-vivre sécurisé sans risque de découvert, en tenant compte des charges restantes et de l'épargne.

* **Palier 2 (Début d'après-midi 13h00 – 15h00) — Net Worth 360°, Crédits & Comparateur Open Data :**
  - Développer le moteur de calcul du **Patrimoine Net (Net Worth)** : $\text{NetWorth} = (\text{Comptes} + \text{Bourse/Crypto} + \text{Biens Physiques}) - \text{Dettes}$.
  - Développer le moteur d'amortissement de crédits (`LoanService`) : capital restant dû, répartition capital/intérêts et simulateur de remboursement anticipé.
  - Développer le **`SubscriptionOptimizerService` (100% gratuit)** : catalogue basé sur l'Open Data du Médiateur National de l'Énergie (`energie-info.fr`) et de l'ARCEP. Algorithme comparant une facture EDF ou Free au prix moyen de marché et calculant l'économie annuelle (ex: 264 €/an d'électricité économisés). Endpoint `GET /api/v1/optimizer/recommendations`.

* **Palier 3 (Fin d'après-midi 15h00 – 16h30) — Tests Jest poussés & Section BAs :**
  - Écrire au moins 12 tests unitaires Jest (couverture > 85%) testant la réactivité en direct et les cas limites (découvert, montants négatifs, factures atypiques).
  - Rédiger `docs/seances/seance-2/RAPPORT_VICTOR.md` avec la section BAs (formule vulgarisée et exemple chiffré pour investisseurs).

---

### 💳 Rémy PORQUET — Ingestion Bancaire, Parsers & Détection d'Abonnements
* **Objectif de la journée :** Créer le moteur d'ingestion bancaire souverain multi-formats le plus rapide du marché, avec normalisation automatique des commerçants et tagging des factures pour l'optimiseur.

* **Palier 1 (Matinée 9h00 – 11h30) — Parseurs OFX & CSV multi-banques françaises :**
  - Créer `apps/api/src/modules/import/` et le service `BankStatementParserService`.
  - Implémenter le parseur OFX universel (balises `<STMTTRN>`, `<TRNAMT>`, `<DTPOSTED>`, `<NAME>`, `<MEMO>`).
  - Implémenter le parseur CSV auto-adaptatif supportant 6 banques majeures (BoursoBank, BNP, Crédit Agricole, Société Générale, Revolut, N26) avec détection dynamique du séparateur et de l'encodage.

* **Palier 2 (Début d'après-midi 13h00 – 15h00) — Merchant Cleaner & Tagging Optimisation Factures :**
  - Développer le **`MerchantCleaner`** : transformer les libellés barbares (`PRLV SEPA EDF CLIENT 8392`, `CB MONOPRIX 4983 PARIS 11`) en noms clairs (`EDF`, `Monoprix`), catégorie et logo officiel.
  - Taguer automatiquement les fournisseurs éligibles aux économies d'énergie et de box internet pour le service de Victor.
  - Dédoublonnage cryptographique SHA-256 : `SHA256(date + "|" + amount + "|" + cleanDescription)` garantissant 0 doublon lors des ré-imports.

* **Palier 3 (Fin d'après-midi 15h00 – 16h30) — Fixtures, Robustesse & Section BAs :**
  - Créer 4 fichiers types dans `apps/api/test/fixtures/` pour la démo en live.
  - Tests unitaires de stress sur des fichiers de 1 000 lignes (temps de parsing < 150ms).
  - Rédiger `docs/seances/seance-2/RAPPORT_REMY.md` avec l'argument clé de marge brute à 95% sans API payante.

---

### 🔄 Ishak MESSAOUDI — Full Stack, Modélisation Patrimoniale & Seed Démo BAs
* **Objectif de la journée :** Structurer la persistance Prisma/Supabase V2 pour le patrimoine 360° (Biens, Crédits, Bourse avec PRU, Projets) et livrer le script de seed ultra-réaliste pour pitcher les BAs.

* **Palier 1 (Matinée 9h00 – 11h30) — Schéma Prisma V2 Étendu :**
  - Déployer les tables : `physical_assets` (montre, voiture, immo), `loans_credits` (emprunts, taux, mensualité), `investment_positions` (PEA, CTO, Crypto avec PRU et quantité), `life_projects` (projets de vie avec montants cibles).
  - Valider l'intégrité référentielle et les index de performance sur Supabase V2.

* **Palier 2 (Début d'après-midi 13h00 – 15h00) — Seed Multi-Personas & SDK API Web :**
  - Créer le script `packages/database/prisma/seed.ts` (`pnpm db:seed` en < 3s) générant 3 personas taillés pour le storytelling BAs :
    1. *Maxime (Étudiant)* : Budget serré, crédit étudiant, 7 abonnements (EDF et box surtaxés), sauvé par le Safe-to-Spend.
    2. *Camille (Cadre Sup)* : Appartement T3 (320 000 €), prêt immo CIC, PEA avec actions Air Liquide & ETF World, Rolex Submariner.
    3. *Lucas (Freelance)* : Portefeuille Crypto (BTC, ETH), compte pro, simulation de voyage aux USA.
  - Finaliser le client API Web TypeScript typé (`apps/web/src/lib/api-client.ts`) avec Bearer token Supabase et timeout < 500ms.

* **Palier 3 (Fin d'après-midi 15h00 – 16h30) — Diagramme ERD, Tests & Section BAs :**
  - Générer le diagramme relationnel (ERD) Mermaid complet.
  - Rédiger `docs/seances/seance-2/RAPPORT_ISHAK.md` avec les fiches des 3 personas prêtes pour les slides d'Arthur.

---

### 🎨 Loris NEVE — Frontend UI/UX, Logos Automatiques & Mode Démo BAs
* **Objectif de la journée :** Créer une interface digne des meilleures FinTechs mondiales, intégrer le résolveur de logos automatiques (CIC, Trade Republic, Binance), la modal de patrimoine et le widget d'économies d'énergie.

* **Palier 1 (Matinée 9h00 – 11h30) — Design System FinTech & Shell Responsive :**
  - Configurer shadcn/ui dans `apps/web` avec palette Dark Mode OLED (`#050811`), touches émeraude (`#10B981`) et ardoise.
  - Shell responsive : Sidebar rétractable sur Desktop, Bottom Navigation Bar mobile ergonomique.
  - Command Menu `Cmd+K` style Raycast / Linear (`cmdk`) pour piloter toute l'application au clavier.

* **Palier 2 (Début d'après-midi 13h00 – 15h00) — Logos Automatiques, Modal Patrimoine & Widget Factures :**
  - Brancher le **résolveur de logos automatique** ([`apps/web/src/lib/institutions.ts`](../../apps/web/src/lib/institutions.ts)) : saisie de "CIC" ➔ logo CIC, "Trade Republic" ➔ logo Trade Republic, "Binance" ➔ logo Binance.
  - Créer la **modal « Ajouter au Patrimoine »** avec 5 onglets : Comptes bancaires, Bourse/Crypto avec PRU, Biens physiques (montre, voiture), Crédits, Projets de vie.
  - Développer le **widget « Optimiseur de Factures »** : badge vert néon sur les factures EDF/Box affichant *« ⚡ Économisez 264 €/an »* ouvrant la comparaison d'offres.
  - Bouton **« Mode Démo BAs »** dans le header pour switcher de persona en 1 clic lors de la soutenance.

* **Palier 3 (Fin d'après-midi 15h00 – 16h30) — Accessibilité WCAG AA, Captures HD & Section BAs :**
  - Contrôler les contrastes de couleurs, navigation au focus et accessibilité ARIA.
  - Prendre 3 captures d'écran Retina HD (format 16:9) pour les slides d'Arthur.
  - Rédiger `docs/seances/seance-2/RAPPORT_LORIS.md`.

---

### 🌐 Jeremy CHAN-FUNG-TING — 3D Web, Product Tour Immersif & Micro-interactions
* **Objectif de la journée :** Concevoir l'effet « Waouh » immédiat : le Financial Core 3D holographique réactif (sans fausse carte bancaire ni CVV) et le Product Tour interactif guidé ("le tutoriel qui claque").

* **Palier 1 (Matinée 9h00 – 11h30) — Socle R3F anti-crash SSR & Matériaux PBR :**
  - Installer `@react-three/fiber`, `@react-three/drei`, `three`.
  - Créer le wrapper `Dynamic3DCanvas` chargé via `next/dynamic` (`ssr: false`) avec Skeleton de préchargement (zéro décalage de layout, CLS = 0).
  - Modéliser le **Financial Core 3D** : prisme/orbe géométrique interactif avec shaders translucides et particules flottantes réagissant à la souris et au gyroscope.

* **Palier 2 (Début d'après-midi 13h00 – 15h00) — Couleur Réactive, Product Tour & Jauge de Patrimoine :**
  - Rendre la **couleur du Financial Core 3D réactive en direct à la santé financière** : émeraude brillant quand le Safe-to-Spend est sain, ambre/orangé si les charges restantes sont critiques.
  - Développer le **Product Tour Interactif Immersif ("le tour qui claque")** avec Framer Motion : spotlight sombre guidant l'utilisateur sur le Safe-to-Spend, l'optimiseur de factures EDF et la jauge de patrimoine. Déclenchable par bouton ou via `Cmd+K`.
  - Jauge ou anneau interactif de répartition du Patrimoine Net 360° (Trésorerie vs Bourse vs Biens vs Dettes).

* **Palier 3 (Fin d'après-midi 15h00 – 16h30) — Benchmark 60 FPS, GIF HD & Section BAs :**
  - Valider un framerate stable à 60 FPS constants sans surconsommation GPU.
  - Générer un GIF HD / capture animée de la 3D et du Product Tour prêt pour le PowerPoint d'Arthur.
  - Rédiger `docs/seances/seance-2/RAPPORT_JEREMY.md`.

---

### 🚀 Clément LAUMOND — Web Performance, Optimistic UI & Benchmark Lighthouse
* **Objectif de la journée :** Garantir une sensation d'instantanéité absolue : mises à jour optimistes en 0ms lors de l'ajout d'une dépense ou d'un bien, Streaming SSR Suspense et score Lighthouse parfait.

* **Palier 1 (Matinée 9h00 – 11h30) — Mises à jour Optimistes (0ms de latence) :**
  - Mettre en place l'Optimistic UI React : lors de la simulation d'une dépense manuelle ou de l'ajout d'une montre de valeur, le solde, le Safe-to-Spend et le Net Worth s'actualisent en 0ms avant la réponse du serveur.
  - Gestion du rollback avec toast d'alerte en cas d'erreur réseau.

* **Palier 2 (Début d'après-midi 13h00 – 15h00) — Streaming SSR Suspense & Traque de Bundle :**
  - Découper la page en Suspense boundaries autonomes avec Skeleton screens adaptés sur chaque widget.
  - Installer `@next/bundle-analyzer` (`pnpm --filter @pathly/web analyze`) et maintenir le bundle initial sous 120 Ko gzip.
  - Optimiser les en-têtes de cache HTTP et la compression Brotli dans `next.config.mjs`.

* **Palier 3 (Fin d'après-midi 15h00 – 16h30) — Audit Lighthouse 100% Vert & Section BAs :**
  - Réaliser les audits de performance Lighthouse Desktop & Mobile : **FCP < 0.8s, CLS = 0, LCP < 1.2s**.
  - Rédiger `docs/seances/seance-2/RAPPORT_CLEMENT.md` avec la slide comparative prouvant l'écrasante supériorité technique face aux banques traditionnelles.

---

### 🔍 Mathias BOUCLON — SEO, Growth, Landing Page & Argumentaire Rétention
* **Objectif de la journée :** Construire la vitrine commerciale SaaS publique de Pathly avec simulateur d'économies public, grille tarifaire et démonstration de la rétention pour les investisseurs.

* **Palier 1 (Matinée 9h00 – 11h30) — Landing Page de Conversion SaaS :**
  - Concevoir la Landing Page publique (`/` ou `/landing`) avec Hero section percutante : *"Arrêtez de piloter votre argent dans le passé. Prévoyez votre trésorerie à 90 jours avec l'IA."*
  - Intégrer le **Simulateur d'économies public interactif** : le visiteur sélectionne son fournisseur d'électricité (EDF) et sa box internet ➔ Affichage direct : *"Vous perdez 444 €/an en factures surtaxées. Pathly les neutralise."*

* **Palier 2 (Début d'après-midi 13h00 – 15h00) — Grille Tarifaire & Moat de Rétention :**
  - Concevoir la **Pricing Table** : Offre Découverte (0 €) vs **Pathly Black à 9,99 €/mois**.
  - Intégrer la section **« Pourquoi rester abonné ? »** (Le GPS permanent de patrimoine net, le gardien anti-hausses discrètes, le simulateur de projets de vie).
  - Générer dynamiquement `sitemap.ts` et `robots.ts`.

* **Palier 3 (Fin d'après-midi 15h00 – 16h30) — Données Structurées JSON-LD & Section BAs :**
  - Injecter les métadonnées OpenGraph / Twitter Cards et les données structurées Schema.org (JSON-LD) de type `SoftwareApplication`, `FinancialService` et `Offer` (prix indexé dans Google).
  - Rédiger `docs/seances/seance-2/RAPPORT_MATHIAS.md` avec le calcul de la LTV client pour le pitch d'Arthur.

---

## 🏁 4. Grille de Clôture de Fin de Séance (Definition of Done)

Avant de quitter la séance et valider les merges vers `main`, chaque condition doit être validée :

- [ ] **Arthur :** La CI GitHub Actions est verte, les 7 PRs sont relues et le compte-rendu consolidé `docs/seances/seance-2/RAPPORT_ARTHUR.md` est finalisé avec la trame du pitch BAs.
- [ ] **Victor :** Endpoints `Safe-to-Spend` en direct, `Net Worth` et `SubscriptionOptimizerService` (Open Data) opérationnels avec > 85% de couverture Jest + `RAPPORT_VICTOR.md`.
- [ ] **Rémy :** Parseur multi-banques (OFX/CSV) testé, MerchantCleaner avec détection des factures énergétiques/télécoms opérationnel + `RAPPORT_REMY.md`.
- [ ] **Ishak :** Schéma Prisma migré avec les nouveaux modèles patrimoniaux, BDD seedée avec les 3 personas en < 3s + `RAPPORT_ISHAK.md`.
- [ ] **Loris :** Résolveur de logos automatique (CIC, Trade Republic, Binance), modal 5 onglets de patrimoine et widget d'économies fonctionnels + `RAPPORT_LORIS.md`.
- [ ] **Jeremy :** Financial Core 3D holographique réactif (60 FPS), Product Tour immersif et jauge de patrimoine fonctionnels + `RAPPORT_JEREMY.md`.
- [ ] **Clément :** Mises à jour optimistes à 0ms, FCP < 0.8s et CLS = 0 sur Lighthouse + `RAPPORT_CLEMENT.md`.
- [ ] **Mathias :** Landing page avec simulateur d'économies public, pricing table et balisage Schema.org validés sans warning + `RAPPORT_MATHIAS.md`.

---

> *"L'IA multiplie la vitesse par 10 : notre rôle d'ingénieurs n'est pas de faire le même projet 10 fois plus vite, mais de bâtir un produit 10 fois plus profond, plus robuste et plus ambitieux."*  
> **Bonne journée intensive d'ingénierie à toute l'équipe Pathly !**

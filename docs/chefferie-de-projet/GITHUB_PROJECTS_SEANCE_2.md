# 🚀 GitHub Projects — Séance 2 (Format Séance (9h00-11h30 | 13h00-16h30) — Charge x3)
## Architecture Temps Réel, Ingestion Multi-Banques, Gestion Patrimoniale, Comparateur d'Économies Énergie/Télécoms & Rétention BAs

> **Projet :** Pathly V2 (Monorepo FinTech d'intelligence patrimoniale, prédiction de trésorerie & optimisation financière)  
> **Rythme :** Semaine B — YDays Campus Rouen Ynov (2026-2027)  
> **Chef de projet / Tech Lead :** Arthur COURCHAY  
> **Date de séance :** Séance 2 / 11 (Format Séance (9h00-11h30 | 13h00-16h30) — 8 Développeurs assistés par IA)  
> **Objectif Business & Pitch :** Démontrer aux **Business Angels (BAs) de l'école** que Pathly est un produit rentable dès le 1er jour pour l'utilisateur (ROI net positif grâce au comparateur de factures 100% gratuit) et addictif sur la durée.

---

## ⚡ 1. La Killer Feature Business : Le Comparateur d'Abonnements Open Data (100% Gratuit)

> [!TIP]
> **Comment ça marche sans payer d'API tierce ?**  
> En France, l'État publie des données publiques gratuites et ouvertes :
> * **Médiateur National de l'Énergie (`energie-info.fr` / `data.gouv.fr`) :** Référentiel public officiel des offres d'électricité et de gaz.
> * **Observatoire de l'ARCEP (`data.gouv.fr`) :** Baromètre public des prix des forfaits mobiles et box internet.
> 
> **L'Expérience Utilisateur magique :**  
> Quand l'utilisateur importe son relevé et qu'une ligne `EDF - 120 €/mois` est détectée, Pathly affiche un badge néon étincelant :  
> 👉 *« ⚡ Économisez 264 €/an sur votre électricité (Offre alternative à 98 €/mois sans coupure ni changement de compteur) »*.
> 
> **L'Argument Massue pour les Business Angels :**  
> * « Pathly Black coûte 9,99 €/mois (120 €/an). En 1 clic, l'application fait économiser 264 € d'électricité et 180 € de box internet à l'utilisateur (444 € de gain net). **Le produit est remboursé plus de 3 fois dès la première utilisation !** »  
> * **Deuxième flux de revenus (Monétisation B2B) :** À terme, modèle d'affiliation (type Papernest/Selectra) qui rémunère entre 40 € et 80 € chaque bascule de contrat énergétique ou télécom.

---

## 💡 2. Le Moat de Rétention SaaS : Pourquoi payer après le 1er mois ?

1. **Le GPS d'Enrichissement Net (Net Worth 360°) :**  
   Vos actions PEA/CTO, vos cryptos et la valeur de vos biens (voiture, montre, immo) bougent chaque jour. Pathly suit en temps réel la progression de votre patrimoine net et calcule votre taux d'enrichissement.
2. **Le Gardien Continu Anti-Dérive (Hausses discrètes de tarifs) :**  
   Les abonnements augmentent sans prévenir en cours d'année (Netflix qui prend +2 €, EDF qui réajuste son échéancier à la hausse, prime d'assurance annuelle). Dès que l'abonné coupe Pathly, il perd son filet de sécurité.
3. **Le Simulateur de Projets Dynamique (Life Goals Engine) :**  
   Votre projet immobilier ou voyage n'est pas figé : chaque arbitrage financier mensuel avance ou retarde automatiquement la date prévisionnelle d'achat de votre appartement.
4. **L'Accélérateur de Remboursement de Crédit :**  
   Calculateur d'arbitrage en direct : *"Si tu réinjectes 500 € d'économie ce mois-ci sur ton prêt auto, tu gagnes 180 € d'intérêts et 2 mois de liberté financière."*
5. **Le Coffre-Fort Souverain (Data Lock-in) :**  
   Toutes ses possessions et son historique sont centralisés dans son espace privé chiffré.

---

## 🎨 3. Résolution Automatique de Logos (CIC, Trade Republic, Binance...)

L'application détecte en temps réel le nom de l'établissement pour afficher son logo officiel haute définition :
* **Banques :** CIC, BNP Paribas, Crédit Agricole, Société Générale, BoursoBank, Revolut, N26...
* **Bourse & Courtiers :** Trade Republic, DEGIRO, Bourse Direct, Interactive Brokers, Finary...
* **Crypto Exchanges :** Binance, Coinbase, Kraken, Bitpanda...
* Intégré dans [`apps/web/src/lib/institutions.ts`](../../apps/web/src/lib/institutions.ts).

---

## 🎫 4. Les 8 Tickets Détaillés (Format Séance (9h00-11h30 | 13h00-16h30) x3)

---

### Ticket #1 — Arthur COURCHAY
* **Titre :** `[Lead/CI] Architecture SaaS Freemium, CI GitHub Actions, quotas multi-actifs & Pitch Deck BAs`
* **Assigné :** Arthur COURCHAY (`@Arthurccy`)
* **Pôle :** `Architecture & Pilotage SaaS`
* **Priorité :** `🔴 P0 - Bloquant`
* **Branche Git obligatoire :** `chore/scrum-ci-rules`
* **Livrable attendu :** `docs/seances/seance-2/RAPPORT_ARTHUR.md`
* **Labels :** `governance`, `ci-cd`, `tech-lead`, `investor-pitch`, `p0`

#### Tâches techniques (Charge x3)
- [ ] **Modélisation des quotas Freemium / Premium** dans `packages/shared-types` :
  - *Free* : 1 compte bancaire, 1 bien physique, projection 15j.
  - *Pathly Black (9,99 €/mois)* : Multi-comptes illimités, Bourse PEA/CTO/Crypto avec PRU, suivi des crédits, simulateur de projets, comparateur d'économies énergie/télécoms illimité.
- [ ] **Workflow GitHub Actions complet (`.github/workflows/ci.yml`)** : Pipeline automatique (pnpm install, typecheck strict, lint Turborepo et build complet).
- [ ] **Vérification automatique du rapport Markdown en CI** : Vérifier la présence de `docs/seances/seance-2/RAPPORT_<PRENOM>.md` dans chaque PR.
- [ ] **Hook Git local Husky + lint-staged** : Verrouiller la conformité Prettier / ESLint en pré-commit.
- [ ] **Consolidation du Pitch Deck BAs** : Structurer dans `RAPPORT_ARTHUR.md` le storytelling complet pour les BAs (ROI utilisateur à 444 € d'économies, marge brute 95%, rétention continue).

---

### Ticket #2 — Victor HUBERT
* **Titre :** `[Back] Safe-to-Spend EN DIRECT, Net Worth global, amortissement crédits & Moteur d'optimisation factures`
* **Assigné :** Victor HUBERT
* **Pôle :** `Backend Core & Moteurs d'Économies`
* **Priorité :** `🔴 P0 - Bloquant`
* **Branche Git obligatoire :** `feat/back-api-domain-mock`
* **Livrable attendu :** `docs/seances/seance-2/RAPPORT_VICTOR.md`
* **Labels :** `backend`, `nestjs`, `realtime-cashflow`, `optimizer`, `net-worth`, `p0`

#### Tâches techniques (Charge x3)
- [ ] **Moteur Safe-to-Spend en direct (`CashflowPredictorService`)** : Calcul dynamique à la volée du reste-à-vivre sécurisé (< 50ms) basé sur le solde temps réel, charges récurrentes restantes et épargne cible.
- [ ] **Moteur de Comparaison de Factures 100% Gratuit (`SubscriptionOptimizerService`)** :
  - Créer un catalogue de référence de marché basé sur les données publiques ouvertes (Médiateur de l'Énergie pour l'électricité/gaz, baromètre ARCEP pour les télécoms).
  - Algorithme de comparaison : si dépense EDF > tarif moyen de marché, générer l'alternative avec calcul d'économie annuelle (ex: `delta = 120€ - 98€ = 22€/mois ➔ 264 €/an`).
  - Endpoint REST : `GET /api/v1/optimizer/recommendations`.
- [ ] **Moteur de Calcul du Patrimoine Net (Net Worth)** : $\text{NetWorth} = (\text{Comptes} + \text{Bourse/Crypto} + \text{Biens}) - \text{Dettes}$.
- [ ] **Moteur d'Amortissement de Crédits** : Calcul du capital restant dû et des intérêts économisables en cas de remboursement anticipé.
- [ ] **Tests unitaires Jest (> 85% de couverture)** : Couvrir le calcul prédictif et l'algorithme d'optimisation de factures.
- [ ] **Section Pitch BAs dans `RAPPORT_VICTOR.md`** : Justifier le ROI utilisateur pour les investisseurs.

---

### Ticket #3 — Rémy PORQUET
* **Titre :** `[Back] Moteur universel d'import bancaire, normaliseur commerçants & tagging pour optimisation`
* **Assigné :** Rémy PORQUET
* **Pôle :** `Ingestion Bancaire & Data Cleaning`
* **Priorité :** `🔴 P0 - Bloquant`
* **Branche Git obligatoire :** `feat/back-bank-statement-parser`
* **Livrable attendu :** `docs/seances/seance-2/RAPPORT_REMY.md`
* **Labels :** `backend`, `banking`, `parsers`, `cleaner`, `p0`

#### Tâches techniques (Charge x3)
- [ ] **Parseurs bancaires multi-formats souverains** : Support OFX et CSV pour 6 banques (BoursoBank, BNP, Crédit Agricole, Société Générale, Revolut, N26).
- [ ] **Nettoyeur intelligent de libellés (Merchant Cleaner)** :
  - Transformer les libellés cryptiques (`PRLV SEPA EDF CLIENT 8392`) en labels clairs (`EDF`), catégorie (`Énergie`) et logo officiel.
  - Détecter et étiqueter les fournisseurs optimisables pour Victor (EDF, Engie, TotalEnergies, Orange, Free Mobile, SFR, Bouygues Telecom).
- [ ] **Dédoublonnage cryptographique SHA-256** : Empreinte unique empêchant tout doublon à l'importation.
- [ ] **Fixtures & tests Jest** : 4 jeux de données types dans `apps/api/test/fixtures/`.
- [ ] **Section Pitch BAs dans `RAPPORT_REMY.md`** : Argument clé d'indépendance souveraine (zéro coût d'API bancaire = marge brute SaaS à 95%).

---

### Ticket #4 — Ishak MESSAOUDI
* **Titre :** `[FullStack] Modélisation Prisma V2 (Biens, Crédits, Bourse, Projets), Seed Persona & SDK Web`
* **Assigné :** Ishak MESSAOUDI
* **Pôle :** `Full Stack & Database`
* **Priorité :** `🔴 P0 - Bloquant`
* **Branche Git obligatoire :** `feat/fullstack-prisma-seed-bridge`
* **Livrable attendu :** `docs/seances/seance-2/RAPPORT_ISHAK.md`
* **Labels :** `fullstack`, `prisma`, `supabase`, `wealth-model`, `p0`

#### Tâches techniques (Charge x3)
- [ ] **Schéma relationnel Prisma V2 enrichi** :
  - Modèles : `PhysicalAsset` (voiture, montre, immo), `LoanCredit` (prêts et mensualités), `InvestmentPosition` (PEA, CTO, Crypto avec PRU et quantité), `LifeProject` (projets de vie avec montants cibles).
- [ ] **Script de Seeding "Multi-Personas Patrimonial" (`pnpm db:seed`)** :
  - Générer des profils captivants pour la démo aux BAs :
    1. *Maxime (Étudiant)* : 1 compte courant, 1 livret jeune, 1 crédit étudiant, 7 abonnements (dont EDF et forfait mobile surtaxés).
    2. *Camille (Cadre Sup)* : Appartement T3 (320 000 €), prêt immo CIC en cours, PEA avec actions Air Liquide & ETF World, montre Rolex Submariner.
    3. *Lucas (Freelance)* : Portefeuille Crypto (BTC, ETH), compte pro, simulation de voyage aux USA.
- [ ] **Contrats partagés (`packages/shared-types`)** incluant `SubscriptionOptimizationDto` et client API Web TypeScript typé.
- [ ] **Section Pitch BAs dans `RAPPORT_ISHAK.md`** : Fiches des personas prêtes pour les slides.

---

### Ticket #5 — Loris NEVE
* **Titre :** `[Front] Résolveur de Logos Automatiques, Modal Patrimoine, Widget d'Optimisation Factures & Dark Mode`
* **Assigné :** Loris NEVE
* **Pôle :** `Frontend UI/UX`
* **Priorité :** `🟠 P1 - Haute`
* **Branche Git obligatoire :** `feat/front-shadcn-responsive-layout`
* **Livrable attendu :** `docs/seances/seance-2/RAPPORT_LORIS.md`
* **Labels :** `frontend`, `ui-ux`, `institution-logos`, `savings-widget`, `p1`

#### Tâches techniques (Charge x3)
- [ ] **Résolveur automatique de logos (`apps/web/src/lib/institutions.ts`)** :
  - Affichage instantané du logo officiel haute définition dès la saisie (CIC, Trade Republic, Binance, BoursoBank, etc.).
- [ ] **Widget "Optimiseur d'Économies Factures"** :
  - Sur chaque facture identifiée (ex: EDF), afficher le badge cliquable :  
    👉 *« ⚡ Économisez 264 €/an sur cette facture »*.
  - Modal détaillée affichant l'alternative recommandée, l'économie annuelle et le bouton d'action sans coupure.
- [ ] **Modal multimodal "Ajouter au Patrimoine"** : 5 onglets (Comptes, Bourse/Crypto avec PRU, Biens physiques montre/voiture, Crédits, Projets de vie).
- [ ] **Sélecteur "Mode Démo / Pitch BAs"** dans le header pour basculer de persona en 1 clic.
- [ ] **Section Pitch BAs dans `RAPPORT_LORIS.md`** : Captures Retina HD du widget d'économies et des logos automatiques.

---

### Ticket #6 — Jeremy CHAN-FUNG-TING
* **Titre :** `[Front/3D] Financial Core 3D holographique réactif (R3F), Product Tour immersif & Jauge de Patrimoine`
* **Assigné :** Jeremy CHAN-FUNG-TING
* **Pôle :** `3D & Micro-interactions Immersives`
* **Priorité :** `🟠 P1 - Haute`
* **Branche Git obligatoire :** `feat/front-r3f-canvas-motion`
* **Livrable attendu :** `docs/seances/seance-2/RAPPORT_JEREMY.md`
* **Labels :** `frontend`, `threejs`, `r3f`, `product-tour`, `wealth-gauge`, `p1`

#### Tâches techniques (Charge x3)
- [ ] **Financial Core 3D Holographique (React Three Fiber)** :
  - Prisme / Orbe 3D stylé représentant le "Cœur de Trésorerie" de l'utilisateur.
  - Particules animées, shaders translucides et couleur réactive en direct à la santé financière (vert si Safe-to-Spend confortable, ambre si serré).
- [ ] **Jauge interactive de Patrimoine Net 360°** :
  - Anneau interactif montrant la répartition Trésorerie vs Bourse vs Biens Physiques vs Dettes.
- [ ] **Product Tour Interactif Immersif ("Le tour qui claque")** :
  - Walkthrough animé étape par étape avec Framer Motion (spotlight sur le Safe-to-Spend, l'optimiseur de factures EDF et la jauge de patrimoine).
- [ ] **Section Pitch BAs dans `RAPPORT_JEREMY.md`** : GIF animé de la 3D et du tour interactif prêt pour PowerPoint.

---

### Ticket #7 — Clément LAUMOND
* **Titre :** `[Perf] Mises à jour optimistes (0ms), Streaming SSR Suspense, analyseur de bundle & benchmark CI`
* **Assigné :** Clément LAUMOND
* **Pôle :** `Web Performance & Fluidité`
* **Priorité :** `🟠 P1 - Haute`
* **Branche Git obligatoire :** `feat/perf-streaming-bundle-benchmarks`
* **Livrable attendu :** `docs/seances/seance-2/RAPPORT_CLEMENT.md`
* **Labels :** `perf`, `core-web-vitals`, `optimistic-ui`, `lighthouse`, `p1`

#### Tâches techniques (Charge x3)
- [ ] **Optimistic UI à 0ms** : Mise à jour instantanée du solde, du Safe-to-Spend et du Net Worth lors de l'ajout d'une possession ou d'une transaction sans temps d'attente serveur.
- [ ] **Streaming SSR avec React Suspense** : Squelettes de chargement pulsants pour un FCP < 0.8s et CLS = 0.
- [ ] **Optimisation du bundle JS** sous 120 Ko gzip avec `@next/bundle-analyzer`.
- [ ] **Section Pitch BAs dans `RAPPORT_CLEMENT.md`** : Slide des scores Lighthouse 100% vert pour prouver la supériorité technique face aux banques classiques.

---

### Ticket #8 — Mathias BOUCLON
* **Titre :** `[SEO/Growth] Landing Page SaaS B2C, Simulateur d'économies public, Pricing Table & Argumentaire Rétention`
* **Assigné :** Mathias BOUCLON
* **Pôle :** `SEO, Growth & Acquisition`
* **Priorité :** `🟡 P2 - Moyenne`
* **Branche Git obligatoire :** `feat/seo-metadata-schema-ld`
* **Livrable attendu :** `docs/seances/seance-2/RAPPORT_MATHIAS.md`
* **Labels :** `seo`, `growth`, `landing-page`, `pricing`, `schema-org`, `p2`

#### Tâches techniques (Charge x3)
- [ ] **Landing Page de conversion SaaS** : Hero section percutante mettant en avant le comparateur gratuit d'énergie et la grille tarifaire **Pathly Black à 9,99 €/mois**.
- [ ] **Simulateur d'économies public interactif** :
  - Le visiteur coche sa facture d'électricité (ex: EDF) et sa box internet ➔ Affichage direct : *"Vous pouvez économiser 444 €/an immédiatement"*.
- [ ] **SEO Technique & Balisage Schema.org (JSON-LD)** complet (`SoftwareApplication`, `FinancialService`, `Offer`).
- [ ] **Section Pitch BAs dans `RAPPORT_MATHIAS.md`** : Argumentaire de rentabilité du business model (LTV/CAC et ROI net positif pour l'utilisateur).

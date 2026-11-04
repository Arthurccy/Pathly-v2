# Pathly V2 — Monorepo FinTech

> Solution FinTech d'agrégation bancaire, intelligence prédictive de trésorerie et optimisation financière.

> Projet de deuxième année de master en alternance : neuf membres, onze séances de six heures, développement assisté par IA.
>
> Commencer par l’[index documentaire](docs/README.md), la [vision produit](docs/VISION_PRODUIT.md) et le [guide de contribution](CONTRIBUTING.md). Le [briefing S2](docs/BRIEFING_SEANCE_POUR_IA.md) décrit la séance active ; les [missions S3 à S11](docs/chefferie-de-projet/MISSIONS_PAR_SEANCE.md) donnent la suite pour chacun.

---

## Architecture du Monorepo

Ce monorepo est orchestré avec **pnpm workspaces** et **Turborepo** :

```text
Pathly-v2/
├── apps/
│   ├── api/             # Backend NestJS (Logique métier, Ingestion Powens, Chiffrement bancaire)
│   ├── web/             # Frontend Next.js 15 App Router (SSR, SEO, 3D R3F, Framer Motion)
│   └── legacy/          # MVP v1 Vite/React (conservé pour rétro-compatibilité et consultation)
│
├── packages/
│   ├── database/        # Client Prisma ORM connecté à la nouvelle BDD Supabase V2
│   ├── shared-types/    # Contrats d'API, DTOs et interfaces partagées Web <-> Api
│   └── tsconfig/        # Configurations TypeScript unifiées
│
├── pnpm-workspace.yaml  # Déclaration des workspaces
├── turbo.json           # Pipeline de build & cache Turborepo
└── .env.example         # Template des variables d'environnement
```

---

## Rôles et responsabilités de l’équipe (9 membres)

| Membre                | Responsabilité principale                                |
| --------------------- | -------------------------------------------------------- |
| Arthur COURCHAY       | Pilotage, arbitrages, CI et intégration                  |
| Victor HUBERT         | API, trésorerie et simulations financières               |
| Rémy PORQUET          | Import bancaire et normalisation                         |
| Ishak MESSAOUDI       | Modèle de données, contrats, seed et client API          |
| Loris NEVE            | Dashboard, composants UI et intégration des écrans       |
| Jeremy CHAN-FUNG-TING | Visualisation financière et interactions                 |
| Clément LAUMOND       | Recette de parcours, fiabilité et mesures de performance |
| Mathias BOUCLON       | Pages publiques, SEO et sources commerciales             |
| Yann                  | Compte utilisateur, authentification et confidentialité  |

Les [consignes de séance](docs/BRIEFING_SEANCE_POUR_IA.md) précisent les zones de modification et les revues. La [roadmap](docs/chefferie-de-projet/ROADMAP_GLOBALE_11_SEANCES.md) décrit la progression collective ; le [plan de Yann](docs/chefferie-de-projet/YANN_MISSIONS.md) détaille ses missions à partir de S2.

---

## Démarrage Rapide

Commandes prévues par le dépôt. Consulter les [limites initiales de l’outillage](CONTRIBUTING.md) : génération Prisma, tests et lint demandent des vérifications ; la présence des scripts ne prouve pas le fonctionnement complet de l’API.

### 1. Prérequis

- **Node.js** >= 20.x
- **pnpm** >= 9.x (`npm install -g pnpm`)

### 2. Installation

```bash
# À la racine du monorepo
pnpm install
```

### 3. Variables d'environnement

Copiez `.env.example` vers `.env` et complétez avec vos identifiants de développement (nouvelle base Supabase V2 et sandbox Powens) :

```bash
cp .env.example .env
```

### 4. Lancement en développement

```bash
# Lance simultanément le Web (port 3000) et l'API (port 4000)
pnpm dev
```

- **Frontend Next.js** : [http://localhost:3000](http://localhost:3000)
- **Backend NestJS** : [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **Swagger Documentation** : [http://localhost:4000/docs](http://localhost:4000/docs)

---

## Règles de Sécurité Bancaire

1. **Isolation stricte de la BDD** : La V2 dispose de sa propre base Supabase dédiée. Ne connectez jamais la BDD de production de la V1 à la V2.
2. **Secrets Powens strictement serveur** : Le client (`apps/web`) ne doit **JAMAIS** connaître `POWENS_CLIENT_SECRET`. Toutes les requêtes d'ingestion passent par `apps/api`.
3. **Chiffrement au repos (AES-256-GCM)** : Les jetons d'accès bancaires sont chiffrés avant d'être sauvegardés en base de données.
4. **Vérification de signature Webhook** : Tout webhook entrant de Powens est validé par signature HMAC SHA256.

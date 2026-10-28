# 💎 Pathly V2 — Monorepo FinTech

> Solution FinTech d'agrégation bancaire, intelligence prédictive de trésorerie et optimisation financière.

---

## 🏛️ Architecture du Monorepo

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

## 👥 Rôles & Responsabilités de l'Équipe (8 Membres)

| Membre | Rôle | Périmètre technique principal |
| :--- | :--- | :--- |
| **Arthur COURCHAY** | Chef de projet / Tech Lead | Pilotage Scrum, architecture globale, arbitrage fonctionnel et livrables |
| **Victor HUBERT** | Développeur Backend | Endpoints d'API, logique métier, interfaçage données (`apps/api`) |
| **Rémy PORQUET** | Développeur Backend | Ingestion API Powens, webhooks, persistance et synchronisation (`apps/api`) |
| **Ishak MESSAOUDI** | Développeur Full Stack | Passerelle Front/Back, calculs critiques, client API (`packages/shared-types`) |
| **Loris NEVE** | Frontend / UI & UX | Design system shadcn/ui, ergonomie, composants React (`apps/web`) |
| **Jeremy CHAN-FUNG-TING** | Frontend / Animations & 3D | Intégrations React Three Fiber, animations micro-interactives Framer Motion |
| **Clément LAUMOND** | Performance Web | Optimisations Core Web Vitals, temps de réponse < 500ms, benchmarks |
| **Mathias BOUCLON** | SEO & Référencement | Architecture sémantique, SSR Next.js, métadonnées OpenGraph |

---

## 🚀 Démarrage Rapide

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

## 🔐 Règles de Sécurité Bancaire
1. **Isolation stricte de la BDD** : La V2 dispose de sa propre base Supabase dédiée. Ne connectez jamais la BDD de production de la V1 à la V2.
2. **Secrets Powens strictement serveur** : Le client (`apps/web`) ne doit **JAMAIS** connaître `POWENS_CLIENT_SECRET`. Toutes les requêtes d'ingestion passent par `apps/api`.
3. **Chiffrement au repos (AES-256-GCM)** : Les jetons d'accès bancaires sont chiffrés avant d'être sauvegardés en base de données.
4. **Vérification de signature Webhook** : Tout webhook entrant de Powens est validé par signature HMAC SHA256.

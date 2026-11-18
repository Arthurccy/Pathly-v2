// @ts-check
// ==========================================
// PATHLY V2 — SEED REPRODUCTIBLE : PERSONA FICTIF « ALEX »
// ==========================================
//
// Lancement : pnpm db:seed (racine) ou pnpm --filter @pathly/database db:seed
//
// Garanties :
// - Idempotent : identifiants déterministes + upsert. Deux exécutions donnent le même état,
//   sans doublon.
// - Ne supprime rien : seules les lignes du persona (identifiants dérivés de son id) sont
//   créées ou remises aux valeurs du seed. Aucune autre donnée n'est touchée.
// - Base locale uniquement par défaut : refuse une base distante sauf SEED_ALLOW_REMOTE=true.
//
// Variables optionnelles :
// - SEED_PERSONA_USER_ID : id d'un utilisateur Supabase de test (UserProfile.id = auth.users.id).
// - SEED_PERSONA_EMAIL   : e-mail du profil (doit correspondre à cet utilisateur de test).
//
// Données entièrement fictives. Synthèse attendue (référence S2, voir CONTRATS_SEANCE_2.md) :
//   trésorerie 2 000 € + investissements 5 000 € + biens 10 000 € − dettes 3 000 € = 14 000 €.
// Le PEA existe à la fois comme compte INVESTMENT (5 000 €) et comme positions (5 000 €) liées
// par accountId ; le crédit auto existe comme compte LOAN (−3 000 €) et comme LoanCredit liés.
// La synthèse doit compter chacun une seule fois.

import { createHash } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const DEFAULT_USER_ID = '00000000-0000-4000-8000-000000000001';
const DEFAULT_EMAIL = 'persona.alex@pathly.test';

const userId = process.env.SEED_PERSONA_USER_ID || DEFAULT_USER_ID;
const email = process.env.SEED_PERSONA_EMAIL || DEFAULT_EMAIL;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** UUID déterministe dérivé de l'id du persona et d'une clé (même entrée → même UUID). */
function seedId(key) {
  const hex = createHash('sha256').update(`pathly-seed:${userId}:${key}`).digest('hex');
  const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

/** Date métier 'YYYY-MM-DD' → Date UTC (colonnes @db.Date). */
function day(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

function assertLocalDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL manquant (voir packages/database/.env).');
  const host = new URL(url).hostname;
  const isLocal = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(host);
  if (!isLocal && process.env.SEED_ALLOW_REMOTE !== 'true') {
    throw new Error(
      `Seed refusé sur une base distante (${host}). Utiliser une base de développement dédiée ` +
        'et définir SEED_ALLOW_REMOTE=true seulement après accord explicite.',
    );
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed refusé : NODE_ENV=production.');
  }
}

const prisma = new PrismaClient();

/** upsert avec les mêmes valeurs en création et en mise à jour (état reproductible). */
async function upsert(delegate, id, data) {
  return delegate.upsert({ where: { id }, create: { id, ...data }, update: data });
}

async function main() {
  if (!UUID_RE.test(userId)) throw new Error(`SEED_PERSONA_USER_ID invalide : ${userId}`);
  assertLocalDatabase();

  // Un e-mail déjà utilisé par un autre profil n'est ni écrasé ni rattaché à ce persona.
  const emailOwner = await prisma.userProfile.findUnique({ where: { email } });
  if (emailOwner && emailOwner.id !== userId) {
    throw new Error(`L'e-mail ${email} appartient déjà au profil ${emailOwner.id} : seed interrompu.`);
  }

  await upsert(prisma.userProfile, userId, { email, fullName: 'Alex Martin (persona fictif)' });

  // Connexion de saisie manuelle : aucune synchro bancaire réelle.
  const connectionId = seedId('connection:manual');
  await upsert(prisma.bankConnection, connectionId, {
    userId,
    source: 'MANUAL',
    institutionName: 'Banque fictive Pathly',
    status: 'CONNECTED',
  });

  const accounts = {
    checking: seedId('account:checking'),
    savings: seedId('account:savings'),
    pea: seedId('account:pea'),
    carLoan: seedId('account:car-loan'),
  };

  await upsert(prisma.bankAccount, accounts.checking, {
    connectionId,
    name: 'Compte courant (fictif)',
    type: 'CHECKING',
    currentBalance: 1500,
    currency: 'EUR',
    isFavorite: true,
  });
  await upsert(prisma.bankAccount, accounts.savings, {
    connectionId,
    name: 'Livret A (fictif)',
    type: 'SAVINGS',
    currentBalance: 500,
    currency: 'EUR',
  });
  await upsert(prisma.bankAccount, accounts.pea, {
    connectionId,
    name: 'PEA (fictif)',
    type: 'INVESTMENT',
    currentBalance: 5000,
    currency: 'EUR',
  });
  await upsert(prisma.bankAccount, accounts.carLoan, {
    connectionId,
    name: 'Crédit auto (fictif)',
    type: 'LOAN',
    currentBalance: -3000,
    currency: 'EUR',
  });

  // Opérations d'octobre 2026 sur le compte courant (dépense négative, revenu positif).
  // Les deux cafés identiques sont deux dépenses légitimes distinctes.
  const transactions = [
    ['tx:salary', '2026-10-01', 2100, 'SALAIRE', 'Salaire', 'REVENU'],
    ['tx:rent', '2026-10-05', -750, 'PRLV LOYER OCTOBRE', 'Loyer', 'LOGEMENT'],
    ['tx:car-loan', '2026-10-10', -250, 'ECHEANCE CREDIT AUTO', 'Crédit auto', 'CREDIT'],
    ['tx:monoprix', '2026-10-12', -42.5, 'CB MONOPRIX PARIS', 'Monoprix', 'ALIMENTATION'],
    ['tx:coffee-1', '2026-10-14', -2.5, 'CB CAFE', 'Café', 'ALIMENTATION'],
    ['tx:coffee-2', '2026-10-14', -2.5, 'CB CAFE', 'Café', 'ALIMENTATION'],
  ];
  for (const [key, date, amount, rawDescription, cleanedDescription, category] of transactions) {
    await upsert(prisma.bankTransaction, seedId(key), {
      accountId: accounts.checking,
      date: day(date),
      amount,
      currency: 'EUR',
      rawDescription,
      cleanedDescription,
      category,
    });
  }

  // Positions du PEA, liées au compte INVESTMENT : 10 × 500 € = 5 000 €.
  await upsert(prisma.investmentPosition, seedId('position:cw8'), {
    userId,
    accountId: accounts.pea,
    brokerInstitution: 'Courtier fictif',
    accountType: 'PEA',
    symbol: 'CW8',
    name: 'ETF Monde (fictif)',
    quantity: 10,
    unitBuyPrice: 450,
    currentPrice: 500,
    currency: 'EUR',
  });

  await upsert(prisma.physicalAsset, seedId('asset:car'), {
    userId,
    name: 'Voiture (fictive)',
    category: 'VEHICLE',
    estimatedValue: 10000,
    purchasePrice: 14000,
    purchaseDate: day('2023-03-01'),
    currency: 'EUR',
  });

  // Crédit lié au compte LOAN : capital restant 3 000 €.
  await upsert(prisma.loanCredit, seedId('loan:car'), {
    userId,
    accountId: accounts.carLoan,
    name: 'Crédit auto (fictif)',
    lenderInstitution: 'Banque fictive Pathly',
    loanType: 'AUTO',
    initialAmount: 8000,
    remainingCapital: 3000,
    interestRate: 3.9,
    monthlyPayment: 250,
    startDate: day('2023-03-01'),
    endDate: day('2027-12-01'),
  });

  await upsert(prisma.lifeProject, seedId('project:emergency-fund'), {
    userId,
    title: 'Fonds de sécurité (fictif)',
    category: 'EMERGENCY_FUND',
    targetAmount: 6000,
    currentSaved: 500,
    targetDate: day('2027-06-30'),
    monthlyAllocation: 200,
  });

  console.log(`Seed terminé pour le persona ${userId} (${email}).`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

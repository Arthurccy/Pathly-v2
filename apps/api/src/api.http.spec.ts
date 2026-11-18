import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configureHttp } from './app.setup';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AccountsRepository } from './modules/accounts/accounts.repository';
import { BusinessClock } from './modules/cashflow/business-clock';
import { CashflowModule } from './modules/cashflow/cashflow.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { TransactionsRepository } from './modules/transactions/transactions.repository';
import { FakeAuthGuard } from './testing/fake-auth.guard';
import {
  ACCOUNT_A,
  ACCOUNT_B,
  InMemoryAccountsRepository,
  InMemoryTransactionsRepository,
  SAVINGS_A,
  TX_A1,
  TX_A2,
  TX_B1,
  USER_A,
  USER_B,
} from './testing/fixtures';

// Validation isolée : contrôleurs, validation et filtres réels ; dépôts et identité simulés.
// L'isolation au niveau SQL (clauses Prisma) reste à vérifier sur la base V2.

const USER_EMPTY = '00000000-0000-4000-8000-0000000000ee';
const USER_USD = '00000000-0000-4000-8000-0000000000ad';
const USER_TWO_CHECKING = '00000000-0000-4000-8000-0000000000c2';

const accountsByUser = {
  [USER_A]: [ACCOUNT_A, SAVINGS_A],
  [USER_B]: [ACCOUNT_B],
  [USER_USD]: [{ ...ACCOUNT_A, id: '55555555-5555-4555-8555-555555555555', currency: 'USD' }],
  [USER_TWO_CHECKING]: [
    ACCOUNT_A,
    { ...ACCOUNT_A, id: '66666666-6666-4666-8666-666666666666', currentBalance: 250.25 },
  ],
};

const transactionsByUser = {
  [USER_A]: [TX_A1, TX_A2],
  [USER_B]: [TX_B1],
};

class FixedClock extends BusinessClock {
  today() {
    return '2026-10-15';
  }
}

async function createApp(accountsRepo: AccountsRepository = new InMemoryAccountsRepository(accountsByUser)) {
  const moduleRef = await Test.createTestingModule({
    imports: [AccountsModule, TransactionsModule, CashflowModule],
  })
    .overrideProvider(AccountsRepository)
    .useValue(accountsRepo)
    .overrideProvider(TransactionsRepository)
    .useValue(new InMemoryTransactionsRepository(transactionsByUser))
    .overrideProvider(BusinessClock)
    .useValue(new FixedClock())
    .overrideGuard(SupabaseAuthGuard)
    .useClass(FakeAuthGuard)
    .compile();

  const app = moduleRef.createNestApplication({ logger: false });
  configureHttp(app, 'api/v1');
  await app.init();
  return app;
}

const as = (userId: string) => ({ Authorization: `Bearer ${userId}` });

describe('API S2 (validation isolée)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/accounts', () => {
    it('401 sans session', async () => {
      await request(app.getHttpServer()).get('/api/v1/accounts').expect(401);
    });

    it("renvoie les comptes de l'utilisateur au format BankAccountDto", async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/accounts').set(as(USER_A)).expect(200);
      expect(res.body).toEqual({ success: true, data: [ACCOUNT_A, SAVINGS_A] });
    });

    it('tableau vide pour un utilisateur sans compte', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/accounts').set(as(USER_EMPTY)).expect(200);
      expect(res.body).toEqual({ success: true, data: [] });
    });

    it("isolation : B ne voit que ses comptes", async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/accounts').set(as(USER_B)).expect(200);
      expect(res.body.data.map((a: { id: string }) => a.id)).toEqual([ACCOUNT_B.id]);
    });

    it("erreur explicite (500) si le dépôt échoue, pas une liste vide", async () => {
      const failing = new InMemoryAccountsRepository({});
      failing.findByUser = () => Promise.reject(new Error('BDD indisponible'));
      const failingApp = await createApp(failing);
      try {
        const res = await request(failingApp.getHttpServer()).get('/api/v1/accounts').set(as(USER_A)).expect(500);
        expect(res.body.success).not.toBe(true);
        expect(res.body.data).toBeUndefined();
      } finally {
        await failingApp.close();
      }
    });
  });

  describe('GET /api/v1/accounts/:id', () => {
    it('renvoie le compte de son propriétaire', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/accounts/${ACCOUNT_A.id}`)
        .set(as(USER_A))
        .expect(200);
      expect(res.body).toEqual({ success: true, data: ACCOUNT_A });
    });

    it("404 sur le compte d'un autre utilisateur, sans divulguer son contenu", async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/accounts/${ACCOUNT_A.id}`)
        .set(as(USER_B))
        .expect(404);
      expect(JSON.stringify(res.body)).not.toContain(ACCOUNT_A.name);
    });

    it('404 sur un compte inexistant', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/accounts/99999999-9999-4999-8999-999999999999')
        .set(as(USER_A))
        .expect(404);
    });

    it('400 sur un identifiant non UUID', async () => {
      await request(app.getHttpServer()).get('/api/v1/accounts/abc').set(as(USER_A)).expect(400);
    });
  });

  describe('GET /api/v1/transactions', () => {
    it('401 sans session', async () => {
      await request(app.getHttpServer()).get('/api/v1/transactions').expect(401);
    });

    it('trie par date décroissante, montants signés', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/transactions').set(as(USER_A)).expect(200);
      expect(res.body).toEqual({ success: true, data: [TX_A2, TX_A1] });
      expect(res.body.data[1].amount).toBe(-42.5);
    });

    it('pagination par curseur', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/api/v1/transactions?limit=1')
        .set(as(USER_A))
        .expect(200);
      expect(page1.body.data).toEqual([TX_A2]);

      const page2 = await request(app.getHttpServer())
        .get(`/api/v1/transactions?limit=1&cursor=${TX_A2.id}`)
        .set(as(USER_A))
        .expect(200);
      expect(page2.body.data).toEqual([TX_A1]);
    });

    it('isolation : B ne voit que ses transactions', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/transactions').set(as(USER_B)).expect(200);
      expect(res.body.data).toEqual([TX_B1]);
    });

    it.each(['limit=0', 'limit=101', 'limit=abc', 'limit=1.5', 'cursor=pas-un-uuid', 'userId=x'])(
      '400 pour ?%s',
      async (qs) => {
        await request(app.getHttpServer()).get(`/api/v1/transactions?${qs}`).set(as(USER_A)).expect(400);
      },
    );
  });

  describe('GET /api/v1/cashflow/summary', () => {
    const url = '/api/v1/cashflow/summary';

    it('401 sans session', async () => {
      await request(app.getHttpServer()).get(url).expect(401);
    });

    it('exemple S2 : 1500 (courant, livret exclu) − 800 − 200 = 500 → AVAILABLE', async () => {
      const res = await request(app.getHttpServer())
        .get(`${url}?month=2026-10&remainingCommittedExpenses=800&savingsReserve=200`)
        .set(as(USER_A))
        .expect(200);
      expect(res.body).toEqual({
        success: true,
        data: {
          month: '2026-10',
          asOfDate: '2026-10-15',
          safeToSpendPeriod: 500,
          status: 'AVAILABLE',
          currency: 'EUR',
        },
      });
    });

    it('mois courant par défaut', async () => {
      const res = await request(app.getHttpServer())
        .get(`${url}?remainingCommittedExpenses=800&savingsReserve=200`)
        .set(as(USER_A))
        .expect(200);
      expect(res.body.data.month).toBe('2026-10');
    });

    it('somme plusieurs comptes courants : 1500 + 250,25 − 800 − 200 = 750,25', async () => {
      const res = await request(app.getHttpServer())
        .get(`${url}?remainingCommittedExpenses=800&savingsReserve=200`)
        .set(as(USER_TWO_CHECKING))
        .expect(200);
      expect(res.body.data.safeToSpendPeriod).toBe(750.25);
    });

    it("isolation : B obtient 99 − 800 − 200 = −901 → SHORTFALL (pas le solde de A)", async () => {
      const res = await request(app.getHttpServer())
        .get(`${url}?remainingCommittedExpenses=800&savingsReserve=200`)
        .set(as(USER_B))
        .expect(200);
      expect(res.body.data.safeToSpendPeriod).toBe(-901);
      expect(res.body.data.status).toBe('SHORTFALL');
    });

    it('paramètres de simulation absents → INCOMPLETE, montant null', async () => {
      const res = await request(app.getHttpServer()).get(url).set(as(USER_A)).expect(200);
      expect(res.body.data).toMatchObject({
        safeToSpendPeriod: null,
        status: 'INCOMPLETE',
        incompleteReasons: ['REMAINING_COMMITTED_EXPENSES_MISSING', 'SAVINGS_RESERVE_MISSING'],
      });
    });

    it('aucun compte courant → INCOMPLETE (solde indisponible, pas 0)', async () => {
      const res = await request(app.getHttpServer())
        .get(`${url}?remainingCommittedExpenses=0&savingsReserve=0`)
        .set(as(USER_EMPTY))
        .expect(200);
      expect(res.body.data).toMatchObject({
        safeToSpendPeriod: null,
        status: 'INCOMPLETE',
        incompleteReasons: ['AVAILABLE_BALANCE_MISSING'],
      });
    });

    it('compte courant hors EUR → INCOMPLETE (UNSUPPORTED_CURRENCY), pas de conversion', async () => {
      const res = await request(app.getHttpServer())
        .get(`${url}?remainingCommittedExpenses=0&savingsReserve=0`)
        .set(as(USER_USD))
        .expect(200);
      expect(res.body.data).toMatchObject({
        safeToSpendPeriod: null,
        status: 'INCOMPLETE',
        incompleteReasons: ['UNSUPPORTED_CURRENCY'],
      });
    });

    it.each([
      'month=2026-09',
      'month=2026-13',
      'remainingCommittedExpenses=-1',
      'savingsReserve=1.234',
      'remainingCommittedExpenses=abc',
      'availableBalance=999999',
    ])('400 pour ?%s', async (qs) => {
      await request(app.getHttpServer()).get(`${url}?${qs}`).set(as(USER_A)).expect(400);
    });
  });
});

describe('SupabaseAuthGuard réel', () => {
  it('401 sans en-tête Authorization (aucun appel réseau)', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AccountsModule] })
      .overrideProvider(AccountsRepository)
      .useValue(new InMemoryAccountsRepository(accountsByUser))
      .compile();
    const app = moduleRef.createNestApplication({ logger: false });
    configureHttp(app, 'api/v1');
    await app.init();
    try {
      await request(app.getHttpServer()).get('/api/v1/accounts').expect(401);
      await request(app.getHttpServer()).get('/api/v1/accounts').set('Authorization', 'Basic xyz').expect(401);
    } finally {
      await app.close();
    }
  });
});

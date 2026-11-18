import * as assert from 'assert';
import { ImportService } from '../import.service';
import { StatementFormat } from '../dto/import-preview.dto';
import { prisma } from '@pathly/database';

async function runCommitTests() {
  console.log('=== Suite de Tests : ImportService.commit & Autorisation ===\n');

  const importService = new ImportService();
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  [FAIL] ${name}`);
      console.error(`         ${err.message}`);
      failed++;
    }
  }

  // 1. Rejet si contenu sans aucune transaction valide
  await test('1. Rejet BadRequest si le contenu ne contient aucune transaction valide', async () => {
    let errorThrown: any = null;
    try {
      await importService.commit('user-123', {
        accountId: 'acc-1',
        rawContent: 'date;libelle;montant\ndate_invalide;desc;montant_invalide',
        format: StatementFormat.CSV,
      });
    } catch (err) {
      errorThrown = err;
    }
    assert.ok(errorThrown, 'Devrait lever une exception');
    assert.strictEqual(errorThrown.status, 400);
  });

  // 2. Contrôle de sécurité : compte non possédé par l'utilisateur
  await test('2. Sécurité : Rejet Forbidden si le compte cible n’appartient pas à l’utilisateur connecté', async () => {
    // Mock de prisma.bankAccount.findFirst renvoyant null (compte non possédé)
    const originalFindFirst = prisma.bankAccount.findFirst;
    (prisma.bankAccount as any).findFirst = async () => null;

    let errorThrown: any = null;
    try {
      await importService.commit('user-hacker', {
        accountId: 'compte-victime',
        rawContent: 'date;libelle;montant\n2026-10-12;VIREMENT PIRATE;1000,00',
        format: StatementFormat.CSV,
      });
    } catch (err) {
      errorThrown = err;
    } finally {
      prisma.bankAccount.findFirst = originalFindFirst;
    }

    assert.ok(errorThrown, 'Doit lever une exception de sécurité');
    assert.strictEqual(errorThrown.status, 403, 'Code HTTP doit être 403 Forbidden');
  });

  // 3. Cas nominal avec persistance et détection de doublons existants en BDD
  await test('3. Persistance & Anti-doublons : détection des transactions déjà en base', async () => {
    const originalFindFirst = prisma.bankAccount.findFirst;
    const originalFindMany = prisma.bankTransaction.findMany;
    const originalCreate = prisma.bankTransaction.create;

    // Compte autorisé
    (prisma.bankAccount as any).findFirst = async () => ({
      id: 'acc-remi-1',
      currency: 'EUR',
    });

    // En BDD, la transaction Monoprix existe déjà
    (prisma.bankTransaction as any).findMany = async () => [
      {
        date: new Date('2026-10-12'),
        amount: -42.50,
        rawDescription: 'CB MONOPRIX PARIS',
      },
    ];

    const createdList: any[] = [];
    (prisma.bankTransaction as any).create = async ({ data }: any) => {
      const record = { id: `tx-${createdList.length + 1}`, ...data };
      createdList.push(record);
      return record;
    };

    try {
      const result = await importService.commit('user-remi', {
        accountId: 'acc-remi-1',
        rawContent: 'date;libelle;montant\n2026-10-12;CB MONOPRIX PARIS;-42,50\n2026-10-13;SALAIRE;2100,00',
        format: StatementFormat.CSV,
        skipDuplicates: true,
      });

      assert.strictEqual(result.totalRead, 2);
      assert.strictEqual(result.skippedDuplicatesCount, 1, 'Monoprix doit être ignoré car déjà présent en BDD');
      assert.strictEqual(result.importedCount, 1, 'Seul le salaire doit être persisté');
      assert.strictEqual(createdList.length, 1);
      assert.strictEqual(createdList[0].rawDescription, 'SALAIRE');
      assert.strictEqual(createdList[0].amount, 2100.00);
    } finally {
      prisma.bankAccount.findFirst = originalFindFirst;
      prisma.bankTransaction.findMany = originalFindMany;
      prisma.bankTransaction.create = originalCreate;
    }
  });

  // 4. Auto-création de compte si accountId omis
  await test('4. Auto-création de la connexion et du compte si accountId n’est pas fourni', async () => {
    const originalConnFindFirst = prisma.bankConnection.findFirst;
    const originalConnCreate = prisma.bankConnection.create;
    const originalAccCreate = prisma.bankAccount.create;
    const originalTxCreate = prisma.bankTransaction.create;
    const originalTxFindMany = prisma.bankTransaction.findMany;

    let connectionCreated = false;
    let accountCreated = false;

    (prisma.bankConnection as any).findFirst = async () => null; // Pas de connexion existante
    (prisma.bankConnection as any).create = async ({ data }: any) => {
      connectionCreated = true;
      return { id: 'conn-auto-1', ...data };
    };
    (prisma.bankAccount as any).create = async ({ data }: any) => {
      accountCreated = true;
      return { id: 'acc-auto-1', ...data };
    };
    (prisma.bankTransaction as any).findMany = async () => [];
    (prisma.bankTransaction as any).create = async ({ data }: any) => {
      return { id: 'tx-1', ...data };
    };

    try {
      const result = await importService.commit('user-remi', {
        rawContent: 'date;libelle;montant\n2026-10-12;CB MONOPRIX PARIS;-42,50',
        format: StatementFormat.CSV,
      });

      assert.strictEqual(connectionCreated, true, 'Doit auto-créer la connexion');
      assert.strictEqual(accountCreated, true, 'Doit auto-créer le compte bancaire');
      assert.strictEqual(result.accountId, 'acc-auto-1');
      assert.strictEqual(result.importedCount, 1);
    } finally {
      prisma.bankConnection.findFirst = originalConnFindFirst;
      prisma.bankConnection.create = originalConnCreate;
      prisma.bankAccount.create = originalAccCreate;
      prisma.bankTransaction.create = originalTxCreate;
      prisma.bankTransaction.findMany = originalTxFindMany;
    }
  });

  console.log(`\nTests commit terminés : ${passed} réussis, ${failed} échoués.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runCommitTests();

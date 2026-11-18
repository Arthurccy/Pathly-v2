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

  const validUuid1 = '123e4567-e89b-12d3-a456-426614174001';
  const validUuid2 = '123e4567-e89b-12d3-a456-426614174002';

  // 1. Rejet si contenu sans aucune transaction valide
  await test('1. Rejet BadRequest si le contenu ne contient aucune transaction valide', async () => {
    let errorThrown: any = null;
    try {
      await importService.commit('user-123', {
        accountId: validUuid1,
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
        accountId: validUuid2,
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

  // 3. Cas nominal avec persistance et détection de doublons existants en BDD + détail des doublons ignorés
  await test('3. Persistance & Anti-doublons : détection et détails des transactions déjà en base', async () => {
    const originalFindFirst = prisma.bankAccount.findFirst;
    const originalFindMany = prisma.bankTransaction.findMany;
    const originalCreate = prisma.bankTransaction.create;

    // Compte autorisé
    (prisma.bankAccount as any).findFirst = async () => ({
      id: validUuid1,
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
        accountId: validUuid1,
        rawContent: 'date;libelle;montant\n2026-10-12;CB MONOPRIX PARIS;-42,50\n2026-10-13;SALAIRE;2100,00',
        format: StatementFormat.CSV,
        skipDuplicates: true,
      });

      assert.strictEqual(result.totalRead, 2);
      assert.strictEqual(result.skippedDuplicatesCount, 1, 'Monoprix doit être ignoré car déjà présent en BDD');
      assert.strictEqual(result.skippedDuplicates.length, 1, 'La liste détaillée des doublons doit être fournie');
      assert.strictEqual(result.skippedDuplicates[0].rawDescription, 'CB MONOPRIX PARIS');
      assert.strictEqual(result.skippedDuplicates[0].amount, -42.50);
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

  // 5. Réutilisation du compte existant lors d'un second import sans accountId
  await test('5. Réutilisation du compte d’import existant sans accountId pour éviter les comptes doublons', async () => {
    const originalConnFindFirst = prisma.bankConnection.findFirst;
    const originalTxFindMany = prisma.bankTransaction.findMany;
    const originalTxCreate = prisma.bankTransaction.create;

    // La connexion existe déjà avec un compte existant
    (prisma.bankConnection as any).findFirst = async () => ({
      id: 'conn-auto-1',
      accounts: [
        {
          id: 'acc-existant-1',
          name: 'Compte relevé importé',
          currency: 'EUR',
        },
      ],
    });

    (prisma.bankTransaction as any).findMany = async () => [
      {
        date: new Date('2026-10-12'),
        amount: -42.50,
        rawDescription: 'CB MONOPRIX PARIS',
      },
    ];

    try {
      const result = await importService.commit('user-remi', {
        rawContent: 'date;libelle;montant\n2026-10-12;CB MONOPRIX PARIS;-42,50',
        format: StatementFormat.CSV,
        skipDuplicates: true,
      });

      // Le compte réutilisé est acc-existant-1, et la transaction est détectée comme doublon !
      assert.strictEqual(result.accountId, 'acc-existant-1');
      assert.strictEqual(result.skippedDuplicatesCount, 1);
      assert.strictEqual(result.importedCount, 0);
    } finally {
      prisma.bankConnection.findFirst = originalConnFindFirst;
      prisma.bankTransaction.findMany = originalTxFindMany;
      prisma.bankTransaction.create = originalTxCreate;
    }
  });

  // 6. Revue Victor Point 8 : Rejet strict en cas d'écart de devise entre le relevé et le compte cible
  await test('6. Revue Victor Point 8 : Rejet BadRequest si la devise du relevé ne correspond pas au compte', async () => {
    const originalFindFirst = prisma.bankAccount.findFirst;

    // Compte cible libellé en USD
    (prisma.bankAccount as any).findFirst = async () => ({
      id: validUuid1,
      currency: 'USD',
    });

    let errorThrown: any = null;
    try {
      await importService.commit('user-remi', {
        accountId: validUuid1,
        rawContent: 'date;libelle;montant\n2026-10-12;CB MONOPRIX;-42,50',
        format: StatementFormat.CSV,
        currency: 'EUR', // Relevé en EUR sur compte USD -> rejet
      });
    } catch (err) {
      errorThrown = err;
    } finally {
      prisma.bankAccount.findFirst = originalFindFirst;
    }

    assert.ok(errorThrown, 'Doit lever une exception pour écart de devise');
    assert.strictEqual(errorThrown.status, 400);
    assert.ok(
      errorThrown.message.includes('Écart de devise détecté'),
      'Le message doit expliciter le refus de conversion implicite',
    );
  });

  // 7. Revue Victor 2 - Amélioration 4 : Rejet si initialBalance est fourni alors que le compte existe déjà
  await test('7. Revue Victor 2 (Amélioration 4) : Rejet BadRequest si initialBalance est fourni sur compte existant', async () => {
    const originalFindFirst = prisma.bankAccount.findFirst;

    (prisma.bankAccount as any).findFirst = async () => ({
      id: validUuid1,
      currency: 'EUR',
    });

    let errorThrown: any = null;
    try {
      await importService.commit('user-remi', {
        accountId: validUuid1,
        initialBalance: 1500.0,
        rawContent: 'date;libelle;montant\n2026-10-12;CB MONOPRIX;-42,50',
        format: StatementFormat.CSV,
      });
    } catch (err) {
      errorThrown = err;
    } finally {
      prisma.bankAccount.findFirst = originalFindFirst;
    }

    assert.ok(errorThrown, 'Doit lever une exception si initialBalance sur compte existant');
    assert.strictEqual(errorThrown.status, 400);
    assert.ok(
      errorThrown.message.includes('existe déjà'),
      'Doit mentionner que le compte existe déjà',
    );
  });

  // 8. Revue Victor 2 - Amélioration 3 : Pas de repli sur accounts[0] si accountName est différent
  await test('8. Revue Victor 2 (Amélioration 3) : Création d’un nouveau compte si accountName est différent (pas de repli accounts[0])', async () => {
    const originalConnFindFirst = prisma.bankConnection.findFirst;
    const originalAccCreate = prisma.bankAccount.create;
    const originalTxCreate = prisma.bankTransaction.create;
    const originalTxFindMany = prisma.bankTransaction.findMany;

    // La connexion possède déjà un "Compte Courant"
    (prisma.bankConnection as any).findFirst = async () => ({
      id: 'conn-auto-1',
      accounts: [
        {
          id: 'acc-courant-1',
          name: 'Compte Courant',
          currency: 'EUR',
        },
      ],
    });

    let createdAccountName: string | null = null;
    (prisma.bankAccount as any).create = async ({ data }: any) => {
      createdAccountName = data.name;
      return { id: 'acc-livret-1', ...data };
    };
    (prisma.bankTransaction as any).findMany = async () => [];
    (prisma.bankTransaction as any).create = async ({ data }: any) => ({ id: 'tx-1', ...data });

    try {
      const result = await importService.commit('user-remi', {
        accountName: 'Livret A', // Nom différent -> ne doit pas aller dans 'Compte Courant'
        rawContent: 'date;libelle;montant\n2026-10-12;VIREMENT EPARGNE;500,00',
        format: StatementFormat.CSV,
      });

      assert.strictEqual(createdAccountName, 'Livret A', 'Un nouveau compte "Livret A" doit être créé');
      assert.strictEqual(result.accountId, 'acc-livret-1');
    } finally {
      prisma.bankConnection.findFirst = originalConnFindFirst;
      prisma.bankAccount.create = originalAccCreate;
      prisma.bankTransaction.create = originalTxCreate;
      prisma.bankTransaction.findMany = originalTxFindMany;
    }
  });

  // 9. Revue Victor 2 - Amélioration 5 : Ordre des contrôles - aucune écriture BDD en cas de 400
  await test('9. Revue Victor 2 (Amélioration 5) : Aucune écriture en base (connexion ni compte) si rejet devise', async () => {
    const originalConnFindFirst = prisma.bankConnection.findFirst;
    const originalConnCreate = prisma.bankConnection.create;
    const originalAccCreate = prisma.bankAccount.create;

    (prisma.bankConnection as any).findFirst = async () => null;

    let writeAttempted = false;
    (prisma.bankConnection as any).create = async () => {
      writeAttempted = true;
      return { id: 'conn-1' };
    };
    (prisma.bankAccount as any).create = async () => {
      writeAttempted = true;
      return { id: 'acc-1' };
    };

    let errorThrown: any = null;
    try {
      // Relevé contenant des USD mais demandé pour compte EUR
      await importService.commit('user-remi', {
        currency: 'EUR',
        rawContent: '<OFX><CURDEF>USD<BANKTRANLIST><STMTTRN><DTPOSTED>20261012<TRNAMT>-10.00<NAME>TEST</STMTTRN></BANKTRANLIST></OFX>',
        format: StatementFormat.OFX,
      });
    } catch (err) {
      errorThrown = err;
    } finally {
      prisma.bankConnection.findFirst = originalConnFindFirst;
      prisma.bankConnection.create = originalConnCreate;
      prisma.bankAccount.create = originalAccCreate;
    }

    assert.ok(errorThrown, 'Doit lever une exception');
    assert.strictEqual(errorThrown.status, 400);
    assert.strictEqual(writeAttempted, false, 'Aucune écriture en BDD ne doit avoir eu lieu avant le rejet de devise');
  });

  console.log(`\nTests commit terminés : ${passed} réussis, ${failed} échoués.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runCommitTests();

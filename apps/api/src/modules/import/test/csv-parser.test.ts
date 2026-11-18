import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import { CsvStatementParser } from '../parsers/csv-statement-parser';
import { OfxStatementParser } from '../parsers/ofx-statement-parser';
import { ImportService } from '../import.service';
import { StatementFormat } from '../dto/import-preview.dto';

async function runTests() {
  console.log('=== Suite de Tests : Import & Normalisation Bancaire ===\n');
  const csvParser = new CsvStatementParser();
  const ofxParser = new OfxStatementParser();
  const importService = new ImportService();
  const fixturesDir = path.join(__dirname, 'fixtures');

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      const res = fn();
      if (res instanceof Promise) {
        res
          .then(() => {
            console.log(`  [PASS] ${name}`);
            passed++;
          })
          .catch((err) => {
            console.error(`  [FAIL] ${name}`);
            console.error(`         ${err.message}`);
            failed++;
          });
      } else {
        console.log(`  [PASS] ${name}`);
        passed++;
      }
    } catch (err: any) {
      console.error(`  [FAIL] ${name}`);
      console.error(`         ${err.message}`);
      failed++;
    }
  }

  // 1. Cas nominal CSV
  test('1. Cas nominal : CSV avec séparateur point-virgule et virgules décimales', () => {
    const content = fs.readFileSync(path.join(fixturesDir, 'valid-statement.csv'), 'utf-8');
    const result = csvParser.parse(content);

    assert.strictEqual(result.totalRows, 6);
    assert.strictEqual(result.validCount, 6);
    assert.strictEqual(result.errorCount, 0);

    const t1 = result.transactions[0];
    assert.strictEqual(t1.date, '2026-10-12');
    assert.strictEqual(t1.rawDescription, 'CB MONOPRIX PARIS');
    assert.strictEqual(t1.cleanedDescription, 'Monoprix');
    assert.strictEqual(t1.amount, -42.50);
    assert.strictEqual(t1.currency, 'EUR');

    const t2 = result.transactions[1];
    assert.strictEqual(t2.date, '2026-10-13');
    assert.strictEqual(t2.amount, 2100.00);
    assert.strictEqual(t2.cleanedDescription, 'Salaire');

    // Deux opérations légitimes identiques le même jour
    const t5 = result.transactions[4];
    const t6 = result.transactions[5];
    assert.strictEqual(t5.date, '2026-10-15');
    assert.strictEqual(t6.date, '2026-10-15');
    assert.strictEqual(t5.amount, -2.50);
    assert.strictEqual(t6.amount, -2.50);
    assert.strictEqual(t5.rawDescription, 'CAFE ESPRESSO');
    assert.strictEqual(t6.rawDescription, 'CAFE ESPRESSO');

    // Empreintes distinctes
    assert.notStrictEqual(t5.fingerprint, t6.fingerprint, 'Empreintes distinctes pour 2 cafés identiques');
  });

  // 2. Erreurs CSV
  test('2. Fichier mal formé : malformed-statement.csv identifie chaque anomalie sans perte silencieuse', () => {
    const content = fs.readFileSync(path.join(fixturesDir, 'malformed-statement.csv'), 'utf-8');
    const result = csvParser.parse(content);

    assert.strictEqual(result.totalRows, 6);
    assert.strictEqual(result.validCount, 2);
    assert.strictEqual(result.errorCount, 4);

    const errDate = result.errors.find((e) => e.field === 'date');
    assert.ok(errDate);
    assert.strictEqual(errDate?.lineNumber, 3);

    const errAmount = result.errors.find((e) => e.field === 'amount');
    assert.ok(errAmount);
    assert.strictEqual(errAmount?.lineNumber, 4);

    const errFormat = result.errors.find((e) => e.field === 'format');
    assert.ok(errFormat);
    assert.strictEqual(errFormat?.lineNumber, 5);
  });

  // 3. Réimport déterministe
  test('3. Détection de réimport : empreintes déterministes et identiques au second import', () => {
    const content = fs.readFileSync(path.join(fixturesDir, 'valid-statement.csv'), 'utf-8');
    const r1 = csvParser.parse(content);
    const r2 = csvParser.parse(content);

    assert.strictEqual(r1.fileFingerprint, r2.fileFingerprint);
    for (let i = 0; i < r1.transactions.length; i++) {
      assert.strictEqual(r1.transactions[i].fingerprint, r2.transactions[i].fingerprint);
    }
  });

  // 4. Second profil CSV
  test('4. Second profil CSV : séparateur virgule, décimales point et guillemets', () => {
    const content = fs.readFileSync(path.join(fixturesDir, 'valid-comma-statement.csv'), 'utf-8');
    const result = csvParser.parse(content);

    assert.strictEqual(result.validCount, 3);
    assert.strictEqual(result.errorCount, 0);
    assert.strictEqual(result.transactions[0].amount, -42.50);
    assert.strictEqual(result.transactions[1].amount, 2100.00);
    assert.strictEqual(result.transactions[2].amount, -10.99);
  });

  // 5. Format OFX (P1)
  test('5. Support format bancaire OFX : balises <STMTTRN>, DTPOSTED et TRNAMT', () => {
    const content = fs.readFileSync(path.join(fixturesDir, 'valid-statement.ofx'), 'utf-8');
    const result = ofxParser.parse(content);

    assert.strictEqual(result.totalRows, 2);
    assert.strictEqual(result.validCount, 2);
    assert.strictEqual(result.errorCount, 0);

    const tx1 = result.transactions[0];
    assert.strictEqual(tx1.date, '2026-10-12');
    assert.strictEqual(tx1.amount, -42.50);
    assert.strictEqual(tx1.rawDescription, 'CB MONOPRIX PARIS');
    assert.strictEqual(tx1.currency, 'EUR');

    const tx2 = result.transactions[1];
    assert.strictEqual(tx2.date, '2026-10-13');
    assert.strictEqual(tx2.amount, 2100.00);
    assert.strictEqual(tx2.rawDescription, 'SALAIRE EMPLOYEUR');
  });

  // 6. ImportService.preview dispatcher et configuration de mapping
  test('6. ImportService.preview : gère automatiquement CSV et OFX et accepte un mapping personnalisé', () => {
    const csvContent = fs.readFileSync(path.join(fixturesDir, 'valid-statement.csv'), 'utf-8');
    const ofxContent = fs.readFileSync(path.join(fixturesDir, 'valid-statement.ofx'), 'utf-8');

    const csvRes = importService.preview({
      rawContent: csvContent,
      format: StatementFormat.CSV,
      mapping: {
        hasHeader: true,
        delimiter: ';',
        dateColumn: 'date',
        descriptionColumn: 'libelle',
        amountColumn: 'montant',
      },
    });
    assert.strictEqual(csvRes.validCount, 6);

    const ofxRes = importService.preview({ rawContent: ofxContent, format: StatementFormat.OFX });
    assert.strictEqual(ofxRes.validCount, 2);
    assert.strictEqual(ofxRes.transactions[0].currency, 'EUR');
  });

  console.log(`\nTests terminés : ${passed} réussis, ${failed} échoués.\n`);
}

runTests();

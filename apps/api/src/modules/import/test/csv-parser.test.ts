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

  // 7. Revue Victor Point 1 : Rejet strict des montants mal formés (12abc, -42,505, 1.234, 12,5,3)
  test('7. Revue Victor Point 1 : Rejet strict des montants corrompus ou ambigus sans perte silencieuse', () => {
    const cases = [
      { raw: '12abc', label: 'caractères alphabétiques parasites' },
      { raw: '-42,505', label: '3 décimales non conformes' },
      { raw: '1.234', label: 'milliers sans décimale ou 3 décimales ambiguës' },
      { raw: '12,5,3', label: 'séparateurs multiples invalides' },
    ];

    for (const c of cases) {
      const csv = `date;libelle;montant\n2026-10-12;TEST OPERATION;${c.raw}`;
      const res = csvParser.parse(csv);
      assert.strictEqual(
        res.validCount,
        0,
        `Le montant "${c.raw}" (${c.label}) ne doit pas être accepté`,
      );
      assert.strictEqual(
        res.errorCount,
        1,
        `Le montant "${c.raw}" (${c.label}) doit remonter en erreur explicite`,
      );
      assert.strictEqual(res.errors[0].field, 'amount');
    }
  });

  // 8. Revue Victor Point 2 : Présence d'une colonne solde sans confusion avec le montant
  test('8. Revue Victor Point 2 : Une colonne solde n’est jamais prise pour le montant de l’opération', () => {
    const csv = `date;libelle;solde;montant\n2026-10-12;CB MONOPRIX;1500,00;-42,50`;
    const res = csvParser.parse(csv);

    assert.strictEqual(res.validCount, 1);
    assert.strictEqual(res.errorCount, 0);
    assert.strictEqual(
      res.transactions[0].amount,
      -42.50,
      'Le montant doit être -42.50 € et non 1500.00 € (solde)',
    );
  });

  // 9. Revue Victor Point 3 : Fichier sans en-tête avec transaction valide dès la ligne 1
  test('9. Revue Victor Point 3 : Fichier sans en-tête ne perd jamais silencieusement la première transaction', () => {
    const csv = `2026-10-12;CB MONOPRIX;-42,50\n2026-10-13;SALAIRE;2100,00`;
    const res = csvParser.parse(csv);

    assert.strictEqual(res.validCount, 2, 'Les 2 transactions doivent être préservées');
    assert.strictEqual(res.errorCount, 0);
    assert.strictEqual(res.transactions[0].rawDescription, 'CB MONOPRIX');
    assert.strictEqual(res.transactions[0].amount, -42.50);
    assert.strictEqual(res.transactions[1].rawDescription, 'SALAIRE');
    assert.strictEqual(res.transactions[1].amount, 2100.00);
  });

  // 10. Revue Victor Point 4 : Validation stricte des dates OFX (20260231, 00011012)
  test('10. Revue Victor Point 4 : Dates OFX impossibles rejetées en erreur explicite', () => {
    const ofxImpossibleDate = `
<OFX>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20260231
<TRNAMT>-42.50
<NAME>DATE IMPOSSIBLE 31 FEVRIER
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>00011012
<TRNAMT>-10.00
<NAME>ANNEE INVALIDE
</STMTTRN>
</BANKTRANLIST>
</OFX>`;

    const res = ofxParser.parse(ofxImpossibleDate);
    assert.strictEqual(res.validCount, 0);
    assert.strictEqual(res.errorCount, 2);
    assert.strictEqual(res.errors[0].field, 'date');
    assert.strictEqual(res.errors[1].field, 'date');
  });

  // 11. Revue Victor Point 1 (OFX) : Montant mal formé rejeté en OFX (<TRNAMT>12abc)
  test('11. Revue Victor Point 1 (OFX) : Montant mal formé dans <TRNAMT>12abc rejeté en erreur', () => {
    const ofxBadAmt = `
<OFX>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20261012
<TRNAMT>12abc
<NAME>MONTANT MAL FORME
</STMTTRN>
</BANKTRANLIST>
</OFX>`;

    const res = ofxParser.parse(ofxBadAmt);
    assert.strictEqual(res.validCount, 0);
    assert.strictEqual(res.errorCount, 1);
    assert.strictEqual(res.errors[0].field, 'amount');
  });

  console.log(`\nTests terminés : ${passed} réussis, ${failed} échoués.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

'use strict';
/*
 * probe-views-store.js - a View must persist regardless of its category order.
 *
 * verifyPlannedViews compared planned against reparsed records POSITIONALLY, but
 * renderViewsPage emits them grouped in VIEW_CATEGORIES order while
 * placePlannedRecord appends to the end of the plan. So once a page holds a
 * record in a later category, adding one in an earlier category diverges and the
 * whole transaction is rolled back -- silently. The card was written correctly
 * (the entry comparison passes); only the positional loop fails, and the correct
 * card is then thrown away by restoreManagedViewsCards.
 *
 * views-bug.json adds Hates then Likes -- the failing order.
 * views-control.json adds Likes then Hates -- the same two writes, ascending.
 * The ONLY difference is category order, which is what makes this conclusive.
 *
 * Also covers repairViewsCollection, which verified every repairable page against
 * the canonical render rather than only the pages it wrote, so a legal but
 * non-canonical page (parseViewsPage accepts -, – and —) failed the whole repair.
 *
 *   node probe-views-store.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-views-'));
let failures = 0;

function runScenario(name, mutate) {
  const scenario = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'scenarios', name + '.json'), 'utf8'));
  if (mutate) mutate(scenario);
  const scenarioPath = path.join(TMP, name + '.json');
  const reportPath = path.join(TMP, name + '.report.json');
  fs.writeFileSync(scenarioPath, JSON.stringify(scenario));
  const proc = spawnSync(process.execPath,
    [path.join(__dirname, 'run-scenario.js'), scenarioPath, '--json', reportPath, '--quiet'],
    { encoding: 'utf8' });
  if (!fs.existsSync(reportPath)) {
    return { error: (proc.stderr || proc.stdout || 'no report produced').slice(0, 300) };
  }
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const card = (report.finalCards || []).filter(function (c) {
    return /'s Views$/.test(String(c.title));
  })[0];
  const entry = card ? String(card.entry) : '';
  return {
    report: report,
    entry: entry,
    records: entry.split('\n').filter(function (row) { return /\s—\s/.test(row); }),
    throws: report.throws || [],
  };
}

function report(label, r, expected) {
  if (r.error) { failures++; console.log('  FAIL  ' + label + ': ' + r.error); return; }
  if (r.throws.length) {
    failures++;
    console.log('  FAIL  ' + label + ': ' + r.throws.length + ' hook throw(s)');
    return;
  }
  const ok = r.records.length === expected;
  if (!ok) failures++;
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + label + ': '
    + r.records.length + '/' + expected + ' View record(s) persisted');
  r.records.forEach(function (row) { console.log('          ' + row.trim()); });
}

// --- 1. the failing order --------------------------------------------------
console.log('--- two Views, DESCENDING category order (Hates then Likes) ---');
report('descending', runScenario('views-bug'), 2);

// --- 2. the control --------------------------------------------------------
console.log('\n--- the same two Views, ASCENDING order (Likes then Hates) ---');
report('ascending', runScenario('views-control'), 2);

// --- 3. a legal but non-canonical page must not wedge repair ---------------
console.log('\n--- a legal-but-non-canonical page (plain hyphen) ---');
(function () {
  const r = runScenario('views-control', function (scenario) {
    scenario.cards = (scenario.cards || []).concat([{
      title: "Mira Vale's Views",
      keys: "__CC_STABLE_CARD__:Mira Vale's Views",
      type: 'Continuity',
      entry: ['{', "Mira Vale's Views:", 'Loves:', 'Likes:',
        'Player - hand edited with a plain hyphen',
        'Neutrals:', 'Dislikes:', 'Hates:', '}'].join('\n')
    }]);
  });
  if (r.error) { failures++; console.log('  FAIL  ' + r.error); return; }
  if (r.throws.length) {
    failures++;
    console.log('  FAIL  ' + r.throws.length + ' hook throw(s)');
    return;
  }
  const ok = r.records.length > 0;
  if (!ok) failures++;
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  store converged: '
    + r.records.length + ' canonical record(s), no throws');
})();

try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) { /* best effort */ }

console.log('\n' + (failures === 0
  ? 'Views store holds: category order does not decide whether a View persists.'
  : failures + ' failure(s) in the Views store.'));
process.exit(failures === 0 ? 0 : 1);

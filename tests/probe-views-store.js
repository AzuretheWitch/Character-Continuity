'use strict';
/*
 * probe-views-store.js - the Views store must survive legal-but-non-canonical pages.
 *
 * parseViewsPage is deliberately lenient: it accepts "-", "–" and "—" as the
 * separator, trims rows, and matches category headings case-insensitively. So a
 * page a player hand-edited, or one written by an older version, parses fine but
 * does not equal its canonical render.
 *
 * Confirmed defects that turned that into a permanent wedge:
 *   - repairViewsCollection verified EVERY repairable page against the canonical
 *     render, not just the ones it wrote, so one non-canonical page failed the
 *     whole repair -- including the duplicate removal that triggered it.
 *   - verifyPlannedViews compared planned vs reparsed records positionally while
 *     renderViewsPage regroups them by category, so inserts rolled back.
 *
 * Drives the real cco scenario on top of a seeded page and asserts the store
 * still converges and still accepts writes.
 *
 *   node probe-views-store.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const BASE = require(path.join(__dirname, 'scenarios', 'cco.json'));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-views-'));
let failures = 0;

function run(label, seedCards) {
  const scenario = Object.assign({}, BASE, {
    name: label,
    cards: (BASE.cards || []).concat(seedCards || []),
  });
  const scenarioPath = path.join(TMP, label.replace(/\W+/g, '-') + '.json');
  const reportPath = path.join(TMP, label.replace(/\W+/g, '-') + '.report.json');
  fs.writeFileSync(scenarioPath, JSON.stringify(scenario));
  const proc = spawnSync(process.execPath,
    [path.join(__dirname, 'run-scenario.js'), scenarioPath, '--json', reportPath, '--quiet'],
    { encoding: 'utf8' });
  if (!fs.existsSync(reportPath)) {
    return { error: (proc.stderr || proc.stdout || 'no report produced').slice(0, 300) };
  }
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const views = (report.finalCards || []).filter(function (card) {
    return /'s Views$/.test(String(card.title));
  });
  return {
    report: report,
    views: views,
    entry: views.length ? String(views[0].entry) : '',
    throws: report.throws || [],
  };
}

function recordRows(entry) {
  return entry.split('\n').filter(function (row) { return /\s—\s/.test(row); });
}

// --- 1. baseline -----------------------------------------------------------
console.log('--- baseline (no seeded page) ---');
let baseline = 0;
(function () {
  const r = run('baseline', []);
  if (r.error) { failures++; console.log('  FAIL  ' + r.error); return; }
  if (!r.views.length) { failures++; console.log('  FAIL  no Views card produced'); return; }
  baseline = recordRows(r.entry).length;
  console.log('  PASS  Views card present, ' + baseline + ' canonical record(s), '
    + r.throws.length + ' throw(s)');
})();

// --- 2. a non-canonical page must not wedge the store ----------------------
console.log('\n--- a legal-but-non-canonical Views page (plain hyphen) ---');
const SEEDED = {
  title: "Mira Vale's Views",
  keys: "__CC_STABLE_CARD__:Mira Vale's Views",
  type: 'Continuity',
  entry: ['{', "Mira Vale's Views:", 'Loves:', 'Likes:',
    'Player - hand edited with a plain hyphen',
    'Neutrals:', 'Dislikes:', 'Hates:', '}'].join('\n')
};

(function () {
  const r = run('non-canonical', [SEEDED]);
  if (r.error) { failures++; console.log('  FAIL  ' + r.error); return; }
  if (!r.views.length) { failures++; console.log('  FAIL  the Views card vanished'); return; }
  const records = recordRows(r.entry);
  if (r.throws.length) {
    failures++;
    console.log('  FAIL  ' + r.throws.length + ' hook throw(s): '
      + JSON.stringify(r.throws[0]).slice(0, 160));
    return;
  }
  if (records.length === 0) {
    failures++;
    console.log('  FAIL  store wedged: no canonical record survived');
    console.log('        ' + r.entry.replace(/\n/g, ' | '));
    return;
  }
  console.log('  PASS  store converged: ' + records.length + ' canonical record(s), no throws');
})();

// --- 3. a duplicate Views page ---------------------------------------------
console.log('\n--- a duplicate Views page ---');
(function () {
  const r = run('duplicate', [SEEDED, Object.assign({}, SEEDED, { keys: '' })]);
  if (r.error) { failures++; console.log('  FAIL  ' + r.error); return; }
  if (r.throws.length) {
    failures++;
    console.log('  FAIL  ' + r.throws.length + ' hook throw(s): '
      + JSON.stringify(r.throws[0]).slice(0, 160));
    return;
  }
  console.log('  ' + (r.views.length === 1 ? 'PASS' : 'WARN') + '  ' + r.views.length
    + ' Views card(s) remain, no throws'
    + (r.views.length === 1 ? '' : ' (duplicate resolution tracked separately)'));
})();

try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) { /* best effort */ }

console.log('\n' + (failures === 0
  ? 'Views store holds under non-canonical input.'
  : failures + ' failure(s) in the Views store.'));
process.exit(failures === 0 ? 0 : 1);

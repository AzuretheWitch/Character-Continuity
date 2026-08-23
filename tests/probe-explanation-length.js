'use strict';
/*
 * probe-explanation-length.js - an overlong Explanation is trimmed, not discarded.
 *
 * The Name, Relationship and View parsers read the Explanation with wholeLine,
 * which returns "" past its limit -- so an Explanation a few characters too long
 * did not get shortened, it threw away the whole record as malformed and the
 * continuity change was lost.
 *
 * That is now a deliberate change: the Explanation is compacted to a clause
 * boundary and the record is accepted. Two things follow from that decision, and
 * this probe pins both:
 *
 *   1. the record must be ACCEPTED and its change persisted;
 *   2. the trim must be REPORTED, not silent, so the player can see the script
 *      altered what the model wrote.
 *
 * The old rejection wording ("over N characters") has been removed from the
 * parser messages to match, since length is no longer a rejection cause.
 *
 *   node probe-explanation-length.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const BASE = require(path.join(__dirname, 'scenarios', 'cco.json'));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-explen-'));
let failures = 0;

// Comfortably past MAX_OPERATION_EXPLANATION_CHARS (180).
const LONG = 'She stayed at the table after being pressed and returned to easy talk, '
  + 'and kept talking about the harbour and the tide '.repeat(4);

function run(label, cco) {
  const turns = BASE.turns.slice();
  turns[turns.length - 1] = Object.assign({}, turns[turns.length - 1], { cco: cco });
  const scenario = Object.assign({}, BASE, {
    name: label,
    turns: turns,
    // Debug on so the parser's own reason line is written out where it can be read.
    cards: (BASE.cards || []).concat([{
      title: 'CC — Settings',
      keys: '__CC_STABLE_CARD__:CC — Settings',
      type: 'Continuity',
      entry: ['{', 'Enabled: true', 'Debug: true', '}'].join('\n')
    }])
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
  const cards = report.finalCards || [];
  const all = cards.map(function (c) { return String(c.entry); }).join('\n');
  const views = cards.filter(function (c) { return /'s Views$/.test(String(c.title)); })[0];
  return {
    allText: all,
    viewRecords: views
      ? String(views.entry).split('\n').filter(function (r) { return /\s—\s/.test(r); })
      : [],
    reportedTrim: /shortened to fit/i.test(all),
    saysOverLength: /over \d+ characters/i.test(all),
    throws: report.throws || [],
  };
}

console.log('--- an overlong View Explanation ---');
(function () {
  const r = run('overlong-view', '(CCO|V|P|%E%|Likes|M|' + LONG + ')');
  if (r.error) { failures++; console.log('  FAIL  ' + r.error); return; }

  const accepted = r.viewRecords.length > 0;
  const trimmed = r.viewRecords.every(function (row) { return row.length <= 260; });
  const ok = accepted && trimmed && r.reportedTrim && !r.saysOverLength && !r.throws.length;
  if (!ok) failures++;

  console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  supplied ' + LONG.length + ' chars against a 180 cap');
  console.log('        record accepted        : ' + (accepted ? 'yes' : 'NO - discarded'));
  console.log('        stored value trimmed   : ' + (trimmed ? 'yes' : 'NO'));
  console.log('        trim reported to player: ' + (r.reportedTrim ? 'yes' : 'NO - silent'));
  console.log('        stale "over N characters" wording present: '
    + (r.saysOverLength ? 'YES - message contradicts behaviour' : 'no'));
  if (r.viewRecords[0]) console.log('        ' + r.viewRecords[0].trim().slice(0, 110) + '...');
})();

console.log('\n--- a normal-length Explanation (control) ---');
(function () {
  const r = run('normal-view', '(CCO|V|P|%E%|Likes|M|She stayed at the table and talked easily.)');
  if (r.error) { failures++; console.log('  FAIL  ' + r.error); return; }
  const ok = r.viewRecords.length > 0 && !r.reportedTrim && !r.throws.length;
  if (!ok) failures++;
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  accepted with no trim reported'
    + ' (records ' + r.viewRecords.length + ', trim note ' + (r.reportedTrim ? 'present' : 'absent') + ')');
})();

try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) { /* best effort */ }

console.log('\n' + (failures === 0
  ? 'Explanation length handled: overlong is trimmed, accepted, and reported.'
  : failures + ' failure(s) in Explanation length handling.'));
process.exit(failures === 0 ? 0 : 1);

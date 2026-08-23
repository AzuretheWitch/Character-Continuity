'use strict';
/*
 * probe-duplicate-cards.js - a duplicate managed card must not wedge a subsystem.
 *
 * A player can duplicate any card in the AID UI. Several subsystems responded by
 * going permanently inert rather than resolving or reporting it:
 *
 *   - writeStateCard returned early when two State cards existed for a character,
 *     so it never recorded the card hash; syncStateCard then re-parsed the first
 *     copy on every hook and the NPC's State was pinned to whichever copy sorted
 *     first, forever, with nothing said about it.
 *
 * Exact duplicates are now collapsed the way duplicate Outer cards already were,
 * and a genuine conflict is reported on the Status card instead of being silent.
 *
 *   node probe-duplicate-cards.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const BASE = require(path.join(__dirname, 'scenarios', 'cco.json'));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-dup-'));
let failures = 0;

function run(label, extraCards) {
  const scenario = Object.assign({}, BASE, {
    name: label,
    cards: (BASE.cards || []).concat(extraCards || []),
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
  const status = cards.filter(function (c) { return /Status/.test(String(c.title)); })[0];
  return {
    stateCards: cards.filter(function (c) { return /'s State$/.test(String(c.title)); }),
    status: status ? String(status.entry) : '',
    throws: report.throws || [],
    contained: report.containedFailures || [],
  };
}

const STATE_CARD = function (overrides) {
  return Object.assign({
    title: "Mira Vale's State",
    keys: "__CC_STABLE_CARD__:Mira Vale's State",
    type: 'Continuity',
    entry: ['{', "Mira Vale's current private State:", 'About: Player',
      'Situation: seated across the table', 'Thought: he is not what she expected', '}'].join('\n')
  }, overrides || {});
};

console.log('--- two EXACT duplicate State cards ---');
(function () {
  const r = run('state-exact-dup', [STATE_CARD(), STATE_CARD()]);
  if (r.error) { failures++; console.log('  FAIL  ' + r.error); return; }
  const collapsed = r.stateCards.length === 1;
  const reported = /State cards:.*(removed|exact)/i.test(r.status);
  if (!collapsed) failures++;
  console.log('  ' + (collapsed ? 'PASS' : 'FAIL') + '  ' + r.stateCards.length
    + ' State card(s) remain (expected 1), throws ' + r.throws.length);
  console.log('        collapse reported: ' + (reported ? 'yes' : 'no'));
})();

console.log('\n--- two CONFLICTING State cards ---');
(function () {
  const r = run('state-conflict-dup', [
    STATE_CARD(),
    STATE_CARD({

      entry: ['{', "Mira Vale's current private State:", 'About: Player',
        'Situation: standing by the door', 'Thought: she wants him gone', '}'].join('\n')
    })
  ]);
  if (r.error) { failures++; console.log('  FAIL  ' + r.error); return; }
  // The contract is: converge to one card, or say why not. Going silently inert
  // with the player's State pinned to an arbitrary copy is the failure mode.
  const resolved = r.stateCards.length === 1;
  const reported = /conflicting State cards/i.test(r.status);
  const ok = (resolved || reported) && r.throws.length === 0 && r.contained.length === 0;
  if (!ok) failures++;
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  '
    + (resolved ? 'converged to a single State card' : 'left ' + r.stateCards.length + ' cards')
    + (reported ? ', conflict reported' : '')
    + ', throws ' + r.throws.length + ', contained failures ' + r.contained.length);
})();

console.log('\n--- control: a single State card ---');
(function () {
  const r = run('state-single', [STATE_CARD()]);
  if (r.error) { failures++; console.log('  FAIL  ' + r.error); return; }
  const ok = r.stateCards.length === 1 && r.throws.length === 0 && r.contained.length === 0;
  if (!ok) failures++;
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + r.stateCards.length
    + ' State card, throws ' + r.throws.length);
})();

try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) { /* best effort */ }

console.log('\n' + (failures === 0
  ? 'Duplicate managed cards are collapsed or reported, never silently wedged.'
  : failures + ' failure(s): a duplicate card still wedges a subsystem silently.'));
process.exit(failures === 0 ? 0 : 1);

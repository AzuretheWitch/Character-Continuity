'use strict';
/*
 * probe-undo.js - an undo must not leave the script inert.
 *
 * AI Dungeon fires no hook on undo. The script only learns about one when the
 * platform's action count comes back lower than CC.lastCompletedActionCount, the
 * monotonic high-water mark markActionCompleted maintains.
 *
 * Nothing detected that regression: after an N-action undo the observed count sat
 * N below the mark, so `clearlyNewAction` stayed false for N turns and each was
 * misread as a RETRY of an action the player had already erased.
 *
 * The assertion is the invariant itself: the high-water mark must never sit ahead
 * of the platform's action count. Without the resync an undo of 5 leaves the mark
 * at 10 while the count is 7, 8, 9 -- and that gap is exactly what makes
 * `clearlyNewAction` false and the turn read as a retry. The probe also requires
 * that no post-undo turn is classified `retry` or downgraded to `preview`, and
 * that continuity keeps being injected.
 *
 * Uses the `undo: N` turn field, which rewinds the action count and trims history
 * exactly as the platform does.
 *
 *   node probe-undo.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const BASE = require(path.join(__dirname, 'scenarios', 'cco.json'));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-undo-'));
const UNDO_AT = 12; // well after Mira Vale is onboarded and active
let failures = 0;

function run(label, undoBy) {
  const turns = BASE.turns.map(function (turn, index) {
    return index === UNDO_AT && undoBy
      ? Object.assign({}, turn, { undo: undoBy })
      : turn;
  });
  const scenario = Object.assign({}, BASE, { name: label, turns: turns });
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
  return {
    injected: report.turns.map(function (t) {
      return (t.hooks && t.hooks.context && t.hooks.context.added) || 0;
    }),
    planKinds: report.turns.map(function (t) { return t.planKind || ''; }),
    // The high-water mark against the platform's real action count, per turn.
    marks: report.turns.map(function (t) {
      return { mark: t.lastCompletedActionCount, count: t.actionCount };
    }),
    throws: report.throws || [],
    contained: report.containedFailures || [],
  };
}

function check(label, undoBy) {
  const r = run(label, undoBy);
  if (r.error) { failures++; console.log('  FAIL  ' + label + ': ' + r.error); return; }

  const after = r.injected.slice(UNDO_AT);
  const live = after.filter(function (n) { return n > 0; }).length;

  // 1. The high-water mark must never sit ahead of the platform's action count.
  //    This is the defect itself: after an N-action undo the mark stayed N ahead,
  //    so `clearlyNewAction` was false and the turn was read as a retry.
  const ahead = r.marks.slice(UNDO_AT).filter(function (m) {
    return typeof m.mark === 'number' && typeof m.count === 'number' && m.mark > m.count;
  });

  // 2. No turn after the undo may be classified as a retry or downgraded to a
  //    preview -- the player took a real new action.
  const misread = r.planKinds.slice(UNDO_AT).filter(function (k) {
    return k === 'retry' || k === 'preview';
  });

  const ok = live === after.length && ahead.length === 0 && misread.length === 0
    && r.throws.length === 0 && r.contained.length === 0;
  if (!ok) failures++;
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + label);
  console.log('        continuity: ' + live + '/' + after.length + ' turns injected');
  console.log('        action mark ahead of count on ' + ahead.length + ' turn(s)'
    + (ahead.length ? '  <-- ' + JSON.stringify(ahead[0]) : ''));
  console.log('        plan kinds: ' + r.planKinds.slice(UNDO_AT).join(', '));
}

console.log('--- continuity survives an undo ---');
check('no undo (control)', 0);
check('undo 1 action', 1);
check('undo 3 actions', 3);
check('undo 5 actions', 5);

try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) { /* best effort */ }

console.log('\n' + (failures === 0
  ? 'Undo guard holds: rewinding the action count keeps continuity alive.'
  : failures + ' failure(s): an undo leaves the script inert.'));
process.exit(failures === 0 ? 0 : 1);

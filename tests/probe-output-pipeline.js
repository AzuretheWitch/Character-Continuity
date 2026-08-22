'use strict';
/*
 * probe-output-pipeline.js - the player must always get their prose back.
 *
 * processOutput strips the script's own CCO control protocol out of the model's
 * reply before the player sees it. Several confirmed defects made that stripping
 * swallow the story itself:
 *
 *   - ccoProtocolSpans counts paren depth from the opener with no bound. One
 *     unmatched "(" leaves complete=false and end=source.length, so
 *     stripCcoProtocolSpans deletes from the record to end-of-text.
 *   - stripSystemControlBlocks truncates to end-of-text at the first unmatched
 *     <SYSTEM> tag, which models routinely echo mid-response.
 *   - stripTurningPointControlEchoes collapses whitespace on every output turn
 *     regardless of whether it stripped anything, left-flushing formatted prose.
 *
 * Each case runs the full cco scenario and replaces only the FINAL turn, so the
 * script is properly onboarded with an active character and a live operation.
 *
 *   node probe-output-pipeline.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const BASE = require(path.join(__dirname, 'scenarios', 'cco.json'));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-output-'));
let failures = 0;

// The prose the player typed their turn to read. It must survive every case.
const PROSE = 'Mira Vale sets the cup down and finally looks up at you.';

function lastTurn(overrides) {
  const turns = BASE.turns.slice();
  const final = Object.assign({}, turns[turns.length - 1], overrides);
  turns[turns.length - 1] = final;
  return turns;
}

function run(label, overrides) {
  const scenario = Object.assign({}, BASE, { name: label, turns: lastTurn(overrides) });
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
  return { text: String(report.turns[report.turns.length - 1].outputText || '') };
}

function check(label, overrides, predicate, describe) {
  const r = run(label, overrides);
  if (r.error) { failures++; console.log('  FAIL  ' + label + ': ' + r.error); return; }
  const ok = predicate(r.text);
  if (!ok) failures++;
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + label);
  console.log('        ' + describe(r.text));
}

function shown(text) {
  const flat = text.replace(/\n/g, '\\n');
  return 'player saw: ' + JSON.stringify(flat.length > 90 ? flat.slice(0, 90) + '...' : flat);
}

const keepsProse = function (text) { return text.indexOf(PROSE) !== -1; };

console.log('--- unbalanced parentheses must not swallow the story ---');
check('balanced record (control)',
  { modelOutput: PROSE, cco: '(CCO|K|S|%E%|Nothing in this exchange changed established continuity.)' },
  keepsProse, shown);

check('unmatched ( inside the record',
  { modelOutput: PROSE, cco: '(CCO|K|S|%E%|Nothing changed (yet, at least.)' },
  keepsProse, shown);

check('stray ( in the prose before the record',
  { modelOutput: 'Mira Vale sets the cup down (and finally looks up at you.',
    cco: '(CCO|K|S|%E%|Nothing in this exchange changed established continuity.)' },
  function (text) { return text.indexOf('finally looks up at you') !== -1; }, shown);

console.log('\n--- an echoed control tag must not truncate the story ---');
check('unmatched <SYSTEM> echoed mid-reply',
  { modelOutput: '<SYSTEM> ' + PROSE,
    cco: '(CCO|K|S|%E%|Nothing in this exchange changed established continuity.)' },
  keepsProse, shown);

console.log('\n--- formatting must survive an untouched turn ---');
check('indented prose keeps its indentation',
  { modelOutput: 'She reads it aloud:\n\n    Come home when the river is low.\n    I will wait.',
    cco: '(CCO|K|S|%E%|Nothing in this exchange changed established continuity.)' },
  function (text) { return /\n {2,}Come home/.test(text); },
  function (text) {
    return 'indentation ' + (/\n {2,}Come home/.test(text) ? 'preserved' : 'FLATTENED')
      + ' :: ' + JSON.stringify(text.replace(/\n/g, '\\n').slice(0, 90));
  });

try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) { /* best effort */ }

console.log('\n' + (failures === 0
  ? 'Output pipeline holds: the player kept their prose in every case.'
  : failures + ' failure(s): the output pipeline is eating player-visible text.'));
process.exit(failures === 0 ? 0 : 1);

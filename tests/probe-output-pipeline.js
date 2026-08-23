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

// Control text that must never reach the player, whatever else happens. Checking
// only that the prose survived was the gap that let a malformed multiline record
// leave its tail, and an echoed <SYSTEM> tag leave the instructions it wrapped.
const LEAK = /\(\s*CCO\b|\bCCO\s*\||PROTOCOL TAIL|<\s*\/?\s*SYSTEM\s*>|CC CURRENT|operation is mandatory|Follow the final CC|Do not omit or refuse/i;

function leaked(text) {
  const found = LEAK.exec(String(text));
  return found ? found[0] : '';
}

function shown(text) {
  const flat = text.replace(/\n/g, '\\n');
  const bad = leaked(text);
  return 'player saw: ' + JSON.stringify(flat.length > 90 ? flat.slice(0, 90) + '...' : flat)
    + (bad ? '   <-- LEAKED CONTROL TEXT: ' + JSON.stringify(bad) : '');
}

// Prose survives AND nothing from the control protocol is left behind.
const keepsProse = function (text) {
  return text.indexOf(PROSE) !== -1 && !leaked(text);
};

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

console.log('\n--- an UNFINISHED MULTILINE record must go entirely ---');
check('unbalanced ( with the tail on the next line',
  { modelOutput: PROSE, cco: '(CCO|S|S|%E%|situation (here\nPROTOCOL TAIL)' },
  keepsProse, shown);

check('no closing paren anywhere',
  { modelOutput: PROSE, cco: '(CCO|S|S|%E%|situation here\nPROTOCOL TAIL' },
  keepsProse, shown);

check('three-line unfinished record',
  { modelOutput: PROSE, cco: '(CCO|S|S|%E%|situation (here\nSECOND LINE\nPROTOCOL TAIL)' },
  function (text) { return keepsProse(text) && text.indexOf('SECOND LINE') === -1; }, shown);

console.log('\n--- an echoed control tag must not truncate the story ---');
check('unmatched <SYSTEM> echoed mid-reply',
  { modelOutput: '<SYSTEM> ' + PROSE,
    cco: '(CCO|K|S|%E%|Nothing in this exchange changed established continuity.)' },
  keepsProse, shown);

check('unmatched <SYSTEM> wrapping one instruction line',
  { modelOutput: '<SYSTEM>\nA Character Continuity operation is mandatory this response.\n' + PROSE,
    cco: '' },
  keepsProse, shown);

check('unmatched <SYSTEM> wrapping the whole front-memory block',
  { modelOutput: ['<SYSTEM>',
    'A Character Continuity operation is mandatory this response.',
    'Follow the final CC CURRENT ASSESSMENT/OPERATION block in Context.',
    'Output exactly one completed CCO record as the first nonblank line, then story prose.',
    'If the Context block offers K and no change is supported, use K.',
    'Do not omit or refuse the record.',
    PROSE].join('\n'), cco: '' },
  keepsProse, shown);

// The two failure modes have to be tested TOGETHER, not just separately. Punctuation
// alone cannot mark where a malformed record ends: the record's own continuation can
// read as a sentence, and the story after one can be cut off mid-word.
console.log('\n--- malformed control AND prose, in combination ---');

check('punctuated continuation belongs to the record',
  { modelOutput: "She's really here.\nMira sets down the cup...",
    cco: '(CCO|S|S|%E%|reconnect|Azure returns (unexpectedly' },
  function (text) {
    return text.indexOf('Mira sets down the cup') !== -1
      && text.indexOf("She's really here.") === -1 && !leaked(text);
  },
  function (text) {
    return shown(text) + (text.indexOf("She's really here.") !== -1
      ? '   <-- record continuation left visible' : '');
  });

check('story truncated mid-word after a malformed record',
  { modelOutput: 'Mira sets down the cup and then she',
    cco: '(CCO|S|S|%E%|reconnect|Azure returns (unexpectedly' },
  function (text) { return text.indexOf('Mira sets down the cup and then she') !== -1; },
  function (text) {
    return shown(text) + (text.trim() ? '' : '   <-- STORY DESTROYED');
  });

check('story truncated mid-word after an unmatched <SYSTEM>',
  { modelOutput: '<SYSTEM>\nA Character Continuity operation is mandatory this response.\n'
      + 'Mira sets down the cup and then she', cco: '' },
  function (text) {
    return text.indexOf('Mira sets down the cup and then she') !== -1 && !leaked(text);
  },
  function (text) {
    return shown(text) + (text.trim() ? '' : '   <-- STORY DESTROYED');
  });

check('a multi-paragraph reply is never eaten past the record',
  { modelOutput: 'Line one of the story.\nLine two of the story.\nLine three of the story.',
    cco: '' },
  function (text) {
    return ['Line one', 'Line two', 'Line three'].every(function (part) {
      return text.indexOf(part) !== -1;
    });
  }, shown);

console.log('\n--- formatting must survive an untouched turn ---');
check('indented prose keeps its indentation',
  { modelOutput: 'She reads it aloud:\n\n    Come home when the river is low.\n    I will wait.',
    cco: '(CCO|K|S|%E%|Nothing in this exchange changed established continuity.)' },
  function (text) { return /\n {2,}Come home/.test(text); },
  function (text) {
    return 'indentation ' + (/\n {2,}Come home/.test(text) ? 'preserved' : 'FLATTENED')
      + ' :: ' + JSON.stringify(text.replace(/\n/g, '\\n').slice(0, 90));
  });


console.log('\n--- a truncated generation must still reach the player ---');
// AID cuts generations at the token limit, so a reply ending mid-sentence is
// routine. Withholding the continuity bookkeeping is right; deleting the prose
// the player waited for is not.
check('reply cut off mid-sentence',
  { modelOutput: 'Mira Vale sets the cup down and looks at you for a long moment, then she',
    cco: '' },
  function (text) { return text.indexOf('looks at you for a long moment') !== -1; }, shown);

check('reply ending on a comma',
  { modelOutput: 'She turns the coin over once, twice,', cco: '' },
  function (text) { return text.indexOf('turns the coin over') !== -1; }, shown);

check('properly punctuated reply (control)',
  { modelOutput: 'She turns the coin over once, twice, and sets it down.', cco: '' },
  function (text) { return text.indexOf('sets it down') !== -1; }, shown);

try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) { /* best effort */ }

console.log('\n' + (failures === 0
  ? 'Output pipeline holds: the player kept their prose in every case.'
  : failures + ' failure(s): the output pipeline is eating player-visible text.'));
process.exit(failures === 0 ? 0 : 1);

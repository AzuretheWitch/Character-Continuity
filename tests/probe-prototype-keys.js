'use strict';
/*
 * probe-prototype-keys.js - player-controlled text must not reach a map's prototype.
 *
 * The script groups records in plain object literals keyed by player-controlled
 * strings: alias keys, view and relationship target keys, turning point ids, NPC
 * names. `if (!groups[key]) groups[key] = []` then reads through the prototype
 * chain, so a record whose key is "constructor" finds Object, skips the init and
 * calls Object.push(...) -- TypeError.
 *
 * keyOf and nameKeyOf lowercase, which masks toString and valueOf, but
 * "constructor" is already lowercase and survives. canonicalTurningPointId
 * accepts ^[a-z0-9][a-z0-9_]{0,79}$, so "constructor" is a DOCUMENTED-LEGAL id.
 *
 * Since the hook boundary now contains throws, these failures no longer crash --
 * they silently kill continuity forever, with the Status card still reporting
 * "Warning: None". The check is therefore that context injection CONTINUES.
 *
 *   node probe-prototype-keys.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const BASE = require(path.join(__dirname, 'scenarios', 'cco.json'));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-proto-'));
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
  // Once an NPC is active, a contextAppend turn that adds nothing means CC is dead.
  const added = report.turns.map(function (t) {
    return (t.hooks && t.hooks.context && t.hooks.context.added) || 0;
  });
  const late = added.slice(-4);
  return {
    contained: report.containedFailures || [],
    throws: report.throws || [],
    lateInjection: late,
    injecting: late.some(function (n) { return n > 0; }),
  };
}

function check(label, cards) {
  const r = run(label, cards);
  if (r.error) { failures++; console.log('  FAIL  ' + label + ': ' + r.error); return; }
  const ok = r.throws.length === 0 && r.contained.length === 0 && r.injecting;
  if (!ok) failures++;
  console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  ' + label);
  console.log('        last 4 turns injected: [' + r.lateInjection.join(', ') + '] chars'
    + ', throws ' + r.throws.length + ', contained failures ' + r.contained.length);
  if (r.contained.length) console.log('        ' + r.contained[0].slice(0, 140));
}

const NAMES_CARD = function (alias) {
  return {
    title: "Mira Vale's Names",
    keys: "__CC_STABLE_CARD__:Mira Vale's Names",
    type: 'Continuity',
    entry: ['{', "Mira Vale's Names:",
      'Canonical: Mira Vale',
      '',
      'Alias: ' + alias,
      'Status: Active',
      'Use: General',
      'Progress: ',
      'Reason: She gave the short form of her name herself.',
      '}'].join('\n')
  };
};

console.log('--- player-controlled keys that collide with Object.prototype ---');
check('Alias: constructor', [NAMES_CARD('constructor')]);
check('Alias: Constructor', [NAMES_CARD('Constructor')]);
check('Alias: __proto__', [NAMES_CARD('__proto__')]);
check('Alias: toString (control, lowercased away)', [NAMES_CARD('toString')]);
check('NPC named constructor in the roster', [{
  title: 'CC — Active NPCs',
  keys: '__CC_STABLE_CARD__:CC — Active NPCs',
  type: 'Continuity',
  entry: ['{', 'Active NPC slots:', 'N1: Mira Vale', 'N2: constructor',
    'N3: ', 'N4: ', 'N5: ', '}'].join('\n')
}]);
check('baseline, no poisoned key (control)', []);

try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) { /* best effort */ }

console.log('\n' + (failures === 0
  ? 'Prototype-key class holds: continuity survives every poisoned key.'
  : failures + ' failure(s): a player-controlled key still reaches the prototype.'));
process.exit(failures === 0 ? 0 : 1);

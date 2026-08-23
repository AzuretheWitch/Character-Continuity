'use strict';
/*
 * bench.js - per-turn cost against a mature story card deck.
 *
 * Card-write cost scales with deck size, because the write path serialises the
 * whole deck to verify a change landed. The bundled scenarios run with a small
 * deck, which understates it, so this pads the deck with player lore cards to
 * something a long-running adventure would actually carry.
 *
 *   node bench.js            # default 100 padding cards, 3 runs
 *   node bench.js 250 5      # 250 padding cards, 5 runs
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const PAD = Number(process.argv[2] || 100);
const RUNS = Number(process.argv[3] || 3);

const base = require(path.join(__dirname, 'scenarios', 'long.json'));
const padding = [];
for (let i = 0; i < PAD; i += 1) {
  padding.push({
    title: 'Lore ' + i, keys: 'lore' + i, type: 'class',
    entry: ('Background detail number ' + i + '. ').repeat(60)
  });
}
const scenario = Object.assign({}, base, {
  name: 'bench',
  cards: (base.cards || []).concat(padding)
});

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-bench-'));
const scenarioPath = path.join(dir, 'bench.json');
const reportPath = path.join(dir, 'bench.report.json');
fs.writeFileSync(scenarioPath, JSON.stringify(scenario));

const timings = [];
for (let run = 0; run < RUNS; run += 1) {
  const started = Date.now();
  spawnSync(process.execPath,
    [path.join(__dirname, 'run-scenario.js'), scenarioPath, '--json', reportPath, '--quiet'],
    { stdio: 'ignore' });
  timings.push(Date.now() - started);
}

const report = fs.existsSync(reportPath)
  ? JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  : null;

timings.sort(function (a, b) { return a - b; });
const median = timings[Math.floor(timings.length / 2)];
const turns = report ? report.turns.length : 0;

console.log('deck            : ' + scenario.cards.length + ' seeded cards'
  + (report ? ' -> ' + report.finalCards.length + ' final' : ''));
console.log('turns           : ' + turns);
console.log('runs            : ' + timings.join('ms, ') + 'ms');
console.log('median total    : ' + median + 'ms');
if (turns) console.log('median per turn : ' + (median / turns).toFixed(1) + 'ms');
if (report) {
  console.log('throws          : ' + (report.throws || []).length);
  console.log('final state     : ' + (report.stateBytes / 1024).toFixed(1) + ' KiB');
}

try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { /* best effort */ }

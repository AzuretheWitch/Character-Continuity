'use strict';
/*
 * probe-card-ownership.js - CC must not seize story cards it does not own.
 *
 * migrateOwnedCardTitles iterates every card in the deck and rewrites any whose
 * title merely LOOKS like "<Name>'s <Label>" for one of the owned labels (Outer,
 * Inner, Names, State, Relationships, Views, Experiences, Identity...). It
 * replaced the card's trigger keys with __CC_STABLE_CARD__:<title> and its type
 * with "Continuity". Nothing checked whether CC ever created the card.
 *
 * A player writing their own lore card called "Sarah's State" therefore lost its
 * keys, so it stopped triggering, and CC began treating it as a managed card it
 * may rewrite. The only notice is a Debug counter, and DEBUG defaults to false.
 *
 *   node probe-card-ownership.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const BASE = require(path.join(__dirname, 'scenarios', 'cco.json'));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-own-'));
let failures = 0;

// Player-authored lore cards whose titles collide with CC's owned-title shape.
const PLAYER_CARDS = [
  { title: "Sarah's State", keys: 'Sarah, state, condition', type: 'class',
    entry: 'Sarah is a travelling cartographer. She is not a CC character.' },
  { title: "Tomas's Inner", keys: 'Tomas, inner', type: 'character',
    entry: 'Tomas keeps his own counsel and answers to no script.' },
  { title: 'The Old Bridge', keys: 'bridge, crossing', type: 'location',
    entry: 'A stone span over the river, half collapsed.' },
  // The card TYPE is free text a player can set to anything, including CC's own
  // "Continuity". It must not count as proof of ownership.
  { title: "Elena's Views", keys: 'Elena, views, opinions', type: 'Continuity',
    entry: 'Elena keeps a ledger of who owes her what. Authored by the player.' },
  { title: "Rook's Relationships", keys: 'Rook, ties', type: 'continuity',
    entry: 'Rook answers to the harbourmaster and to nobody else.' }
];

function run() {
  const scenario = Object.assign({}, BASE, {
    name: 'card-ownership',
    cards: (BASE.cards || []).concat(PLAYER_CARDS),
  });
  const scenarioPath = path.join(TMP, 'ownership.json');
  const reportPath = path.join(TMP, 'ownership.report.json');
  fs.writeFileSync(scenarioPath, JSON.stringify(scenario));
  const proc = spawnSync(process.execPath,
    [path.join(__dirname, 'run-scenario.js'), scenarioPath, '--json', reportPath, '--quiet'],
    { encoding: 'utf8' });
  if (!fs.existsSync(reportPath)) {
    return { error: (proc.stderr || proc.stdout || 'no report produced').slice(0, 300) };
  }
  return { report: JSON.parse(fs.readFileSync(reportPath, 'utf8')) };
}

console.log('--- player-authored cards must survive untouched ---');
const r = run();
if (r.error) {
  failures++;
  console.log('  FAIL  ' + r.error);
} else {
  PLAYER_CARDS.forEach(function (original) {
    const found = (r.report.finalCards || []).filter(function (card) {
      return String(card.title) === original.title;
    })[0];
    if (!found) {
      failures++;
      console.log('  FAIL  ' + original.title + ' :: card vanished');
      return;
    }
    const keysKept = String(found.keys) === original.keys;
    const typeKept = String(found.type) === original.type;
    const entryKept = String(found.entry) === original.entry;
    if (keysKept && typeKept && entryKept) {
      console.log('  PASS  ' + original.title + ' :: keys, type and entry intact');
      return;
    }
    failures++;
    console.log('  FAIL  ' + original.title + ' :: seized by CC');
    if (!keysKept) console.log('        keys  ' + JSON.stringify(original.keys)
      + ' -> ' + JSON.stringify(String(found.keys)));
    if (!typeKept) console.log('        type  ' + JSON.stringify(original.type)
      + ' -> ' + JSON.stringify(String(found.type)));
    if (!entryKept) console.log('        entry changed');
  });
}

try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) { /* best effort */ }

console.log('\n' + (failures === 0
  ? 'Card ownership respected: no player card was seized.'
  : failures + ' player card(s) seized or damaged by CC.'));
process.exit(failures === 0 ? 0 : 1);

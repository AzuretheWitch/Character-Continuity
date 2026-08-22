'use strict';
/*
 * run-scenario.js - drives the real CharacterContinuity through a scripted
 * scenario in the true AI Dungeon hook order.
 *
 *   node run-scenario.js <scenario.json> [--json out.json] [--quiet] [--cards] [--context]
 *
 * See README.md for the scenario file format.
 */
const fs = require('fs');
const path = require('path');
const { createSandbox } = require('./aid-sandbox');

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const positional = argv.filter((a) => !a.startsWith('--'));
let jsonOut = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--json') jsonOut = argv[i + 1];
}
const scenarioPath = positional[0] || path.join(__dirname, 'scenarios', 'smoke.json');
const QUIET = flags.has('--quiet');
const SHOW_CARDS = flags.has('--cards');
const SHOW_CONTEXT = flags.has('--context');

function out() {
  if (!QUIET) console.log.apply(console, arguments);
}

const scenario = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));

// ---------------------------------------------------------------------------
// Sandbox
// ---------------------------------------------------------------------------
const sb = createSandbox({
  libraryPath: scenario.libraryPath,
  state: scenario.initialState,
  storyCards: scenario.storyCards || [],
  history: [],
  info: scenario.info,
  dedupeKeys: scenario.dedupeKeys
});

const report = {
  scenario: path.resolve(scenarioPath),
  library: scenario.libraryPath || require('./aid-sandbox').DEFAULT_LIBRARY,
  hooksRun: { input: 0, context: 0, contextAppend: 0, output: 0 },
  throws: [],
  cacheViolations: [],
  stateLoss: [],
  turns: []
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Apply a scenario "cards" block: create or patch story cards, as a human would in the UI. */
function applyCardEdits(edits) {
  (edits || []).forEach((edit) => {
    const existing = sb.storyCards.find(
      (c) =>
        (edit.title && c.title === edit.title) ||
        (edit.matchKeys && String(c.keys) === edit.matchKeys)
    );
    if (edit.remove) {
      const i = sb.storyCards.indexOf(existing);
      if (i >= 0) sb.storyCards.splice(i, 1);
      return;
    }
    if (existing) {
      if (typeof edit.entry === 'string') existing.entry = edit.entry;
      if (typeof edit.keys === 'string') existing.keys = edit.keys;
      if (typeof edit.type === 'string') existing.type = edit.type;
      if (typeof edit.newTitle === 'string') existing.title = edit.newTitle;
      return;
    }
    sb.storyCards.push({
      id: 'seed-' + sb.storyCards.length,
      title: edit.title || '',
      keys: typeof edit.keys === 'string' ? edit.keys : '',
      entry: typeof edit.entry === 'string' ? edit.entry : '',
      type: edit.type || 'Continuity',
      description: '',
      useForCharacterCreation: false
    });
  });
}

/** Build the platform-side context string the Context hook receives. */
function buildPlatformContext(memory) {
  const parts = [];
  if (memory) parts.push(memory);
  sb.sandbox.history.slice(-20).forEach((h) => parts.push(h.text));
  return parts.join('\n').trim() + '\n';
}

function persist(label, turnIndex) {
  const r = sb.persistState();
  if (!r.ok) {
    report.stateLoss.push({ turn: turnIndex, after: label, lost: r.lost, error: r.error });
  }
  return r;
}

function callHook(hook, text, turnIndex) {
  try {
    const result = sb.runHook(hook, text);
    report.hooksRun[hook] += 1;
    return { ok: true, result: result };
  } catch (err) {
    report.throws.push({
      turn: turnIndex,
      hook: hook,
      message: err && err.message,
      stack: err && err.stack
    });
    return { ok: false, result: text, error: err };
  }
}

function cardTitles() {
  return sb.storyCards.map((c) => c.title || '(untitled:' + String(c.keys).slice(0, 40) + ')');
}

// ---------------------------------------------------------------------------
// Drive
// ---------------------------------------------------------------------------
const contextHookName = scenario.contextHook || 'contextAppend';
let actionCount = Number(scenario.startActionCount || 0);

out('Scenario : ' + path.resolve(scenarioPath));
out('Library  : ' + report.library);
out('Context  : ' + contextHookName);
out('Turns    : ' + (scenario.turns || []).length);
out('');

applyCardEdits(scenario.cards);

(scenario.turns || []).forEach((turn, i) => {
  const n = i + 1;
  applyCardEdits(turn.cards);

  sb.sandbox.info.actionCount = actionCount;
  sb.context.info = sb.sandbox.info;

  const turnReport = { turn: n, hooks: {}, cardCount: 0, stateBytes: 0 };

  // ---- 1. input -----------------------------------------------------------
  const rawInput = turn.playerInput === undefined ? '' : turn.playerInput;
  const inputRes = callHook('input', rawInput, n);
  const inputText = String(inputRes.result === undefined ? rawInput : inputRes.result);
  turnReport.hooks.input = { ok: inputRes.ok, chars: inputText.length };
  persist('input', n);

  if (inputText.trim()) {
    sb.sandbox.history.push({ text: inputText, type: turn.actionType || 'do' });
  }

  // ---- 2. context ---------------------------------------------------------
  const platformContext = buildPlatformContext(turn.memory || scenario.memory || '');
  const ctxRes = callHook(contextHookName, platformContext, n);
  const ctxText = String(ctxRes.result === undefined ? platformContext : ctxRes.result);
  turnReport.hooks.context = {
    ok: ctxRes.ok,
    chars: ctxText.length,
    added: ctxText.length - platformContext.length
  };
  // The cache contract: a contextAppend result MUST begin with the original verbatim.
  if (contextHookName === 'contextAppend' && !ctxText.startsWith(platformContext)) {
    report.cacheViolations.push({ turn: n, originalChars: platformContext.length });
    turnReport.hooks.context.cacheViolation = true;
  }
  if (SHOW_CONTEXT) {
    out('--- turn ' + n + ' context tail ---');
    out(ctxText.slice(platformContext.length) || '(nothing appended)');
    out('--- end ---');
  }
  persist('context', n);

  // ---- 2b. CCO assessment plumbing ---------------------------------------
  // When CC asks for an assessment it lists evidence rows as "E12[SNRVT]: ...".
  // A scenario turn may supply `cco` with %E% / %E1% placeholders so the fake
  // model can answer the assessment it was actually given this turn.
  const evidenceIds = [];
  String(ctxText).replace(/^(E\d+)\[/gm, function (m, id) {
    if (evidenceIds.indexOf(id) < 0) evidenceIds.push(id);
    return m;
  });
  turnReport.evidenceIds = evidenceIds;
  turnReport.assessmentOffered = /CC CURRENT ASSESSMENT/.test(ctxText);

  // ---- 3. output ----------------------------------------------------------
  let rawOutput = turn.modelOutput === undefined ? '' : turn.modelOutput;
  if (typeof turn.cco === 'string' && turn.cco) {
    const line = turn.cco
      .replace(/%E%/g, evidenceIds.slice(0, 2).join(','))
      .replace(/%E1%/g, evidenceIds[0] || 'E1')
      .replace(/%E2%/g, evidenceIds[1] || evidenceIds[0] || 'E1');
    rawOutput = line + '\n' + rawOutput;
    turnReport.ccoSent = line;
  }
  const outRes = callHook('output', rawOutput, n);
  const outText = String(outRes.result === undefined ? rawOutput : outRes.result);
  turnReport.hooks.output = { ok: outRes.ok, chars: outText.length };
  persist('output', n);

  if (outText.trim()) sb.sandbox.history.push({ text: outText, type: 'story' });

  actionCount += 1;

  const bytes = Buffer.byteLength(JSON.stringify(sb.sandbox.state) || '', 'utf8');
  turnReport.cardCount = sb.storyCards.length;
  turnReport.stateBytes = bytes;
  turnReport.cardTitles = cardTitles();
  turnReport.outputText = outText;
  report.turns.push(turnReport);

  out(
    'turn ' + String(n).padStart(2) +
    ' | in ' + (inputRes.ok ? 'ok' : 'THROW') +
    ' ctx ' + (ctxRes.ok ? 'ok' : 'THROW') +
    (turnReport.hooks.context.cacheViolation ? '(CACHE!)' : '') +
    ' out ' + (outRes.ok ? 'ok' : 'THROW') +
    ' | +' + turnReport.hooks.context.added + ' ctx chars' +
    ' | cards ' + turnReport.cardCount +
    ' | state ' + bytes + 'B' +
    (turnReport.assessmentOffered ? ' | ASK[' + evidenceIds.join(',') + ']' : '') +
    (turnReport.ccoSent ? ' | CCO sent' : '')
  );
  if (turnReport.ccoSent && !QUIET) {
    const leaked = /\(CCO\|/.test(outText);
    out('        cco: ' + turnReport.ccoSent);
    out('        leaked into story prose: ' + (leaked ? 'YES - CCO VISIBLE TO PLAYER' : 'no'));
  }
  if (turn.label) out('        ' + turn.label);
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
out('');
out('=== hooks executed ===');
Object.keys(report.hooksRun).forEach((h) => out('  ' + h.padEnd(14) + report.hooksRun[h]));

out('');
out('=== story cards (' + sb.storyCards.length + ') ===');
sb.storyCards.forEach((c, i) => {
  out(
    '  [' + String(i).padStart(2) + '] ' +
    (c.title || '(no title)') +
    '  | type=' + c.type +
    ' | keys=' + String(c.keys).slice(0, 46) +
    ' | entry=' + String(c.entry).length + 'ch'
  );
  if (SHOW_CARDS) out(String(c.entry).split('\n').map((l) => '        ' + l).join('\n'));
});

const finalBytes = Buffer.byteLength(JSON.stringify(sb.sandbox.state) || '', 'utf8');
out('');
out('=== state ===');
out('  top-level keys : ' + Object.keys(sb.sandbox.state).join(', '));
out('  serialised size: ' + finalBytes + ' bytes (' + (finalBytes / 1024).toFixed(1) + ' KiB)');

out('');
out('=== problems ===');
out('  hook throws        : ' + report.throws.length);
report.throws.forEach((t) =>
  out('    turn ' + t.turn + ' ' + t.hook + ': ' + t.message + '\n' +
      String(t.stack).split('\n').slice(0, 8).map((l) => '      ' + l).join('\n'))
);
out('  cache violations   : ' + report.cacheViolations.length);
report.cacheViolations.forEach((c) => out('    turn ' + c.turn));
out('  state JSON losses  : ' + report.stateLoss.length);
report.stateLoss.slice(0, 20).forEach((s) =>
  out('    turn ' + s.turn + ' after ' + s.after + ': ' +
      (s.error || s.lost.slice(0, 8).join(', ')))
);

if (sb.logs.length) {
  out('');
  out('=== log() output (' + sb.logs.length + ' lines, first 20) ===');
  sb.logs.slice(0, 20).forEach((l) => out('  ' + l));
}

report.finalState = sb.sandbox.state;
report.finalCards = sb.storyCards;
report.stateBytes = finalBytes;
if (jsonOut) {
  fs.writeFileSync(jsonOut, JSON.stringify(report, null, 2));
  out('\nreport written to ' + path.resolve(jsonOut));
}

const allFour =
  report.hooksRun.input > 0 &&
  report.hooksRun.output > 0 &&
  (report.hooksRun.context > 0 || report.hooksRun.contextAppend > 0);
out('');
out('RESULT: ' + (report.throws.length === 0 && allFour ? 'PASS' : 'FAIL'));
process.exitCode = report.throws.length === 0 && allFour ? 0 : 1;

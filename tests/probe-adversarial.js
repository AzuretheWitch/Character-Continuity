'use strict';
/*
 * probe-adversarial.js - drive the real library through hostile / edge conditions
 * that a static, region-scoped read cannot evaluate.
 *
 *   node probe-adversarial.js
 */
const { createSandbox } = require('./aid-sandbox');

const results = [];
function probe(name, fn) {
  const t0 = Date.now();
  try {
    const detail = fn();
    results.push({ name: name, ok: true, ms: Date.now() - t0, detail: detail });
    console.log('PASS  ' + name + '  (' + (Date.now() - t0) + 'ms)' + (detail ? '  ' + detail : ''));
  } catch (err) {
    results.push({ name: name, ok: false, ms: Date.now() - t0, error: err.message, stack: err.stack });
    console.log('THROW ' + name + '  (' + (Date.now() - t0) + 'ms)');
    console.log(String(err.stack).split('\n').slice(0, 10).map((l) => '        ' + l).join('\n'));
  }
}

function boot(cards, info) {
  const sb = createSandbox({
    storyCards: cards || [
      { title: "Player's Identity", entry: 'Name: Azure\nPronouns: she/her', type: 'Continuity' }
    ],
    info: info
  });
  return sb;
}

/** Run one whole turn (all three connectors) with JSON persistence between each. */
function turn(sb, input, output, ctxBase) {
  const i = sb.runHook('input', input);
  sb.persistState();
  const base = ctxBase === undefined ? String(i) + '\n' : ctxBase;
  const c = sb.runHook('contextAppend', base);
  sb.persistState();
  const o = sb.runHook('output', output);
  sb.persistState();
  if (!String(c).startsWith(base)) {
    throw new Error('CACHE CONTRACT VIOLATED: contextAppend result did not begin with the original context');
  }
  return { input: String(i), context: String(c), output: String(o), base: base };
}

function rosterCard(names) {
  const rows = ['{', 'Active NPC slots:'];
  for (let i = 0; i < 5; i++) rows.push('N' + (i + 1) + ': ' + (names[i] || ''));
  rows.push('}');
  return rows.join('\n');
}

function setRoster(sb, names) {
  const card = sb.storyCards.find((c) => c.title === 'CC — Active NPCs');
  if (!card) throw new Error('roster card missing');
  card.entry = rosterCard(names);
}

// ===========================================================================
console.log('--- adversarial probes against the real Library ---\n');

// 1. Every hook against genuinely empty text.
probe('empty text through all four hooks', function () {
  const sb = boot();
  ['input', 'context', 'contextAppend', 'output'].forEach(function (h) {
    sb.runHook(h, '');
    sb.persistState();
  });
  return 'cards=' + sb.storyCards.length;
});

// 2. Undefined / null text (the platform can hand these over on odd turns).
probe('undefined and null text through all four hooks', function () {
  const sb = boot();
  ['input', 'context', 'contextAppend', 'output'].forEach(function (h) {
    sb.runHook(h, undefined);
    sb.runHook(h, null);
    sb.persistState();
  });
  return 'survived';
});

// 3. No Player's Identity card at all (documented fallback path).
probe('no Player card - documented fallback', function () {
  const sb = createSandbox({ storyCards: [] });
  turn(sb, '> You wait.', 'Nothing happens.');
  const status = sb.storyCards.find((c) => c.title === 'CC — Status');
  return 'cards=' + sb.storyCards.length + ' status=' + (status ? 'yes' : 'no');
});

// 4. Regex-hostile canonical NPC name in the roster.
probe('regex-metacharacter NPC name', function () {
  const sb = boot();
  turn(sb, '> Start.', 'A room.');
  setRoster(sb, ['D(.*)Arcy [the] Grey+']);
  for (let i = 0; i < 4; i++) turn(sb, '> You speak to D(.*)Arcy.', 'They answer.');
  return 'cards=' + sb.storyCards.length;
});

// 5. Very long player input and model output.
probe('100k-char input and output', function () {
  const sb = boot();
  turn(sb, '> Start.', 'A room.');
  const big = ('lorem ipsum dolor sit amet ').repeat(4000); // ~108k chars
  const r = turn(sb, '> ' + big, big);
  return 'in=' + r.input.length + ' out=' + r.output.length;
});

// 6. Lone surrogates / astral plane characters.
probe('astral + lone-surrogate text', function () {
  const sb = boot();
  turn(sb, '> Start.', 'A room.');
  const nasty = '👩‍🚀 🦊 ' + '\uD83D'.repeat(50) + ' \uDC00 end';
  const r = turn(sb, '> ' + nasty, nasty);
  return 'out=' + r.output.length;
});

// 7. Story card entry containing the script's own private key prefix (spoofing).
probe('spoofed managed-card key from a user-authored card', function () {
  const sb = boot([
    { title: "Player's Identity", entry: 'Name: Azure\nPronouns: she/her', type: 'Continuity' },
    { title: 'A Trap', keys: '__CC_STABLE_CARD__:CC — Settings', entry: 'Enabled: false', type: 'Continuity' }
  ]);
  turn(sb, '> Start.', 'A room.');
  turn(sb, '> Again.', 'Still a room.');
  return 'cards=' + sb.storyCards.length;
});

// 8. Duplicate managed cards (a player copy/pasting a CC card).
probe('duplicate managed card titles', function () {
  const sb = boot();
  turn(sb, '> Start.', 'A room.');
  const settings = sb.storyCards.find((c) => c.title === 'CC — Settings');
  sb.storyCards.push(JSON.parse(JSON.stringify(settings)));
  turn(sb, '> Again.', 'Still a room.');
  return 'cards=' + sb.storyCards.length;
});

// 9. Corrupted persisted state (AID does drop/garble state in the wild).
probe('state replaced by garbage between turns', function () {
  const sb = boot();
  turn(sb, '> Start.', 'A room.');
  sb.sandbox.state.characterContinuityStableV1 = 'not an object at all';
  sb.context.state = sb.sandbox.state;
  turn(sb, '> Again.', 'Still a room.');
  return 'recovered';
});

probe('state truncated to an empty object between turns', function () {
  const sb = boot();
  for (let i = 0; i < 3; i++) turn(sb, '> Turn ' + i, 'Reply ' + i);
  sb.sandbox.state = {};
  sb.context.state = sb.sandbox.state;
  turn(sb, '> After wipe.', 'Reply after wipe.');
  return 'recovered';
});

probe('deeply nested junk injected into CC state', function () {
  const sb = boot();
  turn(sb, '> Start.', 'A room.');
  const cc = sb.sandbox.state.characterContinuityStableV1;
  Object.keys(cc).forEach(function (k) {
    if (Array.isArray(cc[k])) cc[k] = { nowAnObject: true };
    else if (cc[k] && typeof cc[k] === 'object') cc[k] = [1, 2, 3];
    else if (typeof cc[k] === 'number') cc[k] = 'NaN-ish';
  });
  sb.context.state = sb.sandbox.state;
  turn(sb, '> Again.', 'Still a room.');
  return 'recovered';
});

// 10. Tiny info.maxChars - can the append contract still hold?
probe('info.maxChars = 200 (context squeeze)', function () {
  const sb = boot(null, { maxChars: 200 });
  turn(sb, '> Start.', 'A room.');
  setRoster(sb, ['Snow']);
  const big = 'x'.repeat(5000);
  for (let i = 0; i < 4; i++) turn(sb, '> Talk to Snow.', 'Snow replies.', big);
  return 'append contract held';
});

probe('info.maxChars = 0 / missing info object', function () {
  const sb = boot(null, { maxChars: 0 });
  turn(sb, '> Start.', 'A room.');
  delete sb.sandbox.info;
  sb.context.info = undefined;
  turn(sb, '> Again.', 'Still a room.');
  return 'survived a missing info global';
});

// 11. storyCards emptied under the script (player deletes every card).
probe('player deletes every story card mid-adventure', function () {
  const sb = boot();
  for (let i = 0; i < 3; i++) turn(sb, '> Turn ' + i, 'Reply ' + i);
  sb.storyCards.length = 0;
  turn(sb, '> After purge.', 'Reply after purge.');
  return 'cards rebuilt=' + sb.storyCards.length;
});

// 12. Retry: the same action re-run, which AID does on the retry button.
probe('same turn retried three times', function () {
  const sb = boot();
  turn(sb, '> Start.', 'A room.');
  const snapshots = [];
  for (let i = 0; i < 3; i++) {
    sb.runHook('output', 'The same reply.');
    sb.persistState();
    snapshots.push(JSON.stringify(sb.sandbox.state).length);
  }
  return 'state sizes ' + snapshots.join(' -> ');
});

// 13. Full five-NPC roster driven for many turns (worst-case context assembly).
probe('five active NPCs x 30 turns', function () {
  const sb = boot();
  turn(sb, '> Start.', 'A room.');
  const names = ['Snow', 'Mira Vale', 'Corvin', 'Tessaly Roan', 'Bram'];
  setRoster(sb, names);
  // complete every pack so all five activate
  for (let pass = 0; pass < 2; pass++) {
    names.forEach(function (n) {
      const outer = sb.storyCards.find((c) => c.title === n + "'s Outer");
      const inner = sb.storyCards.find((c) => c.title === n + "'s Inner");
      if (outer) {
        outer.entry = ['{', n + "'s Outer:", 'Onboarding: Pending', 'Ready: Yes',
          'Name, age, gender, pronouns: ' + n + ', 30, woman, she/her',
          'Race/Species: human', 'Physical attributes: tall and wiry',
          'Clothing style: travel clothes', 'Starting status: Main', '}'].join('\n');
      }
      if (inner) {
        inner.entry = ['{', n + "'s Inner:", 'Onboarding: Pending',
          'Personality: observant', 'Mannerisms: watches the door', 'Wants: safety',
          'Fears: dependence', 'Mental wounds: old betrayal',
          'Principles: ask first', '}'].join('\n');
      }
    });
    turn(sb, '> You greet everyone.', 'They all reply.');
  }
  let maxMs = 0;
  for (let i = 0; i < 30; i++) {
    const t0 = Date.now();
    turn(sb, '> You talk with ' + names[i % 5] + ' about the road.',
      names[i % 5] + ' answers carefully, and the others listen.');
    maxMs = Math.max(maxMs, Date.now() - t0);
  }
  const bytes = Buffer.byteLength(JSON.stringify(sb.sandbox.state), 'utf8');
  return 'state=' + (bytes / 1024).toFixed(1) + 'KiB slowestTurn=' + maxMs + 'ms cards=' + sb.storyCards.length;
});

// 14. Does the script tolerate hooks called out of order / repeatedly?
probe('hooks called out of platform order', function () {
  const sb = boot();
  sb.runHook('output', 'An orphan output.');
  sb.persistState();
  sb.runHook('contextAppend', 'Some context\n');
  sb.persistState();
  sb.runHook('input', '> A late input.');
  sb.persistState();
  sb.runHook('contextAppend', 'Some context\n');
  sb.runHook('contextAppend', 'Some context\n');
  sb.persistState();
  return 'survived';
});

// 15. Unknown hook name (defensive path at the bottom of the function).
probe('unknown hook name', function () {
  const sb = boot();
  const r = sb.runHook('nonsense', 'passthrough text');
  if (String(r) !== 'passthrough text') return 'WARNING: text was altered -> ' + JSON.stringify(String(r));
  return 'passes text through unchanged';
});

// ===========================================================================
console.log('\n--- summary ---');
const failed = results.filter((r) => !r.ok);
console.log(results.length + ' probes, ' + failed.length + ' threw');
failed.forEach((f) => console.log('  THROW: ' + f.name + ' :: ' + f.error));
process.exitCode = failed.length ? 1 : 0;

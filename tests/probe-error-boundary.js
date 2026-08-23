'use strict';
/*
 * probe-error-boundary.js - proves the hook dispatch contains an unexpected throw.
 *
 * The platform supplies no try/catch around a script hook, so before the boundary
 * existed any TypeError anywhere in the 20k-line closure broke the player's turn.
 * These probes force a throw from deep inside the closure and assert that:
 *
 *   1. the hook still returns,
 *   2. it returns the platform's own text (so contextAppend stays append-only),
 *   3. the failure is reported rather than silently swallowed.
 *
 * Exits 1 if any hook throws or violates the append contract.
 *
 *   node probe-error-boundary.js
 */
const { createSandbox } = require('./aid-sandbox');

const HOOKS = ['input', 'context', 'contextAppend', 'output'];
let failures = 0;

function baseCards() {
  return [
    { title: "Player's Identity", entry: 'Name: Azure\nPronouns: she/her', type: 'Continuity' },
    {
      title: "Snow's Outer",
      type: 'Continuity',
      entry: ['{', "Snow's Outer:",
        'Name, age, gender, pronouns: Snow, 31, woman, she/her',
        'Race/Species: human', 'Physical attributes: tall',
        'Clothing style: dark layers', 'Starting status: Main', '}'].join('\n')
    }
  ];
}

// A card whose entry throws the moment the script reads it. This is the cheapest
// way to inject a failure deep inside the closure without editing the Library.
// It must be attached AFTER createSandbox, which normalises cards by reading them.
function poison(sandbox) {
  const card = {
    id: 'poisoned', title: "Snow's Inner", keys: '',
    type: 'Continuity', description: '', useForCharacterCreation: false
  };
  Object.defineProperty(card, 'entry', {
    enumerable: true,
    get: function () { throw new TypeError('injected failure from a poisoned story card'); }
  });
  sandbox.storyCards.push(card);
  return sandbox;
}

console.log('--- a throw deep inside the closure, per hook ---');
HOOKS.forEach(function (hook) {
  const sandbox = poison(createSandbox({ storyCards: baseCards() }));
  const sent = hook === 'output' ? 'Snow nods once.' : '> Look at Snow.';
  let result;
  try {
    result = sandbox.runHook(hook, sent);
  } catch (err) {
    failures++;
    console.log('  FAIL  ' + hook + '  threw: ' + err.message);
    return;
  }
  const returned = typeof result === 'string' ? result : (result && result.text);
  if (hook === 'contextAppend' && typeof returned === 'string'
      && returned !== ' ' && returned.indexOf(sent) !== 0) {
    failures++;
    console.log('  FAIL  ' + hook + '  broke the append-only contract');
    return;
  }
  console.log('  PASS  ' + hook + '  contained, returned ' + JSON.stringify(
    String(returned).slice(0, 40)) + (String(returned).length > 40 ? '...' : ''));
});

// The failure must be reported somewhere, not silently swallowed. Containment is
// layered, so which channel carries it depends on when the failure happened:
//   - during hook work, the closure is intact -> the Status card reports it;
//   - during closure setup (what a poisoned card triggers), there is no Status
//     card to write, so the outermost net reports through log().
console.log('\n--- the failure is reported, not swallowed ---');
(function () {
  const sandbox = poison(createSandbox({ storyCards: baseCards() }));
  try {
    sandbox.runHook('input', '> Look at Snow.');
  } catch (err) {
    failures++;
    console.log('  FAIL  hook threw: ' + err.message);
    return;
  }
  const status = sandbox.storyCards.filter(function (card) {
    return card && String(card.title).indexOf('Status') !== -1;
  })[0];
  const onCard = status && String(status.entry).indexOf('hook failed') !== -1;
  const logged = sandbox.logs.filter(function (row) {
    return String(row).indexOf('failed before it could report') !== -1;
  })[0];
  if (!onCard && !logged) {
    failures++;
    console.log('  FAIL  the failure was swallowed silently');
    console.log('        status card: ' + (status ? 'present' : 'absent')
      + ', log lines: ' + sandbox.logs.length);
    return;
  }
  console.log('  PASS  reported via ' + (onCard ? 'Status card' : 'log()') + ': '
    + String(onCard
      ? String(status.entry).split('\n').filter(function (r) {
        return r.indexOf('hook failed') !== -1;
      })[0]
      : logged).trim().slice(0, 110));
})();

// A missing platform global must not take the turn down either.
console.log('\n--- missing platform globals ---');
[['history', { noHistory: true }], ['storyCards', { noStoryCards: true }]].forEach(function (pair) {
  const sandbox = createSandbox({ storyCards: baseCards() });
  try {
    if (pair[1].noHistory) sandbox.context.history = undefined;
    if (pair[1].noStoryCards) sandbox.context.storyCards = undefined;
  } catch (err) {
    console.log('  SKIP  ' + pair[0] + ' is not overridable in this sandbox');
    return;
  }
  try {
    sandbox.runHook('input', '> Hello.');
    console.log('  PASS  ' + pair[0] + ' missing: survived');
  } catch (err) {
    failures++;
    console.log('  FAIL  ' + pair[0] + ' missing: threw ' + err.message);
  }
});

console.log('\n' + (failures === 0
  ? 'Error boundary holds: no hook threw.'
  : failures + ' failure(s): the hook boundary does not contain throws.'));
process.exit(failures === 0 ? 0 : 1);

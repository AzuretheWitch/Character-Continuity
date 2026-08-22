'use strict';
/*
 * probe-known-crash.js - live reproduction of the one input that kills every hook.
 *
 * Static finding "lines 1500-2910#1" (Library:1693, CONFIRMED) predicted that
 * `{{Player.constructor}}` throws an uncaught TypeError. This executes it.
 *
 *   node probe-known-crash.js
 *
 * Exits 1 while the crash reproduces, 0 once it is fixed - so it doubles as the
 * regression test for any patch to resolvePlayerTokens.
 */
const { createSandbox } = require('./aid-sandbox');

function withOuter(physical) {
  return createSandbox({
    storyCards: [
      { title: "Player's Identity", entry: 'Name: Azure\nPronouns: she/her', type: 'Continuity' },
      {
        title: "Snow's Outer",
        type: 'Continuity',
        entry: ['{', "Snow's Outer:",
          'Name, age, gender, pronouns: Snow, 31, woman, she/her',
          'Race/Species: human',
          'Physical attributes: ' + physical,
          'Clothing style: dark layers',
          'Starting status: Main', '}'].join('\n')
      },
      {
        title: "Snow's Inner",
        type: 'Continuity',
        entry: ['{', "Snow's Inner:", 'Personality: calm', 'Mannerisms: still',
          'Wants: peace', 'Fears: loss', 'Mental wounds: old',
          'Principles: consent', '}'].join('\n')
      }
    ]
  });
}

let crashes = 0;

// --- 1. exactly which token forms are dangerous ----------------------------
console.log('token forms in an NPC Outer card:');
[
  '{{Player.constructor}}',
  '{{player.constructor}}',
  '{{PLAYER.constructor}}',
  '{{Player.toString}}',
  '{{Player.valueOf}}',
  '{{Player.hasOwnProperty}}',
  '{{Player.__proto__}}',
  '{{Player.name}}'
].forEach(function (tok) {
  const sb = withOuter('tall, with ' + tok + ' hair');
  try {
    sb.runHook('input', '> Hello Snow.');
    console.log('  survives  ' + tok);
  } catch (err) {
    crashes++;
    console.log('  THROWS    ' + tok + '  :: ' + err.message);
  }
});

// Only `constructor` is dangerous because keyOf() lowercases the field name:
// `toString`/`valueOf`/`hasOwnProperty` become `tostring`/`valueof`/
// `hasownproperty`, which are NOT on Object.prototype, so the lookup is
// undefined and the token is left alone. `constructor` is already lowercase.
// And only the `Player.` casing throws: that branch is the one calling
// .charAt() on the resolved value (Library:1693).

// --- 2. blast radius -------------------------------------------------------
console.log('\nhooks killed by a single poisoned Outer card:');
['input', 'context', 'contextAppend', 'output'].forEach(function (hook) {
  const sb = withOuter('tall, with {{Player.constructor}} hair');
  try {
    sb.runHook(hook, 'some text');
    console.log('  ' + hook.padEnd(14) + ' survives');
  } catch (err) {
    crashes++;
    console.log('  ' + hook.padEnd(14) + ' THROWS  ' + err.message);
  }
});

// --- 3. which cards are a delivery vector ----------------------------------
console.log('\ndelivery vectors:');
const vectors = [
  ['NPC Outer card', function () { return withOuter('tall, {{Player.constructor}}'); }],
  ['NPC Inner card', function () {
    const sb = withOuter('tall');
    sb.storyCards.find((c) => c.title === "Snow's Inner").entry =
      ['{', "Snow's Inner:", 'Personality: {{Player.constructor}}', 'Mannerisms: still',
        'Wants: peace', 'Fears: loss', 'Mental wounds: old', 'Principles: consent', '}'].join('\n');
    return sb;
  }],
  ["Player's Identity card", function () {
    return createSandbox({
      storyCards: [{ title: "Player's Identity", entry: 'Name: {{Player.constructor}}\nPronouns: she/her', type: 'Continuity' }]
    });
  }],
  ['an unrelated story card', function () {
    return createSandbox({
      storyCards: [
        { title: "Player's Identity", entry: 'Name: Azure\nPronouns: she/her', type: 'Continuity' },
        { title: 'A Signpost', keys: 'sign', entry: 'It reads {{Player.constructor}}.', type: 'Continuity' }
      ]
    });
  }],
  ['player input text', function () {
    const sb = withOuter('tall');
    sb._poisonInput = true;
    return sb;
  }]
];
vectors.forEach(function (pair) {
  const sb = pair[1]();
  try {
    sb.runHook('input', sb._poisonInput ? '> You say {{Player.constructor}}.' : '> Hello.');
    console.log('  safe      ' + pair[0]);
  } catch (err) {
    crashes++;
    console.log('  CRASHES   ' + pair[0] + '  :: ' + err.message);
  }
});

console.log('\n' + crashes + ' crash reproductions. ' +
  (crashes ? 'Library:1693 is live - every hook dies and the adventure cannot advance ' +
    'until a human edits the card.' : 'No crash: the defect appears to be fixed.'));
process.exitCode = crashes ? 1 : 0;

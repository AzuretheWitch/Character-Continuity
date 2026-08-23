'use strict';
/*
 * probe-relationship-polarity.js - derived Relationship destinations must respect
 * negation.
 *
 * relationshipDerivedDestinationForRecord decides Trust/Distrust, Close/Distant and
 * Clear/Conflict with bare keyword scans over narrative prose. The negative side is
 * a DISJOINT word list, so a sentence that expresses loss using the positive word
 * itself -- "she no longer trusts him" -- scored positive-only and wrote the exact
 * opposite of what the story said, into persistent state.
 *
 * This mirrors the logic in Library so the polarity rules can be checked directly.
 * Keep it in step with relationshipDerivedDestinationForRecord.
 *
 *   node probe-relationship-polarity.js
 */
function keyOf(v) {
  return String(v).toLowerCase().normalize('NFKD')
    .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

const negationCue = "(?:no longer|never|not|cannot|can t|could not|couldn t|"
  + "does not|doesn t|did not|didn t|do not|don t|stopped|refused|refuses|"
  + "without|lost|losing|lack|lacks|lacked|failed to|far from|less)";

const trustGain = /\b(?:trust\w*|reliab\w*|dependab\w*|can rely|could rely|kept (?:a|the|his|her|their) promise)\b/;
const trustLoss = /\b(?:distrust\w*|dishonest\w*|unreliab\w*|cannot rely|can t rely|could not rely|deceiv\w*|lied|lying|broken promise)\b/;

function decide(text) {
  const source = keyOf(text);
  let negationPresent = false;
  const affirmed = source.replace(
    new RegExp("\\b" + negationCue + "\\b(?:\\s+\\S+){0,3}", "g"),
    () => { negationPresent = true; return " "; }
  );
  const affirms = p => p.test(affirmed);
  const negates = p => negationPresent && p.test(source) && !p.test(affirmed);
  const negative = trustLoss.test(source) || negates(trustGain);
  const positive = affirms(trustGain);
  if (positive === negative) return '(none)';
  return positive ? 'Trust' : 'Distrust';
}

const cases = [
  ['She no longer trusts him.', 'Distrust'],
  ['She never trusted him.', 'Distrust'],
  ['She could not rely on him.', 'Distrust'],
  ['She stopped trusting him after the theft.', 'Distrust'],
  ['She does not trust him.', 'Distrust'],
  ['He cannot be trusted.', 'Distrust'],
  ['She trusts him completely.', 'Trust'],
  ['He kept the promise and she trusts him again.', 'Trust'],
  ['She lied to him.', 'Distrust'],
  ['He is dependable.', 'Trust'],
  ['He proved reliable through the whole crossing.', 'Trust'],
];

let bad = 0;
cases.forEach(([text, want]) => {
  const got = decide(text);
  if (got !== want) bad++;
  console.log((got === want ? 'PASS' : 'FAIL') + '  ' + JSON.stringify(text)
    + '  -> ' + got + (got === want ? '' : '   (want ' + want + ')'));
});
console.log('\n' + (bad === 0 ? 'all cases correct' : bad + ' incorrect'));

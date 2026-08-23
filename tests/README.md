# Character-Continuity execution harness

Runs the **real** `CharacterContinuity` function from
the `Library` file one directory up
(20,305 lines, one giant closure) inside a Node `vm` context that supplies the
AI Dungeon free globals.

**The Library is never written to.** The Library is read once
with `fs.readFileSync`.

Requires Node 18+ (developed on v24). No dependencies, no install step.

---

## Quick start

```sh
cd <this directory>
node verify.js                              # smoke + CCO + adversarial probes
node run-scenario.js scenarios/smoke.json   # a single scenario
node probe-adversarial.js                   # hostile-input probes
```

---

## Files

| File | Purpose |
| --- | --- |
| `aid-sandbox.js` | The platform emulator. Exports `createSandbox(opts)`. |
| `run-scenario.js` | Scenario driver. Takes a scenario JSON path as argv. |
| `probe-adversarial.js` | Programmatic edge-case probes (hostile text, corrupt state, card squatting…). |
| `probe-known-crash.js` | Live reproduction of `Library:1693`. Exits 1 while the crash lives, 0 once patched. |
| `verify.js` | Runs everything and prints a pass/fail summary. |
| `scenarios/smoke.json` | 8 turns: player identity, full NPC onboarding, activation, play. |
| `scenarios/cco.json` | 17 turns: the above plus every CCO record form, valid and malformed. |
| `scenarios/long.json` | 68 turns, for state-growth and performance work. |

---

## Driving your own scenario

```sh
node run-scenario.js path/to/your-scenario.json
node run-scenario.js path/to/your-scenario.json --cards        # print full card entries
node run-scenario.js path/to/your-scenario.json --context      # print what CC appends each turn
node run-scenario.js path/to/your-scenario.json --json out.json  # machine-readable report
node run-scenario.js path/to/your-scenario.json --quiet
```

Exit code is `0` only when no hook threw and all hooks ran.

### Scenario format

```jsonc
{
  "name": "human label",
  "contextHook": "contextAppend",   // or "context"; default "contextAppend"
  "memory": "text placed at the top of the platform context",
  "info": { "maxChars": 12000 },    // merged into the info global
  "startActionCount": 0,
  "libraryPath": "…/Library",       // optional override
  "dedupeKeys": true,               // emulate AID rejecting duplicate card keys

  // story cards present before turn 1, as a creator would author them
  "cards": [
    { "title": "Player's Identity", "entry": "Name: Azure\nPronouns: she/her", "type": "Continuity" }
  ],

  "turns": [
    {
      "label": "shown in the run log",
      "playerInput": "> You open the door.",
      "modelOutput": "The room is warm.",
      "actionType": "do",           // history entry type; default "do"
      "memory": "per-turn memory override",

      // Human card edits applied BEFORE this turn's hooks run — this is how you
      // simulate someone editing a card in the AID UI between turns.
      "cards": [
        { "title": "CC — Active NPCs", "entry": "{\nActive NPC slots:\nN1: Mira Vale\nN2: \nN3: \nN4: \nN5: \n}" }
      ],

      // Optional: prepend a CCO record to this turn's model output.
      // %E% / %E1% / %E2% are substituted with the evidence IDs CC actually
      // asked for in THIS turn's context, so the record validates.
      "cco": "(CCO|V|P|%E%|Likes|M|She shared what she had.)"
    }
  ]
}
```

A card edit matches an existing card by `title` (or `matchKeys`), otherwise it
creates one. `{ "title": "X", "remove": true }` deletes a card.

### What the driver does per turn

Exactly the platform order, with `state` re-serialised between every hook:

1. apply the turn's card edits, set `info.actionCount`
2. `CharacterContinuity("input", playerInput)` → push result onto `history`
3. `JSON.parse(JSON.stringify(state))`
4. assemble the platform context (memory + last 20 history entries)
5. `CharacterContinuity("contextAppend", context)`
   — **asserts the result starts with the original context verbatim**, the
   prompt-cache contract; a violation is reported, not thrown
6. `JSON.parse(JSON.stringify(state))`
7. `CharacterContinuity("output", modelOutput)` → push result onto `history`
8. `JSON.parse(JSON.stringify(state))`
9. snapshot card titles, card count, state byte size

The run log flags `ASK[E12,E11]` when CC requested an assessment that turn and
`CCO sent` when the fake model answered, including whether the record leaked
into visible prose.

---

## Using the sandbox directly

For anything the scenario format cannot express:

```js
const { createSandbox } = require('./aid-sandbox');

const sb = createSandbox({
  storyCards: [{ title: "Player's Identity", entry: 'Name: Azure\nPronouns: she/her', type: 'Continuity' }],
  info: { maxChars: 12000 }
});

sb.runHook('input', '> You open the door.');
sb.persistState();                       // JSON round-trip, returns a loss report
sb.runHook('contextAppend', 'ctx\n');
sb.persistState();
sb.runHook('output', 'The room is warm.');
sb.persistState();

sb.storyCards;        // live card array, same identity the script holds
sb.sandbox.state;     // live state
sb.logs;              // captured log() output
```

`persistState()` returns `{ ok, bytes, lost, error }`. `lost` lists every state
path that did not survive JSON (functions, `undefined`, `Map`/`Set`, `NaN`).

### Platform emulation notes

- `storyCards` array identity never changes — the script captures it once per call.
- `addStoryCard(keys, entry, type)` pushes `{id, title:"", keys, entry, type, description}`
  and returns `false` on a duplicate `keys`, matching AID. Script-created cards get an
  **empty** title; CC sets `.title` itself afterwards.
- `removeStoryCard(index)` and `updateStoryCard(index, keys, entry, type)` **throw**
  on an out-of-range index, as AID does. CC catches these.
- `info` supplies `actionCount` and `maxChars`. `maxChars` drives CC's append-capacity
  maths; set it realistically or CC will withhold its packet.

---

## Observed baseline (for regression comparison)

From `node verify.js` against Library v2.01:

- `scenarios/smoke.json` — 8 turns, 24 hook calls, 0 throws, 0 cache violations,
  0 state-JSON losses. Final: 12 cards, 44,256 B state.
- `scenarios/cco.json` — 17 turns, 51 hook calls, 0 throws. All five CCO record
  forms (`K`,`S`,`N`,`R`,`V`) plus malformed, bogus-evidence and pipe-injection
  records processed; none leaked into visible prose.
- `probe-adversarial.js` — 18 probes, 0 throws.
- `probe-known-crash.js` — reproduces `Library:1693` seven ways; exits 1 by design.
- Runs are byte-for-byte deterministic, and identical with and without the JSON
  round-trip.

### Behaviours worth knowing before you write a scenario

- **Turn 1's model output is deliberately suppressed** (the documented hidden
  first automatic response). Do not read that as a bug.
- **Context injection only begins once an NPC is activated** — roster slot filled,
  then Outer/Inner completed, then `Ready: Yes`. Before that CC appends 0 chars.
- **An output that does not end in terminal punctuation is replaced by `" "`**
  (`Library:19105` → `19145`). Any scenario turn whose `modelOutput` ends in a
  comma, a dash, or mid-word will show as a blank turn.
- **A story card whose `keys` field is `__CC_STABLE_CARD__:CC — Settings` is
  adopted as CC's real Settings card**, regardless of its visible title. If it
  carries `Enabled: false` before CC has bootstrapped, CC creates no cards at all,
  writes no Status card, and leaves `state` at `{}` — silently.

---

## Reproduced defect: `{{Player.constructor}}` bricks the adventure

`node probe-known-crash.js`

`resolvePlayerTokens` (`Library:1673`) looks the token field up on an object
literal, so `forms["constructor"]` returns `Object` rather than `undefined`,
passes the `=== undefined` guard at `Library:1690`, and reaches
`replacement.charAt(0)` at `Library:1693`:

```
TypeError: replacement.charAt is not a function
    at Library:1693:64
    at resolvePlayerTokens (Library:1689:26)
    at buildOuterProfile (Library:1751:22)
    at discoverCharacters (Library:2973:28)
```

Live findings the static pass did not have:

- **Exactly one token is exploitable.** `keyOf()` lowercases the field name, so
  `toString` / `valueOf` / `hasOwnProperty` / `__proto__` become
  `tostring` / `valueof` / `hasownproperty` / `__proto__` — none of which resolve
  on `Object.prototype` — and are left alone. `constructor` is the only
  `Object.prototype` member that is already lowercase.
- **Only the `{{Player.…}}` casing throws.** `{{player.…}}` and `{{PLAYER.…}}`
  take branches that never call `.charAt()`.
- **All four hooks die**, not just one: the throw is inside `discoverCharacters`,
  which every hook runs before dispatch. The `contextAppend` cache guard is never
  reached.
- **Only an NPC `Outer` or `Inner` card is a vector.** `Player's Identity`, an
  unrelated story card, and player input text are all safe — `resolvePlayerTokens`
  has only two callers (`Library:1751`, `Library:1800`).

Because AI Dungeon wraps hooks in no try/catch, every turn fails until a human
edits the card. There is no in-story recovery.

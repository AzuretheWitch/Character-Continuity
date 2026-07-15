# Character Continuity v5.0 Open Beta

## Simple Creator Guide

Character Continuity helps an AI portray recurring NPCs consistently while still allowing them to react, change, remember important events, and develop relationships over a long adventure.

This is an open beta. It has automated coverage but still needs testing in real adventures, models, and creator setups. Use it first in a test scenario or a copy of an adventure you can afford to troubleshoot. Back up important cards before installing or updating it.

> **Compatibility:** Character Continuity requires the Context modifier. It does not work with cached models or optimized context. Turn those features off before testing it.

## Quick setup

1. Add the Character Continuity v5.0 script as a Library.
2. Connect it to the Input, Context, and Output modifiers once each.
3. Create one `CC CORE: Full Name` Story Card for every NPC you want the script to manage.
4. Optionally create a `CC PLAYER` card and the extra creator cards described below.
5. Start the adventure. The script creates its configuration, status, State, continuity, relationship, memory, and Turning Point cards automatically.
6. Open `Configure Character Continuity` and choose the mode and limits you want.

Do not copy the full Library into all three modifiers. If your scenario package already connects the Library to the modifiers, do not add a second set of calls.

The project's official repository provides the current beta, dated release history, known limitations, and reporting instructions.

### Modifier calls

If you need to connect the Library manually, use one wrapper in each modifier.

Input modifier:

```js
const modifier = (text) => ({
  text: CharacterContinuity("input", text)
});
modifier(text);
```

Context modifier:

```js
const modifier = (text) => ({
  text: CharacterContinuity("context", text)
});
modifier(text);
```

Output modifier:

```js
const modifier = (text) => ({
  text: CharacterContinuity("output", text)
});
modifier(text);
```

## Registering an NPC

Create a Story Card whose title is exactly:

```text
CC CORE: Full Name
```

Example:

```text
Aliases: Nickname, formal title
Pronouns: she/her
Identity: A concise physical or social identity.
Core: The character's stable nature and defining principles.
Personality: A few durable personality traits.
Relational disposition: How she generally approaches trust, affection, intimacy, commitment, and conflict.
Protected traits: Qualities that ordinary story events should not casually erase.
```

Only the correctly titled Core card is required. The fields above are recommended, not mandatory. Keep them concise and describe durable characterization rather than the current scene.

Use `Enabled: false` inside an NPC's Core card if you temporarily want that NPC ignored.

Leave ordinary Story Card trigger keys blank for CC cards. The script discovers them by title and selects relevant information itself.

## Player identity

The optional `CC PLAYER` card helps the script protect player control and use the correct grammar.

```text
Name: Azure
Pronouns: she/her/her/hers/herself
```

Common two-part pronouns such as `she/her`, `he/him`, and `they/them` are expanded automatically. Five forms are useful for custom pronouns.

Creator cards can use placeholders such as `{{player.name}}`, `{{player.subject}}`, `{{player.object}}`, `{{player.possessive_adjective}}`, `{{player.possessive_pronoun}}`, and `{{player.reflexive}}`.

## Optional creator cards

These cards use the same exact NPC name as the Core card:

- `CC VOICE: Full Name` — speech style, vocabulary, rhythm, and mannerisms.
- `CC MOTIVES: Full Name` — durable needs, priorities, fears, and ambitions.
- `CC BOUNDARIES: Full Name` — creator-defined limits, consent rules, and relationship boundaries.

Write these as ordinary creator guidance. The script selects one relevant anchor when context space permits.

## Choosing a mode

| Mode | What it does | Suggested output length |
|---|---|---:|
| `story-first` | Uses Core and existing continuity for portrayal but never asks the model to generate temporary State. | 100+ tokens |
| `balanced` | Requests a State opportunity only when the newest generated story contains a likely reaction, decision, goal, or tension cue for the focused NPC. | 130+ tokens |
| `full-package` | Makes every feature available and offers a State opportunity on every eligible generation. | 150+ tokens |

`story-first` is the safest starting point. Try `balanced` when you want temporary reactions without asking for them constantly. Use `full-package` when continuity matters more than minimizing output overhead.

Balanced mode uses a conservative text cue rather than full semantic understanding. It may occasionally miss unusually phrased reactions or offer an unnecessary update. An offered update is optional; no change is stored unless the completed story supports it.

## Configuration card

The script creates `Configure Character Continuity`. Edit values after the colon and keep the labels intact.

| Setting | Meaning |
|---|---|
| `Enabled` | `false` completely disables injection and updates while preserving existing cards. |
| `Mode` | `story-first`, `balanced`, or `full-package`. |
| `Context ceiling` | Maximum estimated tokens the continuity packet, update task, and reserve may use. Default: `1400`. |
| `State lifetime` | Visible generations before temporary State expires. Default: `3`. Continue generations count toward this lifetime. |
| `Durable review interval` | Genuine post-grace player inputs between durable reviews. Default: `3`. Continue does not advance it. |
| `Low-output behavior` | Chooses what happens when the detected output allowance is below the mode recommendation. |
| `Turning Points` | `growth-only`, `all-directions`, or `disabled`. |
| `Maximum active NPCs` | Maximum registered NPCs included in one generation. Default: `2`. |
| `Debug` | Creates an additional diagnostics card when `true`. |

Low-output choices:

- `protect-story` defers temporary State so the model has more room for prose.
- `prefer-state` requests State despite the smaller output allowance.
- `warn-only` requests State and adds a warning to the status card.

The context ceiling controls Character Continuity's own injection, not the model's total context window. If NPC identities do not fit, increase the ceiling. If the script feels too expensive, lower it and let optional memories and supporting details be omitted first.

## Temporary State and durable continuity

Temporary State records an NPC's current feeling, thought, goal, or tension. A valid update begins influencing the following response, never the response already being generated. State expires automatically, and an explicit time jump clears old State before a new post-jump State can apply.

Durable continuity is for lasting personal stances, relationship changes, important memories, and major Turning Points. Reviews occur at the configured interval. The generated story must directly support a durable change; player input alone is not evidence. It is normal for a review to finish without storing anything.

The script may briefly ask the model for a final `CC5` record. The Output modifier removes valid or malformed task records before story prose enters history. Creators and players should not type CC5 records themselves.

## Managed cards

The script creates and maintains:

- `CC STATE: Name` — temporary working State.
- `CC CONTINUITY: Name` — durable personal continuity.
- `CC RELATIONSHIPS: Name` — durable directional relationships.
- `CC MEMORY ARCHIVE: Name` — significant memories.
- `CC TURNING POINTS: Name` — major development.
- `Character Continuity Status` — compact runtime information.
- `Character Continuity Debug` — optional diagnostics.

Manual edits to managed cards are supported. Keep field labels and complete relationship or Turning Point blocks intact. Clearing a field intentionally clears the stored value. Avoid renaming managed cards.

The first automatic model output is suppressed. The first genuine player action receives a prose-only startup generation before durable reviews begin.

## Troubleshooting

**No configuration, status, or managed cards appear:** Check that the Library is connected to all three modifiers and that at least one card is titled exactly `CC CORE: Name`.

**An NPC is not active:** Mention the NPC's name or a listed alias in the current input or recent story. Check `Maximum active NPCs` and the Core card's `Enabled` field.

**Balanced mode does not request State:** The newest generated story may not contain a recognized reaction cue, the focused NPC may not be named, or `protect-story` may be deferring State because the output allowance is low.

**State feels stale:** Wait for its configured lifetime, use a clear time jump, or manually clear the relevant field in `CC STATE: Name`.

**A CC5 line becomes visible in the story:** Treat that as a beta bug. Save the generated output and the Status card before retrying.

**A later output is blank:** Check the Status card. The script may have rejected a protocol-only or incomplete response and requested prose recovery.

## Short open-beta test tracks

You do not need to run every test. Choose one track and play normally for about 10–20 visible generations.

### Track A: Story-first stability

Use `story-first` with a 100-token or larger output allowance. Watch whether every active NPC remains distinct, story prose survives intact, Retry works normally, and no CC5 line becomes visible.

### Track B: Temporary reactions

Use `balanced` with 130+ output tokens or `full-package` with 150+. Create an emotionally meaningful scene, continue for several generations, and check whether temporary State appears, influences later portrayal, and expires instead of becoming permanent.

### Track C: Long-term change

Play through at least one lasting decision, relationship change, or important discovery. Check whether a durable review stores only story-supported changes. If possible, include a clear time jump and confirm that old temporary State is cleared while durable continuity survives.

## Reporting beta issues

Include as much of the following as you are comfortable sharing:

- Character Continuity version.
- Model and output-token setting.
- Selected mode and low-output behavior.
- Whether the generation was a normal action, Retry, or Continue.
- Whether a time jump occurred.
- The unexpected output, with private story details redacted if needed.
- `Character Continuity Status` and, if enabled, `Character Continuity Debug`.
- The relevant managed card before and after the problem.

Copyable report template:

```text
Version:
Model and output tokens:
Mode / low-output behavior:
Normal action, Retry, or Continue:
What I expected:
What happened:
Time jump involved: Yes / No
Visible CC5 text: Yes / No
Story prose lost: Yes / No
Status card:
Relevant managed card before/after:
Other notes:
```

Private story text is not required. Redacted excerpts plus the Status card are usually more useful than an entire adventure transcript.

The most important beta failures to report are lost story prose, visible CC5 records, an update assigned to the wrong NPC, temporary events becoming durable, State surviving an obvious time jump, or creator card edits being overwritten unexpectedly.

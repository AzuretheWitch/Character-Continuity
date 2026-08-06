# Character Continuity Creator and Player Guide

[Introduction](README.md) · [Installation](INSTALLATION.md) · [Configuration](CONFIGURATION.md)

Character Continuity is designed to run during normal play without chat commands. Creators define stable foundations and optional starting continuity; players act naturally in the story; CC selects, validates, and saves narrow continuity changes when the generated evidence supports them.

The current package is **Character Continuity Stable v1.0.80 Cache-Compatible Beta 7**. The maintained release is cache-compatible only: install the canonical files named `Library`, `Input`, `Context`, and `Output`. The Context connector must begin with `// @cache-compatible` and use `CharacterContinuity("contextAppend", text)`. Legacy non-cache Context installations are no longer supported.

## Before you begin

Two expectations prevent most confusion:

1. **An onboarding pack is a set of forms, not AI-completed character creation.** CC creates the six cards and their field titles. A creator or player completes Outer and Inner, may add optional baselines, and explicitly approves activation.
2. **A State card does not need to fill immediately.** CC creates it only after activation and fills it only when an eligible turn produces a valid, evidence-grounded State operation.

Do not manually write State or raw `(CCO|...)` control records.

## Who edits what?

| Action | Creator | Player |
| --- | --- | --- |
| Define starting NPC foundations | Yes | In an Adventure they control |
| Set the Player identity | Often, with a Scenario default or placeholder | Yes, when Adventure editing is available |
| Change CC settings | Yes | Yes |
| Add or reconnect an NPC through the roster | Yes | Yes |
| Complete an onboarding pack | Yes | Yes |
| Deliberately revise Outer or Inner | Yes | Yes, for their own Adventure |
| Author an optional Turning Point tracker and its five stage cards | Yes | Yes, for their own Adventure |
| Manually write State or hidden CCO records | No | No |
| Let Names, Relationships, Views, Experiences, and Turning Point routing evolve after activation | CC | CC |

Outer and Inner are the creator-owned foundation. State is managed by CC. Names, Relationships, Views, and Experiences can begin with creator-authored baselines, then become managed continuity during play. Turning Points are optional creator-authored arcs: the creator owns each definition and all five stage-card entries, while CC manages only `Progress`, `Active card`, and `Stage trigger` during play.

## Creator workflow

For a Scenario intended for other players:

1. Follow the complete [installation guide](INSTALLATION.md), including all three exact connectors.
2. Add `Player's Identity`, using a suitable default or placeholder.
3. Decide how each starting NPC will be created:
   - directly author completed Outer and Inner cards in the Scenario, or
   - use onboarding in a private test Adventure.
4. Add any desired starting Names, Views, Relationships, or Experiences.
5. Optionally author each NPC's Turning Point tracker and five matching stage Lore cards. Turning Points are separate from onboarding.
6. Start a fresh test Adventure.
7. Confirm the roster, context budget, Turning Point mode, and version in `CC — Status`.
8. Test at least one supported State update.
9. Test each configured Turning Point's active-stage routing and, when practical, one supported progress update.
10. Test onboarding if players will be allowed to add NPCs.
11. Confirm that no raw `(CCO|...)` record appears in visible story history.

Changes made inside a test Adventure do not rewrite the parent Scenario. If you use onboarding to design an NPC who should exist for every future player, copy or export that NPC's finalized six setup cards back into the Scenario before publishing. Copy any optional Turning Point tracker and stage cards separately; CC does not add them to the onboarding pack.

### Directly authored starting NPCs

Direct authoring is best when the initial cast is already known. Each NPC needs a complete `Name's Outer` card and a complete `Name's Inner` card. Do not include onboarding controls in a finished direct-authored pair, and do not manually create `Name's State`.

Use [the installation guide's templates](INSTALLATION.md#option-a-author-completed-cards-before-play) for the exact minimum format.

## Player workflow

During ordinary play:

- Play normally; CC does not require chat commands.
- Mention or interact with registered NPCs naturally.
- Let CC decide when the text supports a narrow continuity update.
- Use `CC — Status` for a readable summary without enabling full Debug.
- Edit `CC — Settings` when you want a different State lifetime, cast behavior, Relationship pace, Turning Point mode, or context budget.
- Use `CC — Active NPCs` only when you intentionally want to add, remove, or reconnect an NPC.

The Player character remains player-owned. CC does not establish the Player's private thoughts, feelings, consent, commitments, memories, boundaries, or relationship decisions. `Player's Names` can record an alias the Player explicitly supplies or accepts; repeated NPC usage alone cannot establish one.

## Confirmed onboarding

Confirmed onboarding prevents an unfamiliar roster name from becoming active before its creator-owned foundation is ready.

### 1. Request the NPC

Open `CC — Active NPCs` and enter one unfamiliar **canonical name** in an empty slot:

```text
{
Active NPC slots:
N1: Snow
N2:
N3: Mira Vale
N4:
N5:
}
```

Rules:

- Use the NPC's canonical name, not a nickname or title.
- Do not use `Player`, `Self`, or the Player character's name as an NPC.
- Keep each name in only one slot.
- Do not renumber other NPCs to close a gap.

Save the card and continue once.

`N1` through `N5` are stable active-routing slots, not permanent character IDs. A gap is valid and should remain a gap until another NPC is deliberately assigned to it.

### 2. Find the six generated setup cards

For a genuinely new name, CC creates:

| Card | Required content before activation | What to do |
| --- | --- | --- |
| `Mira Vale's Outer` | Every listed character field | Complete it. Keep `Onboarding: Pending` and `Ready: No` while editing. |
| `Mira Vale's Inner` | Every listed character field | Complete it. Keep `Onboarding: Pending` while editing. |
| `Mira Vale's Names` | No alias records required | Add starting aliases, or leave the blank five-field Alias record untouched. |
| `Mira Vale's Views` | No View records required | Add baseline Views, or leave all five category headings empty. |
| `Mira Vale's Relationships` | No Relationship records required | Add baselines, or leave the blank six-field record untouched. |
| `Mira Vale's Experiences` | No Experience records required | Add prior Experiences, or leave the blank About/Experience pair untouched. |

All six cards are validated together. Outer and Inner must be complete. The other four may contain no baseline records, but their wrappers, headings, and blank field titles must remain intact until activation.

CC does **not** create `Mira Vale's State` while onboarding is pending.

All character-owned cards use possessive titles, and wrapped continuity entries use split wrappers. The current build recognizes legacy em-dash titles and combined openings such as `{ Mira Vale's Outer:`, then attempts to migrate both in place. `CC — Debug` reports these results on its `Card title migration` and `Card wrapper migration` lines.

Turning Points are not a seventh onboarding card. If this NPC needs one, activate and verify the six-card pack first, then author the tracker and five stage Lore cards described in [Turning Points](#turning-points).

### 3. Complete Outer

Generated form:

```text
{
Mira Vale's Outer:
Onboarding: Pending
Ready: No
Name, age, gender, pronouns:
Race/Species:
Physical attributes:
Clothing style:
Starting status:
}
```

Completed example:

```text
{
Mira Vale's Outer:
Onboarding: Pending
Ready: No
Name, age, gender, pronouns: Mira Vale, 29, woman, she/her
Race/Species: human
Physical attributes: tall, wiry, brown skin, cropped black curls, amber eyes
Clothing style: weathered travel coat, fitted trousers, and practical boots
Starting status: Side
}
```

Requirements:

- The first identity value must exactly match the canonical roster name.
- The identity line needs name, age, gender, and pronouns.
- `Race/Species`, `Physical attributes`, and `Clothing style` must be filled.
- `Starting status` must be `Main` or `Side`.
- Outer must contain exactly one `Ready` line.
- Keep `Ready: No` until all six cards have been reviewed.

### 4. Complete Inner

Generated form:

```text
{
Mira Vale's Inner:
Onboarding: Pending
Personality:
Mannerisms:
Wants:
Fears:
Mental wounds:
Principles:
}
```

Completed example:

```text
{
Mira Vale's Inner:
Onboarding: Pending
Personality: observant, self-contained, practical, wry, slow to trust
Mannerisms: checks exits on arrival; rolls a coin across her knuckles while thinking
Wants: earn enough freedom to choose where she belongs
Fears: becoming dependent on another controlling group
Mental wounds: years of conditional protection taught her to expect hidden prices
Principles: ask before intervening; repay genuine care; never bargain away another person's agency
}
```

Every listed Inner field must contain a value.

### 5. Optionally add Names

The generated card contains a canonical line and one blank five-field alias record. Keep the canonical line unchanged.

Example:

```text
{
Mira Vale's Names:
Canonical: Mira Vale

Alias: Mira
Status: Active
Use: General
Progress:
Reason: Her accepted first-name form.
}
```

Supported statuses:

- `Emerging`
- `Active`
- `Retired`
- `Rejected`

`Use` can be:

- `General`
- `None`
- `Player`
- the canonical name of a registered NPC

Several specific users may be comma-separated. `General` and `None` must stand alone.

To add another alias, repeat the complete Alias, Status, Use, Progress, and Reason group. If there are no aliases, leave the generated blank group in place:

```text
Alias:
Status:
Use:
Progress:
Reason:
```

### 6. Optionally add Views

Keep all five headings once and in this order. Add each record as `Target — explanation`:

```text
{
Mira Vale's Views:
Loves:
Likes:
Player — appreciates the Player's willingness to explain before acting
Neutrals:
Dislikes:
Hates:
}
```

Each target may appear only once. A target may be:

- `Self`
- `Player`
- a registered NPC's canonical name
- another clearly named, established subject

If there are no baseline Views, leave the five headings empty.

### 7. Optionally add Relationships

One Relationship record contains exactly six fields:

```text
{
Mira Vale's Relationships:
About: Player
Role: Emerging — possible ally
Trust: Guarded — watches whether promises and actions match
Closeness: Acquainted
Boundaries: Implied
Conflict: Clear
}
```

`About` must be the Player or another registered NPC, not Self or an unknown subject.

Supported stage labels:

| Field | Stages |
| --- | --- |
| Role | Emerging, Established |
| Trust | Severe distrust, Distrust, Guarded, Unproven, Cautious trust, Trust, Deep trust |
| Closeness | Disconnected, Distant, Acquainted, Familiar, Close, Deeply close, Intimate |
| Boundaries | Implied, Explicit, Reinforced |
| Conflict | Clear, Friction, Strain, Open conflict, Rupture |

You may provide a stage by itself or add a short explanation after `—`. During activation, CC converts a stage-only baseline to that stage's canonical midpoint score.

To add another Relationship, repeat the complete About, Role, Trust, Closeness, Boundaries, and Conflict group. If there are no baseline Relationships, leave the generated blank six-field group in place.

### 8. Optionally add Experiences

Example:

```text
{
Mira Vale's Experiences:
About: Player
Experience: the Player gave her shelter without demanding anything in return
}
```

About and Experience must either both be filled or both remain blank. Describe a completed event rather than a personality trait. A stored Experience may contain up to 650 characters; CC supplies at most 320 characters from an individual Experience to the model and can safely split a longer imported field at word boundaries.

To add another Experience, repeat the About and Experience pair.

### 9. Activate the pack

After reviewing all six cards, change only this line in Outer:

```text
Ready: No
```

to:

```text
Ready: Yes
```

Then continue once.

CC validates all six cards as one transaction:

- If every card is valid, CC removes the onboarding controls, activates the NPC in the same stable slot, and creates the managed State card.
- If any card is invalid, the whole pack remains pending and no partial activation is committed.

Read `CC — Status` for the first validation problem. If more detail is needed, set `Debug: true`, continue once, and inspect `CC — Debug`.

After correcting an error, leave `Ready: Yes` in place and continue again.

## Reconnecting or removing an NPC

If a roster name already has completed Outer and Inner cards, entering its exact canonical name reconnects that existing identity instead of creating a new onboarding pack.

If the supplied name is an established alias for another NPC, CC rejects it and asks for the canonical identity.

To remove an NPC from the active roster:

1. Clear that NPC's `N#` line.
2. Leave all other slots where they are.
3. Continue once.

Removing a roster name does not delete the NPC's continuity cards. Re-enter the same canonical name later to reconnect them.

## Editing cards after activation

- Edit **Outer** or **Inner** only when deliberately revising the stable character foundation.
- Edit **Player's Identity** when the Player character's name or pronouns need correction.
- Edit **CC — Settings** for runtime behavior.
- Edit **CC — Active NPCs** for onboarding, removal, or reconnection.
- In an optional **Turning Points** tracker, treat `Turning Point`, `ID`, `Direction`, and `Stage cards` as creator-owned definition fields. Let CC manage `Progress`, `Active card`, and `Stage trigger` after setup.
- Let CC manage **State**, **Names**, **Relationships**, **Views**, **Experiences**, and Turning Point routing fields during ordinary play.

If you intentionally edit a managed continuity card, preserve its exact wrapper, headings, complete record groups, and canonical names. Invalid records are preserved for inspection but excluded from model context and automatic updates.

## Turning Points

Turning Points are optional creator-authored arcs for durable character change. They are separate from the six-card onboarding pack: CC neither creates nor fills a Turning Point tracker or its stage cards. Add them only after the NPC has a completed Outer and Inner foundation.

Each Turning Point needs:

1. one seven-field record in `Name's Turning Points`; and
2. five creator-written Lore cards, one for each stage.

### 1. Author the tracker record

Create a Story Card titled exactly `Mira Vale's Turning Points`. A complete starting record can look like this:

```text
{
Mira Vale's Turning Points:
Turning Point: Choosing trust without surrender
ID: choosing_trust
Direction: Growth
Progress: 5 (Dormant) — Mira assumes that every offer of safety carries a hidden price.
Stage cards: Mira Vale's Choosing Trust
Active card: Mira Vale's Choosing Trust — Dormant
Stage trigger: __CC_TP_MIRA_VALE_CHOOSING_TRUST_DORMANT__
}
```

The seven fields must remain in that order:

| Field | Owner and format |
| --- | --- |
| `Turning Point` | Creator-owned display name for the arc. |
| `ID` | Creator-owned stable ID: lowercase letters, numbers, and underscores; begin with a letter or number. Do not change it after play begins. |
| `Direction` | Creator-owned classification: `Growth`, `Decline`, `Mixed`, or `Neutral`. |
| `Progress` | Initial score, matching stage, and a concrete current-baseline description in `score (Stage) — description` form. CC manages this field after setup. |
| `Stage cards` | Creator-owned title prefix shared by all five stage Lore cards. |
| `Active card` | The prefix plus the stage belonging to the current score. CC manages this field after setup. |
| `Stage trigger` | The private key for the current stage. CC manages this field after setup. |

Progress uses these fixed ranges:

| Stage | Score range | Stage-card suffix |
| --- | ---: | --- |
| Dormant | 0–9 | `— Dormant` |
| Emerging | 10–19 | `— Emerging` |
| Near Breakthrough | 20–29 | `— Near Breakthrough` |
| Achieved | 30–39 | `— Achieved` |
| Integrating | 40–49 | `— Integrating` |

The stage name written inside `Progress` must match the score. CC calculates the expected stage, `Active card`, and `Stage trigger`, reports mismatches, and preserves those deterministic values during managed writes. Enter the matching values during setup. After setup, do not manually advance those three managed fields to force a story outcome; change the creator-owned definition or starting baseline only when you intentionally redesign the arc.

To define more than one Turning Point for the same NPC, repeat the complete seven-field group with a distinct stable `ID`. Keep the complete page at or below 1,000 characters; use numbered `Name's Turning Points 2` pages when needed.

### 2. Choose the Direction and mode

`Direction` describes what kind of arc the creator has written. Progress still moves upward through that arc's five stages; `Decline` does not mean subtracting points.

The `Turning Point mode` setting controls which Directions may receive automatic progress operations:

| Mode | Eligible Directions |
| --- | --- |
| `Growth-only` | `Growth` only |
| `All directions` | `Growth`, `Decline`, `Mixed`, and `Neutral` |
| `Disabled` | None; existing routing and stage portrayal remain available. |

`Growth-only` is the default. See [Configuration](CONFIGURATION.md#turning-point-modes) for the full setting behavior.

### 3. Author all five stage Lore cards

Using the sample `Stage cards` prefix, create Lore cards with these exact titles and private trigger keys:

| Story Card title | Trigger/key |
| --- | --- |
| `Mira Vale's Choosing Trust — Dormant` | `__CC_TP_MIRA_VALE_CHOOSING_TRUST_DORMANT__` |
| `Mira Vale's Choosing Trust — Emerging` | `__CC_TP_MIRA_VALE_CHOOSING_TRUST_EMERGING__` |
| `Mira Vale's Choosing Trust — Near Breakthrough` | `__CC_TP_MIRA_VALE_CHOOSING_TRUST_NEAR_BREAKTHROUGH__` |
| `Mira Vale's Choosing Trust — Achieved` | `__CC_TP_MIRA_VALE_CHOOSING_TRUST_ACHIEVED__` |
| `Mira Vale's Choosing Trust — Integrating` | `__CC_TP_MIRA_VALE_CHOOSING_TRUST_INTEGRATING__` |

The private-key formula is:

```text
__CC_TP_<CANONICAL_NPC_NAME>_<STABLE_ID>_<STAGE>__
```

Convert each part to uppercase ASCII words separated by underscores. Punctuation and spaces become separators. For example, owner `Mira Vale`, ID `choosing_trust`, and stage `Near Breakthrough` produce `__CC_TP_MIRA_VALE_CHOOSING_TRUST_NEAR_BREAKTHROUGH__`.

Put the corresponding private key in that Lore card's trigger/key field. Do not replace it with an ordinary scene trigger: CC supplies only the active private key so the platform routes only the current stage card. Each stage card must stay at or below 1,000 characters.

Write each `Entry` as a durable portrayal baseline, not a required action for the next response. Describe what is now established, what remains difficult, and how uneven expression or setbacks can appear without erasing the stage. For example:

```text
{
Mira Vale's Choosing Trust — Emerging:
Entry: Mira has begun to recognize help that carries no hidden bargain. She may accept limited support after checking its terms, though unfamiliar dependence still makes her guarded.
}
```

The Achieved card should include one explicit, definitive `Breakthrough:` line:

```text
{
Mira Vale's Choosing Trust — Achieved:
Entry: Mira can knowingly accept meaningful help without treating reliance as surrender. Fear may still make her verify terms, but accepting care no longer violates her sense of freedom.
Breakthrough: Mira knowingly accepts meaningful help while retaining the freedom to refuse or set its terms.
}
```

CC requires completed story evidence satisfying the breakthrough condition before it can establish Achieved. Keep the condition specific enough to validate but flexible enough to occur through more than one exact scene. If you separate requirements with semicolons, each clause must be supported. Without an explicit `Breakthrough:` field, the build can fall back to the Achieved `Entry`, but the explicit field is recommended because it states the decisive condition unambiguously.

### 4. Understand progress movement

CC can propose only one narrow continuity operation on a turn, and every Turning Point update must pass the same completed-evidence and transaction checks as other managed continuity.

- **Support:** adds 2 progress for completed, durable movement toward the next creator-written stage. It cannot raise progress above 29 or operate after Achieved.
- **Breakthrough:** moves an unachieved Turning Point to 35 when completed evidence satisfies the Achieved stage and every part of its definitive `Breakthrough:` condition.
- **Integration:** adds 2 after Achieved when completed evidence shows that the change is sustained, habitual, or part of ordinary life, up to 49.

CC updates only `Progress`, `Active card`, and `Stage trigger`. It does not rewrite the Turning Point's title, stable ID, Direction, stage-card prefix, or any creator-written stage entry.

### 5. Verify the setup

Start a fresh test Adventure and inspect `CC — Status`. With `Debug: true`, `CC — Debug` also reports Turning Point pages, stage cards, diagnostics, and the last change. Common setup failures are:

- a missing or misspelled stage-card title;
- a stage card without its exact private trigger key;
- a `Progress` score that does not match its stage;
- a changed or duplicated stable `ID`;
- a malformed or reordered seven-field record;
- a tracker page or stage card over its 1,000-character limit; or
- a Direction excluded by the current `Turning Point mode`.

## Understanding State

A managed State card contains temporary fields such as Thought, Feeling, Goal, Tension, Situation, About, and Triggers. State supplies pressure and context for the present moment, not a turn-by-turn checklist. Thought may remain wholly private, Feeling may color perception without being announced, Goal guides intention without requiring immediate action, and Tension can preserve competing impulses. The NPC may express, conceal, pursue, postpone, revise, or release what the State contains.

Its lifecycle is:

1. CC creates the State card when an NPC activates.
2. On an eligible turn, CC gives the model a narrow continuity task.
3. The generated output may include a hidden `(CCO|...)` candidate.
4. The Output connector passes the generated text back through CC.
5. CC validates and saves an accepted candidate to the State card.
6. CC removes the hidden record before returning visible story text.
7. The cache-compatible Context connector can later append a readable private-State projection for the model to use when relevant.

CC keeps raw `Triggers` in the managed State card because they support validation and field derivation. It omits that redundant `Triggers` line from the model-facing State projection; the derived State can influence portrayal without making the model restate or visibly perform every cause. Unused continuity may remain latent on any given turn.

An empty State card therefore does not prove that installation failed: the NPC may not have received a qualifying State operation yet, or the candidate may have failed validation. An empty State card combined with visible raw CCO text usually points to an incorrect connector. If the exact connectors are already installed, preserve the raw output and Debug contents for diagnosis.

### Structured-output fallback handling

Some models express a requested continuity operation through recognizable labels instead of the exact hidden CCO syntax. The current build can normalize a complete, high-confidence fallback form into a candidate and then apply the ordinary evidence, frozen-owner, target, provenance, and transaction checks.

Debug reports these cases as:

- `normalized accepted`
- `normalized unchanged`
- `normalized rejected`
- `malformed stripped`

Partial records, inline candidate fragments, and unsupported structures are stripped without changing saved continuity. If a generated response contains no complete story prose after cleaning, CC requests prose-only recovery.

## Troubleshooting

### State cards stay empty and a `CCO` line appears in the story

Check all three connectors first.

Incorrect:

```js
CharacterContinuity("output");
const modifier = (text) => ({ text });
modifier(text);
```

Correct:

```js
const modifier = (text) => {
  text = CharacterContinuity("output", text);
  return { text };
};

modifier(text);
```

The incorrect form gives CC no output to parse and discards its cleaned return value. CC cannot save the candidate into State, while the raw control record can enter visible story history and later model context.

Input uses the same two-argument, returned-text pattern with `CharacterContinuity("input", text)`. Cache-compatible Context is different: its directive must remain on the first line, and it must use the append-only hook exactly as shown here:

```js
// @cache-compatible
const modifier = (text) => ({
  text: CharacterContinuity("contextAppend", text)
});

modifier(text);
```

Use each connector only in its corresponding script tab, as shown in the [installation guide](INSTALLATION.md#3-install-all-three-connectors).

With the exact connectors installed, the current build strips accepted, rejected, normalized, and malformed candidate forms before returning visible story text. If a raw control record still appears, save the complete generated response and `CC — Debug` contents so the sanitizer path can be reproduced.

### A State block appears in the Context Viewer

This is expected when it looks like:

```text
{
Snow's current private State:
Thought: ...
Feeling: ...
}
```

CC appends relevant current State for the model to use as temporary pressure. It intentionally omits raw `Triggers` from this model-facing projection. A raw line beginning with `(CCO|` in the visible story is not expected.

### Nothing happens

- Confirm Scripts are enabled in both the Scenario and account Gameplay settings.
- Confirm all four script tabs were saved.
- Confirm the full current `Library` file is in the Library script tab only.
- Confirm Input, Context, and Output pass `text` into CC and return CC's result.
- Confirm the Context tab begins with `// @cache-compatible` and calls `CharacterContinuity("contextAppend", text)`.
- Start a fresh Adventure from the saved Scenario.

### The first AI response is blank

One blank automatic response immediately after the Scenario opening is expected. Enter the Player's first real action.

### An onboarding NPC stays pending

- Remember that CC creates blank onboarding forms; it does not invent or fill the character foundation.
- Keep exactly one `Onboarding: Pending` line in Outer and Inner.
- Keep exactly one `Ready: Yes` line in Outer when attempting activation.
- Fill every required Outer and Inner field.
- Keep the optional blank-card structures and their field titles intact.
- Use canonical names in the roster and About fields.
- Remove conflicting duplicate cards.
- Read the onboarding diagnostic in `CC — Status`.

### An NPC is registered but not model-facing

CC activates only scene-relevant roster NPCs. Mention or interact with the NPC, or bring them back into the current scene. Also check:

- the NPC is still present in `CC — Active NPCs`
- `Maximum active NPCs` is high enough
- Outer and Inner are complete
- the NPC is not still onboarding

### A card has an internal-looking trigger

Leave it in place. CC uses managed keys to preserve card identity across script hooks. Turning Point stage cards intentionally use their stage-specific `__CC_TP_...__` keys so only the active creator-written stage is routed. Ordinary scene triggers are not required for CC-managed context injection.

### Relationship development feels too fast or too slow

Change `Relationship pace` to `Slowburn`, `Balanced`, or `Fast`. Use `Custom` only when you want direct control over event values and maximum stage movement. See [Configuration](CONFIGURATION.md#relationship-pace-presets).

### A Turning Point does not advance or route its stage card

- Confirm the record has all seven fields in the exact order shown in [Turning Points](#turning-points).
- Confirm `Progress` uses the correct score/stage pair and includes a current-baseline description.
- Confirm all five stage-card titles use the exact `Stage cards` prefix and suffixes.
- Confirm every stage card contains its exact private trigger/key.
- Confirm `Turning Point mode` permits the record's Direction.
- Remember that Support requires completed durable movement, Breakthrough requires completed evidence satisfying the Achieved condition, and Integration requires sustained change after Achieved.
- Enable Debug and read `Turning Point pages`, `Turning Point stage cards`, `Turning Point diagnostics`, and `Last Turning Point / change`.

### More diagnostics are needed

Change:

```text
Debug: false
```

to:

```text
Debug: true
```

Continue once, inspect `CC — Debug`, and turn Debug off again when finished.

Useful lines include:

- `Error`
- `CCO parse`
- `Last task / owner`
- `Last candidate / update`
- `Operation outcome / drain`
- `Active NPC slots`
- `Card title migration`
- `Card wrapper migration`
- `State clock / lifetime`
- `Turning Points`
- `Turning Point mode`
- `Turning Point pages`
- `Turning Point stage cards`
- `Turning Point diagnostics`
- `Last Turning Point / change`
- `Components`
- `Budget configured / effective / used / headroom`
- `Store session output parses/writes`

# Character Continuity Creator and Player Guide

[Introduction](README.md) · [Installation](INSTALLATION.md) · [Configuration](CONFIGURATION.md)

Character Continuity is designed to run during normal play without chat commands. Creators define stable foundations and optional starting continuity; players act naturally in the story; the model interprets bounded fresh evidence and supplies any narrow continuity change, while CC validates its structure and current managed-card mechanics before saving it.

The current package is **v2.01**. The maintained release is cache-compatible only: install the canonical files named `Library`, `Input`, `Context`, and `Output`. The Context connector must begin with `// @cache-compatible` and use `CharacterContinuity("contextAppend", text)`. Legacy non-cache Context installations are no longer supported.

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
| Let Names, Relationships, Views, Experiences, and Turning Point progress evolve after activation | CC | CC |

Outer and Inner are the creator-owned foundation. State is managed by CC. Names, Relationships, Views, and Experiences can begin with creator-authored baselines, then become managed continuity during play. Turning Points are optional creator-authored arcs: the creator owns each definition, optional definitive `Breakthrough`, and all five stage-card entries, while CC manages only `Progress`, `Active card`, and `Stage trigger` during play.

## Creator workflow

For a Scenario intended for other players:

1. Follow the complete [installation guide](INSTALLATION.md), including all three exact connectors.
2. Add `Player's Identity`, using a suitable default or placeholder.
3. Decide how each starting NPC will be created:
   - directly author completed Outer and Inner cards in the Scenario, or
   - use onboarding in a private test Adventure.
4. Add any desired starting Names, Views, Relationships, or Experiences.
5. Optionally author each NPC's Turning Point tracker and five matching stage Story Cards. Turning Points are separate from onboarding.
6. Start a fresh test Adventure.
7. Confirm the roster, context budget, Turning Point mode, and version in `CC — Status`.
8. Test at least one supported State update.
9. Test each configured Turning Point's active-stage injection and, when practical, one supported progress update.
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
- Play normally while the model assesses the fresh evidence CC supplies and either describes one narrow continuity update or records that continuity is unchanged.
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

Turning Points are not a seventh onboarding card. If this NPC needs one, activate and verify the six-card pack first, then author the tracker and five stage Story Cards described in [Turning Points](#turning-points).

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
- In an optional **Turning Points** tracker, treat `Turning Point`, `ID`, `Direction`, `Stage cards`, and the optional final `Breakthrough` as creator-owned definition fields. Let CC manage `Progress`, `Active card`, and `Stage trigger` after setup.
- Let CC manage **State**, **Names**, **Relationships**, **Views**, **Experiences**, and Turning Point progress fields during ordinary play.

If you intentionally edit a managed continuity card, preserve its exact wrapper, headings, complete record groups, and canonical names. Invalid records are preserved for inspection but excluded from model context and automatic updates.

## Turning Points

Turning Points are optional creator-authored arcs for durable character change. They are separate from the six-card onboarding pack: CC neither creates nor fills a Turning Point tracker or its stage cards. Add them only after the NPC has a completed Outer and Inner foundation.

Each Turning Point needs:

1. one record with seven required fields, plus an optional final `Breakthrough` field, in `Name's Turning Points`; and
2. five creator-written Story Cards, one for each stage.

### 1. Author the tracker record

Create a Story Card titled exactly `Mira Vale's Turning Points`. Leave this router Story Card's own trigger/key blank. CC discovers the router by its exact title; an ordinary scene trigger could cause the platform to expose the private router Entry independently of CC. The `Stage trigger:` line inside the Entry is a managed record field, not an instruction to activate the router itself. CC preserves the router's creator-assigned key and type during progress transactions.

A complete starting record can look like this:

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
Breakthrough: Mira knowingly accepts meaningful help while retaining the freedom to refuse or set its terms.
}
```

The seven required fields must remain in that order. If supplied, `Breakthrough` must be the eighth and final field:

| Field | Owner and format |
| --- | --- |
| `Turning Point` | Creator-owned display name for the arc. |
| `ID` | Creator-owned stable ID: lowercase letters, numbers, and underscores; begin with a letter or number. Do not change it after play begins. |
| `Direction` | Creator-owned classification: `Growth`, `Decline`, `Mixed`, or `Neutral`. |
| `Progress` | Initial score, matching stage, and a concrete current-baseline description in `score (Stage) — description` form. CC manages this field after setup. |
| `Stage cards` | Creator-owned title prefix shared by all five stage Story Cards. |
| `Active card` | The prefix plus the stage belonging to the current score. CC manages this field after setup. |
| `Stage trigger` | The private key for the current stage. CC manages this field after setup. |
| `Breakthrough` | Optional but recommended creator-owned definitive condition for establishing Achieved. CC preserves this field and does not rewrite it. |

Progress uses these fixed ranges:

| Stage | Score range | Stage-card suffix |
| --- | ---: | --- |
| Dormant | 0–9 | `— Dormant` |
| Emerging | 10–19 | `— Emerging` |
| Near Breakthrough | 20–29 | `— Near Breakthrough` |
| Achieved | 30–39 | `— Achieved` |
| Integrating | 40–49 | `— Integrating` |

The stage name written inside `Progress` must match the score. CC calculates the expected stage, `Active card`, and `Stage trigger`, reports mismatches, and preserves those deterministic values during managed writes. Enter the matching values during setup. After setup, do not manually advance those three managed fields to force a story outcome; change the creator-owned definition or starting baseline only when you intentionally redesign the arc.

To define more than one Turning Point for the same NPC, repeat the complete record with a distinct stable `ID`. Keep the complete page at or below 1,000 characters; use numbered `Name's Turning Points 2` pages when needed.

### 2. Choose the Direction and mode

`Direction` describes what kind of arc the creator has written. Progress still moves upward through that arc's five stages; `Decline` does not mean subtracting points.

The `Turning Point mode` setting controls which Directions may receive automatic progress operations:

| Mode | Eligible Directions |
| --- | --- |
| `Growth-only` | `Growth` only |
| `All directions` | `Growth`, `Decline`, `Mixed`, and `Neutral` |
| `Disabled` | None; existing validated current-stage selection and portrayal remain available. |

`Growth-only` is the default. See [Configuration](CONFIGURATION.md#turning-point-modes) for the full setting behavior.

### 3. Author all five stage Story Cards

Using the sample `Stage cards` prefix, create Story Cards with these exact titles and private trigger keys:

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

Use the corresponding private key as that Story Card's only trigger/key, appearing exactly once. Do not replace it with—or add—an ordinary scene trigger, which could let the platform independently activate an old or wrong stage. In v2.01 the private key is a deterministic identity and validation key: CC validates it, then directly supplies the current stage Entry through the Context script instead of injecting the key for native platform routing. Each stage card must have one nonempty Entry and stay at or below 1,000 characters. Its creator-assigned Story Card type is preserved; CC does not require either Lore or Continuity type.

Write each `Entry` as a durable portrayal baseline, not a required action for the next response. Describe what is now established, what remains difficult, and how uneven expression or setbacks can appear without erasing the stage. For example:

```text
{
Mira Vale's Choosing Trust — Emerging:
Entry: Mira has begun to recognize help that carries no hidden bargain. She may accept limited support after checking its terms, though unfamiliar dependence still makes her guarded.
}
```

The recommended definitive `Breakthrough:` condition belongs in the router record, as shown above. For compatibility, an older setup may instead keep that line in the Achieved card:

```text
{
Mira Vale's Choosing Trust — Achieved:
Entry: Mira can knowingly accept meaningful help without treating reliance as surrender. Fear may still make her verify terms, but accepting care no longer violates her sense of freedom.
Breakthrough: Mira knowingly accepts meaningful help while retaining the freedom to refuse or set its terms.
}
```

The model should select `Breakthrough` only when the supplied completed story evidence satisfies the breakthrough condition. Keep the condition specific enough to assess but flexible enough to occur through more than one exact scene. If you separate requirements with semicolons, each clause should be supported.

Condition precedence is deterministic:

1. the router record's final `Breakthrough` field;
2. a `Breakthrough` line in the Achieved stage card; then
3. the Achieved `Entry` as a legacy fallback.

The router field is preferred because it keeps the definitive mechanical condition out of ordinary portrayal context and separate from the current stage baseline. When that movement is mechanically available, the current assessment lists the condition beside the Turning Point ID and `Breakthrough` choice so the model can compare it with the supplied evidence.

### 4. Understand current-stage injection and optimized cache

CC never injects the whole Turning Point router as portrayal context. For every valid current Turning Point belonging to a model-facing NPC, it supplies the exact current stage Entry inside a tagged `TP STAGE` block, or reselects an identical matching block already retained by optimized cache. A compact `CURRENT TP` line identifies the stable development and its current Entry revision. The final assessment can separately list each currently legal stable ID and movement, current Progress, a compact comparison-stage reference, and any definitive condition.

Optimized context is append-only, so a previous stage block may remain physically visible in cached context after progress crosses a boundary. The authority rule in the newest CC portrayal block selects only the matching current handle and revision and supersedes every earlier revision or untagged stage passage for that development. Only the selected current block contributes stage guidance.

`CURRENT TP` and `TP STAGE ... BEGIN/END` are therefore expected internal controls in the Context Viewer. They do not expose the router, progress score, Direction, stable ID, active-card title, or private trigger, and CC strips them if a model echoes them into visible output.

### 5. Understand progress movement

The model can propose only one narrow continuity operation on an assessment turn, and every Turning Point update must pass the same supplied-evidence, current-mechanics, and transaction checks as other managed continuity.

- **Support:** adds 2 progress for completed, durable movement toward the next creator-written stage. It cannot raise progress above 29 or operate after Achieved.
- **Breakthrough:** moves an unachieved Turning Point to 35 when completed evidence satisfies the Achieved stage and every part of its definitive `Breakthrough:` condition.
- **Integration:** adds 2 after Achieved when completed evidence shows that the change is sustained, habitual, or part of ordinary life, up to 49.

The assessment lists the currently available Turning Point IDs, their current `TP-…` portrayal handles, and movements. The model chooses a unique supplied evidence subset in supplied order, the stable ID, `Support`, `Breakthrough`, or `Integration`, and a grounded Explanation, using this shape:

```text
(CCO|T|S|EvidenceIDs|StableID|Movement|Explanation)
```

CC verifies that `S` is the focused owner's Self target and that the selected ID and movement are still available from the current router and stage cards. If the model copies the matching `TP-…` portrayal handle instead of the stable ID, CC resolves that unambiguous handle to the listed stable ID before validation. A longer complete safe Explanation is compacted at a word boundary to 180 characters before storage. The characters `|`, `{`, `}`, `[`, `]`, `(`, `)`, and line breaks are reserved record characters and cannot appear in the Explanation.

CC updates only `Progress`, `Active card`, and `Stage trigger`. It does not rewrite the Turning Point's title, stable ID, Direction, stage-card prefix, optional Breakthrough condition, or any creator-written stage Entry.

Each progress write is transactional. CC verifies the complete router page, title, keys, type, and reparsed target record after writing. If the Story Card API returns a partial or mismatched write, CC rejects the update and attempts to restore the whole prior page rather than leave a partly advanced router.

### 6. Verify the setup

Start a fresh test Adventure and inspect `CC — Status`. With `Debug: true`, `CC — Debug` also reports Turning Point pages, stage cards, diagnostics, and the last change. Common setup failures are:

- a missing, misspelled, or duplicated physical stage-card title;
- a stage card without its exact private trigger key;
- a `Progress` score that does not match its stage;
- a changed or duplicated stable `ID`;
- a malformed or reordered required field, or a `Breakthrough` field placed anywhere except last;
- a tracker page or stage card over its 1,000-character limit; or
- a Direction excluded by the current `Turning Point mode`.

## How hidden assessment records work

CC chooses the focused NPC and supplies at most two fresh raw `E#` rows. JavaScript does not assign those rows to State, Name, Relationship, View, or Turning Point meaning. The final appended block begins `CC CURRENT ASSESSMENT — FINAL RESPONSE SUFFIX` and lists the current target codes, field choices, card mechanics, and available CCO forms.

The model then:

1. interprets the supplied evidence;
2. selects any unique supplied evidence subset in supplied order and completes one available `S`, `N`, `R`, `V`, or `T` record, or completes `K` with the full supplied list when managed continuity stays unchanged; and
3. continues with complete story prose from the next line.

The Output connector removes the CCO line and echoed CC controls before returning the response. It checks record shape, supplied IDs, target codes, legal field values, current managed-card identity and movement, evidence reuse, and transaction safety. It does not rescore the prose to choose a different semantic operation. Players therefore see the scene, not the assessment section.

Optimized context can retain older assessment packets. The newest final assessment suffix is authoritative. An operation may cite a subset of its supplied IDs, but each ID must still be available, unique, and in supplied order. `K` must copy the full supplied list. A record that cites unavailable or reordered IDs is `stale contract stripped`; CC preserves the story, adds no operation drain, and carries the same assessment once. An omitted record or cut-off protocol fragment also preserves usable story and can receive one bounded retry. Malformed and unauthorized records are stripped before story is returned and do not mutate continuity.

The listed CCO forms are the supported assessment interface. CC may normalize harmless presentation wrapping around an otherwise complete record, but it does not infer missing semantic fields from story prose or replace the model's operation choice with a JavaScript-selected one.

## Understanding State

A managed State card contains temporary fields such as Thought, Feeling, Goal, Tension, Situation, About, and Triggers. State supplies pressure and context for the present moment, not a turn-by-turn checklist. Thought may remain wholly private, Feeling may color perception without being announced, Goal guides intention without requiring immediate action, and Tension can preserve competing impulses. The NPC may express, conceal, pursue, postpone, revise, or release what the State contains.

Its lifecycle is:

1. CC creates the State card when an NPC activates.
2. On an eligible focused turn, CC gives the model fresh evidence and the available assessment forms. The model may choose State only for a supported current change or confirmation; mere participation can instead produce `K`.
3. The generated output begins with one completed hidden CCO assessment record and continues with story prose on the next line.
4. The Output connector passes that generated text back through CC.
5. CC validates the State record's structure and current managed-card mechanics and saves an accepted candidate transactionally.
6. CC removes the hidden record before returning visible story text.
7. The cache-compatible Context connector can later append a readable private-State projection for the model to use when relevant.

CC keeps raw `Triggers` in the managed State card because they support validation and field derivation. It omits that redundant `Triggers` line from the model-facing State projection; the derived State can influence portrayal without making the model restate or visibly perform every cause. Unused continuity may remain latent on any given turn.

An empty State card therefore does not prove that installation failed: the model may have selected `K`, omitted the assessment record, selected another continuity type, or returned a State candidate that failed structural or mechanical validation. An empty State card combined with visible raw CCO text usually points to an incorrect connector. If the exact connectors are already installed, preserve the raw output and Debug contents for diagnosis.

State derives Feeling, Goal, and Tension from the model-supplied validated trigger list. Thought is stored only when it is direct first-person private thought and is grounded to the supplied About target. If Thought is unavailable or unsuitable, CC can still commit the trigger-derived fields and Situation, then reports: `Applied trigger-derived State but ignored a Thought that was unavailable or unsuitable for direct storage.` This warning describes graceful partial State handling, not an operation failure.

State stores at most three triggers. When a model returns more than three valid trigger codes, CC deterministically keeps the first three unique codes in supplied order and continues the State transaction. Unknown trigger codes remain malformed rather than being reinterpreted.

### Control-record handling

The current assessment expects one complete available CCO form on the first nonblank line. CC can normalize harmless presentation wrappers around a complete record, then applies the ordinary supplied-evidence, fixed-owner, target, managed-card, provenance, and transaction checks. It does not derive an operation from free-form labels or story prose.

Debug distinguishes accepted and unchanged assessments from `stale contract stripped`, `malformed stripped`, `unauthorized stripped`, `cutoff stripped`, `omitted`, and rejected candidates. Partial records, inline candidate fragments, stale contracts, and unsupported structures are stripped without changing saved continuity. If a generated response contains no complete punctuated story prose after cleaning, CC requests prose-only recovery.

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

With the exact connectors installed, the current build strips accepted, unchanged, stale, rejected, unauthorized, malformed, cut-off, and omitted control material before returning visible story text. If a raw control record still appears, save the complete generated response and `CC — Debug` contents so the sanitizer path can be reproduced.

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

### An assessment record is stripped or a Turning Point stays unchanged

Read `Current task`, `Last action task`, `Last action selection`, `Last action resolution`, and `CCO parse` together. The newest final assessment is the source of truth. For example, an available Turning Point form is:

```text
(CCO|T|S|E22|chosen_not_kept|Breakthrough|Sydney tells the full truth and accepts the free response.)
```

The model chooses `T`, target code `S`, a unique subset of the supplied evidence IDs, one listed stable ID such as `chosen_not_kept`, and one movement currently listed for that ID. Those values must remain in their exact field positions. A matching current `TP-…` portrayal handle is also accepted and normalized to its stable ID. Character names, Turning Point display names, and stage labels such as `Achieved` remain descriptive context rather than movement codes. When several evidence IDs are supplied, an operation may choose one or more while preserving their supplied order; only `K` copies the complete supplied list.

The model supplies `Explanation` as one complete clause using ordinary text without the reserved record characters `|`, `{`, `}`, `[`, `]`, `(`, or `)`. v2.01 safely compacts a longer complete Turning Point explanation to 180 characters at a word boundary.

A record citing unavailable or reordered evidence is reported as `stale contract stripped`, adds no drain, and carries the current assessment once. A structurally broken current record is `malformed stripped`; a well-formed record that uses an unavailable target, field, card identity, movement, reused source, or unsafe write is `rejected`. In every case, CC strips the assessment material and preserves complete punctuated story prose.

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

Leave it in place. CC uses managed keys to preserve card identity across script hooks. Turning Point stage cards intentionally retain their exact stage-specific `__CC_TP_...__` validation key. CC directly injects only the validated current stage Entry, so the private key is not exposed to the model or used to activate the card through native trigger chaining. Ordinary scene triggers are not required for CC-managed context injection.

### Relationship development feels too fast or too slow

Change `Relationship pace` to `Slowburn`, `Balanced`, or `Fast`. Use `Custom` only when you want direct control over event values and maximum stage movement. See [Configuration](CONFIGURATION.md#relationship-pace-presets).

### A Turning Point does not advance or supply its current stage

- Confirm the record has all seven required fields in the exact order shown in [Turning Points](#turning-points), with any optional `Breakthrough` field eighth and last.
- Confirm `Progress` uses the correct score/stage pair and includes a current-baseline description.
- Confirm all five stage-card titles use the exact `Stage cards` prefix and suffixes.
- Confirm each stage-card title resolves to exactly one physical Story Card.
- Confirm every stage card contains its exact private trigger/key.
- Confirm `Turning Point mode` permits the record's Direction.
- Remember that Support requires completed durable movement, Breakthrough requires completed evidence satisfying the Achieved condition, and Integration requires sustained change after Achieved.
- Enable Debug and read `Turning Point pages`, `Turning Point stage cards`, `Turning Point diagnostics`, `Selected Turning Point stages`, `Omitted Turning Point stages`, and `Last Turning Point / change`.
- In the Context Viewer, confirm the newest `CURRENT TP` line has one matching `TP STAGE` block. Older cached revisions can remain physically present but are not authoritative.

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
- `Current pass`
- `Current task / owner`
- `Current selected operation`
- `Current candidate / update`
- `Current operation outcome / drain`
- `Last action task`
- `Last action selection`
- `Last action resolution`
- `Last action mutation / drain`
- `Last action output chars raw/prose/CCO`
- `Pending operation retry`
- `Operation task ceiling`
- `Portrayal packet`
- `Active NPC slots`
- `Card title migration`
- `Card wrapper migration`
- `State clock / lifetime`
- `Turning Points`
- `Turning Point mode`
- `Turning Point pages`
- `Turning Point stage cards`
- `Turning Point diagnostics`
- `Selected Turning Point stages`
- `Omitted Turning Point stages`
- `Last Turning Point / change`
- `Components`
- `Budget configured / effective / used / headroom`
- `Store session output parses/writes`

# Configuring Character Continuity

[Introduction](README.md) · [Installation](INSTALLATION.md) · [Creator and Player Guide](CREATOR-PLAYER-GUIDE.md)

The maintained cache-compatible build of Character Continuity creates `CC — Settings` automatically. Edit the value after a setting's colon, save the card, and continue once for the change to take effect.

This reference describes **v2.02-test-b2**.

Keep every setting on its own line. `true` and `false` are recommended for Boolean options, although common forms such as `yes/no` and `on/off` are also recognized.

## Settings reference

| Setting | Default | Accepted values | What it does |
| --- | ---: | --- | --- |
| `Enabled` | `true` | `true` or `false` | Turns CC processing on or off without removing source or managed continuity cards. When off, CC clears its Front Memory block and removes its derived Model Context cards so their name triggers do not remain active. |
| `Continuity budget` | `2000` | Positive whole number; minimum `1800` | Outer safety allowance for CC's temporary control task and the context capacity available that turn. Portrayal now uses separately capped triggered Model Context cards, so raising this value does not enlarge them. |
| `State lifetime` | `3` | Whole number from `1` to `12` | Sets how many completed AI responses a temporary State field may survive without new evidence refreshing it. |
| `Maximum active NPCs` | `5` | Whole number from `1` to `5` | Limits how many scene-relevant registered NPCs CC may treat as active at once. The roster itself still has five stable slots. |
| `Dynamic cast` | `true` | `true` or `false` | Allows Side NPCs to become Main and inactive Main NPCs to become Side. `false` freezes those statuses. |
| `Side promotion interactions` | `5` | Whole number from `1` to `999` | Sets the qualifying interaction count a Side NPC needs before becoming Main when Dynamic cast is on. |
| `Main inactivity limit` | `12` | Whole number from `1` to `999` | Sets the qualifying absence count before a Main NPC becomes Side when Dynamic cast is on. |
| `Relationship pace` | `Balanced` | `Slowburn`, `Balanced`, `Fast`, or `Custom` | Selects how much Relationship score a supported event can add or remove and how many stages one operation may cross. |
| `Custom accumulated event value` | `2` | Whole number from `0` to `50` | Sets the score for accumulated Relationship evidence when pace is `Custom`. |
| `Custom direct event value` | `10` | Whole number from `0` to `50` | Sets the score for explicit direct Relationship events when pace is `Custom`. |
| `Custom maximum stages per operation` | `1` | Whole number from `1` to `6` | Limits the Relationship stages one accepted operation may cross when pace is `Custom`. |
| `Turning Point mode` | `Growth-only` | `Growth-only`, `All directions`, or `Disabled` | Selects which creator-authored Turning Point directions CC may update. It does not rewrite the creator-authored stage cards. |
| `Debug` | `false` | `true` or `false` | Creates detailed `CC — Debug` diagnostics. Leave this off during ordinary play. |

## Relationship pace presets

| Pace | Accumulated event | Direct event | Maximum stage movement |
| --- | ---: | ---: | ---: |
| `Slowburn` | `1` | `10` | `1` |
| `Balanced` | `2` | `10` | `1` |
| `Fast` | `6` | `20` | `2` |
| `Custom` | Uses Custom setting | Uses Custom setting | Uses Custom setting |

An **accumulated event** is a smaller piece of evidence that builds a pattern. A **direct event** is an explicit, completed relationship fact such as a clearly established role, boundary, commitment, betrayal, or repair.

`Slowburn` makes repeated smaller moments matter gradually. `Balanced` is the recommended default. `Fast` responds more strongly and can cross two stages after sufficiently strong evidence. `Custom` exposes the three numeric controls without changing the underlying evidence and validation rules.

If `Relationship pace` or its Custom values are invalid, CC falls back to `Balanced` and reports a warning.

## Turning Point modes

| Mode | Behavior |
| --- | --- |
| `Growth-only` | Updates only Turning Points whose creator-authored `Direction` is `Growth`. `Decline`, `Mixed`, and `Neutral` records remain available for current-stage selection and portrayal but do not receive progress operations. |
| `All directions` | Allows progress operations for `Growth`, `Decline`, `Mixed`, and `Neutral` Turning Points. Direction describes the creator's intended arc; CC still requires completed evidence for any movement. |
| `Disabled` | Disables Turning Point progress operations. Existing records, progress, validated current-stage selection, and creator-authored stage cards are preserved. |

If `Turning Point mode` is missing or invalid, CC falls back to `Growth-only` and reports a warning.

## How the main controls interact

### Continuity budget

In v2.02-test-b2, portrayal and control use different routes. Compact portrayal lives in generated, name-triggered `CC — Model Context — Name` Story Cards. Front Memory contains only a current one-family assessment task, an unpromoted possible-next assessment staged for Continue, or a prose-recovery instruction; CC removes its tagged block when none is active.

An operation-task payload may use at most 600 estimated tokens; the `<CC_FRONT_MEMORY>` ownership tags and unrelated existing Front Memory are budgeted separately. Normal tasks are built to at most 592 tokens, reserving eight tokens so the positive Retry label remains inside the same 600-token hard ceiling. Input prepares the task before platform context assembly; Output can prepare a separate possible Continue task. The task is delivered only after Context verifies both its preparation fingerprint and that the incoming text already ends with the exact complete `state.memory.frontMemory` value for that plan. A card, settings, evidence, or managed-state change invalidates a stale prepared task. In enabled task verification, Context does not append, replace, resize, or truncate the task. Disabled-mode cleanup may remove CC's owned block. Text outside CC's own tags is preserved.

When a task is delivered, CC has frozen one owner and one legal operation family. It supplies up to two fresh completed evidence rows, a bounded current target map, that family's mechanics, and exactly one operation form plus `K`. The family scheduler uses lowest owner/family drain, longest since served, current relevance, oldest evidence, and a rotating stable fallback. The model selects a unique supplied evidence subset in supplied order and supplies the scheduled operation's details, or completes `K` with the full supplied list when that family remains unchanged. `K` retires evidence only for the scheduled family and only when its current legal scope was complete; otherwise it remains reviewable for that family. The Output connector validates structure and current mechanics, attempts at most one managed write transactionally, and strips the control record so only story prose remains visible. An omitted record receives one bounded retry.

Every completed, unchanged, rejected, or malformed outcome updates drain only for the scheduled owner/family pair. The record is shared across evidence IDs, targets, fields, and destinations. Stale or cut-off transport adds no drain. Family drain decays on that owner's later opportunities, so another ready zero-drain family normally receives the next assessment.

The final `CC CURRENT ASSESSMENT — FINAL RESPONSE SUFFIX` block inside `<CC_FRONT_MEMORY>...</CC_FRONT_MEMORY>` identifies the current supplied evidence and mechanics. Complete CCO records from older tasks are stale when they cite unavailable or reordered IDs: CC strips the record, preserves punctuated story prose, adds no operation drain, and carries the current assessment once. Recovery receives a short tagged Front Memory instruction. Ordinary story-only turns receive no CC Front Memory block.

The owner opportunity clock advances once for every eligible focused action, including a completed `K` assessment and a turn whose complete packet cannot fit. This clock governs durable evidence age and operation-drain decay. Status reports evidence as `available` and `unreviewed`; `pending` is no longer used for every merely age-eligible ledger item.

`info.maxChars` bounds task preparation, but the task is staged before platform context assembly rather than competing with the already assembled base text. Context never returns a partial task or tries to use an internal overflow area as writable capacity. `CC — Status` reports generated Model Context cards, their stored token estimates, Front Memory mode and verification, and control-task budget use.

If context is crowded, keep Outer and Inner concise and remove redundant source prose. Each generated Model Context card is capped independently; optional State, development, Relationship, View, Name, and Experience blocks are added only while complete blocks fit.

### State lifetime

Each State field has its own temporary clock. A supported new event may refresh or replace one field without making unrelated fields permanent. Increasing the lifetime makes private State linger longer; lowering it makes CC clear unrefreshed State sooner.

State stores at most three trigger codes. If the model supplies more than three valid codes, CC keeps the first three unique codes in their supplied order. An unknown trigger code remains structurally invalid.

### Maximum active NPCs

The roster always provides `N1` through `N5`, but this setting limits how many currently relevant NPCs CC treats as active for focus and update routing. Native Story Card matching can still activate more than one generated Model Context card when several registered names are explicitly present. The setting does not delete NPCs or change their stable roster slots.

### Dynamic cast

When enabled, qualifying interaction counts can promote Side NPCs to Main, and prolonged absence can demote Main NPCs to Side. The two thresholds control those changes. Turning Dynamic cast off preserves the current Main/Side classifications.

## Fixed safety limits

These limits in the current cache-compatible build are not editable through `CC — Settings`:

| Limit | Value |
| --- | ---: |
| Stable active-roster slots | `5` |
| Outer card context copy | `2,000` characters per NPC |
| Inner card context copy | `2,000` characters per NPC |
| Names card page | `1,000` characters |
| Relationships card page | `1,000` characters |
| Turning Points card page | `1,000` characters |
| Turning Point stage card | `1,000` characters |
| Views card page | `1,000` characters |
| Experiences card page | `1,000` characters |
| Imported Experience field | `5,000` characters before safe splitting |
| Stored Experience record | `650` characters |
| Model-facing Experience copy | `320` characters |
| Generated Model Context card | `4,400` characters per NPC |
| Generated Model Context triggers | `12` unambiguous canonical/Active forms plus currently mentioned managed forms per NPC |
| Individual State value | `120` characters |
| State triggers | `3` |
| Confirmations required for Experience promotion | `3` |
| Operation-task payload ceiling | `600` estimated tokens inside the configured Continuity budget; normal tasks reserve 8 tokens for Retry |
| Turning Point Explanation requested from the model | `150` characters |
| Stored Turning Point Explanation after safe word-boundary compaction | `180` characters |
| CC Front Memory on an ordinary no-task turn | `0` tokens |

When a managed collection outgrows one page, CC can create numbered pages where supported. An oversized imported Experience can be divided at word boundaries into valid stored records before paging.

## Suggested starting profiles

### Default

Keep the generated settings unchanged. This gives a three-response State lifetime, five active NPCs, dynamic cast management, Balanced relationship development, and Growth-only Turning Points.

### Slower character development

Use:

```text
State lifetime: 3
Relationship pace: Slowburn
```

This slows accumulated Relationship movement without forcing temporary emotions to linger.

### Smaller context footprint

Keep the continuity budget at its default and lower:

```text
Maximum active NPCs: 3
```

This is usually more effective than trying to force the continuity budget below its 1,800-token safety floor.

### Diagnostic session

Temporarily change:

```text
Debug: true
```

Continue once, inspect `CC — Debug`, and return it to `false` when the problem is understood.

For card editing and runtime workflows, see the [Creator and Player Guide](CREATOR-PLAYER-GUIDE.md).

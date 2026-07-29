# Configuring Character Continuity

[Introduction](README.md) · [Installation](INSTALLATION.md) · [Creator and Player Guide](CREATOR-PLAYER-GUIDE.md)

Character Continuity creates `CC — Settings` automatically. Edit the value after a setting's colon, save the card, and continue once for the change to take effect.

Keep every setting on its own line. `true` and `false` are recommended for Boolean options, although common forms such as `yes/no` and `on/off` are also recognized.

## Settings reference

| Setting | Default | Accepted values | What it does |
| --- | ---: | --- | --- |
| `Enabled` | `true` | `true` or `false` | Turns CC processing on or off without removing its Library code or cards. |
| `Continuity budget` | `2000` | Positive whole number; minimum `1800` | Sets the approximate token budget for CC's normal model-facing packet. Values below 1,800 are raised to 1,800. A higher value may fit more relevant continuity but consumes more model context. |
| `State lifetime` | `3` | Whole number from `1` to `12` | Sets how many completed AI responses a temporary State field may survive without new evidence refreshing it. |
| `Maximum active NPCs` | `5` | Whole number from `1` to `5` | Limits how many scene-relevant registered NPCs CC may treat as active at once. The roster itself still has five stable slots. |
| `Dynamic cast` | `true` | `true` or `false` | Allows Side NPCs to become Main and inactive Main NPCs to become Side. `false` freezes those statuses. |
| `Side promotion interactions` | `5` | Whole number from `1` to `999` | Sets the qualifying interaction count a Side NPC needs before becoming Main when Dynamic cast is on. |
| `Main inactivity limit` | `12` | Whole number from `1` to `999` | Sets the qualifying absence count before a Main NPC becomes Side when Dynamic cast is on. |
| `Relationship pace` | `Balanced` | `Slowburn`, `Balanced`, `Fast`, or `Custom` | Selects how much Relationship score a supported event can add or remove and how many stages one operation may cross. |
| `Custom accumulated event value` | `2` | Whole number from `0` to `50` | Sets the score for accumulated Relationship evidence when pace is `Custom`. |
| `Custom direct event value` | `10` | Whole number from `0` to `50` | Sets the score for explicit direct Relationship events when pace is `Custom`. |
| `Custom maximum stages per operation` | `1` | Whole number from `1` to `6` | Limits the Relationship stages one accepted operation may cross when pace is `Custom`. |
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

## How the main controls interact

### Continuity budget

The budget controls CC's model-facing continuity packet, not the total amount of information saved in Story Cards. CC selects relevant records rather than inserting every record on every turn.

If context is crowded, first keep Outer and Inner concise and remove redundant prose. Raising the budget can expose more continuity, but also leaves less room for story history and other Scenario instructions.

### State lifetime

Each State field has its own temporary clock. A supported new event may refresh or replace one field without making unrelated fields permanent. Increasing the lifetime makes private State linger longer; lowering it makes CC clear unrefreshed State sooner.

### Maximum active NPCs

The roster always provides `N1` through `N5`, but this setting can limit how many currently relevant NPCs are model-facing. Lower values reduce context use in large casts. They do not delete NPCs or change their stable roster slots.

### Dynamic cast

When enabled, qualifying interaction counts can promote Side NPCs to Main, and prolonged absence can demote Main NPCs to Side. The two thresholds control those changes. Turning Dynamic cast off preserves the current Main/Side classifications.

## Fixed safety limits

These v1.0.72 limits are not editable through `CC — Settings`:

| Limit | Value |
| --- | ---: |
| Stable active-roster slots | `5` |
| Outer card context copy | `2,000` characters per NPC |
| Inner card context copy | `2,000` characters per NPC |
| Names card page | `1,000` characters |
| Relationships card page | `1,000` characters |
| Views card page | `1,000` characters |
| Experiences card page | `1,000` characters |
| Imported Experience field | `5,000` characters before safe splitting |
| Stored Experience record | `650` characters |
| Model-facing Experience copy | `320` characters |
| Individual State value | `120` characters |
| State triggers | `3` |
| Confirmations required for Experience promotion | `3` |
| Operation-specific instruction | approximately `600` tokens |
| Complete continuity operation turn | approximately `1,400` tokens |

When a managed collection outgrows one page, CC can create numbered pages where supported. An oversized imported Experience can be divided at word boundaries into valid stored records before paging.

## Suggested starting profiles

### Default

Keep the generated settings unchanged. This gives a three-response State lifetime, five active NPCs, dynamic cast management, and Balanced relationship development.

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

# Character Continuity Creator and Player Guide

[Introduction](README.md) · [Installation](INSTALLATION.md) · [Configuration](CONFIGURATION.md)

Character Continuity is designed to run during normal play without chat commands. Creators define stable foundations and optional starting continuity; players act naturally in the story; CC selects, validates, and saves narrow continuity changes when the generated evidence supports them.

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
| Manually write State or hidden CCO records | No | No |
| Let Names, Relationships, Views, and Experiences evolve after activation | CC | CC |

Outer and Inner are the creator-owned foundation. State is managed by CC. Names, Relationships, Views, and Experiences can begin with creator-authored baselines, then become managed continuity during play.

## Creator workflow

For a Scenario intended for other players:

1. Follow the complete [installation guide](INSTALLATION.md), including all three exact connectors.
2. Add `Player — Identity`, using a suitable default or placeholder.
3. Decide how each starting NPC will be created:
   - directly author completed Outer and Inner cards in the Scenario, or
   - use onboarding in a private test Adventure.
4. Add any desired starting Names, Views, Relationships, or Experiences.
5. Start a fresh test Adventure.
6. Confirm the roster, context budget, and version in `CC — Status`.
7. Test at least one supported State update.
8. Test onboarding if players will be allowed to add NPCs.
9. Confirm that no raw `(CCO|...)` record appears in visible story history.

Changes made inside a test Adventure do not rewrite the parent Scenario. If you use onboarding to design an NPC who should exist for every future player, copy or export that NPC's finalized six setup cards back into the Scenario before publishing.

### Directly authored starting NPCs

Direct authoring is best when the initial cast is already known. Each NPC needs a complete `Name — Outer` card and a complete `Name — Inner` card. Do not include onboarding controls in a finished direct-authored pair, and do not manually create `Name — State`.

Use [the installation guide's templates](INSTALLATION.md#option-a-author-completed-cards-before-play) for the exact minimum format.

## Player workflow

During ordinary play:

- Play normally; CC does not require chat commands.
- Mention or interact with registered NPCs naturally.
- Let CC decide when the text supports a narrow continuity update.
- Use `CC — Status` for a readable summary without enabling full Debug.
- Edit `CC — Settings` when you want a different State lifetime, cast behavior, Relationship pace, or context budget.
- Use `CC — Active NPCs` only when you intentionally want to add, remove, or reconnect an NPC.

The Player character remains player-owned. CC does not establish the Player's private thoughts, feelings, consent, commitments, memories, boundaries, names, or relationship decisions.

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
| `Mira Vale — Outer` | Every listed character field | Complete it. Keep `Onboarding: Pending` and `Ready: No` while editing. |
| `Mira Vale — Inner` | Every listed character field | Complete it. Keep `Onboarding: Pending` while editing. |
| `Mira Vale — Names` | No alias records required | Add starting aliases, or leave the blank five-field Alias record untouched. |
| `Mira Vale — Views` | No View records required | Add baseline Views, or leave all five category headings empty. |
| `Mira Vale — Relationships` | No Relationship records required | Add baselines, or leave the blank six-field record untouched. |
| `Mira Vale's Experiences` | No Experience records required | Add prior Experiences, or leave the blank About/Experience pair untouched. |

All six cards are validated together. Outer and Inner must be complete. The other four may contain no baseline records, but their wrappers, headings, and blank field titles must remain intact until activation.

CC does **not** create `Mira Vale — State` while onboarding is pending.

### 3. Complete Outer

Generated form:

```text
{ Mira Vale's Outer:
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
{ Mira Vale's Outer:
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
{ Mira Vale's Inner:
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
{ Mira Vale's Inner:
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
{ Mira Vale's Experiences:
About: Player
Experience: the Player gave her shelter without demanding anything in return
}
```

About and Experience must either both be filled or both remain blank. Keep the Experience concise—no longer than a State value—and describe a completed event rather than a personality trait.

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
- Edit **Player — Identity** when the Player character's name or pronouns need correction.
- Edit **CC — Settings** for runtime behavior.
- Edit **CC — Active NPCs** for onboarding, removal, or reconnection.
- Let CC manage **State**, **Names**, **Relationships**, **Views**, and **Experiences** during ordinary play.

If you intentionally edit a managed continuity card, preserve its exact wrapper, headings, complete record groups, and canonical names. Invalid records are preserved for inspection but excluded from model context and automatic updates.

## Understanding State

A managed State card contains temporary fields such as Thought, Feeling, Goal, Tension, Situation, About, and Triggers. Its lifecycle is:

1. CC creates the State card when an NPC activates.
2. On an eligible turn, CC gives the model a narrow continuity task.
3. The generated output may include a hidden `(CCO|...)` candidate.
4. The Output connector passes the generated text back through CC.
5. CC validates and saves an accepted candidate to the State card.
6. CC removes the hidden record before returning visible story text.
7. The Context connector can later inject a readable private-State block so the model can portray it through behavior and subtext.

An empty State card therefore does not prove that installation failed: the NPC may not have received a qualifying State operation yet, or the candidate may have failed validation. An empty State card **combined with visible raw CCO text** points strongly to an incorrect connector.

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

Apply the same two-argument, returned-text pattern to Input and Context:

```js
text = CharacterContinuity("input", text);
text = CharacterContinuity("context", text);
```

Use each line only inside its corresponding modifier, as shown in the [installation guide](INSTALLATION.md#3-install-all-three-connectors).

### A State block appears in the Context Viewer

This is expected when it looks like:

```text
{ Snow's current private State:
Thought: ...
Feeling: ...
}
```

CC injects current State so the model can portray it. A raw line beginning with `(CCO|` in the visible story is not expected.

### Nothing happens

- Confirm Scripts are enabled in both the Scenario and account Gameplay settings.
- Confirm all four script tabs were saved.
- Confirm the full v1.0.61 file is in Library only.
- Confirm Input, Context, and Output pass `text` into CC and return CC's result.
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

Leave it in place. CC uses managed keys to preserve card identity across script hooks. Ordinary scene triggers are not required for CC-managed context injection.

### Relationship development feels too fast or too slow

Change `Relationship pace` to `Slowburn`, `Balanced`, or `Fast`. Use `Custom` only when you want direct control over event values and maximum stage movement. See [Configuration](CONFIGURATION.md#relationship-pace-presets).

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
- `State clock / lifetime`
- `Components`
- `Budget configured / effective / used / headroom`

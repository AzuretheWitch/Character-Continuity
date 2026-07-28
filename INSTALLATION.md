# Installing Character Continuity

[Introduction](README.md) · [Configuration](CONFIGURATION.md) · [Creator and Player Guide](CREATOR-PLAYER-GUIDE.md)

This guide installs **Character Continuity Stable v1.0.61** in an AI Dungeon Scenario. For the cleanest first setup, use a new or otherwise clean Scenario and start a fresh Adventure after saving it.

## What you need

- `Character-Continuity-Stable-v1.0.61.txt`
- AI Dungeon in a computer browser, or a mobile browser in desktop view
- A Scenario you can edit
- Scripts enabled in AI Dungeon's account Gameplay settings

## 1. Open the script editor

1. Create a new Scenario or edit one you own.
2. Open the Scenario's **Details**.
3. Scroll to **Scripting**.
4. Turn on **Scripts Enabled**.
5. Select **Edit Scripts**.

The editor contains four areas:

- **Library**
- **Input**
- **Context**
- **Output**

## 2. Install the Library code

1. Open `Character-Continuity-Stable-v1.0.61.txt`.
2. Copy the entire file.
3. Open AI Dungeon's **Library** script tab.
4. Remove any placeholder code.
5. Paste the full CC file once.

Do not paste the full Library code into Input, Context, or Output.

## 3. Install all three connectors

Each connector must:

1. pass the current `text` into `CharacterContinuity`, and
2. return the replacement text that `CharacterContinuity` gives back.

This is required for context injection, State-card updates, opening suppression, and removal of hidden control records.

### Input

```js
const modifier = (text) => {
  text = CharacterContinuity("input", text);
  return { text };
};

modifier(text);
```

### Context

```js
const modifier = (text) => {
  text = CharacterContinuity("context", text);
  return { text };
};

modifier(text);
```

### Output

```js
const modifier = (text) => {
  text = CharacterContinuity("output", text);
  return { text };
};

modifier(text);
```

> **Critical:** do not call `CharacterContinuity("input")`, `CharacterContinuity("context")`, or `CharacterContinuity("output")` without the second argument. Do not call CC and then return the original, unchanged `text`.

Save all four script areas.

## 4. Add the Player identity

Create a Custom Story Card:

- **Name:** `Player — Identity`
- **Entry:**

```text
Name: Azure
Pronouns: she/her
```

Replace the example values with the Player character's details.

For `she/her`, `he/him`, or `they/them`, two forms are enough. For custom pronouns, use all five forms in this order:

```text
Pronouns: subject/object/possessive-adjective/possessive-pronoun/reflexive
```

Example:

```text
Pronouns: ze/zir/zir/zirs/zirself
```

If the Player card is absent or unreadable, CC falls back to `the player` and `they/them`.

## 5. Choose how to add starting NPCs

There are two supported approaches.

### Option A: author completed cards before play

This is the fastest method when the Scenario creator already knows the starting cast.

Create one Custom Outer card and one Custom Inner card for each starting NPC.

Example Outer card:

- **Name:** `Snow — Outer`
- **Entry:**

```text
{ Snow's Outer:
Name, age, gender, pronouns: Snow, 31, woman, she/her
Race/Species: arctic fox demi-human
Physical attributes: medium height, sturdy build, silver-white hair, pale-grey eyes, white ears and tail
Clothing style: practical dark layers, a café apron, and sturdy boots
Starting status: Main
}
```

Example Inner card:

- **Name:** `Snow — Inner`
- **Entry:**

```text
{ Snow's Inner:
Personality: collected, observant, pragmatic, patient, quietly caring
Mannerisms: speaks calmly and precisely; uses dry humor, silence, and practical acts
Wants: keep the inn safe, sustainable, and welcoming
Fears: trusting someone who leaves again
Mental wounds: past abandonment taught her to carry burdens alone
Principles: seek clear consent; accept refusal; care without controlling; protect privacy
}
```

Rules:

- Use the exact same canonical name in both card names and headers.
- Keep one opening `{` and one closing `}`.
- Fill every listed Outer and Inner field.
- `Starting status` must be `Main` or `Side`.
- Do not create a State card manually.
- Optional Names, Views, Relationships, and Experiences baselines may also be added before play.

When no `CC — Active NPCs` card exists yet, CC seeds its roster from completed Outer cards, up to the five-slot limit.

### Option B: use confirmed onboarding

Start with no cards for the new NPC. After the Adventure initializes, enter the NPC's canonical name in an empty `N#` line inside `CC — Active NPCs`.

CC creates a six-card setup pack and keeps the NPC pending until the whole pack passes validation. See [Confirmed onboarding](CREATOR-PLAYER-GUIDE.md#confirmed-onboarding) for the complete walkthrough and card templates.

## 6. Leave managed triggers alone

You do not need to create ordinary scene triggers for CC-managed cards. CC selects and supplies relevant continuity through the Context script.

After activation, CC may place an internal-looking value in a managed card's trigger or key field so the script can preserve that card's identity across hooks. Leave that value in place.

## 7. Start and verify a fresh Adventure

1. Save the Scenario and all script tabs.
2. Select **Play** to start a fresh Adventure.
3. Let the Scenario opening appear.
4. The first automatic AI response immediately after the opening is intentionally hidden.
5. Enter the Player's first real action.
6. Open the Adventure's Story Cards.

Look for:

- `CC — Settings`
- `CC — Active NPCs`
- `CC — Status`
- `Name — State` for each activated NPC

`CC — Status` should end with:

```text
Version: Character Continuity Stable v1.0.61
```

An initial State card may be empty. It fills only after CC accepts a supported, evidence-grounded State operation.

## Combining CC with another script

Each Input, Context, and Output tab should contain only one final `modifier(text)` call. Multiple Library functions can run inside that modifier, with each function receiving the prior function's returned text.

Example shape:

```js
const modifier = (text) => {
  text = OtherScript("input", text);
  text = CharacterContinuity("input", text);
  return { text };
};

modifier(text);
```

Use the integration order recommended by the other script. Test the combined setup in a duplicate Scenario before publishing it.

## Installation checklist

- [ ] The complete v1.0.61 file is in Library.
- [ ] Input calls and returns `CharacterContinuity("input", text)`.
- [ ] Context calls and returns `CharacterContinuity("context", text)`.
- [ ] Output calls and returns `CharacterContinuity("output", text)`.
- [ ] Scripts are enabled in the Scenario and account Gameplay settings.
- [ ] `Player — Identity` exists, or the generic fallback is acceptable.
- [ ] Every directly authored starting NPC has completed Outer and Inner cards.
- [ ] No State cards were created manually.
- [ ] A fresh Adventure was started after saving.
- [ ] `CC — Status` reports `Character Continuity Stable v1.0.61`.

## Quick installation troubleshooting

If State cards stay empty while a line beginning with `(CCO|` appears in the visible story, the Output connector is not giving CC the generated text or is discarding CC's cleaned replacement. Replace all three connectors with the exact two-argument, returned-text forms above.

Seeing a populated `{ Name's current private State: ... }` block in AI Dungeon's **Context Viewer** is expected; that is how CC supplies private continuity for portrayal. Seeing raw `(CCO|...)` data in the visible story is not expected.

For additional diagnosis, see [Troubleshooting](CREATOR-PLAYER-GUIDE.md#troubleshooting).

## AI Dungeon references

- [What are Scripts and how do you install them?](https://help.aidungeon.com/what-are-scripts-and-how-do-you-install-them)
- [Scripting API reference](https://help.aidungeon.com/scripting)
- [Story Cards guide](https://help.aidungeon.com/faq/story-cards)
- [Scenario guide](https://help.aidungeon.com/faq/what-are-scenarios)

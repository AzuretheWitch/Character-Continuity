# Installing Character Continuity

[Introduction](README.md) · [Configuration](CONFIGURATION.md) · [Creator and Player Guide](CREATOR-PLAYER-GUIDE.md)

This guide installs the cache-compatible **v2.02-test-b5** release of Character Continuity in an AI Dungeon Scenario. Keep a recoverable copy of v2.01 while testing. For the cleanest first setup, use a duplicate, new, or otherwise clean Scenario and start a fresh Adventure after saving it.

CC is maintained as **cache-compatible only**. Use the four canonical files named `Library`, `Input`, `Context`, and `Output`; do not substitute an older non-cache Context connector.

## What you need

- The `Library`, `Input`, `Context`, and `Output` files from this package
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

1. Open the file named `Library` from this package.
2. Copy the entire file.
3. Open AI Dungeon's **Library** script tab.
4. Remove any placeholder code.
5. Paste the full CC file once.

Do not paste the full Library code into Input, Context, or Output.

## 3. Install all three connectors

Each connector must:

1. pass the current `text` into `CharacterContinuity`, and
2. return the replacement text that `CharacterContinuity` gives back.

This is required for triggered Model Context card updates, temporary Front Memory control, State-card updates, opening suppression, and removal of hidden control records.

### Input

```js
const modifier = (text) => ({
  text: CharacterContinuity("input", text)
});

modifier(text);
```

### Context

The `// @cache-compatible` directive must be the first line of the Context tab.

```js
// @cache-compatible
const modifier = (text) => ({
  text: CharacterContinuity("contextAppend", text)
});

modifier(text);
```

### Output

```js
const modifier = (text) => ({
  text: CharacterContinuity("output", text)
});

modifier(text);
```

> **Critical:** Input must call `CharacterContinuity("input", text)`, cache-compatible Context must call `CharacterContinuity("contextAppend", text)`, and Output must call `CharacterContinuity("output", text)`. Keep the first-line Context directive, pass the second argument, and return CC's replacement text.

On an eligible focused turn, Input prepares a tagged block in `state.memory.frontMemory` before platform context assembly. It begins with `CC CURRENT ASSESSMENT — FINAL RESPONSE SUFFIX`, identifies one fixed NPC and one scheduled operation family, and supplies fresh completed raw evidence without deciding whether that family changed. It includes only that family's legal targets, current mechanics, one CCO operation form, and `K`. Output can pre-stage the corresponding task for a possible Continue. The model selects the relevant supplied evidence IDs and completes either the scheduled operation or `K` for that family's shown scope remaining unchanged as its first nonblank line, then writes the scene from the next line. The Output connector removes that control record before the player sees the story and replaces the consumed block only when a Continue or recovery task is ready.

CC wraps only its own temporary task in `<CC_FRONT_MEMORY>...</CC_FRONT_MEMORY>` and preserves Front Memory text outside those tags. In enabled task verification, Context returns its input unchanged and marks a task delivered only when the incoming text already ends with the exact complete staged Front Memory value. Disabled-mode cleanup may remove CC's owned block. A recovery turn receives a short recovery task; an ordinary story-only turn receives no CC Front Memory block.

Save all four script areas.

## 4. Add the Player identity

Create a Custom Story Card:

- **Name:** `Player's Identity`
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

CC creates `Player's Names` automatically. That card can record aliases the Player explicitly supplies or accepts; repeated NPC usage alone cannot establish a Player alias.

## 5. Choose how to add starting NPCs

There are two supported approaches.

### Option A: author completed cards before play

This is the fastest method when the Scenario creator already knows the starting cast.

Create one Custom Essentials card for each starting NPC.

Example Essentials card:

- **Name:** `Snow's Essentials`
- **Entry:**

```text
{
Snow's Essentials:
Outer:
Name, age, gender, pronouns: Snow, 31, woman, she/her
Race/Species: arctic fox demi-human
Physical attributes: medium height, sturdy, silver-white hair, pale-grey eyes, white ears and tail
Clothing style: practical dark layers and a café apron
Starting status: Main
Inner:
Personality: collected, observant, pragmatic, patient, quietly caring
Mannerisms: speaks calmly and precisely; uses dry humor, silence, and practical acts
Wants: keep the inn safe, sustainable, and welcoming
Fears: trusting someone who leaves again
Mental wounds: past abandonment taught her to carry burdens alone
Principles: seek clear consent; accept refusal; care without controlling; protect privacy
Names:
Canonical: Snow
}
```

Rules:

- Use the exact same canonical name in the card name, header, identity line, and `Canonical` line.
- Put the opening `{` and possessive card header on separate lines.
- Keep one opening `{` and one closing `}`.
- Required fields are `Name, age, gender, pronouns`, `Race/Species`, `Physical attributes`, `Personality`, `Wants`, `Principles`, and `Starting status`.
- `Clothing style`, `Mannerisms`, `Fears`, and `Mental wounds` are optional; omit blank optional lines from a finished card.
- `Starting status` must be `Main` or `Side`.
- Keep the complete Essentials Entry at or below 1,000 characters. Aim for 850 or fewer so the model can attend to it reliably.
- Finished Essentials displays compact name lines after `Canonical`, for example `Active [General]: Frost` or `Rejected: Fox`. The separate Names ledger remains authoritative; do not add an alias only to this mirror.
- Do not create a State card manually.
- Optional Views, Relationships, and Experiences baselines may also be added before play. If directly authoring initial aliases rather than using onboarding, put their complete records in a matching `Name's Names` baseline and mirror them compactly in Essentials.
- Optional creator-authored Turning Points may be added separately by following the [Turning Points guide](CREATOR-PLAYER-GUIDE.md#turning-points); they are not part of onboarding.

The current build still reads legacy Outer/Inner cards. It creates a pending Essentials migration draft for review and leaves those legacy sources active until the creator approves the draft; it never deletes them automatically.

When no `CC — Active NPCs` card exists yet, CC seeds its roster from completed Essentials cards, and still recognizes completed legacy Outer cards, up to the five-slot limit.

### Option B: use confirmed onboarding

Start with no cards for the new NPC. After the Adventure initializes, enter the NPC's canonical name in an empty `N#` line inside `CC — Active NPCs`.

CC creates four visible setup cards—Essentials, Views, Relationships, and Experiences—and keeps the NPC pending until the whole pack passes validation. On activation it creates the authoritative Names ledger and managed State card. See [Confirmed onboarding](CREATOR-PLAYER-GUIDE.md#confirmed-onboarding) for the complete walkthrough and card templates.

## 6. Leave managed triggers alone

Do not create ordinary scene triggers for CC's managed storage cards. The activated Essentials card is the intentional exception: CC gives it the canonical name and unambiguous Active aliases so its compact portrayal enters context only when relevant.

After activation, CC may place an internal-looking value in a managed card's trigger or key field so the script can preserve that card's identity across hooks. Leave that value in place.

For each activated NPC, CC also creates `CC — Model Context — Name`. It uses the same relevant name routing but contains only the player-agency reminder and dynamic State, Turning Point development, Relationship, View, or Experience blocks that fit. It never copies stable portrayal or Names. Its preferred limit is 600 characters and its hard limit is 1,000. A managed Emerging, Retired, or Rejected alias may be added transiently when that exact form is currently mentioned. Do not edit this generated card or its keys; edit Essentials or the applicable managed source card instead. Input and Output refresh it automatically.

Turning Point stage cards are a special creator-authored case. Use the exact `__CC_TP_...__` private key required by the Turning Point guide as the stage card's only trigger/key; do not add an ordinary scene trigger. v2.02-test-b5 validates that key and copies only the current stage guidance into the NPC's generated Model Context card. Keeping ordinary triggers off every stage card prevents the platform from independently activating an old or wrong stage. The stage card's creator-assigned type is preserved.

The separate `Name's Turning Points` router should have no card-level scene trigger/key. CC discovers it by its exact title and preserves its creator-assigned keys and type. Its managed `Stage trigger:` Entry line does not require the router itself to enter native context; leaving the router non-activating keeps the whole router out of ordinary native portrayal context. When movement is currently legal, the assessment can list a compact Turning Point ID, progress, movement, comparison-stage, and condition reference for the model.

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
- `Player's Names`
- `Name's Essentials` for each activated NPC
- `Name's Names` for each activated NPC
- `Name's State` for each activated NPC
- `CC — Model Context — Name` for each activated NPC

`CC — Status` should end with the version declared near the top of the installed `Library` file. For the current package, that line is:

```text
Version: v2.02-test-b5
```

For later releases, verify that the Status value exactly matches the `VERSION` value in the installed Library rather than expecting the v2.02-test-b5 text permanently.

An initial State card may be empty. Mere scene participation does not seed State; it fills only after CC accepts a supported, evidence-grounded State change or confirmation.

## Combining CC with another script

Each Input, Context, and Output tab should contain only one final `modifier(text)` call. Multiple Library functions can run inside that modifier, with each function receiving the prior function's returned text.

Example Input shape:

```js
const modifier = (text) => {
  text = OtherScript("input", text);
  text = CharacterContinuity("input", text);
  return { text };
};

modifier(text);
```

Context integration remains cache-compatible and must keep its directive on the first line. Combine CC only with another Context script that also supports AI Dungeon's cache-compatible mode; follow that script's documented hook name and ordering:

```js
// @cache-compatible
const modifier = (text) => {
  text = OtherScript("context", text);
  text = CharacterContinuity("contextAppend", text);
  return { text };
};

modifier(text);
```

The example order is valid only when `OtherScript` preserves the complete current `state.memory.frontMemory` value as the actual suffix. If another Context function appends after Front Memory, do not combine it with this verification path until that function can insert its content before the Front Memory suffix. At the moment CC runs—and when the combined modifier returns—the exact Front Memory value must remain at the end of `text`; otherwise CC safely withholds its task or the final-response contract is no longer last. Test the combined setup in a duplicate Scenario before publishing it.

## Installation checklist

- [ ] The complete current `Library` file is in the Library script tab.
- [ ] Input calls and returns `CharacterContinuity("input", text)`.
- [ ] Context begins with `// @cache-compatible` and calls and returns `CharacterContinuity("contextAppend", text)`.
- [ ] Output calls and returns `CharacterContinuity("output", text)`.
- [ ] Scripts are enabled in the Scenario and account Gameplay settings.
- [ ] `Player's Identity` exists, or the generic fallback is acceptable.
- [ ] Every directly authored starting NPC has one complete Essentials card at or below 1,000 characters.
- [ ] Every Essentials card contains all seven required fields; blank optional fields are omitted from finished cards.
- [ ] No State cards were created manually.
- [ ] A fresh Adventure was started after saving.
- [ ] `CC — Status` reports the same version as the installed Library's `VERSION` value.
- [ ] Each activated NPC has a name-triggered Essentials card, an authoritative Names ledger, and one generated `CC — Model Context — Name` card.
- [ ] Before Context, staging reports `Front Memory: prepared-operation | verified No`; after Context authorizes an assessment, it reports `Front Memory: operation | verified Yes`. After Output, `prepared-operation | verified No` is normal when a possible Continue task is staged.

## Quick installation troubleshooting

If State cards stay empty while a line beginning with `(CCO|` appears in the visible story, first replace all three connectors with the exact two-argument, returned-text forms above and confirm that Context begins with `// @cache-compatible`. On assessment turns, the model places one completed CCO record on the first nonblank output line and begins story prose on the next line; the Output connector strips accepted, unchanged, stale, rejected, malformed, and cut-off control forms before returning the story. If raw CCO still appears with the exact connectors installed, preserve the generated output and `CC — Debug` contents for diagnosis.

Seeing a populated private State block inside a triggered `CC — Model Context — Name` card in the **Context Viewer** is expected; that is how CC supplies bounded dynamic continuity. Stable portrayal should come from the separate triggered Essentials card, and neither portrayal fields nor Names should be duplicated in Model Context. On assessment turns, a tagged Front Memory task is also expected. Neither the tags nor raw `(CCO|...)` data should appear in visible story.

For additional diagnosis, see [Troubleshooting](CREATOR-PLAYER-GUIDE.md#troubleshooting).

## AI Dungeon references

- [What are Scripts and how do you install them?](https://help.aidungeon.com/what-are-scripts-and-how-do-you-install-them)
- [Scripting API reference](https://help.aidungeon.com/scripting)
- [Story Cards guide](https://help.aidungeon.com/faq/story-cards)
- [Scenario guide](https://help.aidungeon.com/faq/what-are-scenarios)

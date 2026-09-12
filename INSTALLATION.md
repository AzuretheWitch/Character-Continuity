# Installing Character Continuity

[Introduction](README.md) · [Configuration](CONFIGURATION.md) · [Creator and Player Guide](CREATOR-PLAYER-GUIDE.md)

This guide installs Character Continuity **v3.0** in an AI Dungeon Scenario. For the cleanest first setup, use a new or otherwise clean Scenario and start a fresh Adventure after saving it.

Use the four canonical files named `Library`, `Input`, `Context`, and `Output`. The included cache-compatible Context connector is the recommended and faster installation. v3.0 also supports a slower replaceable-Context fallback for troubleshooting or platform compatibility.

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

This is required for context injection, State-card updates, opening suppression, and removal of hidden control records.

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

On an eligible focused turn, the newest appended context ends with `CC CURRENT ASSESSMENT — FINAL RESPONSE SUFFIX`. That final block supplies fresh completed raw evidence without assigning its semantic operation meaning, along with legal targets, current card mechanics, and the available CCO record forms. The model selects the relevant supplied evidence IDs and completes either one continuity operation or `K` for continuity unchanged as its first nonblank line, then writes the scene from the next line. The Output connector removes that control record before the player sees the story.

Optimized context may still display older assessment packets. The final current-response block is authoritative. If a cached record cites evidence outside the current supplied set or changes its supplied order, CC strips it as stale transport, preserves completed story prose, and carries the current assessment once. On a story-only or recovery turn, the newest block instead begins `CC CURRENT RESPONSE` and asks for ordinary story prose.

### Slower replaceable-Context fallback

If Optimized Context is unavailable or needs to be ruled out during troubleshooting, replace the complete Context tab with this version and remove the `// @cache-compatible` directive:

```js
const modifier = (text) => ({
  text: CharacterContinuity("context", text)
});

modifier(text);
```

This fallback lets CC remove an older tagged CC suffix before adding the current one, but gives up Optimized Context's prompt-cache reuse and is expected to run more slowly. Neither Context mode reads or writes Plot Essentials, Author's Note, or Front Memory.

Save all four script areas.

## 4. Set up the Player cards

During the first input/context cycle, CC ensures that `Player's Identity` and `Player's Names` exist. If AI Dungeon has stored common Scenario setup answers for the Player's name and pronouns, CC uses them. Otherwise it creates fill-in fields with instructions in Notes.

You may also author `Player's Identity` in the Scenario before play:

- **Name:** `Player's Identity`
- **Entry:**

```text
{
Player's Identity:
Name: Azure
Pronouns: she/her
}
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

For a published Scenario, AI Dungeon setup placeholders may be placed in the `Name` and `Pronouns` lines in Entry. Keep placeholder syntax out of the Notes field, because Notes are instructions rather than setup questions.

`Player's Names` copies the resolved canonical name. Separately answered first-name and family-name questions can also seed Active, General aliases. Repeated NPC usage alone cannot establish a Player alias.

## 5. Choose how to add starting NPCs

There are two supported approaches.

### Option A: author completed cards before play

This is the fastest method when the Scenario creator already knows the starting cast.

Create one Custom Outer card and one Custom Inner card for each starting NPC.

Example Outer card:

- **Name:** `Snow's Outer`
- **Entry:**

```text
{
Snow's Outer:
Name, age, gender, pronouns: Snow, 31, woman, she/her
Race/Species: arctic fox demi-human
Physical attributes: medium height, sturdy build, silver-white hair, pale-grey eyes, white ears and tail
Clothing style: practical dark layers, a café apron, and sturdy boots
Starting status: Main
}
```

Example Inner card:

- **Name:** `Snow's Inner`
- **Entry:**

```text
{
Snow's Inner:
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
- Put the opening `{` and possessive card header on separate lines.
- Keep one opening `{` and one closing `}`.
- Fill every listed Outer and Inner field.
- `Starting status` must be `Main` or `Side`.
- Do not create a State card manually.
- Optional Names, Views, Relationships, and Experiences baselines may also be added before play.
- Optional creator-authored Turning Points may be added separately by following the [Turning Points guide](CREATOR-PLAYER-GUIDE.md#turning-points); they are not part of onboarding.

The current build still reads legacy combined openings such as `{ Snow's Outer:` and normalizes them to the split form in place.

When no `CC — Active NPCs` card exists yet, CC seeds its roster from completed Outer cards, up to the five-slot limit.

### Option B: use Template Builder

Start with no cards for the new NPC. After the Adventure initializes, enter the NPC's canonical name in an empty `N#` line inside `CC — Active NPCs`.

Take one action. CC creates six templates with fill-in fields in Entry and card-specific instructions in Notes, then keeps the NPC pending until the whole pack passes validation. See [Template Builder onboarding](CREATOR-PLAYER-GUIDE.md#template-builder-onboarding) for the complete walkthrough.

## 6. Leave managed triggers alone

You do not need to create ordinary scene triggers for CC-managed cards. CC's scripted relevance rules supply current continuity through the Context script.

After activation, CC may place an internal-looking value in a managed card's trigger or key field so the script can preserve that card's identity across hooks. Leave that value in place.

Turning Point stage cards are a special creator-authored case. Use the exact `__CC_TP_...__` private key required by the Turning Point guide as the stage card's only trigger/key; do not add an ordinary scene trigger. v3.0 validates that key and directly supplies the current stage Entry through the Context script. Keeping ordinary triggers off every stage card also prevents the platform from independently activating an old or wrong stage. The stage card's creator-assigned type is preserved.

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
- `Name's State` for each activated NPC

`CC — Status` should end with the version declared near the top of the installed `Library` file. For the current package, that line is:

```text
Version: v3.0
```

`CC — Status` refreshes after a script hook. Immediately after editing a card it may still describe the prior state, so take one action before checking it. The Status card is a generated diagnostic; do not import it into the parent Scenario with completed NPC cards.

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

Use the integration order recommended by the other script. Test the combined setup in a duplicate Scenario before publishing it.

## Installation checklist

- [ ] The complete current `Library` file is in the Library script tab.
- [ ] Input calls and returns `CharacterContinuity("input", text)`.
- [ ] Context uses the supplied optimized `contextAppend` connector, or the documented replaceable `context` fallback exactly.
- [ ] Output calls and returns `CharacterContinuity("output", text)`.
- [ ] Scripts are enabled in the Scenario and account Gameplay settings.
- [ ] `Player's Identity` is resolved from Scenario answers, manually authored, or ready to be filled from its generated template.
- [ ] Every directly authored starting NPC has completed Outer and Inner cards.
- [ ] No State cards were created manually.
- [ ] A fresh Adventure was started after saving.
- [ ] `CC — Status` reports the same version as the installed Library's `VERSION` value.

## Quick installation troubleshooting

If State cards stay empty while a line beginning with `(CCO|` appears in the visible story, first replace all three connectors with the exact two-argument, returned-text forms above and confirm that Context begins with `// @cache-compatible`. On assessment turns, the model places one completed CCO record on the first nonblank output line and begins story prose on the next line; the Output connector strips accepted, unchanged, stale, rejected, malformed, and cut-off control forms before returning the story. If raw CCO still appears with the exact connectors installed, preserve the generated output and `CC — Debug` contents for diagnosis.

Seeing a populated private State block in AI Dungeon's **Context Viewer**, with `{` followed by `Name's current private State:` on the next line, is expected; that is how CC supplies private continuity for portrayal. A configured Turning Point may likewise add `CURRENT TP` and matching `TP STAGE ... BEGIN/END` controls around the current stage Entry. Under optimized context, older stage and assessment blocks can remain physically cached, but the newest CC portrayal and final current-response blocks select the current authority. None of these controls, and no raw `(CCO|...)` data, should appear in visible story.

For additional diagnosis, see [Troubleshooting](CREATOR-PLAYER-GUIDE.md#troubleshooting).

## AI Dungeon references

- [What are Scripts and how do you install them?](https://help.aidungeon.com/what-are-scripts-and-how-do-you-install-them)
- [Scripting API reference](https://help.aidungeon.com/scripting)
- [Story Cards guide](https://help.aidungeon.com/faq/story-cards)
- [Scenario guide](https://help.aidungeon.com/faq/what-are-scenarios)

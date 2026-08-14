# Character Continuity Stable

Character Continuity, or **CC**, is an AI Dungeon companion script for keeping predetermined NPCs recognizable, emotionally continuous, and capable of gradual change.

CC gives each registered NPC a stable creator-authored foundation, a temporary private State, directional Relationships and Views, usable Names, persistent Experiences, and optional creator-authored Turning Points. It supplies only scene-relevant continuity to the model and validates every automatic update before saving it.

The current package is **v2.00**.

The maintained release is **cache-compatible only**. Install the four canonical files named `Library`, `Input`, `Context`, and `Output`; the Context connector must begin with `// @cache-compatible` and use the `contextAppend` hook. Legacy non-cache Context installations are no longer supported.

## Documentation

- [Installation](INSTALLATION.md) — install the Library code, add the correct Input/Context/Output connectors, create starting cards, and verify the script.
- [Configuration](CONFIGURATION.md) — every `CC — Settings` option, relationship pace presets, and fixed safety limits.
- [Creator and Player Guide](CREATOR-PLAYER-GUIDE.md) — recommended workflows, complete six-card onboarding instructions, card formats, and troubleshooting.

## What CC tracks

CC separates stable character foundations from continuity that should change during play.

| Card | Main author | Purpose |
| --- | --- | --- |
| `Player's Identity` | Creator or player | Supplies the Player character's name and pronouns. |
| `Player's Names` | Player baseline, then CC | Records Player aliases that the Player explicitly supplies or accepts. |
| `Name's Outer` | Creator | Defines the NPC's identity, appearance, species, clothing style, pronouns, and starting Main/Side status. |
| `Name's Inner` | Creator | Defines the NPC's personality, mannerisms, wants, fears, mental wounds, and principles. |
| `Name's State` | CC | Holds the NPC's temporary Thought, Feeling, Goal, Tension, Situation, About target, and triggers. |
| `Name's Names` | Creator baseline, then CC | Tracks the canonical name and aliases that are Emerging, Active, Retired, or Rejected, including who may use them. |
| `Name's Relationships` | Creator baseline, then CC | Tracks the NPC's directional Role, Trust, Closeness, Boundaries, and Conflict. |
| `Name's Views` | Creator baseline, then CC | Tracks what the NPC Loves, Likes, feels Neutral toward, Dislikes, or Hates. |
| `Name's Experiences` | Creator baseline, then CC | Stores lasting events that remain important after temporary State expires. |
| `Name's Turning Points` | Creator definition, then CC progress | Tracks optional durable change through a stable ID, Direction, Progress, active stage card, private stage key, and optional definitive Breakthrough condition. |
| `Stage-card prefix — Stage` | Creator | Defines portrayal for one of the five Turning Point stages: Dormant, Emerging, Near Breakthrough, Achieved, or Integrating. CC preserves its creator-assigned Story Card type. |
| `CC — Settings` | Creator or player | Controls CC's editable runtime settings. |
| `CC — Active NPCs` | Creator or player | Holds the five stable `N1`–`N5` active-roster slots and starts onboarding. |
| `CC — Status` | CC | Separates the current hook/pass from the last input-turn action operation, and summarizes the roster, State, warnings, and version. |
| `CC — Debug` | CC | Provides detailed diagnostics when `Debug: true`. |

`Outer` and `Inner` remain the NPC's creator-authored foundation. CC may shorten an overlong copy when building model context, but story events do not rewrite those cards.

All character-owned Story Card titles use the possessive format. Wrapped continuity entries place the opening `{` and possessive header on separate lines. Current builds recognize legacy em-dash card titles and combined entry openings such as `{ Name's Outer:`, then attempt to migrate both in place without deleting or recreating the card. Turning Point router cards are deliberately excluded from ordinary managed-key/type migration so their creator-assigned keys and type remain intact; give those routers their exact possessive titles during setup.

## Temporary private State

State records what matters to an NPC **right now**:

- **Thought:** direct first-person private thought, which may remain wholly private
- **Feeling:** current emotion
- **Goal:** immediate intention, not a required next action
- **Tension:** unresolved internal or interpersonal pressure
- **Situation:** the concrete event currently shaping the State
- **About:** Self, the Player, or another authorized NPC
- **Triggers:** one to three supported emotional or relational causes, stored for State validation and derivation

State is temporary. Each field expires after the configured number of completed AI responses unless new evidence refreshes it.

An empty State is not filled merely because an NPC appears in a scene. CC supplies fresh completed evidence for assessment, and the model chooses a State record only when that evidence establishes a current change or confirmation. When a temporary private Thought or trigger is needed, the model may make a conservative character-specific inference from the completed event and the NPC's supplied Inner continuity, but it may not invent a new event, fact, commitment, or relationship change. If the returned Thought is unsuitable for direct private storage, CC can still commit the trigger-derived Feeling, Goal, Tension, About target, and Situation while reporting that the Thought was ignored.

When CC supplies a State block for a scene-relevant NPC, its fields are temporary pressures rather than a checklist: Thought may remain private, Feeling can color perception, Goal can be postponed or revised, and the NPC may choose what to express or conceal. Raw `Triggers` remain in the managed State card but are not repeated in the model-facing State block.

Seeing a block beginning with the following lines in the Context Viewer is normal:

```text
{
Snow's current private State:
Thought: ...
Feeling: ...
}
```

Seeing a raw `(CCO|...)` record in the visible story is not.

## Directional continuity

Relationships and Views belong to an owner and point toward a target.

`Snow → Player` and `Player → Snow` are not interchangeable. CC tracks NPC-owned continuity while reserving the Player character's speech, actions, thoughts, feelings, consent, commitments, memories, boundaries, and relationship decisions for the player. `Player's Names` can record aliases the Player explicitly supplies or accepts; repeated NPC usage alone cannot establish one.

Relationships can track:

- **Role**
- **Trust**
- **Closeness**
- **Boundaries**
- **Conflict**

Views can track:

- **Loves**
- **Likes**
- **Neutrals**
- **Dislikes**
- **Hates**

A View can also be buried when established forgetting is supported and recovered later.

## Names and aliases

CC keeps canonical identities stable while allowing story-supported changes in how characters are addressed.

An alias can be:

- **Emerging:** observed but not yet established
- **Active:** currently accepted
- **Retired:** used historically but no longer active
- **Rejected:** explicitly declined

Name permissions can be general or limited to the Player or a particular registered NPC. Three distinct uses can establish an Emerging alias.

## Experiences

A Situation remains temporary State until the same owner, About target, and event receive three distinct confirmations. CC can then promote it into a lasting Experience.

This prevents a passing moment from becoming permanent memory while allowing genuinely recurring or reinforced events to persist.

## Optional Turning Points

Turning Points let a creator define durable stages of an NPC's change without asking CC to invent the arc. They are optional and are not part of the six-card onboarding pack.

For each Turning Point, the creator writes one record in `Name's Turning Points` and five matching Story Cards:

- **Dormant:** progress 0–9
- **Emerging:** progress 10–19
- **Near Breakthrough:** progress 20–29
- **Achieved:** progress 30–39
- **Integrating:** progress 40–49

The stage cards use the record's `Stage cards` prefix followed by `— Dormant`, `— Emerging`, `— Near Breakthrough`, `— Achieved`, or `— Integrating`. The router may end with an optional, creator-owned `Breakthrough:` field defining the completed event required to establish Achieved; this is the recommended location in v2.00.

The creator owns the Turning Point's meaning, Direction, stable ID, optional Breakthrough condition, and all five stage-card entries. CC updates only `Progress`, `Active card`, and `Stage trigger`. Keep the router Story Card's own trigger/key blank so the platform does not natively expose its private Entry; the managed `Stage trigger:` line inside that Entry is a separate data field. CC validates the exact private key on the current stage card, then directly supplies that card's Entry in a tagged model-facing block; it does not expose the whole router or rely on native trigger chaining. The assessment task lists currently available Turning Point IDs, movements, relevant comparison-stage text, and any definitive condition so the model can choose a grounded update.

With optimized append-only context, an older stage block may remain physically visible in cached context. Each new CC portrayal block includes a `CURRENT TP` handle and revision selecting the only authoritative matching `TP STAGE` block. That newest revision supersedes older tagged or untagged stage passages, so only the selected current block contributes stage guidance. These controls are expected in the Context Viewer and are stripped if a model echoes them into output.

The default `Growth-only` setting processes Growth Turning Points; see the [Creator and Player Guide](CREATOR-PLAYER-GUIDE.md#turning-points) for setup and the [Configuration guide](CONFIGURATION.md) for mode controls.

## Active cast

CC provides five stable roster slots:

```text
N1:
N2:
N3:
N4:
N5:
```

These are active routing slots, not permanent identity numbers. A registered NPC keeps the same slot while present in the roster, and gaps are intentional.

Each NPC also has a **Main** or **Side** cast status:

- Main NPCs receive priority.
- Side NPCs can become Main after repeated interaction.
- Inactive Main NPCs can become Side.
- Automatic promotion and demotion can be disabled with `Dynamic cast: false`.

## Evidence-grounded updates

On an eligible turn, CC:

1. Detects registered NPCs relevant to the current scene.
2. Selects one fixed focus NPC.
3. Supplies that NPC's relevant foundations and continuity.
4. Supplies a bounded set of fresh completed raw evidence rows, without assigning their semantic operation meaning, plus the currently legal target and card mechanics.
5. Gives the model a `CC CURRENT ASSESSMENT — FINAL RESPONSE SUFFIX` contract.
6. Lets the model select the relevant supplied evidence IDs and provide one complete Name, State, Relationship, View, or Turning Point record—or a complete `K` assessment when managed continuity stays unchanged.
7. Checks record shape, supplied IDs, authorized targets, legal field values, current card identity, and transaction safety.
8. Saves at most one update when those checks succeed.
9. Removes the CCO record and any echoed CC controls before returning the story to the player.

The model interprets story meaning and supplies the operation details. JavaScript does not use regex scoring to preclassify the assessment evidence or choose an operation kind, target, evidence subset, Relationship field, View destination, or Turning Point movement. It enforces the protocol and managed-card mechanics, then performs verified transactional writes. Malformed, partial, stale, or unauthorized candidates are stripped or rejected without changing saved continuity. Complete punctuated story prose is preserved whenever possible.

The final assessment suffix is authoritative in optimized append-only context. A complete record may cite any unique subset of the supplied IDs while preserving their supplied order. A `K` record copies the complete supplied list and completes the review with continuity unchanged. A record that cites unavailable or reordered IDs is stale transport; CC strips it, preserves the story, adds no drain, and carries the assessment once. An omitted record likewise preserves the story and permits one bounded retry. A cut-off protocol fragment remains penalty-free and retryable.

Every eligible focused action advances that owner's opportunity clock, including a completed `K` assessment and a turn whose complete assessment packet cannot fit. Durable evidence age and drain decay therefore continue to advance instead of waiting for an operation to be selected.

Continuing without a new player input, including refreshing the Context Viewer after the real generation, can run a portrayal-only Continue pass. `CC — Status` therefore reports the **Current pass** separately from the **Last action task**, **selection**, **resolution**, and **mutation / drain**. The last-action rows preserve what happened on the actual input turn instead of being erased by the later preview.

## Retry and context protection

Retry restores the discarded generation's pre-turn snapshot, including:

- fixed assessment owner, supplied evidence, and legal target map
- active roster and stable slots
- temporary State
- Names, Relationships, Turning Points, Views, and Experiences
- operation meters and provenance

CC also uses a bounded context budget and selects scene-relevant continuity instead of loading every saved record every turn. The configured Continuity budget governs the complete CC packet, including portrayal and any assessment task. An assessment task has a fixed 1,200-token ceiling inside that same total budget. In cache-compatible mode CC can fit the focused portrayal in full, compact, or emergency tiers, evict optional projections to reserve a complete assessment packet, or defer the assessment when the complete task still cannot fit. The portrayal tier is therefore a budget-fitting strategy, not a separate hidden budget.

## Scope

CC is designed for **predetermined or deliberately onboarded NPCs**. It does not automatically register every name the model invents.

CC focuses on character continuity. General world lore, exact time/place/occasion tracking, inventory systems, and full plot-memory systems are outside this script's current scope.

## AI Dungeon references

- [What are Scripts and how do you install them?](https://help.aidungeon.com/what-are-scripts-and-how-do-you-install-them)
- [Scripting API reference](https://help.aidungeon.com/scripting)
- [Story Cards guide](https://help.aidungeon.com/faq/story-cards)
- [Scenario guide](https://help.aidungeon.com/faq/what-are-scenarios)

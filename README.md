# Character Continuity Stable v1.0.72

Character Continuity, or **CC**, is an AI Dungeon companion script for keeping predetermined NPCs recognizable, emotionally continuous, and capable of gradual change.

CC gives each registered NPC a stable creator-authored foundation, a temporary private State, directional Relationships and Views, usable Names, and persistent Experiences. It supplies only scene-relevant continuity to the model and validates every automatic update before saving it.

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
| `CC — Settings` | Creator or player | Controls CC's editable runtime settings. |
| `CC — Active NPCs` | Creator or player | Holds the five stable `N1`–`N5` active-roster slots and starts onboarding. |
| `CC — Status` | CC | Summarizes the current roster, State, latest operation, warnings, and version. |
| `CC — Debug` | CC | Provides detailed diagnostics when `Debug: true`. |

`Outer` and `Inner` remain the NPC's creator-authored foundation. CC may shorten an overlong copy when building model context, but story events do not rewrite those cards.

All character-owned Story Card titles use the possessive format. v1.0.72 recognizes older em-dash titles such as `Name — Outer` and attempts to migrate them in place without changing their entries.

## Temporary private State

State records what matters to an NPC **right now**:

- **Thought:** direct first-person private thought
- **Feeling:** current emotion
- **Goal:** immediate intention
- **Tension:** unresolved internal or interpersonal pressure
- **Situation:** the concrete event currently shaping the State
- **About:** Self, the Player, or another authorized NPC
- **Triggers:** one to three supported emotional or relational causes

State is temporary. Each field expires after the configured number of completed AI responses unless new evidence refreshes it.

CC deliberately supplies a populated State block to the model so the NPC can portray it through behavior and subtext. Seeing `{ Snow's current private State: ... }` in the Context Viewer is normal. Seeing a raw `(CCO|...)` record in the visible story is not.

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
4. Selects at most one Name, State, Relationship, or View operation.
5. Gives the model a narrow evidence packet and fixed owner/target map.
6. Validates the model's hidden continuity record.
7. Removes the record before returning the story to the player.
8. Saves the update only if every check succeeds.

Complete high-confidence fallback forms from smaller models can be normalized into a hidden candidate and passed through the same evidence, owner, target, and transaction validators. Malformed, partial, unsupported, or unauthorized candidates are stripped or rejected without changing saved continuity. Complete story prose is preserved whenever possible.

## Retry and context protection

Retry restores the discarded generation's pre-turn snapshot, including:

- fixed operation owner and target
- selected evidence
- active roster and stable slots
- temporary State
- Names, Relationships, Views, and Experiences
- operation meters and provenance

CC also uses a bounded context budget and selects scene-relevant continuity instead of loading every saved record every turn.

## Scope

CC is designed for **predetermined or deliberately onboarded NPCs**. It does not automatically register every name the model invents.

CC focuses on character continuity. General world lore, exact time/place/occasion tracking, inventory systems, and full plot-memory systems are outside this script's current scope.

## AI Dungeon references

- [What are Scripts and how do you install them?](https://help.aidungeon.com/what-are-scripts-and-how-do-you-install-them)
- [Scripting API reference](https://help.aidungeon.com/scripting)
- [Story Cards guide](https://help.aidungeon.com/faq/story-cards)
- [Scenario guide](https://help.aidungeon.com/faq/what-are-scenarios)

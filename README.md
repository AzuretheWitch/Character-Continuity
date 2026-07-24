# Character Continuity

Character Continuity helps AI Dungeon keep registered NPCs recognizable and consistent while still allowing them to change naturally through the story.

## Features

### Characters and cast

- **Creator-controlled foundations:** Each NPC uses an Outer card for identity and appearance, and an Inner card for personality, mannerisms, wants, fears, mental wounds, and principles. These creator-authored details remain the character's stable foundation.
- **Player identity and pronouns:** The script uses the Player's chosen name and pronouns. Common pronouns need only two forms, while custom pronouns can use all five.
- **NPC pronouns:** NPC pronouns are read from their Outer cards and used when the script prepares character-specific instructions.
- **Player-agency guidance:** The model is reminded that only the Player controls the Player character's speech, actions, thoughts, feelings, consent, commitments, memories, boundaries, names, and relationship choices.
- **Stable active roster:** Up to five NPCs can occupy the fixed `N1` to `N5` slots. A character keeps the same slot instead of being silently moved when the roster changes.
- **Confirmed NPC onboarding:** A new name placed in an empty roster slot receives Outer and Inner templates. The NPC becomes active only after both templates are complete.
- **Main and Side NPCs:** Main NPCs receive priority. Side NPCs can become Main through repeated interaction, while inactive Main NPCs can become Side. This automatic movement can be turned off to freeze the cast.

### Continuity tracking

- **Temporary private State:** The script tracks an NPC's current Thought, Feeling, Goal, Tension, Situation, what the State is About, and its triggers. State can concern Self, the Player, or another active NPC. It refreshes when supported by new events and expires when it becomes stale.
- **Names and aliases:** The Player and NPCs can gain, adopt, retire, reject, or reactivate aliases. The script can also record who is allowed to use a name while keeping the canonical identity stable.
- **Directional Relationships:** Each NPC can have a different relationship with the Player and with other NPCs. Relationship records can track Role, Trust, Closeness, Boundaries, and Conflict.
- **Adjustable relationship pace:** Relationship development uses evidence and can run at a Balanced default pace or creator-configured values. A single event cannot freely rewrite an entire relationship.
- **Directional Views:** NPCs can Love, Like, feel Neutral toward, Dislike, or Hate Self, the Player, another NPC, or another established subject. Forgotten Views can be buried and later recovered.
- **Persistent Experiences:** A temporary Situation that receives enough separate confirmation can become a lasting Experience. Only Experiences relevant to the current scene are supplied to the model.
- **Focused updates:** The script chooses one continuity task at a time—State, Name, Relationship, or View—so the instruction stays narrow and inexpensive.
- **Automatic continuity cards:** The script creates and maintains its own Settings, roster, Status, State, Names, Relationships, Views, and Experiences cards. For character setup, the creator supplies the Player identity and each NPC's Outer and Inner foundations.

### Reliability and context use

- **Strict evidence checks:** A continuity change must use the exact evidence and target authorized for that turn. Unsupported changes are rejected without altering the saved continuity.
- **Hidden control metadata:** The model's continuity record is validated and removed before the story reaches the player. Malformed or unauthorized records are stripped while complete story prose is preserved.
- **Retry protection:** Retry restores the original owner, target, evidence, roster position, operation choice, and saved records instead of counting the discarded response as new progress.
- **Relevant context only:** The script supplies the active characters and the continuity records most relevant to the current scene instead of loading every saved record every turn.
- **Bounded context cost:** Continuity uses a 2,000-token budget by default, with a protected 1,800-token minimum. An operation task is capped at 600 tokens and the complete operation turn at 1,400 tokens. Creator-authored Outer and Inner cards are limited to 2,000 characters each.
- **Automatic diagnostics:** `CC — Status` reports the active roster, latest operation, context use, warnings, and script version. Optional Debug cards provide more detail when troubleshooting.
- **Clean opening behavior:** The Scenario opening is preserved, while only the first automatic AI response immediately after that opening is hidden.

## Installation and activation

This guide explains how to install `Character-Continuity-Stable-v1.0.53.txt` in an AI Dungeon Scenario and confirm that it is working.

For the easiest first setup, install it in a new or otherwise clean Scenario. The script was release-tested in a fresh Adventure.

## Before you begin

You need:

- The file `Character-Continuity-Stable` library section, available in this repository.
- AI Dungeon open in a computer web browser
- A Scenario that you can edit

On a phone or tablet, use the website in desktop view if the script editor is not visible.

## Part 1: Open the script editor

1. Open AI Dungeon.
2. Create a new Scenario, or edit a Scenario you already own.
3. Open the Scenario's **Details**.
4. Scroll to **Scripting**.
5. Turn on **Scripts Enabled**.
6. Select **Edit Scripts**.

You should see four tabs:

- **Library**
- **Input**
- **Context**
- **Output**

The Library tab holds the main script. The other three tabs contain small connectors that tell AI Dungeon when to run it.

## Part 2: Install the main script

1. Open `Character-Continuity-Stable` library tab.
2. Select everything in the file and copy it.
3. In AI Dungeon, open the **Library** tab.
4. Remove any placeholder code from that tab.
5. Paste the full contents of the file into the **Library** tab.

Paste the full file only once. Do not paste it into the Input, Context, or Output tabs.

## Part 3: Add the three connectors

Remove any placeholder code from each tab, then paste the matching connector below.

### Input tab

```js
const modifier = (text) => {
  return { text: CharacterContinuity("input", text) }
}

modifier(text);
```

### Context tab

```js
const modifier = (text) => {
  return { text: CharacterContinuity("context", text) }
}

modifier(text);
```

### Output tab

```js
const modifier = (text) => {
  return { text: CharacterContinuity("output", text) }
}

modifier(text);
```

Save your changes in all four tabs.

> For a first installation, use these tabs only for Character Continuity. Combining it with another script requires the scripts to be merged; adding a second `modifier` block to the same tab will not do that safely.

## Part 4: Add the Player card

Return to the Scenario editor and create a Story Card.

Use:

- **Type:** Custom
- **Name:** `Player — Identity`
- **Entry:**

```text
Name: Azure
Pronouns: she/her
```

Replace `Azure` and `she/her` with the Player character's name and pronouns.

For common pronouns, `she/her`, `he/him`, and `they/them` are enough. If the character uses custom pronouns, enter all five forms in this order:

```text
Pronouns: subject/object/possessive-adjective/possessive-pronoun/reflexive
```

Example:

```text
Pronouns: ze/zir/zir/zirs/zirself
```

## Part 5: Add each starting NPC

Each NPC needs two Story Cards: one **Outer** card and one **Inner** card. Use the Custom Story Card type.

The two card names must use exactly the same NPC name.

### Example Outer card

- **Name:** `Snow — Outer`
- **Entry:**

```text
{ Snow's Outer:
Name, age, gender, pronouns: Snow, 31, woman, she/her
Race/Species: arctic fox demi-human
Physical attributes: silver-white hair, pale-grey eyes, white ears and tail
Clothing style: practical dark layers, an apron, and boots
Starting status: Main
}
```

### Example Inner card

- **Name:** `Snow — Inner`
- **Entry:**

```text
{ Snow's Inner:
Personality: composed, observant, pragmatic, patient, quietly caring
Mannerisms: stillness, dry understatement, precise gestures
Wants: keep the inn sustainable and safe
Fears: trusting someone who leaves again
Mental wounds: Azure's long absence
Principles: care is clearest when it is dependable
}
```

Change the example details to match your NPC.

Important:

- Keep the opening `{` and closing `}`.
- Use only one pair of braces around each card.
- Set `Starting status` to either `Main` or `Side`.
- Keep the same spelling and capitalization of the NPC's name in both card names and entries.
- Repeat this pair of cards for every NPC who should exist at the start.
- The script can keep up to five NPCs active at once.

You do not need to create any cards whose names begin with `CC —`. The script creates and manages those itself.

## Part 6: Activate the script

1. Save the Scenario.
2. Select **Play** to start a fresh Adventure from it.
3. Let the Scenario opening appear.
4. The first automatic AI response after the opening is intentionally hidden. A blank response at this exact point is normal.
5. Enter the Player's first real action and continue the story.

The script is enabled by default, so starting the Adventure activates it.

## Part 7: Check that it is working

After the Adventure initializes, open its Story Cards and look for:

- `CC — Settings`
- `CC — Active NPCs`
- `CC — Status`
- State cards for the registered characters

Open `CC — Settings` and make sure it begins with:

```text
Enabled: true
```

Open `CC — Status` and look at the final line. It should say:

```text
Version: Character Continuity Stable v1.0.53
```

Open `CC — Active NPCs`. Active characters should be listed in stable slots such as:

```text
N1: Snow
N2: Rowan
N3:
N4:
N5:
```

If those cards and the correct version line are present, the script is active.

## Adding another NPC later

To add an NPC after the Adventure has started:

1. Open `CC — Active NPCs`.
2. Put the NPC's exact name into an empty slot, such as `N3: Mira`.
3. Continue the Adventure once so the script can create `Mira — Outer` and `Mira — Inner`.
4. Fill in every field in both new cards.
5. Keep `Onboarding: Pending` in place while you are filling them in.
6. Continue the Adventure again.

When both cards are complete, the script confirms the NPC, removes the pending marker, and keeps that character in the same slot.

## Quick troubleshooting

### Nothing happens

- Make sure **Scripts Enabled** is on in the Scenario.
- In AI Dungeon, check **Account Settings → Gameplay** and make sure scripts are enabled there too.
- Make sure all four script tabs were saved.
- Start a fresh Adventure from the saved Scenario.

### A script error appears

- Make sure the entire `.txt` file is in the Library tab.
- Make sure the Library code was not also pasted into the other tabs.
- Make sure each of the other tabs ends with `modifier(text)`.
- Make sure `CharacterContinuity` is spelled exactly as shown in the connectors.

### An NPC does not appear

- Check that the card names are exactly `Name — Outer` and `Name — Inner`.
- Check that both names use the same spelling and capitalization.
- Check that every required field has a value.
- Check that both entries have their opening and closing braces.
- Check that `Starting status` is `Main` or `Side`.

### The first AI response is blank

That is expected once, immediately after the Scenario opening. Enter the Player's first action.

### You need more detail

Open `CC — Status` and read the **Warning** line. For extra diagnostics, change this line in `CC — Settings`:

```text
Debug: false
```

to:

```text
Debug: true
```

Continue the Adventure once, then inspect the `CC — Debug` card. Turn Debug off again when you are finished.

## Final checklist

- The full file is in **Library**.
- The Input, Context, and Output connectors are in the correct tabs.
- Scripts are enabled for both the Scenario and the account.
- `Player — Identity` exists.
- Every starting NPC has one Outer card and one Inner card.
- The Adventure was started fresh from the saved Scenario.
- `CC — Settings` says `Enabled: true`.
- `CC — Status` shows `Character Continuity Stable` plus the latest version(which is v1.0.59 right now).

These steps follow AI Dungeon's official [script installation guide](https://help.aidungeon.com/what-are-scripts-and-how-do-you-install-them), [scripting reference](https://help.aidungeon.com/scripting), [Story Cards guide](https://help.aidungeon.com/faq/story-cards), and [Scenario guide](https://help.aidungeon.com/faq/what-are-scenarios).

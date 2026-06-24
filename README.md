# JackPack 🎉

A single-phone, **pass-the-phone** party game platform built with **Expo + React Native + TypeScript**. Pick a mini-game, read the rules, and play. Ships with **Truth Bomb** fully playable.

## Run it

```bash
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with **Expo Go**.

> If you hit a dependency version warning, run `npx expo install --fix` to align native modules with your installed Expo SDK.

## Truth Bomb

Pass the phone around the circle. A question appears — read it out loud, answer, tap **NEXT**, pass it on. The timer never stops. When it hits **0**, whoever is holding the phone gets the **💣 Truth Bomb** (a dare). Repeat for the chosen number of rounds.

- Round length and number of rounds are configurable on the detail screen.
- 35 questions + 20 dares, shuffled with no repeats until the deck resets.
- Timer turns yellow ≤10s and red ≤5s, with a pulse for urgency.

## Project structure

```
App.tsx                      # Fonts, navigation, theme
src/
  types/game.ts              # Game + GameEngine interfaces
  theme/theme.ts             # Colors, fonts, spacing, radius tokens
  data/
    games.ts                 # Central list of all games
    truthBomb.ts             # Question + dare banks
  utils/deck.ts              # Shuffle + no-repeat draw hook
  hooks/useReducedMotion.ts  # Respects OS "Reduce Motion"
  navigation/types.ts        # Typed route params
  components/                # PrimaryButton, GameCard, CountdownDisplay, Stepper
  screens/                   # Home, GameDetail, GamePlay (generic host)
  games/
    registry.ts              # gameId -> engine component
    truthbomb/TruthBombEngine.tsx
```

## Adding a new game

1. Add a `Game` entry to `src/data/games.ts`.
2. Build an engine component that accepts `GameEngineProps` (`roundLength`, `totalRounds`, `onExit`).
3. Register it in `src/games/registry.ts`.

The home grid, detail screen, and generic `GamePlay` host pick it up automatically. Until an engine is registered, a game shows as **Coming soon** (see `would-you-rather` and `paranoia`).

## Design

Dark, Jackbox-inspired aesthetic — deep indigo surfaces with neon accents, **Fredoka** display + **Nunito** body fonts, big bold touch targets, and motion reserved for high-impact moments (timer urgency, the bomb reveal).

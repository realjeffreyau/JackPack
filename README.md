# JackPack

JackPack is a party-game collection built with Expo, React Native, and TypeScript. It supports pass-and-play games on one phone and optional multiplayer lobbies where each player uses their own device.

> **Project status:** public portfolio project. The single-phone games run locally; multiplayer is an optional prototype integration that requires a Supabase project.

## What is included

### Single Phone

Pass one phone around the group and keep the game moving:

- **Truth Bomb** — answer questions before the timer lands on someone.
- **Paranoia** — vote in secret, interrogate the room, and uncover who fooled whom.
- **The Mole** — solve trivia while one player quietly sabotages the group.
- **Outblurt** — describe a word without saying the banned words before the timer explodes.
- **Verdict** — argue a bizarre case while everyone protects a secret role.
- **Drink if You Smile** — act out prompts and test everyone’s poker face. Play responsibly.
- **Likely To** — debate who best fits each “most likely to” prompt.
- **Signal Sync** — one partner gives a clue and the other places the needle as close as possible to the hidden target.

**Would You Rather** is listed as a future game concept but is not playable yet.

### Multi Phone

Create or join a lobby with a short code. Multiplayer uses anonymous Supabase authentication, Postgres tables, and Realtime updates:

- **Witlash** — submit funny answers and vote on the best one.
- **The Outsider** — answer a shared prompt and find the player who received a different one.
- **Spymaster** — coordinate across two phones: one board and one private key.

Multiplayer is optional. Single-phone games work without any backend or network configuration.

## Run locally

```bash
npm ci
npm run start
```

Then press `i` for an iOS simulator, `a` for an Android emulator, or scan the QR code with Expo Go. To run the TypeScript and Metro export check:

```bash
npm run validate
```

`validate` runs the TypeScript compiler and exports an iOS bundle through Metro.

## Optional multiplayer setup

Copy `.env.example` to `.env` and add a Supabase project URL plus its public anonymous key:

```bash
cp .env.example .env
```

The app only reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Never put a Supabase service-role key or another private credential in this file or in source control. Run the SQL migrations in `supabase/migrations/` in order, then restart Expo with a cleared cache:

```bash
npx expo start -c
```

### Security boundary

The included Supabase migrations are intentionally permissive so the client-side multiplayer prototype can be evaluated quickly. They are **not production authorization policies**: authenticated players can update more game state than a production service should allow, and lobby-code lookup is not protected against enumeration. Use only synthetic/public session data with this prototype. Before a production deployment, move host-controlled writes behind server-side or security-definer checks, scope reads and writes to lobby membership, and add abuse/rate controls.

Single-phone games do not require Supabase and do not use this backend.

## Project structure

```text
App.tsx                     # Fonts, navigation, and app shell
src/data/games.ts           # Single-phone catalog
src/games/                  # Single-phone game engines
src/multiplayer/            # Supabase lobby and multiplayer sessions
src/screens/                # Navigation screens and phase routers
src/theme/theme.ts          # Shared colors, typography, spacing, and radius tokens
supabase/migrations/        # Optional multiplayer database schema
```

Adding a single-phone game normally means adding one catalog entry, one engine, and one registry entry. The generic navigation host picks it up automatically.

## Validation

Run the same check used by CI before opening a pull request:

```bash
npm run validate
```

This runs the strict TypeScript compiler and exports an iOS bundle through Metro. The generated validation directory is removed automatically and is ignored by Git.

## Known limitations

- Multiplayer depends on a separately configured Supabase project and the security boundary described above.
- There is no automated device or simulator test suite in this repository.
- The app is not configured here for App Store or Google Play submission; platform signing, identifiers, store assets, and release credentials remain deployment-specific.

## Project content

The source, prompts, UI copy, and game concepts in this repository were written for JackPack. The repository does not include third-party game assets, private API credentials, or proprietary source material. JackPack is an independent project and is not affiliated with any other party-game publisher.

## License

JackPack is released under the [MIT License](LICENSE).

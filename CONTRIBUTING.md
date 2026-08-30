# Contributing to JackPack

Thanks for helping improve JackPack. Keep changes focused on the party-game experience, preserve the existing privacy gates, and keep multiplayer changes within the security boundary documented in the [README](README.md).

## Local setup

Use Node.js 20 or newer and npm:

```bash
npm ci
npm run start
```

Single-phone games work without environment variables. To work on multiplayer, copy `.env.example` to `.env` and use a Supabase project containing the migrations in `supabase/migrations/`. Never commit `.env`, credentials, service-role keys, or private user data.

## Before opening a pull request

Run the repository validation command:

```bash
npm run validate
```

Keep pull requests focused, explain user-visible behavior, and update the README when setup or project limitations change. Add focused tests when introducing testable game logic; device and simulator behavior should be described when it cannot be automated.

## Commits

Use the repository owner's human Git identity and a concise Conventional Commit-style subject such as `feat:`, `fix:`, `docs:`, `test:`, or `chore:`. Do not include credentials, tokens, private URLs, or personal data in commits, logs, screenshots, or pull requests.

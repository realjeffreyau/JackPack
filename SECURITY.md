# Security policy

## Supported versions

| Version | Supported |
| --- | --- |
| `main` | Yes |
| Older snapshots | No |

## Reporting a vulnerability

Please report a suspected vulnerability through [GitHub's private security advisory form](https://github.com/realjeffreyau/JackPack/security/advisories/new). Do not include credentials, personal data, or an exploit in a public issue. Include the affected commit or file, reproduction steps, impact, and a suggested fix when possible.

## Scope and demo boundaries

JackPack is a public Expo/React Native showcase. It has no private server API and does not embed service-role credentials, signing keys, or other private secrets. The optional multiplayer client reads only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`; these are public client configuration values, not substitutes for authorization.

The SQL migrations in `supabase/migrations/` intentionally use permissive development row-level-security policies so the multiplayer demo can be evaluated easily. Each exception is marked `HARDEN LATER`. Do not connect this demo schema to private, production, or regulated data. A real deployment must use its own Supabase project and enforce server-side membership checks, state-transition authorization, input limits, rate limits, and appropriate data retention before it is exposed to untrusted users.

Never commit `.env`, a Supabase service-role key, database passwords, signing material, or user data. If a credential is exposed, revoke and rotate it immediately and open a private advisory.

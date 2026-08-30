# Security policy

## Reporting a vulnerability

Please report suspected vulnerabilities privately through [GitHub's security advisory form](https://github.com/realjeffreyau/JackPack/security/advisories/new). Do not open a public issue for an unpatched vulnerability. Include the affected area, reproduction steps or proof of concept, impact, and any suggested mitigation.

If private reporting is unavailable, contact the repository owner through a private channel before sharing details publicly.

## Scope

Reports are especially useful for authentication, lobby access, unauthorized game-state changes, data exposure, dependency vulnerabilities, or accidental disclosure of credentials. The optional Supabase policies are explicitly prototype-level; their documented limitations are not a production security guarantee.

## Secret handling

Never commit `.env`, Supabase service-role keys, database credentials, access tokens, private user data, or generated invite/session data. The Expo public anonymous key is not a substitute for server-side authorization. If a credential is exposed, revoke or rotate it immediately and review the affected history and deployment logs.

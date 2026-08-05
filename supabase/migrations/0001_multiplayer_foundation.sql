-- Jackpack — Multiplayer Foundation (Stage 1)
-- Run this once in the Supabase SQL editor for your project.
-- Tables: lobbies, lobby_players, game_sessions (placeholder for future games).
--
-- RLS in this migration is intentionally DEV-FRIENDLY (permissive UPDATE/DELETE
-- policies) to unblock Stage 1 client logic quickly. See the "HARDEN LATER"
-- comments below for what must be tightened before any public/production launch:
-- restrict UPDATE/DELETE to the row owner or lobby host, move kick/host-transfer
-- to a security-definer RPC, and protect lobby-code lookups from enumeration.

-- ---------------------------------------------------------------------------
-- lobbies
-- ---------------------------------------------------------------------------
create table if not exists public.lobbies (
  id uuid primary key default gen_random_uuid(),
  lobby_code text not null unique,
  host_auth_user_id uuid not null,
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'ended')),
  current_game text not null default 'witlash',
  game_session_id uuid null,
  settings jsonb not null default '{}'::jsonb,
  max_players int not null default 8,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '3 hours')
);

create index if not exists lobbies_lobby_code_idx on public.lobbies (lobby_code);

-- ---------------------------------------------------------------------------
-- lobby_players
-- ---------------------------------------------------------------------------
create table if not exists public.lobby_players (
  id uuid primary key default gen_random_uuid(),
  lobby_id uuid not null references public.lobbies (id) on delete cascade,
  auth_user_id uuid not null,
  display_name text not null,
  is_host boolean not null default false,
  is_connected boolean not null default true,
  status text not null default 'active' check (status in ('active', 'waiting', 'disconnected', 'kicked')),
  score int not null default 0,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (lobby_id, display_name),
  unique (lobby_id, auth_user_id)
);

create index if not exists lobby_players_lobby_id_idx on public.lobby_players (lobby_id);

-- ---------------------------------------------------------------------------
-- game_sessions (placeholder — no multiplayer game logic ships in Stage 1)
-- ---------------------------------------------------------------------------
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  lobby_id uuid not null references public.lobbies (id) on delete cascade,
  game_id text not null,
  phase text not null default 'lobby',
  round_number int not null default 0,
  total_rounds int not null default 0,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists game_sessions_lobby_id_idx on public.game_sessions (lobby_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists lobbies_set_updated_at on public.lobbies;
create trigger lobbies_set_updated_at
  before update on public.lobbies
  for each row execute function public.set_updated_at();

drop trigger if exists lobby_players_set_updated_at on public.lobby_players;
create trigger lobby_players_set_updated_at
  before update on public.lobby_players
  for each row execute function public.set_updated_at();

drop trigger if exists game_sessions_set_updated_at on public.game_sessions;
create trigger game_sessions_set_updated_at
  before update on public.game_sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Realtime — Enable in Supabase dashboard: Database > Replication > toggle tables on
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Row Level Security — Stage 1 dev-friendly policies
-- ---------------------------------------------------------------------------
alter table public.lobbies enable row level security;
alter table public.lobby_players enable row level security;
alter table public.game_sessions enable row level security;

-- lobbies: anyone authenticated (incl. anon-auth) can look up a lobby by code
-- before joining. INSERT only as your own host id. DELETE (close) host-only.
-- HARDEN LATER: restrict UPDATE to host_auth_user_id = auth.uid(), except for
-- the specific fields a non-host player is allowed to touch (none, today).
create policy "lobbies_select_all" on public.lobbies
  for select to authenticated using (true);

create policy "lobbies_insert_as_host" on public.lobbies
  for insert to authenticated with check (host_auth_user_id = auth.uid());

create policy "lobbies_update_dev" on public.lobbies
  for update to authenticated using (true);

create policy "lobbies_delete_host_only" on public.lobbies
  for delete to authenticated using (host_auth_user_id = auth.uid());

-- lobby_players: anyone can see the player list. INSERT only your own row.
-- HARDEN LATER: UPDATE/DELETE should be restricted to auth_user_id = auth.uid()
-- (self) for status/heartbeat writes; kicking or host-transfer should move to a
-- security-definer RPC that verifies the caller is the lobby host, so no client
-- can arbitrarily kick/promote other players or edit their score.
create policy "lobby_players_select_all" on public.lobby_players
  for select to authenticated using (true);

create policy "lobby_players_insert_self" on public.lobby_players
  for insert to authenticated with check (auth_user_id = auth.uid());

create policy "lobby_players_update_dev" on public.lobby_players
  for update to authenticated using (true);

create policy "lobby_players_delete_dev" on public.lobby_players
  for delete to authenticated using (true);

-- game_sessions: placeholder table, no game logic yet — fully open to authenticated.
-- HARDEN LATER: scope to lobby members once a real game reads/writes this table.
create policy "game_sessions_all_dev" on public.game_sessions
  for all to authenticated using (true) with check (true);

-- JackPack — Witlash (Stage 2)
-- Run this once in the Supabase SQL editor, after 0001_multiplayer_foundation.sql.
-- Adds the game-specific tables for Witlash (funny-answer voting game).
--
-- RLS is dev-permissive, matching 0001's pattern. HARDEN LATER notes are inline.
-- After running: Database > Replication > enable Realtime for the 4 new tables
-- (witlash_rounds, witlash_matchups, witlash_answers, witlash_votes).

-- ---------------------------------------------------------------------------
-- witlash_rounds — one row per round; answering is round-wide (all matchups
-- in a round answer simultaneously), so the answer timer lives here.
-- ---------------------------------------------------------------------------
create table if not exists public.witlash_rounds (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  round_number int not null,
  status text not null default 'answering' check (status in ('answering', 'voting', 'complete')),
  prompt_ids jsonb not null default '[]'::jsonb,
  answer_started_at timestamptz not null default now(),
  answer_ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, round_number)
);

create index if not exists witlash_rounds_session_id_idx on public.witlash_rounds (session_id);

-- ---------------------------------------------------------------------------
-- witlash_matchups — one row per prompt-pair. eligible_voter_count is frozen
-- at creation time (see plan: sweep bonus & "all voted" checks depend on this
-- being a fixed snapshot, not a live recount).
-- ---------------------------------------------------------------------------
create table if not exists public.witlash_matchups (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  round_number int not null,
  prompt_id text not null,
  prompt_text text not null,
  player_a_id uuid not null,
  player_b_id uuid not null,
  answer_a_id uuid null,
  answer_b_id uuid null,
  status text not null default 'pending' check (status in ('pending', 'voting', 'results', 'complete')),
  eligible_voter_count int not null default 0,
  display_order int not null default 0,
  voting_started_at timestamptz null,
  voting_ends_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists witlash_matchups_session_round_idx on public.witlash_matchups (session_id, round_number);

-- ---------------------------------------------------------------------------
-- witlash_answers — unique per (matchup, player) so edits before the answer
-- timer ends are upserts, never duplicate rows.
-- ---------------------------------------------------------------------------
create table if not exists public.witlash_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  round_number int not null,
  matchup_id uuid not null references public.witlash_matchups (id) on delete cascade,
  player_id uuid not null,
  answer_text text not null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (matchup_id, player_id)
);

create index if not exists witlash_answers_matchup_id_idx on public.witlash_answers (matchup_id);

-- ---------------------------------------------------------------------------
-- witlash_votes — unique per (matchup, voter) blocks double-voting at the DB
-- level, on top of the client-side eligibility gate.
-- ---------------------------------------------------------------------------
create table if not exists public.witlash_votes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  round_number int not null,
  matchup_id uuid not null references public.witlash_matchups (id) on delete cascade,
  voter_player_id uuid not null,
  answer_id uuid not null,
  submitted_at timestamptz not null default now(),
  unique (matchup_id, voter_player_id)
);

create index if not exists witlash_votes_matchup_id_idx on public.witlash_votes (matchup_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers (reuses public.set_updated_at() from 0001)
-- ---------------------------------------------------------------------------
drop trigger if exists witlash_rounds_set_updated_at on public.witlash_rounds;
create trigger witlash_rounds_set_updated_at
  before update on public.witlash_rounds
  for each row execute function public.set_updated_at();

drop trigger if exists witlash_matchups_set_updated_at on public.witlash_matchups;
create trigger witlash_matchups_set_updated_at
  before update on public.witlash_matchups
  for each row execute function public.set_updated_at();

drop trigger if exists witlash_answers_set_updated_at on public.witlash_answers;
create trigger witlash_answers_set_updated_at
  before update on public.witlash_answers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — Stage 2 dev-friendly policies
-- ---------------------------------------------------------------------------
alter table public.witlash_rounds enable row level security;
alter table public.witlash_matchups enable row level security;
alter table public.witlash_answers enable row level security;
alter table public.witlash_votes enable row level security;

-- witlash_rounds / witlash_matchups: fully open to authenticated for read, and
-- open for write since only the host client issues these writes today (no
-- server-side host check exists yet).
-- HARDEN LATER: writes should move to a security-definer RPC that verifies the
-- caller is the session's lobby host, per the same pattern noted in 0001 for
-- kick/host-transfer.
create policy "witlash_rounds_all_dev" on public.witlash_rounds
  for all to authenticated using (true) with check (true);

create policy "witlash_matchups_all_dev" on public.witlash_matchups
  for all to authenticated using (true) with check (true);

-- witlash_answers: anyone in the session can read (needed for the host to
-- compute results and lock rounds); insert/update should be self-only.
-- HARDEN LATER: restrict update to player_id = auth.uid()'s associated
-- lobby_players row, and restrict select of *other players'* answers until
-- matchup.status is 'voting' or later (true anonymity requires a view/RPC —
-- currently anonymity during voting is enforced client-side only).
create policy "witlash_answers_select_all" on public.witlash_answers
  for select to authenticated using (true);

create policy "witlash_answers_upsert_dev" on public.witlash_answers
  for insert to authenticated with check (true);

create policy "witlash_answers_update_dev" on public.witlash_answers
  for update to authenticated using (true);

-- witlash_votes: anyone can read (needed for tallying + reveal); insert
-- open — the (matchup_id, voter_player_id) unique constraint is the real
-- guard against double-voting.
-- HARDEN LATER: restrict insert to voter_player_id matching the caller's own
-- lobby_players row, and reject inserts where voter_player_id is one of the
-- matchup's two answerers (currently enforced client-side only).
create policy "witlash_votes_select_all" on public.witlash_votes
  for select to authenticated using (true);

create policy "witlash_votes_insert_dev" on public.witlash_votes
  for insert to authenticated with check (true);

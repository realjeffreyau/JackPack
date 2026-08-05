-- JackPack — The Outsider (Stage 3)
-- Run this once in the Supabase SQL editor, after 0001 and 0002.
-- Adds ootl_votes. Everything else (roles, topic, speaking order, phase)
-- lives in game_sessions.state — see src/multiplayer/ootl/types.ts.
--
-- After running: Database > Replication > enable Realtime for ootl_votes.

create table if not exists public.ootl_votes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  voter_player_id uuid not null,
  accused_player_id uuid not null,
  submitted_at timestamptz not null default now(),
  unique (session_id, voter_player_id)
);

create index if not exists ootl_votes_session_id_idx on public.ootl_votes (session_id);

alter table public.ootl_votes enable row level security;

-- Anyone can read (needed for host tallying + live vote-count display).
-- Insert open — the (session_id, voter_player_id) unique constraint is the
-- real guard against double-voting.
-- HARDEN LATER: restrict insert to voter_player_id matching the caller's own
-- lobby_players row, and reject inserts where accused_player_id === voter's
-- own player id (self-vote block is currently client-side only).
create policy "ootl_votes_select_all" on public.ootl_votes
  for select to authenticated using (true);

create policy "ootl_votes_insert_dev" on public.ootl_votes
  for insert to authenticated with check (true);

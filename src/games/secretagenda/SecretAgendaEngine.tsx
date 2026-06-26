import React, { useCallback, useState } from 'react';
import type { GameEngineProps } from '../../types/game';
import { colors } from '../../theme/theme';
import { PROMPTS, type RoundsMode } from '../../data/secretAgenda';
import { useDeck } from '../../utils/deck';
import { generateAgendas, scoreRound } from './agenda';
import type { Agenda, AgendaResult, Player } from './types';
import { RoundsSelect } from './components/RoundsSelect';
import { PlayerSetup } from './components/PlayerSetup';
import { RoundIntro } from './components/RoundIntro';
import { AgendaDeal } from './components/AgendaDeal';
import { AllAssigned } from './components/AllAssigned';
import { PromptScreen } from './components/PromptScreen';
import { VoteEntry } from './components/VoteEntry';
import { RoundReveal } from './components/RoundReveal';
import { ScoreboardModal } from './components/ScoreboardModal';
import { FinalResults } from './components/FinalResults';
import { EditPlayersModal } from './components/EditPlayersModal';

type Phase =
  | 'rounds_select'
  | 'player_setup'
  | 'round_intro'
  | 'dealing'
  | 'all_assigned'
  | 'prompt'
  | 'vote'
  | 'reveal'
  | 'final';

const ACCENT = colors.cyan;

/** Phases where agendas exist for the current round and must be regenerated if the roster changes. */
const ROSTER_LOCKED: Phase[] = ['round_intro', 'dealing', 'all_assigned', 'prompt', 'vote'];
/** Subset where players have already started seeing agendas — saving needs a warning. */
const NEEDS_WARNING: Phase[] = ['dealing', 'all_assigned', 'prompt', 'vote'];

const zeroVotes = (players: Player[]): Record<string, number> =>
  Object.fromEntries(players.map((p) => [p.id, 0]));

export function SecretAgendaEngine({ onExit }: GameEngineProps) {
  const [phase, setPhase] = useState<Phase>('rounds_select');
  const [totalRounds, setTotalRounds] = useState<RoundsMode>(5);
  const [players, setPlayers] = useState<Player[]>([]);
  const [round, setRound] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [dealIndex, setDealIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [voteIndex, setVoteIndex] = useState(0);
  const [results, setResults] = useState<AgendaResult[]>([]);
  const [scored, setScored] = useState(false);
  const [scoreboardOpen, setScoreboardOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const drawPrompt = useDeck(PROMPTS);

  // ── Round lifecycle ──────────────────────────────────────────────────────────

  const startRound = useCallback(
    (roundNum: number, roster: Player[]) => {
      setRound(roundNum);
      setPrompt(drawPrompt());
      setAgendas(generateAgendas(roster));
      setVotes(zeroVotes(roster));
      setResults([]);
      setScored(false);
      setDealIndex(0);
      setVoteIndex(0);
      setPhase('round_intro');
    },
    [drawPrompt],
  );

  const handleRoundsDone = useCallback((r: RoundsMode) => {
    setTotalRounds(r);
    setPhase('player_setup');
  }, []);

  const handlePlayersDone = useCallback(
    (roster: Player[]) => {
      setPlayers(roster);
      startRound(1, roster);
    },
    [startRound],
  );

  // ── Dealing ──────────────────────────────────────────────────────────────────

  const handleDeal = useCallback(() => {
    setDealIndex(0);
    setPhase('dealing');
  }, []);

  const handlePass = useCallback(() => {
    setDealIndex((i) => {
      if (i < players.length - 1) return i + 1;
      setPhase('all_assigned');
      return i;
    });
  }, [players.length]);

  // ── Voting + reveal ──────────────────────────────────────────────────────────

  const handleStartVoting = useCallback(() => {
    setVotes(zeroVotes(players));
    setVoteIndex(0);
    setPhase('vote');
  }, [players]);

  const handleVoteCast = useCallback(
    (targetId: string) => {
      const newVotes = { ...votes, [targetId]: (votes[targetId] ?? 0) + 1 };
      setVotes(newVotes);
      if (voteIndex >= players.length - 1) {
        if (!scored) {
          const r = scoreRound(agendas, players, newVotes);
          setResults(r);
          const winners = new Set(r.filter((x) => x.success).map((x) => x.ownerId));
          setPlayers((prev) => prev.map((p) => (winners.has(p.id) ? { ...p, points: p.points + 1 } : p)));
          setScored(true);
        }
        setPhase('reveal');
      } else {
        setVoteIndex((i) => i + 1);
      }
    },
    [votes, voteIndex, players, agendas, scored],
  );

  const isLastRound = totalRounds !== 0 && round >= totalRounds;

  const handleRevealPrimary = useCallback(() => {
    if (isLastRound) {
      setPhase('final');
    } else {
      startRound(round + 1, players);
    }
  }, [isLastRound, round, players, startRound]);

  const endGame = useCallback(() => setPhase('final'), []);

  // ── Final screen actions ─────────────────────────────────────────────────────

  const handlePlayAgain = useCallback(() => {
    const reset = players.map((p) => ({ ...p, points: 0 }));
    setPlayers(reset);
    startRound(1, reset);
  }, [players, startRound]);

  const handleNewGame = useCallback(() => setPhase('rounds_select'), []);

  // ── Overlays ─────────────────────────────────────────────────────────────────

  const openScoreboard = useCallback(() => setScoreboardOpen(true), []);
  const openEdit = useCallback(() => {
    setScoreboardOpen(false);
    setEditOpen(true);
  }, []);
  const resetScores = useCallback(() => {
    setPlayers((prev) => prev.map((p) => ({ ...p, points: 0 })));
  }, []);

  const handleEditSave = useCallback(
    (next: Player[]) => {
      setEditOpen(false);
      setPlayers(next);
      // If agendas are tied to the current round, restart it so they can't
      // reference removed/renamed players. No points for the abandoned round.
      if (ROSTER_LOCKED.includes(phase)) startRound(round, next);
    },
    [phase, round, startRound],
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  let screen: React.ReactNode = null;

  if (phase === 'rounds_select') {
    screen = <RoundsSelect accent={ACCENT} initial={totalRounds} onDone={handleRoundsDone} onExit={onExit} />;
  } else if (phase === 'player_setup') {
    screen = <PlayerSetup accent={ACCENT} onDone={handlePlayersDone} onBack={() => setPhase('rounds_select')} />;
  } else if (phase === 'round_intro') {
    screen = <RoundIntro accent={ACCENT} round={round} totalRounds={totalRounds} onDeal={handleDeal} />;
  } else if (phase === 'dealing') {
    const player = players[dealIndex];
    const agenda = agendas.find((a) => a.ownerId === player.id);
    screen = (
      <AgendaDeal
        accent={ACCENT}
        playerName={player.name}
        agendaText={agenda?.text ?? ''}
        index={dealIndex}
        total={players.length}
        isLast={dealIndex === players.length - 1}
        onPass={handlePass}
      />
    );
  } else if (phase === 'all_assigned') {
    screen = <AllAssigned accent={ACCENT} onShowPrompt={() => setPhase('prompt')} />;
  } else if (phase === 'prompt') {
    screen = (
      <PromptScreen
        accent={ACCENT}
        round={round}
        totalRounds={totalRounds}
        prompt={prompt}
        onVote={handleStartVoting}
        onScoreboard={openScoreboard}
        onEditPlayers={openEdit}
        onEndGame={endGame}
      />
    );
  } else if (phase === 'vote') {
    screen = <VoteEntry accent={ACCENT} players={players} voteIndex={voteIndex} prompt={prompt} onVoteCast={handleVoteCast} />;
  } else if (phase === 'reveal') {
    screen = (
      <RoundReveal
        accent={ACCENT}
        players={players}
        votes={votes}
        results={results}
        isLastRound={isLastRound}
        onPrimary={handleRevealPrimary}
        onScoreboard={openScoreboard}
        onEndGame={endGame}
      />
    );
  } else if (phase === 'final') {
    screen = (
      <FinalResults
        accent={ACCENT}
        players={players}
        onPlayAgain={handlePlayAgain}
        onEditPlayers={openEdit}
        onNewGame={handleNewGame}
        onExit={onExit}
      />
    );
  }

  return (
    <>
      {screen}
      <ScoreboardModal
        visible={scoreboardOpen}
        accent={ACCENT}
        players={players}
        onClose={() => setScoreboardOpen(false)}
        onEditPlayers={openEdit}
        onResetScores={resetScores}
        onEndGame={() => {
          setScoreboardOpen(false);
          endGame();
        }}
      />
      <EditPlayersModal
        visible={editOpen}
        accent={ACCENT}
        players={players}
        restartWarning={NEEDS_WARNING.includes(phase)}
        onSave={handleEditSave}
        onCancel={() => setEditOpen(false)}
      />
    </>
  );
}

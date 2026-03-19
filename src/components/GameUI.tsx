import type { Location, GamePhase } from '../types';

interface GameUIProps {
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  totalScore: number;
  currentLocation: Location;
  pendingGuess: { lat: number; lng: number } | null;
  onConfirmGuess: () => void;
}

export function GameUI({
  phase,
  currentRound,
  totalRounds,
  totalScore,
  currentLocation,
  pendingGuess,
  onConfirmGuess,
}: GameUIProps) {
  if (phase === 'game_over') return null;

  return (
    <>
      <div className="top-bar">
        <span className="round-label">Round {currentRound + 1} / {totalRounds}</span>
        <div className="divider" />
        <span className="score-label">Score</span>
        <span className="score-value">{totalScore}</span>
      </div>

      {phase === 'guessing' && (
        <div className="clue-card">
          <p className="clue-text">{currentLocation.clue}</p>
          <button
            className="confirm-btn"
            disabled={!pendingGuess}
            onClick={onConfirmGuess}
          >
            Confirm Guess
          </button>
        </div>
      )}
    </>
  );
}

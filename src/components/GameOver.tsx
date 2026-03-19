import type { RoundResult } from '../types';

interface GameOverProps {
  rounds: RoundResult[];
  totalScore: number;
  onRestart: () => void;
}

export function GameOver({ rounds, totalScore, onRestart }: GameOverProps) {
  return (
    <div className="game-over-overlay">
      <div className="game-over-card">
        <h1>Game Over</h1>
        <div className="total-score">{totalScore}</div>
        <div className="total-label">out of {rounds.length * 100} points</div>
        <ul className="rounds-list">
          {rounds.map((r, i) => (
            <li key={r.location.id}>
              <span className="loc-name">{i + 1}. {r.location.name}</span>
              <span className="dist-info">
                {r.distanceKm < 1
                  ? `${Math.round(r.distanceKm * 1000)} m`
                  : r.distanceKm < 100
                  ? `${r.distanceKm.toFixed(1)} km`
                  : `${Math.round(r.distanceKm).toLocaleString()} km`}
              </span>
              <span className="round-score">+{r.score}</span>
            </li>
          ))}
        </ul>
        <button className="play-again-btn" onClick={onRestart}>
          Play Again
        </button>
      </div>
    </div>
  );
}

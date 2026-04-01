import { useState, useEffect } from 'react';
import type { RoundResult } from '../types';

function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

interface GameOverProps {
  rounds: RoundResult[];
  totalScore: number;
}

export function GameOver({ rounds, totalScore }: GameOverProps) {
  const [secondsLeft, setSecondsLeft] = useState(getSecondsUntilMidnight);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft(getSecondsUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  function handleShare() {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const lines = [
      `Will Map — ${today}`,
      `Score: ${totalScore}/${rounds.length * 100}`,
      '',
      ...rounds.map(r => {
        const dist = r.distanceKm < 1
          ? `${Math.round(r.distanceKm * 1000)}m`
          : r.distanceKm < 100
          ? `${r.distanceKm.toFixed(1)}km`
          : `${Math.round(r.distanceKm).toLocaleString()}km`;
        return `${dist} (+${r.score})`;
      }),
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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
        <div className="next-game">
          <div className="next-game-label">New places in</div>
          <div className="next-game-countdown">{formatCountdown(secondsLeft)}</div>
        </div>
        <button className="share-btn" onClick={handleShare}>
          {copied ? 'Copied!' : 'Share Score'}
        </button>
      </div>
    </div>
  );
}

import type { RoundResult as RoundResultType } from '../types';

interface RoundResultProps {
  result: RoundResultType;
  currentRound: number;
  totalRounds: number;
  onNext: () => void;
}

export function RoundResult({ result, currentRound, totalRounds, onNext }: RoundResultProps) {
  const isLastRound = currentRound + 1 >= totalRounds;
  const distanceStr =
    result.distanceKm < 1
      ? `${Math.round(result.distanceKm * 1000)} m`
      : result.distanceKm < 100
      ? `${result.distanceKm.toFixed(1)} km`
      : `${Math.round(result.distanceKm).toLocaleString()} km`;

  return (
    <div className="result-overlay">
      <h2>
        It was <span className="location-name">{result.location.name}</span>
      </h2>
      <div className="distance">{distanceStr}</div>
      <div className="distance-label">from the correct location</div>
      <div className="score-badge">+{result.score} pts</div>
      {result.location.funFact && (
        <p className="fun-fact">{result.location.funFact}</p>
      )}
      <button className="next-btn" onClick={onNext}>
        {isLastRound ? 'See Results' : 'Next Round'}
      </button>
    </div>
  );
}

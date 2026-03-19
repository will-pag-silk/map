import { Globe } from './components/Globe';
import { GameUI } from './components/GameUI';
import { RoundResult } from './components/RoundResult';
import { GameOver } from './components/GameOver';
import { useGame } from './hooks/useGame';
import './styles/index.css';

export default function App() {
  const {
    state,
    currentLocation,
    currentRoundResult,
    totalScore,
    setGuess,
    confirmGuess,
    nextRound,
    restartGame,
  } = useGame();

  return (
    <>
      <Globe
        phase={state.phase}
        pendingGuess={state.pendingGuess}
        currentRoundResult={currentRoundResult}
        onGuessPlaced={setGuess}
      />
      <GameUI
        phase={state.phase}
        currentRound={state.currentRound}
        totalRounds={state.totalRounds}
        totalScore={totalScore}
        currentLocation={currentLocation}
        pendingGuess={state.pendingGuess}
        onConfirmGuess={confirmGuess}
      />
      {state.phase === 'round_result' && currentRoundResult && (
        <RoundResult
          result={currentRoundResult}
          currentRound={state.currentRound}
          totalRounds={state.totalRounds}
          onNext={nextRound}
        />
      )}
      {state.phase === 'game_over' && (
        <GameOver
          rounds={state.rounds}
          totalScore={totalScore}
          onRestart={restartGame}
        />
      )}
    </>
  );
}

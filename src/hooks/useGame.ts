import { useState, useCallback } from 'react';
import type { GameState, GamePhase, RoundResult } from '../types';
import locationsData from '../data/locations.json';
import { haversineDistance, calculateScore } from '../utils/scoring';
import type { Location } from '../types';

const ALL_LOCATIONS = locationsData as Location[];
const TOTAL_ROUNDS = 5;

function getDailySeed(): number {
  const d = new Date();
  const str = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return parseInt(str, 10);
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  const rand = () => {
    s = Math.imul(1664525, s) + 1013904223 | 0;
    return (s >>> 0) / 0x100000000;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initialState(): GameState {
  return {
    phase: 'guessing' as GamePhase,
    currentRound: 0,
    totalRounds: TOTAL_ROUNDS,
    locations: seededShuffle(ALL_LOCATIONS, getDailySeed()).slice(0, TOTAL_ROUNDS),
    rounds: [],
    pendingGuess: null,
  };
}

export function useGame() {
  const [state, setState] = useState<GameState>(initialState);

  const currentLocation = state.locations[state.currentRound];
  const currentRoundResult = state.rounds[state.rounds.length - 1] ?? null;
  const totalScore = state.rounds.reduce((sum, r) => sum + r.score, 0);

  const setGuess = useCallback((lat: number, lng: number) => {
    setState(s => ({ ...s, pendingGuess: { lat, lng } }));
  }, []);

  const confirmGuess = useCallback(() => {
    setState(s => {
      if (!s.pendingGuess || s.phase !== 'guessing') return s;
      const location = s.locations[s.currentRound];
      const distanceKm = haversineDistance(
        s.pendingGuess.lat, s.pendingGuess.lng,
        location.lat, location.lng
      );
      const score = calculateScore(distanceKm);
      const result: RoundResult = {
        location,
        guessLat: s.pendingGuess.lat,
        guessLng: s.pendingGuess.lng,
        distanceKm,
        score,
      };
      return { ...s, phase: 'round_result', rounds: [...s.rounds, result] };
    });
  }, []);

  const nextRound = useCallback(() => {
    setState(s => {
      const nextRoundIdx = s.currentRound + 1;
      if (nextRoundIdx >= s.totalRounds) {
        return { ...s, phase: 'game_over', pendingGuess: null };
      }
      return { ...s, phase: 'guessing', currentRound: nextRoundIdx, pendingGuess: null };
    });
  }, []);

  const restartGame = useCallback(() => {
    setState(initialState());
  }, []);

  return {
    state,
    currentLocation,
    currentRoundResult,
    totalScore,
    setGuess,
    confirmGuess,
    nextRound,
    restartGame,
  };
}

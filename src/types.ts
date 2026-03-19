export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  clue: string;
  funFact?: string;
  category: 'city' | 'landmark' | 'natural';
}

export interface RoundResult {
  location: Location;
  guessLat: number;
  guessLng: number;
  distanceKm: number;
  score: number;
}

export type GamePhase = 'guessing' | 'round_result' | 'game_over';

export interface GameState {
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  locations: Location[];
  rounds: RoundResult[];
  pendingGuess: { lat: number; lng: number } | null;
}

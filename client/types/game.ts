export type GameType = "mindmaze" | "brainrush" | "crazydraws";

export interface Player {
  id: string;
  username: string;
  score: number;
  ready: boolean;
  isHost?: boolean;
}

export interface GameRoom {
  roomCode: string;
  gameType: GameType;
  players: Player[];
  maxPlayers: number;
  status: "waiting" | "ready" | "playing" | "finished";
  createdAt: number;
}

export interface WebSocketMessage {
  type: string;
  roomCode?: string;
  playerId?: string;
  data?: any;
  timestamp?: number;
}

export interface MindMazeState {
  currentEnigma: number;
  totalEnigmas: number;
  timeRemaining: number;
  totalTime: number;
  collectiveScore: number;
  hints: number;
  maxHints: number;
}

export interface BrainRushState {
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number;
  playerScores: Record<string, number>;
  category?: string;
  mode?: "classic" | "sprint" | "duel" | "team";
}

export interface CrazyDrawsState {
  currentRound: number;
  totalRounds: number;
  currentDrawer?: string;
  drawer?: string;
  currentWord?: string;
  constraint?: string;
  timeRemaining: number;
  roundScore: number;
  roundResponses: Record<string, boolean>;
}

// Enigma types for MindMaze
export interface Enigma {
  id: number;
  type: "reconstruction" | "sequence" | "labyrinth" | "memory" | "math";
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  maxPoints: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  answers: string[];
  correct: number;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface DrawingConstraint {
  id: string;
  name: string;
  description: string;
  type:
    | "eyes-closed"
    | "inverted"
    | "mirror"
    | "no-lift"
    | "shapes"
    | "dots"
    | "delay";
}

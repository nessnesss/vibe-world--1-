import { useEffect, useState, useCallback } from "react";
import { useGameWebSocket } from "@/hooks/useGameWebSocket";
import { Player, Enigma, MindMazeState } from "@/types/game";
import { PlayerList } from "@/components/game/PlayerList";
import { Chat, ChatMessage } from "@/components/game/Chat";
import { Timer } from "@/components/game/Timer";
import { ScoreBoard } from "@/components/game/ScoreBoard";

const generateId = () => Math.random().toString(36).substring(2, 11);

interface MindMazeGameProps {
  roomCode: string;
  playerId: string;
  username: string;
  onLeaveGame: () => void;
}

// Enigma pool - 10 enigmas as per spec
const ENIGMAS: Enigma[] = [
  {
    id: 1,
    type: "reconstruction",
    title: "Puzzle Pieces",
    description: "Reconstruct the image from 25 pieces",
    difficulty: "easy",
    timeLimit: 90,
    maxPoints: 100,
  },
  {
    id: 2,
    type: "sequence",
    title: "Number Sequence",
    description: "Complete the number sequence: 2, 4, 6, ?, 10",
    difficulty: "easy",
    timeLimit: 90,
    maxPoints: 100,
  },
  {
    id: 3,
    type: "memory",
    title: "Memory Challenge",
    description: "Remember and reproduce a sequence of 5 colors",
    difficulty: "medium",
    timeLimit: 120,
    maxPoints: 150,
  },
  {
    id: 4,
    type: "labyrinth",
    title: "Collaborative Maze",
    description: "Navigate through the maze - each player controls a section",
    difficulty: "medium",
    timeLimit: 120,
    maxPoints: 150,
  },
  {
    id: 5,
    type: "math",
    title: "Math Puzzle",
    description: "Solve: 15 + 8 × 2 - 10 = ?",
    difficulty: "medium",
    timeLimit: 120,
    maxPoints: 150,
  },
  {
    id: 6,
    type: "sequence",
    title: "Pattern Recognition",
    description: "Identify the pattern: ■ ● ■ ● ■ ?",
    difficulty: "medium",
    timeLimit: 120,
    maxPoints: 200,
  },
  {
    id: 7,
    type: "reconstruction",
    title: "Complex Puzzle",
    description: "Reconstruct the image from 40 pieces",
    difficulty: "hard",
    timeLimit: 180,
    maxPoints: 250,
  },
  {
    id: 8,
    type: "memory",
    title: "Advanced Memory",
    description: "Remember and reproduce a sequence of 8 colors",
    difficulty: "hard",
    timeLimit: 180,
    maxPoints: 300,
  },
  {
    id: 9,
    type: "math",
    title: "Complex Calculation",
    description: "Solve: (25 + 15) × 2 - (30 ÷ 2) = ?",
    difficulty: "hard",
    timeLimit: 180,
    maxPoints: 350,
  },
  {
    id: 10,
    type: "labyrinth",
    title: "Ultimate Maze",
    description: "Navigate the ultimate collaborative maze",
    difficulty: "hard",
    timeLimit: 180,
    maxPoints: 500,
  },
];

export function MindMazeGame({
  roomCode,
  playerId,
  username,
  onLeaveGame,
}: MindMazeGameProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentEnigmaIndex, setCurrentEnigmaIndex] = useState(0);
  const [gameState, setGameState] = useState<MindMazeState>({
    currentEnigma: 1,
    totalEnigmas: 10,
    timeRemaining: 900, // 15 minutes total
    totalTime: 900,
    collectiveScore: 0,
    hints: 0,
    maxHints: 3,
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  const { isConnected, connectionError, sendMessage } = useGameWebSocket({
    roomCode,
    playerId,
    onMessage: (message) => {
      if (message.type === "player-joined" || message.type === "player-left") {
        // Update player list
        if (message.data?.players) {
          setPlayers(
            message.data.players.map((p: any) => ({
              ...p,
              score: 0,
              ready: false,
            }))
          );
        }
      } else if (message.type === "game-start") {
        setGameStarted(true);
      } else if (message.type === "chat-message") {
        setChatMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            playerId: message.data?.playerId || "",
            playerName: message.data?.playerName || "",
            message: message.data?.message || "",
            timestamp: message.timestamp || Date.now(),
          },
        ]);
      }
    },
  });

  const currentEnigma = ENIGMAS[currentEnigmaIndex];
  const timePerEnigma = currentEnigma.timeLimit;

  useEffect(() => {
    if (!gameStarted || gameFinished || gameState.timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameFinished]);

  useEffect(() => {
    if (gameState.timeRemaining <= 0 && gameStarted && !gameFinished) {
      setGameFinished(true);
      sendMessage({
        type: "game-finished",
        data: {
          finalScore: gameState.collectiveScore,
        },
      });
    }
  }, [gameState.timeRemaining, gameStarted, gameFinished]);

  const handleSolveEnigma = useCallback((points: number) => {
    setGameState((prev) => ({
      ...prev,
      collectiveScore: prev.collectiveScore + points,
      currentEnigma: prev.currentEnigma + 1,
    }));

    if (currentEnigmaIndex < ENIGMAS.length - 1) {
      setCurrentEnigmaIndex((prev) => prev + 1);
    }

    sendMessage({
      type: "enigma-solved",
      data: {
        enigmaId: currentEnigma.id,
        points: points,
        newScore: gameState.collectiveScore + points,
      },
    });
  }, [currentEnigma.id, gameState.collectiveScore]);

  const handleRequestHint = useCallback(() => {
    if (gameState.hints < gameState.maxHints) {
      setGameState((prev) => ({
        ...prev,
        hints: prev.hints + 1,
        collectiveScore: Math.max(0, prev.collectiveScore - 50),
      }));

      sendMessage({
        type: "hint-requested",
        data: {
          enigmaId: currentEnigma.id,
          hintNumber: gameState.hints + 1,
          newScore: gameState.collectiveScore - 50,
        },
      });
    }
  }, [gameState.hints, gameState.maxHints, gameState.collectiveScore, currentEnigma.id]);

  const handleSendChat = useCallback(
    (message: string) => {
      sendMessage({
        type: "chat-message",
        data: {
          message,
          playerName: username,
        },
      });
    },
    [username]
  );

  const handleStartGame = useCallback(() => {
    setGameStarted(true);
    sendMessage({
      type: "game-start",
      data: {},
    });
  }, []);

  if (!isConnected) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="text-center max-w-md mx-auto px-6">
          {connectionError ? (
            <>
              <h3 className="text-xl font-bold text-red-400 mb-4">
                Connection Failed
              </h3>
              <p className="text-gray-300 mb-6">{connectionError}</p>
              <p className="text-sm text-gray-400 mb-6">
                The WebSocket server may not be running. Please try again or
                contact support.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Reload Page
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-400 mb-4">Connecting to game...</p>
              <div className="inline-block">
                <div className="animate-spin text-2xl">🔄</div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">MindMaze</h2>
          <p className="text-sm text-gray-400">Room: {roomCode}</p>
        </div>
        <button
          onClick={onLeaveGame}
          className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
        >
          Leave Game
        </button>
      </div>

      {/* Main game area */}
      {!gameStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <h3 className="text-2xl font-bold text-white mb-6">
            Ready to solve some puzzles?
          </h3>
          <div className="mb-6 text-gray-400">
            <p className="mb-2">Players ready: {players.length}</p>
            <div className="flex gap-2">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="px-3 py-1 rounded-full bg-white/10 text-white text-sm"
                >
                  {p.username}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleStartGame}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50"
          >
            Start Game
          </button>
        </div>
      ) : gameFinished ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <h3 className="text-3xl font-bold text-white mb-4">Game Finished!</h3>
          <ScoreBoard
            scores={[
              {
                id: "1",
                name: "Team",
                score: gameState.collectiveScore,
              },
            ]}
            title="Final Score"
            compact={false}
          />
          <div className="mt-6 grid grid-cols-2 gap-4 max-w-md w-full">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm mb-2">Enigmas Solved</p>
              <p className="text-2xl font-bold text-white">
                {gameState.currentEnigma - 1}/{gameState.totalEnigmas}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm mb-2">Time Used</p>
              <p className="text-2xl font-bold text-white">
                {Math.floor((gameState.totalTime - gameState.timeRemaining) / 60)}m
              </p>
            </div>
          </div>
          <button
            onClick={onLeaveGame}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg"
          >
            Back to Lobby
          </button>
        </div>
      ) : (
        <div className="flex-1 flex gap-4 overflow-hidden p-4">
          {/* Main enigma area */}
          <div className="flex-1 flex flex-col">
            <div className="mb-4">
              <Timer
                initialSeconds={timePerEnigma}
                onTimeUp={() => handleSolveEnigma(currentEnigma.maxPoints)}
                size="large"
              />
            </div>

            {/* Enigma display */}
            <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-6 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">
                Enigma {gameState.currentEnigma}/10: {currentEnigma.title}
              </h3>
              <p className="text-gray-400 mb-6">{currentEnigma.description}</p>
              <div className="flex-1 flex items-center justify-center bg-white/10 rounded-lg mb-6 text-gray-400">
                [Enigma Content - {currentEnigma.type}]
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSolveEnigma(currentEnigma.maxPoints)}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Solve Enigma
                </button>
                <button
                  onClick={handleRequestHint}
                  disabled={gameState.hints >= gameState.maxHints}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hint ({gameState.hints}/{gameState.maxHints})
                </button>
              </div>
            </div>

            {/* Score display */}
            <div className="mt-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-4 text-center border border-white/10">
              <p className="text-gray-400 text-sm mb-1">Team Score</p>
              <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text">
                {gameState.collectiveScore.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-64 flex flex-col gap-4 overflow-hidden">
            {/* Players */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <PlayerList
                players={players}
                currentPlayerId={playerId}
                showScores={true}
              />
            </div>

            {/* Chat */}
            <div className="h-48 min-h-0">
              <Chat
                messages={chatMessages}
                currentPlayerId={playerId}
                onSendMessage={handleSendChat}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

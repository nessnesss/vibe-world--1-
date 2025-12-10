import { useEffect, useRef, useState, useCallback } from "react";
import { useGameWebSocket } from "@/hooks/useGameWebSocket";
import { Player, CrazyDrawsState } from "@/types/game";
import { PlayerList } from "@/components/game/PlayerList";
import { Chat, ChatMessage } from "@/components/game/Chat";
import { Timer } from "@/components/game/Timer";
import { ScoreBoard } from "@/components/game/ScoreBoard";
import {
  Trash2,
  RotateCcw,
  Circle,
  Square,
  Paintbrush,
  Droplet,
} from "lucide-react";

interface CrazyDrawsGameProps {
  roomCode: string;
  playerId: string;
  username: string;
  onLeaveGame: () => void;
}

// Drawing words and constraints
const DRAWING_WORDS = [
  "Cat",
  "House",
  "Tree",
  "Pizza",
  "Robot",
  "Dinosaur",
  "Unicorn",
  "Spaceship",
  "Lighthouse",
  "Penguin",
  "Dragon",
  "Comet",
];

const CONSTRAINTS = [
  { id: "eyes-closed", name: "Eyes Closed", description: "Draw with eyes closed" },
  {
    id: "inverted",
    name: "Inverted Mouse",
    description: "Mouse movements are inverted",
  },
  {
    id: "mirror",
    name: "Mirror Mode",
    description: "Everything is mirrored",
  },
  {
    id: "no-lift",
    name: "No Lift",
    description: "Don't lift the pen",
  },
];

export function CrazyDrawsGame({
  roomCode,
  playerId,
  username,
  onLeaveGame,
}: CrazyDrawsGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<CrazyDrawsState>({
    currentRound: 1,
    totalRounds: 8,
    drawer: undefined,
    currentWord: undefined,
    constraint: undefined,
    timeRemaining: 60,
    roundScore: 0,
    roundResponses: {},
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("#ffffff");
  const [guesses, setGuesses] = useState<Record<string, boolean>>({});

  const COLORS = [
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#ffa500",
    "#800080",
    "#ffc0cb",
    "#a52a2a",
    "#008000",
  ];

  const { isConnected, connectionError, sendMessage } = useGameWebSocket({
    roomCode,
    playerId,
    onMessage: (message) => {
      if (message.type === "player-joined" || message.type === "player-left") {
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
      } else if (message.type === "drawing-data") {
        // Handle incoming drawing data
        if (message.data?.drawingData && canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            // Recreate drawing from data
            const data = message.data.drawingData;
            ctx.strokeStyle = data.color;
            ctx.lineWidth = data.size;
            ctx.beginPath();
            ctx.moveTo(data.fromX, data.fromY);
            ctx.lineTo(data.toX, data.toY);
            ctx.stroke();
          }
        }
      } else if (message.type === "chat-message") {
        setChatMessages((prev) => [
          ...prev,
          {
            id: message.timestamp?.toString() || Date.now().toString(),
            playerId: message.data?.playerId || "",
            playerName: message.data?.playerName || "",
            message: message.data?.message || "",
            timestamp: message.timestamp || Date.now(),
          },
        ]);

        // Check if guess is correct
        if (
          message.data?.playerName !== username &&
          gameState.currentWord &&
          message.data?.message.toLowerCase() ===
            gameState.currentWord.toLowerCase()
        ) {
          setGuesses((prev) => ({
            ...prev,
            [message.data?.playerName || ""]: true,
          }));
        }
      }
    },
  });

  const isCurrentPlayerDrawer = gameState.drawer === playerId;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (!gameStarted || gameFinished) return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        const newTime = Math.max(0, prev.timeRemaining - 1);
        if (newTime === 0) {
          // Round finished
          if (prev.currentRound < prev.totalRounds) {
            return {
              ...prev,
              currentRound: prev.currentRound + 1,
              timeRemaining: 60,
              roundResponses: {},
            };
          } else {
            setGameFinished(true);
          }
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameFinished]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCurrentPlayerDrawer || gameFinished) return;
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isCurrentPlayerDrawer || gameFinished) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const prevX = e.movementX ? x - e.movementX : x;
    const prevY = e.movementY ? y - e.movementY : y;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Send drawing data to other players
    sendMessage({
      type: "drawing-data",
      data: {
        fromX: prevX,
        fromY: prevY,
        toX: x,
        toY: y,
        color: brushColor,
        size: brushSize,
      },
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

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
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950">
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
                className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
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
          <h2 className="text-xl font-bold text-white">CrazyDraws</h2>
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
            Ready to draw and guess?
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
            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50"
          >
            Start Game
          </button>
        </div>
      ) : gameFinished ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <h3 className="text-3xl font-bold text-white mb-4">Game Finished!</h3>
          <ScoreBoard
            scores={players.map((p) => ({
              id: p.id,
              name: p.username,
              score: p.score,
            }))}
            currentPlayerId={playerId}
            title="Final Scores"
            compact={false}
          />
          <button
            onClick={onLeaveGame}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg"
          >
            Back to Lobby
          </button>
        </div>
      ) : (
        <div className="flex-1 flex gap-4 overflow-hidden p-4">
          {/* Main canvas area */}
          <div className="flex-1 flex flex-col">
            {/* Game info */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">
                  Round {gameState.currentRound}/{gameState.totalRounds}
                </p>
                <p className="text-white font-semibold">
                  {isCurrentPlayerDrawer ? "You're drawing!" : "Guess the word"}
                </p>
              </div>
              <Timer
                initialSeconds={gameState.timeRemaining}
                size="medium"
              />
            </div>

            {/* Canvas or Guess area */}
            <div className="flex-1 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col">
              {isCurrentPlayerDrawer ? (
                <>
                  {/* Drawing canvas */}
                  <div className="flex-1 bg-gray-900 flex items-center justify-center overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={600}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className="cursor-crosshair max-w-full max-h-full"
                    />
                  </div>

                  {/* Drawing tools */}
                  <div className="border-t border-white/10 p-4 bg-white/5 space-y-4">
                    {/* Word display */}
                    {gameState.currentWord && (
                      <div className="bg-gradient-to-r from-cyan-600/20 to-teal-600/20 rounded-lg p-4 text-center border border-white/10">
                        <p className="text-gray-400 text-sm mb-1">Draw this word</p>
                        <p className="text-2xl font-bold text-cyan-300">
                          {gameState.currentWord}
                        </p>
                      </div>
                    )}

                    {/* Color palette */}
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setBrushColor(color)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            brushColor === color
                              ? "border-white scale-110"
                              : "border-white/30 hover:border-white/60"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    {/* Size and tools */}
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Paintbrush className="w-4 h-4 text-gray-400" />
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={brushSize}
                          onChange={(e) => setBrushSize(Number(e.target.value))}
                          className="flex-1 h-2 rounded-lg bg-white/20 accent-cyan-500"
                        />
                        <span className="text-xs text-gray-400 w-6">
                          {brushSize}
                        </span>
                      </div>
                      <button
                        onClick={handleClearCanvas}
                        className="px-3 py-2 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // Guessing interface
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                  <p className="text-2xl font-bold text-white mb-4">
                    Guess what's being drawn!
                  </p>
                  <div className="w-full max-w-md space-y-4">
                    {Object.entries(guesses).map(([player, guessed]) => (
                      <div
                        key={player}
                        className="px-4 py-2 bg-white/10 rounded-lg flex items-center justify-between"
                      >
                        <span className="text-white">{player}</span>
                        {guessed && (
                          <span className="text-green-400 font-bold">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                disabled={isCurrentPlayerDrawer}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

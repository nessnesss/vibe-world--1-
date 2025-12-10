import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, LogIn } from "lucide-react";
import { CrazyDrawsGame } from "@/components/games/CrazyDrawsGame";

export default function CrazyDraws() {
  const [gameMode, setGameMode] = useState<"lobby" | "room" | "playing">("lobby");
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [joinError, setJoinError] = useState("");
  const [playerId, setPlayerId] = useState(() =>
    Math.random().toString(36).substring(2, 11)
  );

  const handleCreateRoom = async () => {
    try {
      const response = await fetch("/api/room/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType: "crazydraws" }),
      });
      const data = await response.json();
      setRoomCode(data.roomCode);
      setGameMode("playing");
    } catch (error) {
      setJoinError("Failed to create room. Please try again.");
    }
  };

  const handleJoinRoom = async (code: string) => {
    try {
      const response = await fetch(`/api/room/${code}`);
      if (!response.ok) {
        setJoinError("Room not found or is full");
        return;
      }
      setRoomCode(code);
      setGameMode("playing");
    } catch (error) {
      setJoinError("Failed to join room. Please check the code.");
    }
  };

  if (gameMode === "playing") {
    return (
      <CrazyDrawsGame
        roomCode={roomCode}
        playerId={playerId}
        username={username}
        onLeaveGame={() => {
          setGameMode("lobby");
          setRoomCode("");
          setUsername("");
          setJoinError("");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-glow"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-glow"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to PlayHub
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">🎨 CrazyDraws</h1>
          <p className="text-xl text-gray-300">
            Draw with crazy constraints and guess hilarious creations
          </p>
        </div>

        {gameMode === "lobby" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Create room card */}
            <div className="glass-effect rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center mb-6 mx-auto">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-4">
                Create Room
              </h3>
              <p className="text-gray-400 text-center mb-6">
                Start a new drawing game (3-4 players)
              </p>
              <input
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 mb-4 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                onClick={handleCreateRoom}
                disabled={!username}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Game
              </button>
            </div>

            {/* Join room card */}
            <div className="glass-effect rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center mb-6 mx-auto">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-4">
                Join Room
              </h3>
              <p className="text-gray-400 text-center mb-6">
                Enter a room code to join the fun
              </p>
              <input
                type="text"
                placeholder="Room code (6 chars)"
                maxLength={6}
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setJoinError("");
                }}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 mb-3 focus:outline-none focus:border-cyan-500/50"
              />
              <input
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 mb-4 focus:outline-none focus:border-cyan-500/50"
              />
              {joinError && (
                <p className="text-red-400 text-sm mb-3">{joinError}</p>
              )}
              <button
                onClick={() => handleJoinRoom(roomCode)}
                disabled={!roomCode || !username}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Game
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

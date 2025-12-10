import { Player } from "@/types/game";
import { Crown, Check } from "lucide-react";

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string;
  showScores?: boolean;
}

export function PlayerList({
  players,
  currentPlayerId,
  showScores = true,
}: PlayerListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
        Players ({players.length})
      </h3>
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {player.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white truncate">
                  {player.username}
                </p>
                {player.isHost && (
                  <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                )}
                {player.ready && (
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                )}
              </div>
              {showScores && (
                <p className="text-xs text-gray-400">
                  Score: {player.score.toLocaleString()}
                </p>
              )}
            </div>
            {currentPlayerId === player.id && (
              <div className="px-2 py-1 rounded text-xs font-semibold bg-purple-500/20 text-purple-300 flex-shrink-0">
                You
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

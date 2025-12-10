import { Trophy, TrendingUp } from "lucide-react";

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  rank?: number;
}

interface ScoreBoardProps {
  scores: ScoreEntry[];
  currentPlayerId?: string;
  title?: string;
  compact?: boolean;
}

export function ScoreBoard({
  scores,
  currentPlayerId,
  title = "Leaderboard",
  compact = false,
}: ScoreBoardProps) {
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  if (compact) {
    return (
      <div className="bg-white/5 rounded-lg border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <div className="space-y-2">
          {sortedScores.slice(0, 3).map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between text-sm ${
                currentPlayerId === entry.id
                  ? "bg-purple-500/20 px-2 py-1 rounded border border-purple-500/30"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-400 w-4">
                  {["🥇", "🥈", "🥉"][index] || index + 1}
                </span>
                <span className="text-white">{entry.name}</span>
              </div>
              <span className="font-bold text-purple-300">
                {entry.score.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>

      <div className="space-y-3">
        {sortedScores.map((entry, index) => {
          const isCurrentPlayer = currentPlayerId === entry.id;
          const medal = ["🥇", "🥈", "🥉"];

          return (
            <div
              key={entry.id}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                isCurrentPlayer
                  ? "bg-purple-500/20 border border-purple-500/30"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              {/* Rank */}
              <div className="text-2xl w-8 flex-shrink-0">
                {index < 3 ? medal[index] : `#${index + 1}`}
              </div>

              {/* Player info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">
                  {entry.name}
                  {isCurrentPlayer && " (You)"}
                </p>
              </div>

              {/* Score */}
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="font-bold text-lg text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text">
                  {entry.score.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

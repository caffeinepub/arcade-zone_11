import { Loader2, Trophy } from "lucide-react";
import { useTopScores } from "../hooks/useQueries";

interface LeaderboardProps {
  gameId: string;
  gameName: string;
}

function formatTime(ts: bigint): string {
  const d = new Date(Number(ts / BigInt(1_000_000)));
  return d.toLocaleDateString();
}

export function Leaderboard({ gameId, gameName }: LeaderboardProps) {
  const { data: scores, isLoading } = useTopScores(gameId);

  return (
    <div
      className="rounded-2xl border border-border/50 overflow-hidden"
      style={{ background: "oklch(0.12 0.027 258)" }}
    >
      <div
        className="px-5 py-4 border-b border-border/50"
        style={{ background: "oklch(0.14 0.03 258)" }}
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 neon-text-yellow" />
          <h3 className="font-orbitron text-xs font-bold uppercase tracking-widest text-foreground">
            Top Scores
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{gameName}</p>
      </div>
      <div className="p-4">
        {isLoading ? (
          <div
            className="flex items-center justify-center py-8"
            data-ocid="leaderboard.loading_state"
          >
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : !scores || scores.length === 0 ? (
          <div className="text-center py-8" data-ocid="leaderboard.empty_state">
            <p className="text-xs text-muted-foreground">No scores yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Be the first to play!
            </p>
          </div>
        ) : (
          <ol className="space-y-2">
            {scores.map((entry, i) => (
              <li
                key={`${entry.playerName}-${i}`}
                className="flex items-center gap-3 p-2 rounded-lg"
                style={{ background: "oklch(0.15 0.028 258)" }}
                data-ocid={`leaderboard.item.${i + 1}`}
              >
                <span
                  className={`font-orbitron text-xs font-bold w-5 text-center ${i === 0 ? "neon-text-yellow" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-700" : "text-muted-foreground"}`}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {entry.playerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(entry.timestamp)}
                  </p>
                </div>
                <span className="font-orbitron text-xs font-bold neon-text-cyan">
                  {Number(entry.score).toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

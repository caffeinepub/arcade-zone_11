import { useCallback, useEffect, useState } from "react";

const ROWS = 9;
const COLS = 9;
const MINES = 10;

type CellState = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};
type Grid = CellState[][];

function createGrid(firstR: number, firstC: number): Grid {
  const grid: Grid = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    })),
  );
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (
      !grid[r][c].mine &&
      !(Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1)
    ) {
      grid[r][c].mine = true;
      placed++;
    }
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c].mine) continue;
      let cnt = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc].mine)
            cnt++;
        }
      }
      grid[r][c].adjacent = cnt;
    }
  }
  return grid;
}

function reveal(grid: Grid, r: number, c: number): Grid {
  const ng = grid.map((row) => row.map((cell) => ({ ...cell })));
  const queue = [[r, c]];
  while (queue.length) {
    const [cr, cc] = queue.shift()!;
    if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) continue;
    const cell = ng[cr][cc];
    if (cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    if (cell.adjacent === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          queue.push([cr + dr, cc + dc]);
        }
      }
    }
  }
  return ng;
}

const ADJ_COLORS = [
  "transparent",
  "#2FB9FF",
  "#37FF6B",
  "#FF4FD8",
  "#B84CFF",
  "#FF8C42",
  "#2FB9FF",
  "#fff",
  "#aaa",
];

interface MinesweeperProps {
  onGameOver: (score: number) => void;
}

export function Minesweeper({ onGameOver }: MinesweeperProps) {
  const [grid, setGrid] = useState<Grid | null>(null);
  const [status, setStatus] = useState<"idle" | "playing" | "won" | "lost">(
    "idle",
  );
  const [flags, setFlags] = useState(0);
  const [time, setTime] = useState(0);
  const [revealedMines, setRevealedMines] = useState(false);

  useEffect(() => {
    if (status !== "playing") return;
    const t = setInterval(() => setTime((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const start = useCallback(() => {
    setGrid(null);
    setStatus("idle");
    setFlags(0);
    setTime(0);
    setRevealedMines(false);
  }, []);

  const handleClick = (r: number, c: number) => {
    if (status === "won" || status === "lost") return;
    if (!grid) {
      const ng = createGrid(r, c);
      const revealed = reveal(ng, r, c);
      setGrid(revealed);
      setStatus("playing");
      return;
    }
    if (grid[r][c].revealed || grid[r][c].flagged) return;
    if (grid[r][c].mine) {
      const ng = grid.map((row) =>
        row.map((cell) => ({
          ...cell,
          revealed: cell.mine ? true : cell.revealed,
        })),
      );
      setGrid(ng);
      setRevealedMines(true);
      setStatus("lost");
      onGameOver(Math.max(0, (MINES - flags) * 5));
      return;
    }
    const ng = reveal(grid, r, c);
    setGrid(ng);
    const safe = ROWS * COLS - MINES;
    const revealedCount = ng.flat().filter((c2) => c2.revealed).length;
    if (revealedCount >= safe) {
      setStatus("won");
      onGameOver(1000 - time * 2);
    }
  };

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (!grid || status === "won" || status === "lost") return;
    if (grid[r][c].revealed) return;
    const ng = grid.map((row) => row.map((cell) => ({ ...cell })));
    ng[r][c].flagged = !ng[r][c].flagged;
    setGrid(ng);
    setFlags((p) => (ng[r][c].flagged ? p + 1 : p - 1));
  };

  const displayGrid =
    grid ||
    Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({
        mine: false,
        revealed: false,
        flagged: false,
        adjacent: 0,
      })),
    );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6">
        <span className="font-orbitron text-sm">
          <span className="neon-text-yellow">💣</span> {MINES - flags}
        </span>
        <span className="font-orbitron text-sm neon-text-cyan">⏱ {time}s</span>
        <button
          type="button"
          onClick={start}
          className="text-sm text-muted-foreground hover:text-foreground"
          data-ocid="minesweeper.secondary_button"
        >
          Reset
        </button>
      </div>

      {(status === "won" || status === "lost") && (
        <div className="text-center">
          <p
            className={`font-orbitron text-lg font-bold ${status === "won" ? "neon-text-green" : "text-red-400"}`}
          >
            {status === "won" ? "You Win! 🎉" : "Boom! 💥"}
          </p>
          <button
            type="button"
            onClick={start}
            className="glow-btn mt-2 px-6 py-2 rounded-full font-orbitron text-xs font-bold text-white uppercase tracking-widest"
            data-ocid="minesweeper.primary_button"
          >
            New Game
          </button>
        </div>
      )}

      <div
        className="inline-grid gap-1"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {displayGrid
          .flatMap((row, r) => row.map((cell, c) => ({ ...cell, r, c })))
          .map((cell) => (
            <button
              type="button"
              key={`cell-${cell.r}-${cell.c}`}
              onClick={() => handleClick(cell.r, cell.c)}
              onContextMenu={(e) => handleRightClick(e, cell.r, cell.c)}
              className="w-9 h-9 rounded text-xs font-bold transition-all"
              style={{
                background: cell.revealed
                  ? cell.mine && revealedMines
                    ? "#7f0000"
                    : "oklch(0.17 0.03 258)"
                  : "oklch(0.2 0.035 258)",
                borderColor: cell.revealed
                  ? "transparent"
                  : "oklch(0.3 0.05 240 / 0.5)",
                border: "1px solid",
                color:
                  cell.revealed && !cell.mine
                    ? ADJ_COLORS[cell.adjacent]
                    : undefined,
              }}
            >
              {cell.flagged && !cell.revealed
                ? "🚩"
                : cell.revealed && cell.mine
                  ? "💣"
                  : cell.revealed && cell.adjacent > 0
                    ? cell.adjacent
                    : ""}
            </button>
          ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Left click to reveal • Right click to flag
      </p>
    </div>
  );
}

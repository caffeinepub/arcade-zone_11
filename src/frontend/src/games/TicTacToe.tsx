import { useState } from "react";

type Cell = "X" | "O" | null;

function checkWinner(board: Cell[]): { winner: Cell; line: number[] } | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return { winner: board[a], line };
  }
  return null;
}

interface TicTacToeProps {
  onGameOver: (score: number) => void;
}

export function TicTacToe({ onGameOver }: TicTacToeProps) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [gameOver, setGameOver] = useState(false);

  const result = checkWinner(board);
  const isDraw = !result && board.every(Boolean);
  const winLine = result?.line ?? [];

  const handleClick = (i: number) => {
    if (board[i] || gameOver) return;
    const nb = [...board];
    nb[i] = turn;
    setBoard(nb);
    const r = checkWinner(nb);
    if (r) {
      setGameOver(true);
      onGameOver(r.winner === "X" ? 100 : 1);
    } else if (nb.every(Boolean)) {
      setGameOver(true);
      onGameOver(50);
    } else {
      setTurn(turn === "X" ? "O" : "X");
    }
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setGameOver(false);
  };

  const POSITIONS = [
    "tl",
    "tc",
    "tr",
    "ml",
    "mc",
    "mr",
    "bl",
    "bc",
    "br",
  ] as const;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        {gameOver ? (
          result ? (
            <p
              className="font-orbitron text-lg font-bold"
              style={{ color: result.winner === "X" ? "#2FB9FF" : "#FF4FD8" }}
            >
              Player {result.winner} Wins! 🎉
            </p>
          ) : (
            <p className="font-orbitron text-lg font-bold text-muted-foreground">
              It's a Draw!
            </p>
          )
        ) : (
          <p className="font-orbitron text-sm text-muted-foreground">
            Player{" "}
            <span style={{ color: turn === "X" ? "#2FB9FF" : "#FF4FD8" }}>
              {turn}
            </span>
            's Turn
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => {
          const isWin = winLine.includes(i);
          return (
            <button
              type="button"
              key={POSITIONS[i]}
              onClick={() => handleClick(i)}
              className="w-24 h-24 rounded-xl border text-4xl font-black transition-all duration-150 flex items-center justify-center"
              style={{
                background: isWin
                  ? "oklch(0.18 0.04 258)"
                  : "oklch(0.14 0.028 258)",
                borderColor: isWin
                  ? result?.winner === "X"
                    ? "#2FB9FF"
                    : "#FF4FD8"
                  : "oklch(0.28 0.05 240 / 0.5)",
                color: cell === "X" ? "#2FB9FF" : "#FF4FD8",
                textShadow: cell
                  ? `0 0 15px ${cell === "X" ? "#2FB9FF" : "#FF4FD8"}`
                  : undefined,
              }}
              data-ocid={`tictactoe.item.${i + 1}`}
            >
              {cell}
            </button>
          );
        })}
      </div>

      {(gameOver || isDraw) && (
        <button
          type="button"
          onClick={reset}
          className="glow-btn px-8 py-3 rounded-full font-orbitron text-sm font-bold text-white uppercase tracking-widest"
          data-ocid="tictactoe.primary_button"
        >
          Play Again
        </button>
      )}
    </div>
  );
}

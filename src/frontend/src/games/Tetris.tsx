import { useCallback, useEffect, useRef, useState } from "react";

const COLS = 10;
const ROWS = 20;
const CELL = 28;
const W = COLS * CELL;
const H = ROWS * CELL;
const PREVIEW_SIZE = 4 * CELL;

const TETROMINOES = [
  { shape: [[1, 1, 1, 1]], color: "#2FB9FF" },
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#FFD24A",
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#B84CFF",
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#FF8C42",
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#2FB9FF",
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#37FF6B",
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#FF4FD8",
  },
];

type Board = (string | null)[][];
type Piece = { shape: number[][]; color: string; x: number; y: number };

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function randomPiece(): Piece {
  const t = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
  return {
    shape: t.shape,
    color: t.color,
    x: Math.floor((COLS - t.shape[0].length) / 2),
    y: 0,
  };
}

function rotate(shape: number[][]): number[][] {
  return shape[0].map((_, i) => shape.map((row) => row[i]).reverse());
}

function validPos(
  board: Board,
  piece: Piece,
  dx = 0,
  dy = 0,
  shape = piece.shape,
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = piece.x + c + dx;
      const ny = piece.y + r + dy;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
      if (ny >= 0 && board[ny][nx]) return false;
    }
  }
  return true;
}

function placePiece(board: Board, piece: Piece): Board {
  const nb = board.map((r) => [...r]);
  piece.shape.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v) {
        const ny = piece.y + r;
        const nx = piece.x + c;
        if (ny >= 0) nb[ny][nx] = piece.color;
      }
    }),
  );
  return nb;
}

function clearLines(board: Board): { board: Board; lines: number } {
  const kept = board.filter((row) => row.some((c) => !c));
  const lines = ROWS - kept.length;
  const nb = [
    ...Array.from({ length: lines }, () => Array(COLS).fill(null)),
    ...kept,
  ];
  return { board: nb, lines };
}

interface TetrisProps {
  onGameOver: (score: number) => void;
}

export function Tetris({ onGameOver }: TetrisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    board: emptyBoard(),
    current: randomPiece(),
    next: randomPiece(),
    score: 0,
    lines: 0,
    level: 1,
    running: false,
    dead: false,
  });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [dead, setDead] = useState(false);
  const [started, setStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    const preview = previewRef.current;
    if (!canvas || !preview) return;
    const ctx = canvas.getContext("2d");
    const pctx = preview.getContext("2d");
    if (!ctx || !pctx) return;
    const s = stateRef.current;

    ctx.fillStyle = "#070B14";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(47,185,255,0.07)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += CELL) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += CELL) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    s.board.forEach((row, r) =>
      row.forEach((c, col) => {
        if (!c) return;
        ctx.shadowBlur = 8;
        ctx.shadowColor = c;
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.roundRect(col * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2, 3);
        ctx.fill();
        ctx.shadowBlur = 0;
      }),
    );

    if (s.current) {
      s.current.shape.forEach((row, r) =>
        row.forEach((v, c) => {
          if (!v) return;
          const nx = s.current.x + c;
          const ny = s.current.y + r;
          if (ny < 0) return;
          ctx.shadowBlur = 12;
          ctx.shadowColor = s.current.color;
          ctx.fillStyle = s.current.color;
          ctx.beginPath();
          ctx.roundRect(nx * CELL + 1, ny * CELL + 1, CELL - 2, CELL - 2, 3);
          ctx.fill();
          ctx.shadowBlur = 0;
        }),
      );
    }

    // Ghost piece
    let ghost = { ...s.current };
    while (validPos(s.board, ghost, 0, 1)) ghost = { ...ghost, y: ghost.y + 1 };
    ghost.shape.forEach((row, r) =>
      row.forEach((v, c) => {
        if (!v) return;
        const nx = ghost.x + c;
        const ny = ghost.y + r;
        if (ny < 0) return;
        ctx.strokeStyle = `${s.current.color}44`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(nx * CELL + 1, ny * CELL + 1, CELL - 2, CELL - 2, 3);
        ctx.stroke();
      }),
    );

    // Preview
    pctx.fillStyle = "#070B14";
    pctx.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
    const nx2 = s.next;
    const ox = Math.floor((4 - nx2.shape[0].length) / 2);
    const oy = Math.floor((4 - nx2.shape.length) / 2);
    nx2.shape.forEach((row, r) =>
      row.forEach((v, c) => {
        if (!v) return;
        pctx.shadowBlur = 10;
        pctx.shadowColor = nx2.color;
        pctx.fillStyle = nx2.color;
        pctx.beginPath();
        pctx.roundRect(
          (ox + c) * CELL + 1,
          (oy + r) * CELL + 1,
          CELL - 2,
          CELL - 2,
          3,
        );
        pctx.fill();
        pctx.shadowBlur = 0;
      }),
    );
  }, []);

  const step = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;
    if (validPos(s.board, s.current, 0, 1)) {
      s.current.y++;
    } else {
      const nb = placePiece(s.board, s.current);
      const { board: cleared, lines: l } = clearLines(nb);
      s.board = cleared;
      s.lines += l;
      s.score += [0, 100, 300, 500, 800][l] * s.level;
      s.level = Math.floor(s.lines / 10) + 1;
      s.current = s.next;
      s.next = randomPiece();
      setScore(s.score);
      setLines(s.lines);
      if (!validPos(s.board, s.current)) {
        s.running = false;
        s.dead = true;
        setDead(true);
        onGameOver(s.score);
        return;
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
      const speed = Math.max(100, 500 - (s.level - 1) * 40);
      intervalRef.current = setInterval(step, speed);
    }
    drawBoard();
  }, [drawBoard, onGameOver]);

  const start = () => {
    const s = stateRef.current;
    s.board = emptyBoard();
    s.current = randomPiece();
    s.next = randomPiece();
    s.score = 0;
    s.lines = 0;
    s.level = 1;
    s.running = true;
    s.dead = false;
    setScore(0);
    setLines(0);
    setDead(false);
    setStarted(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(step, 500);
    drawBoard();
  };

  useEffect(() => {
    drawBoard();
    const handleKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (!s.running) return;
      if (e.key === "ArrowLeft" && validPos(s.board, s.current, -1)) {
        s.current.x--;
        e.preventDefault();
      } else if (e.key === "ArrowRight" && validPos(s.board, s.current, 1)) {
        s.current.x++;
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        if (validPos(s.board, s.current, 0, 1)) s.current.y++;
        e.preventDefault();
      } else if (e.key === "ArrowUp" || e.key === " ") {
        e.preventDefault();
        const rotated = rotate(s.current.shape);
        if (validPos(s.board, s.current, 0, 0, rotated))
          s.current.shape = rotated;
      }
      drawBoard();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [drawBoard]);

  useEffect(() => {
    if (started) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(step, 500);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [started, step]);

  return (
    <div className="flex gap-6 items-start justify-center">
      <div className="relative rounded-xl overflow-hidden border border-border/50">
        <canvas ref={canvasRef} width={W} height={H} className="block" />
        {(!started || dead) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: "rgba(7,11,20,0.85)" }}
          >
            {dead && (
              <p className="font-orbitron text-sm text-red-400 mb-2">
                GAME OVER
              </p>
            )}
            <button
              type="button"
              onClick={start}
              className="glow-btn px-8 py-3 rounded-full font-orbitron text-sm font-bold text-white uppercase tracking-widest"
              data-ocid="tetris.primary_button"
            >
              {dead ? "Play Again" : "Start Game"}
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 min-w-[120px]">
        <div
          className="rounded-xl border border-border/50 p-3"
          style={{ background: "oklch(0.12 0.027 258)" }}
        >
          <p className="font-orbitron text-xs text-muted-foreground uppercase mb-1">
            Score
          </p>
          <p className="font-orbitron text-lg font-black neon-text-cyan">
            {score}
          </p>
        </div>
        <div
          className="rounded-xl border border-border/50 p-3"
          style={{ background: "oklch(0.12 0.027 258)" }}
        >
          <p className="font-orbitron text-xs text-muted-foreground uppercase mb-1">
            Lines
          </p>
          <p className="font-orbitron text-lg font-black neon-text-green">
            {lines}
          </p>
        </div>
        <div
          className="rounded-xl border border-border/50 p-3"
          style={{ background: "oklch(0.12 0.027 258)" }}
        >
          <p className="font-orbitron text-xs text-muted-foreground uppercase mb-2">
            Next
          </p>
          <canvas
            ref={previewRef}
            width={PREVIEW_SIZE}
            height={PREVIEW_SIZE}
            className="block"
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          ↑ Rotate
          <br />↓ Down
          <br />← → Move
        </p>
      </div>
    </div>
  );
}

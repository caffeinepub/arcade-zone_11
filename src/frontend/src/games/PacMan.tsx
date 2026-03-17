import { useCallback, useEffect, useRef, useState } from "react";

const CELL = 20;
const COLS = 21;
const ROWS = 21;
const W = COLS * CELL;
const H = ROWS * CELL;

const MAZE_TEMPLATE: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1],
  [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 2, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1, 1],
  [1, 1, 1, 1, 2, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 2, 1, 1, 1, 1],
  [1, 1, 1, 1, 2, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 2, 1, 1, 1, 1],
  [0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0],
  [1, 1, 1, 1, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 2, 1, 1, 1, 1],
  [1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1],
  [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
  [1, 3, 2, 1, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 1, 2, 3, 1],
  [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1],
  [1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

interface PacManProps {
  onGameOver: (score: number) => void;
}

type Dir = { x: number; y: number };
type Ghost = { x: number; y: number; color: string; dir: Dir; timer: number };

interface State {
  px: number;
  py: number;
  dir: Dir;
  nextDir: Dir;
  maze: number[][];
  ghosts: Ghost[];
  score: number;
  dotsLeft: number;
  running: boolean;
  dead: boolean;
  moveTimer: number;
  powered: boolean;
  powerTimer: number;
  mouthAngle: number;
  mouthDir: number;
}

function cloneMaze(): number[][] {
  return MAZE_TEMPLATE.map((row) => [...row]);
}

function countDots(maze: number[][]): number {
  let count = 0;
  for (const row of maze)
    for (const cell of row) if (cell === 2 || cell === 3) count++;
  return count;
}

function initGhosts(): Ghost[] {
  return [
    { x: 9, y: 9, color: "#FF4FD8", dir: { x: 1, y: 0 }, timer: 0 },
    { x: 10, y: 9, color: "#2FB9FF", dir: { x: -1, y: 0 }, timer: 10 },
    { x: 9, y: 10, color: "#FFD24A", dir: { x: 0, y: 1 }, timer: 20 },
    { x: 10, y: 10, color: "#FF6B2B", dir: { x: 0, y: -1 }, timer: 30 },
  ];
}

function canMoveFn(maze: number[][], x: number, y: number): boolean {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
  return maze[y][x] !== 1;
}

export function PacMan({ onGameOver }: PacManProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maze0 = cloneMaze();
  const stateRef = useRef<State>({
    px: 10,
    py: 16,
    dir: { x: 0, y: 0 },
    nextDir: { x: 0, y: 0 },
    maze: maze0,
    ghosts: initGhosts(),
    score: 0,
    dotsLeft: countDots(maze0),
    running: false,
    dead: false,
    moveTimer: 0,
    powered: false,
    powerTimer: 0,
    mouthAngle: 0.3,
    mouthDir: 1,
  });
  const rafRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    ctx.fillStyle = "#070B14";
    ctx.fillRect(0, 0, W, H);

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cell = s.maze[row][col];
        const cx = col * CELL + CELL / 2;
        const cy = row * CELL + CELL / 2;
        if (cell === 1) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = "#2FB9FF";
          ctx.fillStyle = "#0a1a2e";
          ctx.strokeStyle = "#1a3a5c";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.rect(col * CELL, row * CELL, CELL, CELL);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (cell === 2) {
          ctx.fillStyle = "#FFD24A";
          ctx.beginPath();
          ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === 3) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#FFD24A";
          ctx.fillStyle = "#FFD24A";
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    for (const ghost of s.ghosts) {
      const gx = ghost.x * CELL + CELL / 2;
      const gy = ghost.y * CELL + CELL / 2;
      const color = s.powered ? "#3a3aff" : ghost.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(gx, gy - 2, CELL / 2 - 2, Math.PI, 0);
      ctx.lineTo(gx + CELL / 2 - 2, gy + CELL / 2 - 2);
      for (let i = 0; i < 3; i++) {
        const wx = gx + CELL / 2 - 2 - i * (CELL / 3 - 1.3);
        ctx.quadraticCurveTo(
          wx - (CELL / 6 - 0.7),
          gy + CELL / 2 - 2,
          wx - (CELL / 3 - 1.3),
          gy + CELL / 2 - 8,
        );
      }
      ctx.lineTo(gx - CELL / 2 + 2, gy + CELL / 2 - 2);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      if (!s.powered) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(gx - 4, gy - 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(gx + 4, gy - 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#070B14";
        ctx.beginPath();
        ctx.arc(gx - 3, gy - 4, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(gx + 5, gy - 4, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const px = s.px * CELL + CELL / 2;
    const py = s.py * CELL + CELL / 2;
    const angle = s.mouthAngle;
    const startAngle = angle;
    const endAngle = Math.PI * 2 - angle;
    let rotation = 0;
    if (s.dir.x === -1) rotation = Math.PI;
    else if (s.dir.y === -1) rotation = -Math.PI / 2;
    else if (s.dir.y === 1) rotation = Math.PI / 2;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rotation);
    ctx.shadowBlur = 16;
    ctx.shadowColor = "#FFD24A";
    ctx.fillStyle = "#FFD24A";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, CELL / 2 - 2, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.shadowBlur = 0;
  }, []);

  const moveGhost = useCallback((ghost: Ghost, maze: number[][]) => {
    const dirs: Dir[] = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    const nx = ghost.x + ghost.dir.x;
    const ny = ghost.y + ghost.dir.y;
    if (canMoveFn(maze, nx, ny)) {
      ghost.x = nx;
      ghost.y = ny;
    } else {
      const shuffled = dirs.sort(() => Math.random() - 0.5);
      for (const d of shuffled) {
        const tx = ghost.x + d.x;
        const ty = ghost.y + d.y;
        if (canMoveFn(maze, tx, ty)) {
          ghost.dir = d;
          ghost.x = tx;
          ghost.y = ty;
          break;
        }
      }
    }
  }, []);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;

    s.mouthAngle += 0.08 * s.mouthDir;
    if (s.mouthAngle > 0.6) s.mouthDir = -1;
    if (s.mouthAngle < 0.05) s.mouthDir = 1;

    if (s.powered) {
      s.powerTimer--;
      if (s.powerTimer <= 0) s.powered = false;
    }

    s.moveTimer++;
    if (s.moveTimer >= 8) {
      s.moveTimer = 0;

      const nd = s.nextDir;
      if (canMoveFn(s.maze, s.px + nd.x, s.py + nd.y)) {
        s.dir = s.nextDir;
      }

      const nx = s.px + s.dir.x;
      const ny = s.py + s.dir.y;
      if (canMoveFn(s.maze, nx, ny)) {
        s.px = nx;
        s.py = ny;
        const cell = s.maze[s.py][s.px];
        if (cell === 2) {
          s.maze[s.py][s.px] = 0;
          s.score += 10;
          s.dotsLeft--;
          setScore(s.score);
        } else if (cell === 3) {
          s.maze[s.py][s.px] = 0;
          s.score += 50;
          s.dotsLeft--;
          s.powered = true;
          s.powerTimer = 200;
          setScore(s.score);
        }
      }

      for (const ghost of s.ghosts) {
        ghost.timer++;
        if (ghost.timer >= 3) {
          ghost.timer = 0;
          moveGhost(ghost, s.maze);
        }
      }

      for (const ghost of s.ghosts) {
        if (ghost.x === s.px && ghost.y === s.py) {
          if (s.powered) {
            ghost.x = 10;
            ghost.y = 9;
            s.score += 200;
            setScore(s.score);
          } else {
            s.running = false;
            s.dead = true;
            setDead(true);
            onGameOver(s.score);
            return;
          }
        }
      }

      if (s.dotsLeft <= 0) {
        s.running = false;
        setWon(true);
        onGameOver(s.score);
        return;
      }
    }

    draw();
  }, [draw, moveGhost, onGameOver]);

  const loop = useCallback(() => {
    update();
    rafRef.current = requestAnimationFrame(loop);
  }, [update]);

  const start = () => {
    const newMaze = cloneMaze();
    const s = stateRef.current;
    s.px = 10;
    s.py = 16;
    s.dir = { x: 0, y: 0 };
    s.nextDir = { x: 0, y: 0 };
    s.maze = newMaze;
    s.ghosts = initGhosts();
    s.score = 0;
    s.dotsLeft = countDots(newMaze);
    s.running = true;
    s.dead = false;
    s.moveTimer = 0;
    s.powered = false;
    s.powerTimer = 0;
    s.mouthAngle = 0.3;
    s.mouthDir = 1;
    setScore(0);
    setDead(false);
    setWon(false);
    setStarted(true);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    draw();
    const handleKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const map: Record<string, Dir> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };
      const d = map[e.key];
      if (d) {
        e.preventDefault();
        s.nextDir = d;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="flex items-center justify-between w-full"
        style={{ maxWidth: W }}
      >
        <span className="font-orbitron text-xs text-muted-foreground uppercase">
          Score
        </span>
        <span className="font-orbitron text-xl font-black neon-text-yellow">
          {score}
        </span>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-border/50">
        <canvas ref={canvasRef} width={W} height={H} className="block" />
        {(!started || dead || won) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: "rgba(7,11,20,0.85)" }}
          >
            {dead && (
              <p className="font-orbitron text-sm text-red-400">GAME OVER</p>
            )}
            {won && (
              <p className="font-orbitron text-sm neon-text-green">YOU WIN!</p>
            )}
            <button
              type="button"
              onClick={start}
              className="glow-btn px-8 py-3 rounded-full font-orbitron text-sm font-bold text-white uppercase tracking-widest"
              data-ocid="pacman.primary_button"
            >
              {dead || won ? "Play Again" : "Start Game"}
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Arrow keys to move · Eat power pellets to fight ghosts
      </p>
    </div>
  );
}

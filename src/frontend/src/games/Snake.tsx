import { useCallback, useEffect, useRef, useState } from "react";

const CELL = 20;
const COLS = 20;
const ROWS = 20;
const W = COLS * CELL;
const H = ROWS * CELL;

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Point = { x: number; y: number };

function rand(max: number) {
  return Math.floor(Math.random() * max);
}

function spawnFood(snake: Point[]): Point {
  let p: Point;
  do {
    p = { x: rand(COLS), y: rand(ROWS) };
  } while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
}

interface SnakeProps {
  onGameOver: (score: number) => void;
}

export function Snake({ onGameOver }: SnakeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    snake: [{ x: 10, y: 10 }] as Point[],
    dir: "RIGHT" as Dir,
    nextDir: "RIGHT" as Dir,
    food: { x: 15, y: 10 } as Point,
    score: 0,
    running: false,
    dead: false,
  });
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const [started, setStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;
    ctx.fillStyle = "#070B14";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(47,185,255,0.05)";
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
    const fx = s.food.x * CELL + CELL / 2;
    const fy = s.food.y * CELL + CELL / 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#37FF6B";
    ctx.fillStyle = "#37FF6B";
    ctx.beginPath();
    ctx.arc(fx, fy, CELL / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    for (let i = 0; i < s.snake.length; i++) {
      const seg = s.snake[i];
      const isHead = i === 0;
      ctx.shadowBlur = isHead ? 20 : 8;
      ctx.shadowColor = "#2FB9FF";
      ctx.fillStyle = isHead
        ? "#2FB9FF"
        : `rgba(47,185,255,${0.9 - i * (0.6 / s.snake.length)})`;
      ctx.beginPath();
      ctx.roundRect(
        seg.x * CELL + 2,
        seg.y * CELL + 2,
        CELL - 4,
        CELL - 4,
        isHead ? 5 : 3,
      );
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }, []);

  const step = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;
    s.dir = s.nextDir;
    const head = s.snake[0];
    const next: Point = {
      x:
        (head.x + (s.dir === "RIGHT" ? 1 : s.dir === "LEFT" ? -1 : 0) + COLS) %
        COLS,
      y:
        (head.y + (s.dir === "DOWN" ? 1 : s.dir === "UP" ? -1 : 0) + ROWS) %
        ROWS,
    };
    if (s.snake.some((seg) => seg.x === next.x && seg.y === next.y)) {
      s.running = false;
      s.dead = true;
      setDead(true);
      onGameOver(s.score);
      return;
    }
    s.snake.unshift(next);
    if (next.x === s.food.x && next.y === s.food.y) {
      s.score += 10;
      s.food = spawnFood(s.snake);
      setScore(s.score);
    } else {
      s.snake.pop();
    }
    draw();
  }, [draw, onGameOver]);

  const start = () => {
    const s = stateRef.current;
    s.snake = [{ x: 10, y: 10 }];
    s.dir = "RIGHT";
    s.nextDir = "RIGHT";
    s.food = spawnFood(s.snake);
    s.score = 0;
    s.running = true;
    s.dead = false;
    setScore(0);
    setDead(false);
    setStarted(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(step, 120);
    draw();
  };

  useEffect(() => {
    draw();
    const handleKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const map: Record<string, Dir> = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
      };
      const newDir = map[e.key];
      if (!newDir) return;
      e.preventDefault();
      const opp: Record<Dir, Dir> = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      };
      if (opp[s.dir] !== newDir) s.nextDir = newDir;
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [draw]);

  useEffect(() => {
    if (started) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(step, 120);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [started, step]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[400px]">
        <span className="font-orbitron text-xs text-muted-foreground uppercase">
          Score
        </span>
        <span className="font-orbitron text-xl font-black neon-text-green">
          {score}
        </span>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-border/50">
        <canvas ref={canvasRef} width={W} height={H} className="block" />
        {(!started || dead) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: "rgba(7,11,20,0.8)" }}
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
              data-ocid="snake.primary_button"
            >
              {dead ? "Play Again" : "Start Game"}
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Use arrow keys to control the snake
      </p>
    </div>
  );
}

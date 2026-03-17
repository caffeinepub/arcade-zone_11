import { useCallback, useEffect, useRef, useState } from "react";

const W = 480;
const H = 380;
const PADDLE_W = 80;
const PADDLE_H = 10;
const BALL_R = 7;
const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_W = 42;
const BRICK_H = 14;
const BRICK_PAD = 3;
const BRICK_OFFSET_X =
  (W - (BRICK_COLS * (BRICK_W + BRICK_PAD) - BRICK_PAD)) / 2;
const BRICK_OFFSET_Y = 30;

const ROW_COLORS = ["#FF4FD8", "#B84CFF", "#2FB9FF", "#37FF6B", "#FFD24A"];

type Brick = { x: number; y: number; alive: boolean; color: string };

function makeBricks(): Brick[][] {
  return Array.from({ length: BRICK_ROWS }, (_, r) =>
    Array.from({ length: BRICK_COLS }, (_, c) => ({
      x: BRICK_OFFSET_X + c * (BRICK_W + BRICK_PAD),
      y: BRICK_OFFSET_Y + r * (BRICK_H + BRICK_PAD),
      alive: true,
      color: ROW_COLORS[r],
    })),
  );
}

interface BreakoutProps {
  onGameOver: (score: number) => void;
}

export function Breakout({ onGameOver }: BreakoutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef({
    paddleX: W / 2 - PADDLE_W / 2,
    ballX: W / 2,
    ballY: H - 60,
    ballVX: 3,
    ballVY: -4,
    bricks: makeBricks(),
    score: 0,
    lives: 3,
    running: false,
    mouseX: -1,
  });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [status, setStatus] = useState<"idle" | "playing" | "won" | "lost">(
    "idle",
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;
    ctx.fillStyle = "#070B14";
    ctx.fillRect(0, 0, W, H);
    for (const row of s.bricks) {
      for (const b of row) {
        if (!b.alive) continue;
        ctx.shadowBlur = 8;
        ctx.shadowColor = b.color;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 3);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#2FB9FF";
    const grad = ctx.createLinearGradient(
      s.paddleX,
      0,
      s.paddleX + PADDLE_W,
      0,
    );
    grad.addColorStop(0, "#1E7DFF");
    grad.addColorStop(1, "#2FB9FF");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(s.paddleX, H - 30, PADDLE_W, PADDLE_H, 5);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#fff";
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, []);

  const gameLoop = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;
    if (s.mouseX >= 0)
      s.paddleX = Math.max(0, Math.min(W - PADDLE_W, s.mouseX - PADDLE_W / 2));
    s.ballX += s.ballVX;
    s.ballY += s.ballVY;
    if (s.ballX - BALL_R < 0 || s.ballX + BALL_R > W) s.ballVX *= -1;
    if (s.ballY - BALL_R < 0) s.ballVY *= -1;
    if (
      s.ballY + BALL_R >= H - 30 &&
      s.ballY + BALL_R <= H - 30 + PADDLE_H &&
      s.ballX >= s.paddleX &&
      s.ballX <= s.paddleX + PADDLE_W
    ) {
      const hitPos = (s.ballX - s.paddleX) / PADDLE_W;
      s.ballVX = (hitPos - 0.5) * 8;
      s.ballVY = -Math.abs(s.ballVY);
    }
    if (s.ballY + BALL_R > H) {
      s.lives--;
      setLives(s.lives);
      if (s.lives <= 0) {
        s.running = false;
        setStatus("lost");
        onGameOver(s.score);
        draw();
        return;
      }
      s.ballX = W / 2;
      s.ballY = H - 60;
      s.ballVX = 3;
      s.ballVY = -4;
    }
    for (const row of s.bricks) {
      for (const b of row) {
        if (!b.alive) continue;
        if (
          s.ballX + BALL_R > b.x &&
          s.ballX - BALL_R < b.x + BRICK_W &&
          s.ballY + BALL_R > b.y &&
          s.ballY - BALL_R < b.y + BRICK_H
        ) {
          b.alive = false;
          s.ballVY *= -1;
          s.score += 10;
          setScore(s.score);
        }
      }
    }
    if (s.bricks.every((row) => row.every((b) => !b.alive))) {
      s.running = false;
      setStatus("won");
      onGameOver(s.score + s.lives * 100);
      draw();
      return;
    }
    draw();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [draw, onGameOver]);

  const start = () => {
    const s = stateRef.current;
    s.paddleX = W / 2 - PADDLE_W / 2;
    s.ballX = W / 2;
    s.ballY = H - 60;
    s.ballVX = 3;
    s.ballVY = -4;
    s.bricks = makeBricks();
    s.score = 0;
    s.lives = 3;
    s.running = true;
    setScore(0);
    setLives(3);
    setStatus("playing");
    rafRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    draw();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.mouseX = e.clientX - rect.left;
    };
    const handleKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.key === "ArrowLeft") {
        s.paddleX = Math.max(0, s.paddleX - 15);
        draw();
      }
      if (e.key === "ArrowRight") {
        s.paddleX = Math.min(W - PADDLE_W, s.paddleX + 15);
        draw();
      }
    };
    canvas.addEventListener("mousemove", handleMouse);
    window.addEventListener("keydown", handleKey);
    return () => {
      canvas.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("keydown", handleKey);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  useEffect(() => {
    if (status === "playing") rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [status, gameLoop]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6">
        <span className="font-orbitron text-sm">
          Score: <span className="neon-text-cyan">{score}</span>
        </span>
        <span className="font-orbitron text-sm">
          Lives: <span className="neon-text-pink">{"❤️".repeat(lives)}</span>
        </span>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-border/50">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block cursor-none"
        />
        {status !== "playing" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: "rgba(7,11,20,0.85)" }}
          >
            {status === "won" && (
              <p className="font-orbitron text-lg font-bold neon-text-green mb-2">
                YOU WIN! 🎉
              </p>
            )}
            {status === "lost" && (
              <p className="font-orbitron text-lg font-bold text-red-400 mb-2">
                GAME OVER
              </p>
            )}
            <button
              type="button"
              onClick={start}
              className="glow-btn px-8 py-3 rounded-full font-orbitron text-sm font-bold text-white uppercase tracking-widest"
              data-ocid="breakout.primary_button"
            >
              {status === "idle" ? "Start Game" : "Play Again"}
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Move mouse or use ← → keys to control paddle
      </p>
    </div>
  );
}

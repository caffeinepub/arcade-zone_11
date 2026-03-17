import { useCallback, useEffect, useRef, useState } from "react";

const W = 400;
const H = 500;
const BIRD_R = 14;
const PIPE_W = 52;
const PIPE_GAP = 140;
const GRAVITY = 0.45;
const FLAP_FORCE = -9;
const PIPE_SPEED = 2.8;

interface FlappyBirdProps {
  onGameOver: (score: number) => void;
}

type Pipe = { x: number; gapY: number; scored: boolean };

interface State {
  birdY: number;
  birdVel: number;
  pipes: Pipe[];
  score: number;
  running: boolean;
  dead: boolean;
  frame: number;
}

export function FlappyBird({ onGameOver }: FlappyBirdProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<State>({
    birdY: H / 2,
    birdVel: 0,
    pipes: [],
    score: 0,
    running: false,
    dead: false,
    frame: 0,
  });
  const rafRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const [started, setStarted] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    ctx.fillStyle = "#070B14";
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 40; i++) {
      const sx = (i * 137.5) % W;
      const sy = (i * 97.3) % (H - 60);
      ctx.fillStyle = `rgba(255,255,255,${0.2 + (i % 3) * 0.15})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const pipe of s.pipes) {
      const topH = pipe.gapY - PIPE_GAP / 2;
      const botY = pipe.gapY + PIPE_GAP / 2;
      const botH = H - botY;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#37FF6B";
      ctx.fillStyle = "#1a4a1a";
      ctx.strokeStyle = "#37FF6B";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(pipe.x, 0, PIPE_W, topH, [0, 0, 8, 8]);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(pipe.x, botY, PIPE_W, botH, [8, 8, 0, 0]);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = "rgba(55,255,107,0.15)";
    ctx.fillRect(0, H - 40, W, 40);
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#37FF6B";
    ctx.strokeStyle = "#37FF6B";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, H - 40);
    ctx.lineTo(W, H - 40);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.save();
    ctx.translate(80, s.birdY);
    ctx.rotate(Math.min(Math.max(s.birdVel * 0.08, -0.5), 1.2));
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#FFD24A";
    ctx.fillStyle = "#FFD24A";
    ctx.beginPath();
    ctx.ellipse(0, 0, BIRD_R + 2, BIRD_R, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#070B14";
    ctx.beginPath();
    ctx.arc(6, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FF6B2B";
    ctx.beginPath();
    ctx.moveTo(BIRD_R + 2, 0);
    ctx.lineTo(BIRD_R + 10, -2);
    ctx.lineTo(BIRD_R + 10, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, []);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;
    s.frame++;
    s.birdVel += GRAVITY;
    s.birdY += s.birdVel;

    if (s.frame % 90 === 0) {
      const gapY = 120 + Math.random() * (H - 200 - 40);
      s.pipes.push({ x: W, gapY, scored: false });
    }

    for (const pipe of s.pipes) {
      pipe.x -= PIPE_SPEED;
      if (!pipe.scored && pipe.x + PIPE_W < 80) {
        pipe.scored = true;
        s.score++;
        setScore(s.score);
      }
    }
    s.pipes = s.pipes.filter((p) => p.x > -PIPE_W - 10);

    const bx = 80;
    const by = s.birdY;
    if (by - BIRD_R <= 0 || by + BIRD_R >= H - 40) {
      s.running = false;
      s.dead = true;
      setDead(true);
      onGameOver(s.score);
      return;
    }
    for (const pipe of s.pipes) {
      if (bx + BIRD_R > pipe.x + 4 && bx - BIRD_R < pipe.x + PIPE_W - 4) {
        const topH = pipe.gapY - PIPE_GAP / 2;
        const botY = pipe.gapY + PIPE_GAP / 2;
        if (by - BIRD_R < topH || by + BIRD_R > botY) {
          s.running = false;
          s.dead = true;
          setDead(true);
          onGameOver(s.score);
          return;
        }
      }
    }
    draw();
  }, [draw, onGameOver]);

  const loop = useCallback(() => {
    update();
    rafRef.current = requestAnimationFrame(loop);
  }, [update]);

  const flap = useCallback(() => {
    const s = stateRef.current;
    if (s.running) s.birdVel = FLAP_FORCE;
  }, []);

  const start = () => {
    const s = stateRef.current;
    s.birdY = H / 2;
    s.birdVel = 0;
    s.pipes = [];
    s.score = 0;
    s.running = true;
    s.dead = false;
    s.frame = 0;
    setScore(0);
    setDead(false);
    setStarted(true);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    draw();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw, flap]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[400px]">
        <span className="font-orbitron text-xs text-muted-foreground uppercase">
          Score
        </span>
        <span className="font-orbitron text-xl font-black neon-text-yellow">
          {score}
        </span>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-border/50">
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: canvas game uses global keyboard listener */}
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block cursor-pointer"
          onClick={flap}
        />
        {(!started || dead) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: "rgba(7,11,20,0.85)" }}
          >
            {dead && (
              <p className="font-orbitron text-sm text-red-400">GAME OVER</p>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                start();
              }}
              className="glow-btn px-8 py-3 rounded-full font-orbitron text-sm font-bold text-white uppercase tracking-widest"
              data-ocid="flappybird.primary_button"
            >
              {dead ? "Play Again" : "Start Game"}
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Click or press Space to flap
      </p>
    </div>
  );
}

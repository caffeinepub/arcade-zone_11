import { useCallback, useEffect, useRef, useState } from "react";

const W = 400;
const H = 500;
const LANE_COUNT = 3;
const LANE_WIDTH = W / LANE_COUNT;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 60;
const OBSTACLE_WIDTH = 44;
const OBSTACLE_HEIGHT = 50;
const COIN_RADIUS = 10;

function getLaneX(lane: number) {
  return LANE_WIDTH * lane + LANE_WIDTH / 2;
}

interface EndlessRunnerProps {
  onGameOver: (score: number) => void;
}

type Obstacle = { lane: number; y: number };
type Coin = { lane: number; y: number; collected: boolean };

interface State {
  lane: number;
  targetLane: number;
  playerX: number;
  playerY: number;
  jumping: boolean;
  jumpVel: number;
  baseY: number;
  sliding: boolean;
  slideTimer: number;
  obstacles: Obstacle[];
  coins: Coin[];
  score: number;
  speed: number;
  frame: number;
  running: boolean;
  dead: boolean;
  spawnTimer: number;
  coinTimer: number;
}

export function EndlessRunner({ onGameOver }: EndlessRunnerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<State>({
    lane: 1,
    targetLane: 1,
    playerX: getLaneX(1),
    playerY: H - 80,
    jumping: false,
    jumpVel: 0,
    baseY: H - 80,
    sliding: false,
    slideTimer: 0,
    obstacles: [],
    coins: [],
    score: 0,
    speed: 4,
    frame: 0,
    running: false,
    dead: false,
    spawnTimer: 0,
    coinTimer: 0,
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

    // Lane lines
    ctx.strokeStyle = "rgba(47,185,255,0.15)";
    ctx.lineWidth = 1;
    for (let i = 1; i < LANE_COUNT; i++) {
      ctx.setLineDash([20, 15]);
      ctx.beginPath();
      ctx.moveTo(LANE_WIDTH * i, 0);
      ctx.lineTo(LANE_WIDTH * i, H);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Ground
    ctx.fillStyle = "rgba(47,185,255,0.1)";
    ctx.fillRect(0, H - 20, W, 20);
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#2FB9FF";
    ctx.strokeStyle = "#2FB9FF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, H - 20);
    ctx.lineTo(W, H - 20);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Coins
    for (const coin of s.coins) {
      if (coin.collected) continue;
      const cx = getLaneX(coin.lane);
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#FFD24A";
      ctx.fillStyle = "#FFD24A";
      ctx.beginPath();
      ctx.arc(cx, coin.y, COIN_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#FFF";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Obstacles
    for (const obs of s.obstacles) {
      const ox = getLaneX(obs.lane) - OBSTACLE_WIDTH / 2;
      ctx.shadowBlur = 14;
      ctx.shadowColor = "#FF4FD8";
      ctx.fillStyle = "#FF4FD8";
      ctx.beginPath();
      ctx.roundRect(ox, obs.y, OBSTACLE_WIDTH, OBSTACLE_HEIGHT, 6);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Player
    const px = s.playerX - PLAYER_WIDTH / 2;
    const isSliding = s.sliding;
    const ph = isSliding ? PLAYER_HEIGHT / 2 : PLAYER_HEIGHT;
    const py = s.playerY - ph;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#37FF6B";
    ctx.fillStyle = "#37FF6B";
    ctx.beginPath();
    ctx.roundRect(px, py, PLAYER_WIDTH, ph, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#070B14";
    if (!isSliding) {
      ctx.beginPath();
      ctx.arc(px + 12, py + 18, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + PLAYER_WIDTH - 12, py + 18, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;
    s.frame++;
    s.score += 1;
    s.speed = 4 + s.score / 300;

    const targetX = getLaneX(s.targetLane);
    s.playerX += (targetX - s.playerX) * 0.25;
    if (Math.abs(s.playerX - targetX) < 1) {
      s.playerX = targetX;
      s.lane = s.targetLane;
    }

    if (s.jumping) {
      s.playerY += s.jumpVel;
      s.jumpVel += 0.8;
      if (s.playerY >= s.baseY) {
        s.playerY = s.baseY;
        s.jumping = false;
        s.jumpVel = 0;
      }
    }

    if (s.sliding) {
      s.slideTimer--;
      if (s.slideTimer <= 0) s.sliding = false;
    }

    s.spawnTimer--;
    if (s.spawnTimer <= 0) {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      s.obstacles.push({ lane, y: -OBSTACLE_HEIGHT });
      s.spawnTimer = 40 + Math.floor(Math.random() * 40);
    }

    s.coinTimer--;
    if (s.coinTimer <= 0) {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      s.coins.push({ lane, y: -20, collected: false });
      s.coinTimer = 30 + Math.floor(Math.random() * 30);
    }

    for (const obs of s.obstacles) obs.y += s.speed;
    s.obstacles = s.obstacles.filter((o) => o.y < H + 60);

    for (const coin of s.coins) coin.y += s.speed;
    s.coins = s.coins.filter((c) => c.y < H + 20);

    const ph = s.sliding ? PLAYER_HEIGHT / 2 : PLAYER_HEIGHT;
    const pTop = s.playerY - ph;
    const pLeft = s.playerX - PLAYER_WIDTH / 2;
    const pRight = s.playerX + PLAYER_WIDTH / 2;

    for (const obs of s.obstacles) {
      const oLeft = getLaneX(obs.lane) - OBSTACLE_WIDTH / 2;
      const oRight = oLeft + OBSTACLE_WIDTH;
      if (
        pRight > oLeft + 6 &&
        pLeft < oRight - 6 &&
        s.playerY > obs.y + 6 &&
        pTop < obs.y + OBSTACLE_HEIGHT - 6
      ) {
        s.running = false;
        s.dead = true;
        setDead(true);
        onGameOver(Math.floor(s.score / 10));
        return;
      }
    }

    for (const coin of s.coins) {
      if (coin.collected) continue;
      const cx = getLaneX(coin.lane);
      if (
        Math.abs(s.playerX - cx) < PLAYER_WIDTH / 2 + COIN_RADIUS &&
        Math.abs(s.playerY - coin.y) < PLAYER_HEIGHT / 2 + COIN_RADIUS
      ) {
        coin.collected = true;
        s.score += 50;
      }
    }

    setScore(Math.floor(s.score / 10));
    draw();
  }, [draw, onGameOver]);

  const loop = useCallback(() => {
    update();
    rafRef.current = requestAnimationFrame(loop);
  }, [update]);

  const start = () => {
    const s = stateRef.current;
    s.lane = 1;
    s.targetLane = 1;
    s.playerX = getLaneX(1);
    s.playerY = H - 80;
    s.baseY = H - 80;
    s.jumping = false;
    s.jumpVel = 0;
    s.sliding = false;
    s.slideTimer = 0;
    s.obstacles = [];
    s.coins = [];
    s.score = 0;
    s.speed = 4;
    s.frame = 0;
    s.running = true;
    s.dead = false;
    s.spawnTimer = 60;
    s.coinTimer = 40;
    setScore(0);
    setDead(false);
    setStarted(true);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    draw();
    const handleKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (!s.running) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        s.targetLane = Math.max(0, s.targetLane - 1);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        s.targetLane = Math.min(LANE_COUNT - 1, s.targetLane + 1);
      } else if ((e.key === "ArrowUp" || e.key === " ") && !s.jumping) {
        e.preventDefault();
        s.jumping = true;
        s.jumpVel = -14;
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        s.sliding = true;
        s.slideTimer = 40;
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
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: "rgba(7,11,20,0.85)" }}
          >
            {dead && (
              <p className="font-orbitron text-sm text-red-400">GAME OVER</p>
            )}
            <button
              type="button"
              onClick={start}
              className="glow-btn px-8 py-3 rounded-full font-orbitron text-sm font-bold text-white uppercase tracking-widest"
              data-ocid="endlessrunner.primary_button"
            >
              {dead ? "Play Again" : "Start Game"}
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        ← → or A/D to switch lanes · Space/↑ to jump · ↓ to slide
      </p>
    </div>
  );
}

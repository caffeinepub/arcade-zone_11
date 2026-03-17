import { useCallback, useEffect, useRef, useState } from "react";

const W = 480;
const H = 500;
const SHIP_W = 40;
const SHIP_H = 30;
const BULLET_W = 4;
const BULLET_H = 14;
const ALIEN_W = 32;
const ALIEN_H = 24;
const ALIEN_COLS = 10;
const ALIEN_ROWS = 4;
const ALIEN_PAD_X = 8;
const ALIEN_PAD_Y = 10;

interface SpaceInvadersProps {
  onGameOver: (score: number) => void;
}

type Alien = { x: number; y: number; alive: boolean; row: number };
type Bullet = { x: number; y: number; enemy: boolean };

interface State {
  shipX: number;
  bullets: Bullet[];
  aliens: Alien[];
  alienDirX: number;
  alienSpeed: number;
  score: number;
  running: boolean;
  dead: boolean;
  fireTimer: number;
  enemyFireTimer: number;
  level: number;
  keys: Set<string>;
  shootCooldown: number;
}

function initAliens(): Alien[] {
  const aliens: Alien[] = [];
  for (let row = 0; row < ALIEN_ROWS; row++) {
    for (let col = 0; col < ALIEN_COLS; col++) {
      aliens.push({
        x: 40 + col * (ALIEN_W + ALIEN_PAD_X),
        y: 60 + row * (ALIEN_H + ALIEN_PAD_Y),
        alive: true,
        row,
      });
    }
  }
  return aliens;
}

export function SpaceInvaders({ onGameOver }: SpaceInvadersProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<State>({
    shipX: W / 2 - SHIP_W / 2,
    bullets: [],
    aliens: initAliens(),
    alienDirX: 1,
    alienSpeed: 0.5,
    score: 0,
    running: false,
    dead: false,
    fireTimer: 0,
    enemyFireTimer: 80,
    level: 1,
    keys: new Set(),
    shootCooldown: 0,
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

    // Stars
    for (let i = 0; i < 60; i++) {
      const sx = (i * 173.3) % W;
      const sy = (i * 89.7) % H;
      ctx.fillStyle = `rgba(255,255,255,${0.1 + (i % 4) * 0.1})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Aliens
    const alienColors = ["#2FB9FF", "#2FB9FF", "#B84CFF", "#FF4FD8"];
    for (const alien of s.aliens) {
      if (!alien.alive) continue;
      const color = alienColors[alien.row] || "#2FB9FF";
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      // Body
      ctx.beginPath();
      ctx.roundRect(alien.x, alien.y, ALIEN_W, ALIEN_H, 4);
      ctx.fill();
      // Eyes
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#070B14";
      ctx.beginPath();
      ctx.arc(alien.x + 8, alien.y + 8, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(alien.x + ALIEN_W - 8, alien.y + 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player ship
    const sx = s.shipX;
    const sy = H - SHIP_H - 10;
    ctx.shadowBlur = 16;
    ctx.shadowColor = "#37FF6B";
    ctx.fillStyle = "#37FF6B";
    // Ship body
    ctx.beginPath();
    ctx.moveTo(sx + SHIP_W / 2, sy);
    ctx.lineTo(sx + SHIP_W, sy + SHIP_H);
    ctx.lineTo(sx, sy + SHIP_H);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Bullets
    for (const b of s.bullets) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = b.enemy ? "#FF4FD8" : "#FFD24A";
      ctx.fillStyle = b.enemy ? "#FF4FD8" : "#FFD24A";
      ctx.beginPath();
      ctx.roundRect(b.x - BULLET_W / 2, b.y, BULLET_W, BULLET_H, 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Ground line
    ctx.strokeStyle = "rgba(55,255,107,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H - 5);
    ctx.lineTo(W, H - 5);
    ctx.stroke();
  }, []);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;

    // Move ship
    const shipSpeed = 4;
    if (s.keys.has("ArrowLeft") || s.keys.has("a") || s.keys.has("A")) {
      s.shipX = Math.max(0, s.shipX - shipSpeed);
    }
    if (s.keys.has("ArrowRight") || s.keys.has("d") || s.keys.has("D")) {
      s.shipX = Math.min(W - SHIP_W, s.shipX + shipSpeed);
    }

    // Shoot
    if (s.shootCooldown > 0) s.shootCooldown--;
    if ((s.keys.has(" ") || s.keys.has("ArrowUp")) && s.shootCooldown === 0) {
      s.bullets.push({
        x: s.shipX + SHIP_W / 2,
        y: H - SHIP_H - 10,
        enemy: false,
      });
      s.shootCooldown = 18;
    }

    // Enemy fire
    s.enemyFireTimer--;
    if (s.enemyFireTimer <= 0) {
      const living = s.aliens.filter((a) => a.alive);
      if (living.length > 0) {
        const shooter = living[Math.floor(Math.random() * living.length)];
        s.bullets.push({
          x: shooter.x + ALIEN_W / 2,
          y: shooter.y + ALIEN_H,
          enemy: true,
        });
      }
      s.enemyFireTimer = 60 + Math.floor(Math.random() * 40);
    }

    // Move bullets
    for (const b of s.bullets) {
      b.y += b.enemy ? 4 : -8;
    }
    s.bullets = s.bullets.filter((b) => b.y > -20 && b.y < H + 20);

    // Move aliens
    s.fireTimer++;
    let hitEdge = false;
    for (const alien of s.aliens) {
      if (!alien.alive) continue;
      alien.x += s.alienDirX * s.alienSpeed;
      if (alien.x <= 0 || alien.x + ALIEN_W >= W) hitEdge = true;
    }
    if (hitEdge) {
      s.alienDirX *= -1;
      for (const alien of s.aliens) {
        if (alien.alive) alien.y += 14;
      }
    }

    // Bullet-alien collision
    for (const b of s.bullets) {
      if (b.enemy) continue;
      for (const alien of s.aliens) {
        if (!alien.alive) continue;
        if (
          b.x > alien.x &&
          b.x < alien.x + ALIEN_W &&
          b.y > alien.y &&
          b.y < alien.y + ALIEN_H
        ) {
          alien.alive = false;
          b.y = -999;
          s.score += 10;
          setScore(s.score);
        }
      }
    }

    // Bullet-player collision
    const px = s.shipX;
    const py = H - SHIP_H - 10;
    for (const b of s.bullets) {
      if (!b.enemy) continue;
      if (b.x > px && b.x < px + SHIP_W && b.y > py && b.y < py + SHIP_H) {
        s.running = false;
        s.dead = true;
        setDead(true);
        onGameOver(s.score);
        return;
      }
    }

    // Aliens reach bottom
    for (const alien of s.aliens) {
      if (alien.alive && alien.y + ALIEN_H >= py) {
        s.running = false;
        s.dead = true;
        setDead(true);
        onGameOver(s.score);
        return;
      }
    }

    // All aliens dead => next level
    if (s.aliens.every((a) => !a.alive)) {
      s.level++;
      s.aliens = initAliens();
      s.alienSpeed += 0.3;
      s.score += 100;
      setScore(s.score);
    }

    draw();
  }, [draw, onGameOver]);

  const loop = useCallback(() => {
    update();
    rafRef.current = requestAnimationFrame(loop);
  }, [update]);

  const start = () => {
    const s = stateRef.current;
    s.shipX = W / 2 - SHIP_W / 2;
    s.bullets = [];
    s.aliens = initAliens();
    s.alienDirX = 1;
    s.alienSpeed = 0.5;
    s.score = 0;
    s.running = true;
    s.dead = false;
    s.fireTimer = 0;
    s.enemyFireTimer = 80;
    s.level = 1;
    s.shootCooldown = 0;
    setScore(0);
    setDead(false);
    setStarted(true);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    draw();
    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys.add(e.key);
      if (e.key === " ") e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys.delete(e.key);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[480px]">
        <span className="font-orbitron text-xs text-muted-foreground uppercase">
          Score
        </span>
        <span className="font-orbitron text-xl font-black neon-text-cyan">
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
              data-ocid="spaceinvaders.primary_button"
            >
              {dead ? "Play Again" : "Start Game"}
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        ← → to move · Space to shoot
      </p>
    </div>
  );
}

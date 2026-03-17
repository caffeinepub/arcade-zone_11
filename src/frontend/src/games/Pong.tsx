import { useCallback, useEffect, useRef, useState } from "react";

const W = 480;
const H = 400;
const PAD_W = 12;
const PAD_H = 72;
const BALL_R = 8;
const WIN_SCORE = 7;

interface PongProps {
  onGameOver: (score: number) => void;
}

interface State {
  playerY: number;
  aiY: number;
  ballX: number;
  ballY: number;
  ballVX: number;
  ballVY: number;
  playerScore: number;
  aiScore: number;
  running: boolean;
  keys: Set<string>;
}

export function Pong({ onGameOver }: PongProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<State>({
    playerY: H / 2 - PAD_H / 2,
    aiY: H / 2 - PAD_H / 2,
    ballX: W / 2,
    ballY: H / 2,
    ballVX: 4,
    ballVY: 3,
    playerScore: 0,
    aiScore: 0,
    running: false,
    keys: new Set(),
  });
  const rafRef = useRef<number>(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState("");

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    ctx.fillStyle = "#070B14";
    ctx.fillRect(0, 0, W, H);

    ctx.setLineDash([12, 10]);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.shadowBlur = 14;
    ctx.shadowColor = "#37FF6B";
    ctx.fillStyle = "#37FF6B";
    ctx.beginPath();
    ctx.roundRect(20, s.playerY, PAD_W, PAD_H, 4);
    ctx.fill();

    ctx.shadowBlur = 14;
    ctx.shadowColor = "#FF4FD8";
    ctx.fillStyle = "#FF4FD8";
    ctx.beginPath();
    ctx.roundRect(W - 20 - PAD_W, s.aiY, PAD_W, PAD_H, 4);
    ctx.fill();

    ctx.shadowBlur = 18;
    ctx.shadowColor = "#2FB9FF";
    ctx.fillStyle = "#2FB9FF";
    ctx.beginPath();
    ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = "bold 28px 'Orbitron', monospace";
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.textAlign = "center";
    ctx.fillText(String(s.playerScore), W / 4, 40);
    ctx.fillText(String(s.aiScore), (3 * W) / 4, 40);
  }, []);

  const resetBall = useCallback((toPlayer: boolean) => {
    const s = stateRef.current;
    s.ballX = W / 2;
    s.ballY = H / 2;
    s.ballVX = (toPlayer ? -1 : 1) * (4 + Math.random() * 1.5);
    s.ballVY = (Math.random() > 0.5 ? 1 : -1) * (2.5 + Math.random() * 1.5);
  }, []);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;

    const padSpeed = 5;
    if (s.keys.has("w") || s.keys.has("W") || s.keys.has("ArrowUp")) {
      s.playerY = Math.max(0, s.playerY - padSpeed);
    }
    if (s.keys.has("s") || s.keys.has("S") || s.keys.has("ArrowDown")) {
      s.playerY = Math.min(H - PAD_H, s.playerY + padSpeed);
    }

    const aiCenter = s.aiY + PAD_H / 2;
    const aiSpeed = 3.2;
    if (s.ballY < aiCenter - 6) s.aiY = Math.max(0, s.aiY - aiSpeed);
    if (s.ballY > aiCenter + 6) s.aiY = Math.min(H - PAD_H, s.aiY + aiSpeed);

    s.ballX += s.ballVX;
    s.ballY += s.ballVY;

    if (s.ballY - BALL_R <= 0) {
      s.ballY = BALL_R;
      s.ballVY = Math.abs(s.ballVY);
    }
    if (s.ballY + BALL_R >= H) {
      s.ballY = H - BALL_R;
      s.ballVY = -Math.abs(s.ballVY);
    }

    if (
      s.ballX - BALL_R <= 20 + PAD_W &&
      s.ballY >= s.playerY &&
      s.ballY <= s.playerY + PAD_H
    ) {
      s.ballX = 20 + PAD_W + BALL_R;
      s.ballVX = Math.abs(s.ballVX) * 1.05;
      const rel = (s.ballY - (s.playerY + PAD_H / 2)) / (PAD_H / 2);
      s.ballVY = rel * 5;
    }
    if (
      s.ballX + BALL_R >= W - 20 - PAD_W &&
      s.ballY >= s.aiY &&
      s.ballY <= s.aiY + PAD_H
    ) {
      s.ballX = W - 20 - PAD_W - BALL_R;
      s.ballVX = -Math.abs(s.ballVX) * 1.05;
      const rel = (s.ballY - (s.aiY + PAD_H / 2)) / (PAD_H / 2);
      s.ballVY = rel * 5;
    }

    const speed = Math.sqrt(s.ballVX * s.ballVX + s.ballVY * s.ballVY);
    if (speed > 14) {
      s.ballVX = (s.ballVX / speed) * 14;
      s.ballVY = (s.ballVY / speed) * 14;
    }

    if (s.ballX - BALL_R <= 0) {
      s.aiScore++;
      setAiScore(s.aiScore);
      if (s.aiScore >= WIN_SCORE) {
        s.running = false;
        setGameOver(true);
        setWinner("AI");
        onGameOver(s.playerScore);
        return;
      }
      resetBall(false);
    }
    if (s.ballX + BALL_R >= W) {
      s.playerScore++;
      setPlayerScore(s.playerScore);
      if (s.playerScore >= WIN_SCORE) {
        s.running = false;
        setGameOver(true);
        setWinner("YOU");
        onGameOver(s.playerScore);
        return;
      }
      resetBall(true);
    }

    draw();
  }, [draw, onGameOver, resetBall]);

  const loop = useCallback(() => {
    update();
    rafRef.current = requestAnimationFrame(loop);
  }, [update]);

  const start = () => {
    const s = stateRef.current;
    s.playerY = H / 2 - PAD_H / 2;
    s.aiY = H / 2 - PAD_H / 2;
    s.playerScore = 0;
    s.aiScore = 0;
    s.running = true;
    setPlayerScore(0);
    setAiScore(0);
    setGameOver(false);
    setWinner("");
    setStarted(true);
    resetBall(Math.random() > 0.5);
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
        <span className="font-orbitron text-xs neon-text-green">
          YOU: {playerScore}
        </span>
        <span className="font-orbitron text-xs text-muted-foreground">
          First to {WIN_SCORE}
        </span>
        <span className="font-orbitron text-xs neon-text-pink">
          AI: {aiScore}
        </span>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-border/50">
        <canvas ref={canvasRef} width={W} height={H} className="block" />
        {(!started || gameOver) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: "rgba(7,11,20,0.85)" }}
          >
            {gameOver && (
              <p
                className={`font-orbitron text-lg font-black ${winner === "YOU" ? "neon-text-green" : "text-red-400"}`}
              >
                {winner === "YOU" ? "YOU WIN!" : "AI WINS"}
              </p>
            )}
            <button
              type="button"
              onClick={start}
              className="glow-btn px-8 py-3 rounded-full font-orbitron text-sm font-bold text-white uppercase tracking-widest"
              data-ocid="pong.primary_button"
            >
              {gameOver ? "Play Again" : "Start Game"}
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        W/S or ↑/↓ to move your paddle
      </p>
    </div>
  );
}

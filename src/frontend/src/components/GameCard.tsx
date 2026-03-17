import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { GameInfo } from "../data/games";

const MS_THUMB = Array.from({ length: 81 }, (_, idx) => {
  const row = Math.floor(idx / 9);
  const col = idx % 9;
  return {
    key: `ms-${row}-${col}`,
    x: 20 + col * 18,
    y: 10 + row * 12,
    highlight: (row * 9 + col) % 7 === 0,
  };
});

const BR_THUMB = Array.from({ length: 28 }, (_, idx) => {
  const row = Math.floor(idx / 7);
  const col = idx % 7;
  return { key: `br-${row}-${col}`, x: 15 + col * 26, y: 10 + row * 14, row };
});

const THUMBNAIL_COLORS: Record<
  string,
  { primary: string; secondary: string; accent: string }
> = {
  green: { primary: "#37FF6B", secondary: "#1a8c3d", accent: "#23ff8a" },
  cyan: { primary: "#2FB9FF", secondary: "#1565a0", accent: "#7dd9ff" },
  purple: { primary: "#B84CFF", secondary: "#6a1fa0", accent: "#d48cff" },
  pink: { primary: "#FF4FD8", secondary: "#9c1e80", accent: "#ff8fe8" },
  yellow: { primary: "#FFD24A", secondary: "#8c6a10", accent: "#ffe48c" },
  cyan2: { primary: "#2FB9FF", secondary: "#1a4080", accent: "#50c8ff" },
};

const TETRIS_COORDS_1 = [
  [40, 80],
  [52, 80],
  [64, 80],
  [64, 68],
] as const;
const TETRIS_COORDS_2 = [
  [90, 80],
  [90, 68],
  [102, 68],
  [114, 68],
] as const;
const TETRIS_COORDS_3 = [
  [130, 80],
  [142, 80],
  [142, 68],
  [142, 56],
] as const;

function GameThumbnail({
  gameId,
  neonColor,
}: { gameId: string; neonColor: string }) {
  const c = THUMBNAIL_COLORS[neonColor] || THUMBNAIL_COLORS.cyan;
  return (
    <div
      className="w-full h-36 rounded-t-2xl overflow-hidden relative"
      style={{
        background: `radial-gradient(ellipse at center, ${c.secondary}33 0%, #070B14 70%)`,
      }}
    >
      {gameId === "snake" && (
        <svg
          viewBox="0 0 200 120"
          className="w-full h-full"
          role="img"
          aria-label="Snake game thumbnail"
        >
          <rect
            x="20"
            y="20"
            width="12"
            height="12"
            rx="3"
            fill={c.primary}
            opacity="0.9"
          />
          <rect
            x="36"
            y="20"
            width="12"
            height="12"
            rx="3"
            fill={c.primary}
            opacity="0.8"
          />
          <rect
            x="52"
            y="20"
            width="12"
            height="12"
            rx="3"
            fill={c.primary}
            opacity="0.7"
          />
          <rect
            x="52"
            y="36"
            width="12"
            height="12"
            rx="3"
            fill={c.primary}
            opacity="0.65"
          />
          <rect
            x="52"
            y="52"
            width="12"
            height="12"
            rx="3"
            fill={c.primary}
            opacity="0.6"
          />
          <rect
            x="68"
            y="52"
            width="12"
            height="12"
            rx="3"
            fill={c.primary}
            opacity="0.55"
          />
          <rect
            x="84"
            y="52"
            width="12"
            height="12"
            rx="3"
            fill={c.primary}
            opacity="0.5"
          />
          <circle cx="160" cy="60" r="6" fill={c.accent} opacity="0.9" />
        </svg>
      )}
      {gameId === "tetris" && (
        <svg
          viewBox="0 0 200 120"
          className="w-full h-full"
          role="img"
          aria-label="Tetris game thumbnail"
        >
          {TETRIS_COORDS_1.map(([x, y], i) => (
            <rect
              key={`t1-${x}-${y}`}
              x={x}
              y={y}
              width="11"
              height="11"
              rx="1"
              fill={c.primary}
              opacity={0.9 - i * 0.05}
            />
          ))}
          {TETRIS_COORDS_2.map(([x, y], i) => (
            <rect
              key={`t2-${x}-${y}`}
              x={x}
              y={y}
              width="11"
              height="11"
              rx="1"
              fill={c.accent}
              opacity={0.9 - i * 0.05}
            />
          ))}
          {TETRIS_COORDS_3.map(([x, y], i) => (
            <rect
              key={`t3-${x}-${y}`}
              x={x}
              y={y}
              width="11"
              height="11"
              rx="1"
              fill="#ff6b6b"
              opacity={0.9 - i * 0.05}
            />
          ))}
          <rect
            x="20"
            y="92"
            width="160"
            height="11"
            rx="1"
            fill={c.primary}
            opacity="0.3"
          />
        </svg>
      )}
      {gameId === "tictactoe" && (
        <svg
          viewBox="0 0 200 120"
          className="w-full h-full"
          role="img"
          aria-label="Tic-Tac-Toe game thumbnail"
        >
          <line
            x1="73"
            y1="20"
            x2="73"
            y2="100"
            stroke={c.primary}
            strokeWidth="2"
            opacity="0.6"
          />
          <line
            x1="107"
            y1="20"
            x2="107"
            y2="100"
            stroke={c.primary}
            strokeWidth="2"
            opacity="0.6"
          />
          <line
            x1="40"
            y1="47"
            x2="140"
            y2="47"
            stroke={c.primary}
            strokeWidth="2"
            opacity="0.6"
          />
          <line
            x1="40"
            y1="73"
            x2="140"
            y2="73"
            stroke={c.primary}
            strokeWidth="2"
            opacity="0.6"
          />
          <text
            x="52"
            y="42"
            fontSize="20"
            fill={c.primary}
            textAnchor="middle"
            opacity="0.9"
          >
            X
          </text>
          <text
            x="90"
            y="68"
            fontSize="20"
            fill={c.accent}
            textAnchor="middle"
            opacity="0.9"
          >
            O
          </text>
          <text
            x="125"
            y="42"
            fontSize="20"
            fill={c.primary}
            textAnchor="middle"
            opacity="0.9"
          >
            X
          </text>
          <text
            x="52"
            y="94"
            fontSize="20"
            fill={c.accent}
            textAnchor="middle"
            opacity="0.9"
          >
            O
          </text>
        </svg>
      )}
      {gameId === "minesweeper" && (
        <svg
          viewBox="0 0 200 120"
          className="w-full h-full"
          role="img"
          aria-label="Minesweeper game thumbnail"
        >
          {MS_THUMB.map((cell) => (
            <rect
              key={cell.key}
              x={cell.x}
              y={cell.y}
              width="16"
              height="10"
              rx="2"
              fill={cell.highlight ? c.primary : "#1a2040"}
              opacity="0.8"
            />
          ))}
          <text
            x="100"
            y="80"
            fontSize="22"
            fill={c.primary}
            textAnchor="middle"
            opacity="0.4"
          >
            💣
          </text>
        </svg>
      )}
      {gameId === "memorymatch" && (
        <svg
          viewBox="0 0 200 120"
          className="w-full h-full"
          role="img"
          aria-label="Memory Match game thumbnail"
        >
          {["🌟", "🎮", "🚀", "💎", "🌟", "🎮", "🚀", "💎"].map((em, i) => (
            <text
              key={`mm-${em}-${i < 4 ? "top" : "bot"}`}
              x={30 + (i % 4) * 42}
              y={i < 4 ? 45 : 90}
              fontSize="22"
              textAnchor="middle"
              opacity="0.8"
            >
              {em}
            </text>
          ))}
        </svg>
      )}
      {gameId === "breakout" && (
        <svg
          viewBox="0 0 200 120"
          className="w-full h-full"
          role="img"
          aria-label="Breakout game thumbnail"
        >
          {BR_THUMB.map((cell) => (
            <rect
              key={cell.key}
              x={cell.x}
              y={cell.y}
              width="22"
              height="10"
              rx="2"
              fill={
                ([c.primary, c.accent, c.secondary, "#ff6b6b"] as string[])[
                  cell.row
                ]
              }
              opacity="0.85"
            />
          ))}
          <rect
            x="70"
            y="105"
            width="60"
            height="8"
            rx="4"
            fill={c.primary}
            opacity="0.9"
          />
          <circle cx="100" cy="90" r="5" fill={c.accent} opacity="0.9" />
        </svg>
      )}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${c.primary}22 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

interface GameCardProps {
  game: GameInfo;
  index: number;
}

export function GameCard({ game, index }: GameCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
    >
      <Link
        to="/game/$gameId"
        params={{ gameId: game.id }}
        data-ocid={`game.item.${index + 1}`}
      >
        <div className="game-card overflow-hidden">
          <GameThumbnail gameId={game.id} neonColor={game.neonColor} />
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-orbitron font-bold text-sm uppercase tracking-wider text-foreground">
                {game.name}
              </h3>
              <Badge
                variant="outline"
                className="text-xs border-border/50 text-muted-foreground"
              >
                {game.category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              {game.description}
            </p>
            <button
              type="button"
              className="glow-btn w-full py-2 rounded-full text-xs font-bold text-white uppercase tracking-widest"
              data-ocid={`game.primary_button.${index + 1}`}
            >
              Play Now
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

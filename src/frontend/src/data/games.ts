export interface GameInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  neonColor: "cyan" | "green" | "purple" | "pink" | "yellow" | "cyan2";
  emoji: string;
}

export const GAMES: GameInfo[] = [
  {
    id: "snake",
    name: "Snake",
    description:
      "Guide the snake to eat food and grow longer. Avoid walls and yourself!",
    category: "Classic",
    neonColor: "green",
    emoji: "🐍",
  },
  {
    id: "tetris",
    name: "Tetris",
    description:
      "Stack falling blocks and clear lines to score. How high can you get?",
    category: "Puzzle",
    neonColor: "cyan",
    emoji: "🟦",
  },
  {
    id: "tictactoe",
    name: "Tic-Tac-Toe",
    description: "Classic two-player strategy. Get three in a row to win!",
    category: "Strategy",
    neonColor: "purple",
    emoji: "❌",
  },
  {
    id: "minesweeper",
    name: "Minesweeper",
    description:
      "Reveal safe cells, flag the mines. One wrong click and it's over!",
    category: "Puzzle",
    neonColor: "yellow",
    emoji: "💣",
  },
  {
    id: "memorymatch",
    name: "Memory Match",
    description:
      "Flip cards to find all matching emoji pairs. Train your memory!",
    category: "Memory",
    neonColor: "pink",
    emoji: "🃏",
  },
  {
    id: "breakout",
    name: "Breakout",
    description: "Bounce the ball to smash all bricks. Don't let it fall!",
    category: "Action",
    neonColor: "cyan2",
    emoji: "🧱",
  },
  {
    id: "endlessrunner",
    name: "Endless Runner",
    description:
      "Dodge obstacles and collect coins in this 3-lane endless runner!",
    category: "Action",
    neonColor: "green",
    emoji: "🏃",
  },
  {
    id: "flappybird",
    name: "Flappy Bird",
    description: "Tap to flap and navigate through the pipes without crashing!",
    category: "Classic",
    neonColor: "yellow",
    emoji: "🐦",
  },
  {
    id: "spaceinvaders",
    name: "Space Invaders",
    description: "Shoot the alien invaders before they reach Earth!",
    category: "Action",
    neonColor: "cyan",
    emoji: "👾",
  },
  {
    id: "pong",
    name: "Pong",
    description: "Classic paddle battle against the AI. First to 7 wins!",
    category: "Classic",
    neonColor: "purple",
    emoji: "🏓",
  },
  {
    id: "pacman",
    name: "Pac-Man",
    description: "Eat all the dots and avoid the ghosts in the classic maze!",
    category: "Classic",
    neonColor: "pink",
    emoji: "👻",
  },
];

export const GAME_NEON_STYLES: Record<
  string,
  { border: string; text: string; glow: string; bg: string }
> = {
  cyan: {
    border: "neon-border-cyan",
    text: "neon-text-cyan",
    glow: "shadow-neon-cyan",
    bg: "from-[oklch(0.72_0.18_220/0.15)] to-transparent",
  },
  green: {
    border: "neon-border-green",
    text: "neon-text-green",
    glow: "shadow-neon-green",
    bg: "from-[oklch(0.85_0.28_145/0.15)] to-transparent",
  },
  purple: {
    border: "neon-border-purple",
    text: "neon-text-purple",
    glow: "shadow-neon-purple",
    bg: "from-[oklch(0.58_0.29_296/0.15)] to-transparent",
  },
  pink: {
    border: "neon-border-pink",
    text: "neon-text-pink",
    glow: "shadow-neon-pink",
    bg: "from-[oklch(0.65_0.28_330/0.15)] to-transparent",
  },
  yellow: {
    border: "neon-border-yellow",
    text: "neon-text-yellow",
    glow: "shadow-neon-yellow",
    bg: "from-[oklch(0.87_0.17_82/0.15)] to-transparent",
  },
  cyan2: {
    border: "neon-border-cyan",
    text: "neon-text-cyan",
    glow: "shadow-neon-cyan",
    bg: "from-[oklch(0.72_0.18_220/0.1)] to-transparent",
  },
};

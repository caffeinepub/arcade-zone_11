import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Leaderboard } from "../components/Leaderboard";
import { ScoreSubmitDialog } from "../components/ScoreSubmitDialog";
import { GAMES } from "../data/games";
import { Breakout } from "../games/Breakout";
import { EndlessRunner } from "../games/EndlessRunner";
import { FlappyBird } from "../games/FlappyBird";
import { MemoryMatch } from "../games/MemoryMatch";
import { Minesweeper } from "../games/Minesweeper";
import { PacMan } from "../games/PacMan";
import { Pong } from "../games/Pong";
import { Snake } from "../games/Snake";
import { SpaceInvaders } from "../games/SpaceInvaders";
import { Tetris } from "../games/Tetris";
import { TicTacToe } from "../games/TicTacToe";

const GAME_COMPONENTS: Record<
  string,
  React.ComponentType<{ onGameOver: (score: number) => void }>
> = {
  snake: Snake,
  tetris: Tetris,
  tictactoe: TicTacToe,
  minesweeper: Minesweeper,
  memorymatch: MemoryMatch,
  breakout: Breakout,
  endlessrunner: EndlessRunner,
  flappybird: FlappyBird,
  spaceinvaders: SpaceInvaders,
  pong: Pong,
  pacman: PacMan,
};

export function GamePage() {
  const { gameId } = useParams({ from: "/game/$gameId" });
  const game = GAMES.find((g) => g.id === gameId);
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-orbitron text-xl text-muted-foreground">
            Game not found
          </p>
          <Link to="/" className="mt-4 inline-block neon-text-cyan text-sm">
            ← Back to Lobby
          </Link>
        </div>
      </div>
    );
  }

  const GameComponent = GAME_COMPONENTS[gameId];

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setTimeout(() => setScoreDialogOpen(true), 500);
  };

  return (
    <main className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
            data-ocid="game.link"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Lobby
          </Link>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Game Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1"
          >
            <div className="mb-6">
              <h1 className="font-orbitron text-2xl font-black uppercase tracking-wider text-foreground">
                {game.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {game.description}
              </p>
            </div>
            <div
              className="rounded-2xl border border-border/50 p-6"
              style={{ background: "oklch(0.11 0.026 258)" }}
            >
              {GameComponent && <GameComponent onGameOver={handleGameOver} />}
            </div>
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-72 shrink-0"
          >
            <Leaderboard gameId={game.id} gameName={game.name} />
          </motion.div>
        </div>
      </div>

      <ScoreSubmitDialog
        open={scoreDialogOpen}
        onClose={() => setScoreDialogOpen(false)}
        gameId={game.id}
        gameName={game.name}
        score={finalScore}
      />
    </main>
  );
}

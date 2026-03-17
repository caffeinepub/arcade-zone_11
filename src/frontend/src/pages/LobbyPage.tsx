import { Gamepad2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { GameCard } from "../components/GameCard";
import { GAMES } from "../data/games";

export function LobbyPage() {
  return (
    <main>
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, oklch(0.65 0.28 25) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, oklch(0.58 0.29 296) 0%, transparent 70%)",
            }}
          />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full opacity-40">
            <svg
              viewBox="0 0 600 600"
              className="w-full h-full"
              fill="none"
              role="img"
              aria-label="Arcade decorative illustration"
            >
              <rect
                x="340"
                y="80"
                width="80"
                height="80"
                rx="12"
                stroke="#FF4433"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />
              <rect
                x="360"
                y="100"
                width="40"
                height="40"
                rx="6"
                fill="#FF4433"
                opacity="0.2"
              />
              <rect
                x="200"
                y="160"
                width="100"
                height="100"
                rx="16"
                stroke="#B84CFF"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
              <rect
                x="450"
                y="200"
                width="60"
                height="60"
                rx="10"
                stroke="#37FF6B"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />
              <rect
                x="280"
                y="300"
                width="120"
                height="80"
                rx="14"
                stroke="#FF4FD8"
                strokeWidth="2"
                fill="none"
                opacity="0.4"
              />
              <circle
                cx="500"
                cy="380"
                r="50"
                stroke="#FFD24A"
                strokeWidth="2"
                fill="none"
                opacity="0.4"
              />
              <circle
                cx="350"
                cy="450"
                r="30"
                stroke="#FF4433"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
              <line
                x1="420"
                y1="120"
                x2="420"
                y2="160"
                stroke="#FF4433"
                strokeWidth="1"
                opacity="0.4"
              />
              <line
                x1="300"
                y1="260"
                x2="350"
                y2="300"
                stroke="#B84CFF"
                strokeWidth="1"
                opacity="0.4"
              />
              <line
                x1="480"
                y1="260"
                x2="480"
                y2="330"
                stroke="#37FF6B"
                strokeWidth="1"
                opacity="0.4"
              />
            </svg>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 neon-text-cyan" />
                <span className="text-xs font-orbitron tracking-widest uppercase neon-text-cyan">
                  BOYS ONLY SITE
                </span>
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-orbitron text-5xl md:text-7xl font-black uppercase leading-tight text-foreground mb-4"
            >
              PLAY THE
              <br />
              <span className="neon-text-cyan">CLASSICS.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground text-lg mb-8 max-w-md leading-relaxed"
            >
              Eleven iconic arcade games, reimagined for the modern web. Compete
              for the top spot on global leaderboards.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <a
                href="#games"
                className="glow-btn inline-flex items-center gap-2 px-8 py-4 rounded-full font-orbitron text-sm font-bold text-white uppercase tracking-widest"
                data-ocid="hero.primary_button"
              >
                <Gamepad2 className="w-4 h-4" />
                Play Now
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="games" className="max-w-7xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-10"
        >
          <h2 className="font-orbitron text-2xl font-black uppercase tracking-wider text-foreground">
            Browse Games
          </h2>
          <div className="flex-1 h-px bg-border/30" />
          <span className="text-xs text-muted-foreground font-orbitron">
            {GAMES.length} Games
          </span>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((game, i) => (
            <GameCard key={game.id} game={game} index={i} />
          ))}
        </div>
      </section>
    </main>
  );
}

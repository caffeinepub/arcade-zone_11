import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

const EMOJIS = ["🚀", "💎", "🎮", "⚡", "🔥", "🌟", "🎯", "🎲"];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function createCards() {
  return shuffle(
    [...EMOJIS, ...EMOJIS].map((emoji, i) => ({
      id: i,
      emoji,
      flipped: false,
      matched: false,
    })),
  );
}

interface MemoryMatchProps {
  onGameOver: (score: number) => void;
}

export function MemoryMatch({ onGameOver }: MemoryMatchProps) {
  const [cards, setCards] = useState(createCards());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const handleFlip = useCallback(
    (id: number) => {
      if (locked || won) return;
      setCards((prev) => {
        const card = prev.find((c) => c.id === id);
        if (!card || card.flipped || card.matched) return prev;
        return prev.map((c) => (c.id === id ? { ...c, flipped: true } : c));
      });
      setFlipped((prev) => {
        const next = [...prev, id];
        if (next.length === 2) return next;
        return next;
      });
      if (!running) setRunning(true);
    },
    [locked, won, running],
  );

  useEffect(() => {
    if (flipped.length !== 2) return;
    setLocked(true);
    setMoves((p) => p + 1);
    const [a, b] = flipped;
    setCards((prev) => {
      const ca = prev.find((c) => c.id === a)!;
      const cb = prev.find((c) => c.id === b)!;
      if (ca.emoji === cb.emoji) {
        const next = prev.map((c) =>
          c.id === a || c.id === b ? { ...c, matched: true } : c,
        );
        if (next.every((c) => c.matched)) {
          setWon(true);
          setRunning(false);
          const score = Math.max(100, 1000 - moves * 10 - time * 2);
          onGameOver(score);
        }
        setFlipped([]);
        setLocked(false);
        return next;
      }
      setTimeout(() => {
        setCards((p2) =>
          p2.map((c) =>
            c.id === a || c.id === b ? { ...c, flipped: false } : c,
          ),
        );
        setFlipped([]);
        setLocked(false);
      }, 800);
      return prev;
    });
  }, [flipped, moves, time, onGameOver]);

  const reset = () => {
    setCards(createCards());
    setFlipped([]);
    setMoves(0);
    setTime(0);
    setRunning(false);
    setWon(false);
    setLocked(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6">
        <span className="font-orbitron text-sm">
          Moves: <span className="neon-text-pink">{moves}</span>
        </span>
        <span className="font-orbitron text-sm">
          Time: <span className="neon-text-cyan">{time}s</span>
        </span>
        <button
          type="button"
          onClick={reset}
          className="text-sm text-muted-foreground hover:text-foreground"
          data-ocid="memory.secondary_button"
        >
          Reset
        </button>
      </div>

      {won && (
        <div className="text-center">
          <p className="font-orbitron text-lg font-bold neon-text-pink">
            You Win! 🎉
          </p>
          <p className="text-sm text-muted-foreground">
            {moves} moves in {time}s
          </p>
          <button
            type="button"
            onClick={reset}
            className="glow-btn mt-2 px-6 py-2 rounded-full font-orbitron text-xs font-bold text-white uppercase tracking-widest"
            data-ocid="memory.primary_button"
          >
            Play Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <motion.button
            type="button"
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className="w-16 h-16 rounded-xl text-2xl flex items-center justify-center border transition-all"
            style={{
              background:
                card.flipped || card.matched
                  ? "oklch(0.18 0.04 258)"
                  : "oklch(0.16 0.03 258)",
              borderColor: card.matched
                ? "oklch(0.65 0.28 330 / 0.7)"
                : card.flipped
                  ? "oklch(0.72 0.18 220 / 0.6)"
                  : "oklch(0.25 0.04 240 / 0.4)",
            }}
            animate={{ rotateY: card.flipped || card.matched ? 0 : 180 }}
            transition={{ duration: 0.3 }}
            data-ocid={`memory.item.${i + 1}`}
          >
            {card.flipped || card.matched ? card.emoji : ""}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

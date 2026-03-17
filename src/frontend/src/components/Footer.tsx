import { Gamepad2 } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer
      className="border-t border-border/50 mt-20"
      style={{ background: "oklch(0.1 0.026 258)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg glow-btn flex items-center justify-center">
                <Gamepad2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-orbitron font-bold text-sm neon-text-cyan">
                BOYS ONLY SITE
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your ultimate destination for classic arcade games. Play for free,
              compete for the top spot on the leaderboards.
            </p>
          </div>
          <div>
            <h4 className="font-orbitron text-xs tracking-widest text-muted-foreground uppercase mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {["Home", "All Games", "Leaderboard", "About"].map((link) => (
                <li key={link}>
                  <a
                    href="/"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-orbitron text-xs tracking-widest text-muted-foreground uppercase mb-4">
              Games
            </h4>
            <ul className="space-y-2">
              {[
                "Snake",
                "Tetris",
                "Tic-Tac-Toe",
                "Minesweeper",
                "Memory Match",
                "Breakout",
              ].map((game) => (
                <li key={game}>
                  <span className="text-sm text-muted-foreground">{game}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border/30 mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {year}. Built with ❤️ using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="neon-text-cyan hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

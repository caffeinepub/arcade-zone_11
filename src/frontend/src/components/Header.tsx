import { Link } from "@tanstack/react-router";
import { Gamepad2 } from "lucide-react";

export function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50"
      style={{
        background: "oklch(0.09 0.025 258 / 0.95)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 group"
          data-ocid="header.link"
        >
          <div className="w-8 h-8 rounded-lg glow-btn flex items-center justify-center">
            <Gamepad2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-orbitron font-800 text-lg tracking-wider neon-text-cyan">
            BOYS ONLY SITE
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
            data-ocid="nav.link"
          >
            Home
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
            data-ocid="nav.link"
          >
            All Games
          </Link>
          <Link
            to="/web"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
            data-ocid="nav.web.link"
          >
            Web
          </Link>
          <Link
            to="/movies"
            className="text-sm font-medium transition-colors tracking-wide uppercase"
            style={{ color: "oklch(0.75 0.2 320)" }}
            data-ocid="nav.movies.link"
          >
            Movies
          </Link>
          <Link
            to="/chat"
            className="text-sm font-medium transition-colors tracking-wide uppercase"
            style={{ color: "oklch(0.72 0.22 145)" }}
            data-ocid="nav.chat.link"
          >
            Chat
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="glow-btn px-5 py-2 rounded-full text-sm font-semibold text-white tracking-wide uppercase"
            data-ocid="header.button"
          >
            Login
          </button>
        </div>
      </div>
    </header>
  );
}

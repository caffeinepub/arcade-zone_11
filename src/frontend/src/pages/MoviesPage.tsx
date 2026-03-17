import { useState } from "react";

const MOVIE_SITES = [
  {
    label: "FlickyStream",
    url: "https://flickystream.ru/player/tv/59186/5/1",
    host: "flickystream.ru",
  },
  { label: "HydraHD", url: "https://hydrahd.ru", host: "hydrahd.ru" },
];

export function MoviesPage() {
  const [active, setActive] = useState(0);

  return (
    <main
      className="flex flex-col"
      style={{
        height: "calc(100vh - 72px)",
        background: "oklch(0.07 0.02 258)",
        marginTop: "72px",
      }}
    >
      <div
        className="flex-shrink-0 px-4 py-2 border-b border-border/50 flex items-center gap-4"
        style={{ background: "oklch(0.10 0.025 258)" }}
      >
        <span
          className="font-orbitron text-sm font-bold tracking-widest uppercase"
          style={{ color: "oklch(0.75 0.2 320)" }}
        >
          🎬 Movies
        </span>
        <div className="flex gap-2">
          {MOVIE_SITES.map((site, i) => (
            <button
              type="button"
              key={site.url}
              onClick={() => setActive(i)}
              className="px-3 py-1 rounded text-xs font-semibold transition-colors"
              style={{
                background:
                  active === i ? "oklch(0.55 0.22 25)" : "oklch(0.15 0.03 258)",
                color: active === i ? "#fff" : "oklch(0.65 0.1 258)",
                border:
                  active === i
                    ? "1px solid oklch(0.65 0.22 25)"
                    : "1px solid oklch(0.25 0.04 258)",
              }}
            >
              {site.label}
            </button>
          ))}
        </div>
        <span className="text-muted-foreground text-xs ml-auto">
          {MOVIE_SITES[active].host}
        </span>
      </div>
      <div className="flex-1 relative overflow-hidden">
        {MOVIE_SITES.map((site, i) => (
          <iframe
            key={site.url}
            src={site.url}
            title={site.label}
            className="w-full h-full border-0 absolute inset-0"
            style={{ display: active === i ? "block" : "none" }}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ))}
      </div>
    </main>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  RefreshCw,
  Search,
  Shield,
  X,
  Youtube,
} from "lucide-react";
import { useRef, useState } from "react";

const PROXY = "https://corsproxy.io/?url=";

const QUICK_LINKS = [
  {
    label: "YouTube",
    url: "https://www.youtube.com",
    icon: <Youtube className="w-4 h-4" />,
    color: "oklch(0.45 0.22 27)",
    glow: "oklch(0.55 0.22 27 / 0.6)",
  },
  {
    label: "DuckDuckGo",
    url: "https://duckduckgo.com",
    icon: <Search className="w-4 h-4" />,
    color: "oklch(0.45 0.2 200)",
    glow: "oklch(0.55 0.2 200 / 0.5)",
  },
  {
    label: "GetIt",
    url: "https://tuffled-getit-pleaselaugh.newlifesanctuarychurch.com/g",
    icon: <Globe className="w-4 h-4" />,
    color: "oklch(0.40 0.18 290)",
    glow: "oklch(0.55 0.2 290 / 0.5)",
  },
];

function proxyUrl(url: string) {
  return `${PROXY}${encodeURIComponent(url)}`;
}

export function WebPage() {
  const [addressBar, setAddressBar] = useState("https://duckduckgo.com");
  const [currentUrl, setCurrentUrl] = useState("https://duckduckgo.com");
  const [useProxy, setUseProxy] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function navigate(url: string) {
    let finalUrl = url.trim();
    if (!finalUrl) return;
    if (!/^https?:\/\//i.test(finalUrl)) {
      if (finalUrl.includes(" ") || !finalUrl.includes(".")) {
        finalUrl = `https://duckduckgo.com/?q=${encodeURIComponent(finalUrl)}`;
      } else {
        finalUrl = `https://${finalUrl}`;
      }
    }
    setBlocked(false);
    setLoading(true);
    setCurrentUrl(finalUrl);
    setAddressBar(finalUrl);
  }

  function handleGo(e?: React.FormEvent) {
    e?.preventDefault();
    navigate(addressBar);
  }

  function handleLoad() {
    setLoading(false);
    if (!useProxy) {
      try {
        const loc = iframeRef.current?.contentWindow?.location?.href;
        if (loc && loc !== "about:blank") {
          setAddressBar(loc);
        }
      } catch {
        // cross-origin
      }
    }
  }

  function handleError() {
    setLoading(false);
    if (useProxy) {
      setBlocked(true);
    } else {
      setUseProxy(true);
    }
  }

  function handleBack() {
    try {
      iframeRef.current?.contentWindow?.history.back();
    } catch {
      /* ignore */
    }
  }

  function handleForward() {
    try {
      iframeRef.current?.contentWindow?.history.forward();
    } catch {
      /* ignore */
    }
  }

  function handleRefresh() {
    setBlocked(false);
    setLoading(true);
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.src = useProxy ? proxyUrl(currentUrl) : currentUrl;
    }
  }

  const iframeSrc = useProxy ? proxyUrl(currentUrl) : currentUrl;

  return (
    <main
      className="flex flex-col"
      style={{
        height: "calc(100vh - 72px)",
        background: "oklch(0.07 0.02 258)",
        marginTop: "72px",
      }}
    >
      {/* Browser Chrome */}
      <div
        className="flex-shrink-0 border-b border-border/60 px-3 py-2 space-y-2"
        style={{ background: "oklch(0.10 0.025 258)" }}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleForward}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* Address bar */}
          <form onSubmit={handleGo} className="flex-1 flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                type="text"
                value={addressBar}
                onChange={(e) => setAddressBar(e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="Search or enter URL..."
                className="w-full pr-8 bg-black/40 border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:border-cyan-500/60 rounded-full h-8"
                style={{ fontFamily: "monospace" }}
              />
              {addressBar && (
                <button
                  type="button"
                  onClick={() => setAddressBar("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              size="sm"
              className="rounded-full px-4 h-8 font-semibold uppercase tracking-wide text-white border-0 text-xs"
              style={{
                background: "oklch(0.45 0.2 200)",
                boxShadow: "0 0 12px oklch(0.55 0.2 200 / 0.5)",
              }}
            >
              Go
            </Button>
          </form>

          {/* Proxy toggle */}
          <button
            type="button"
            onClick={() => {
              setUseProxy((p) => !p);
              setBlocked(false);
              setLoading(true);
            }}
            title={useProxy ? "Proxy ON (bypass blocking)" : "Proxy OFF"}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{
              background: useProxy
                ? "oklch(0.35 0.18 145 / 0.5)"
                : "transparent",
              boxShadow: useProxy
                ? "0 0 8px oklch(0.55 0.2 145 / 0.4)"
                : "none",
              color: useProxy ? "oklch(0.75 0.2 145)" : "oklch(0.5 0.02 258)",
            }}
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>

        {/* Quick-launch tabs */}
        <div className="flex items-center gap-2">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => navigate(link.url)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white/80 hover:text-white transition-colors"
              style={{
                background: link.color,
                boxShadow: `0 0 8px ${link.glow}`,
              }}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
          <span className="text-muted-foreground text-xs ml-2 flex items-center gap-1">
            {useProxy ? (
              <>
                <Shield className="w-3 h-3 text-green-400" />{" "}
                <span className="text-green-400">Proxy on</span> &mdash; bypass
                blocking enabled
              </>
            ) : (
              "Proxy off"
            )}
          </span>
        </div>
      </div>

      {/* iframe viewport */}
      <div className="flex-1 relative overflow-hidden">
        {blocked ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10"
            style={{ background: "oklch(0.07 0.02 258)" }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.15 0.03 258)",
                boxShadow: "0 0 30px oklch(0.55 0.2 27 / 0.3)",
              }}
            >
              <X className="w-10 h-10 text-red-400" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="font-orbitron font-bold text-xl text-white">
                Can&apos;t Display Site
              </h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Even with the proxy, this site blocks embedding. Try opening it
                directly in a new tab.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => window.open(currentUrl, "_blank")}
                className="glow-btn px-6 py-2.5 rounded-full text-sm font-semibold text-white tracking-wide"
              >
                Open in New Tab
              </button>
              <button
                type="button"
                onClick={() => {
                  setBlocked(false);
                  navigate("https://duckduckgo.com");
                }}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-muted-foreground border border-border/60 hover:text-white hover:border-white/40 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        ) : null}

        {loading && !blocked && (
          <div
            className="absolute top-0 left-0 right-0 h-0.5 z-20"
            style={{
              background: "oklch(0.75 0.2 200)",
              boxShadow: "0 0 8px oklch(0.75 0.2 200)",
            }}
          >
            <div
              className="h-full animate-pulse"
              style={{ background: "oklch(0.85 0.22 200 / 0.5)" }}
            />
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={iframeSrc}
          title="Web Browser"
          className="w-full h-full border-0"
          onLoad={handleLoad}
          onError={handleError}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
          allow="autoplay; encrypted-media; fullscreen"
          style={{ display: blocked ? "none" : "block" }}
        />
      </div>
    </main>
  );
}

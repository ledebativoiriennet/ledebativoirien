"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

const LivePopupPlayer = dynamic(() => import("./LivePopupPlayer"), { ssr: false });

interface LiveStream {
  id: string;
  title: string;
  url: string;
  platform: string;
}

const POLL_INTERVAL = 30_000; // 30 seconds

export default function LiveStreamBadge() {
  const [live, setLive] = useState<LiveStream | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch("/api/live", { cache: "no-store" });
      const data = await res.json();
      setLive(data || null);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLive]);

  if (!live) {
    // Afficher badge inactif (grisé) - pas cliquable
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: "0.25rem 0.65rem",
          borderRadius: "999px",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.35)",
          fontSize: "0.72rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          cursor: "default",
          userSelect: "none",
          whiteSpace: "nowrap",
          fontFamily: "inherit",
          margin: 0,
          boxSizing: "border-box",
          lineHeight: "1",
        }}
      >
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
        EN LIVE
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowPlayer(true)}
        title={`Regarder en direct : ${live.title}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: "0.25rem 0.65rem",
          borderRadius: "999px",
          border: "1px solid rgba(220,38,38,0.6)",
          backgroundColor: "rgba(220,38,38,0.15)",
          color: "#fca5a5",
          fontSize: "0.72rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          cursor: "pointer",
          whiteSpace: "nowrap",
          animation: "liveBadgePulse 2s ease-in-out infinite",
          outline: "none",
          transition: "background 0.2s",
          fontFamily: "inherit",
          margin: 0,
          boxSizing: "border-box",
          lineHeight: "1",
        }}
      >
        <span style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: "#ef4444",
          flexShrink: 0,
          animation: "liveDot 1s ease-in-out infinite",
        }} />
        EN LIVE
      </button>

      {showPlayer && (
        <LivePopupPlayer stream={live} onClose={() => setShowPlayer(false)} />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes liveBadgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
          50% { box-shadow: 0 0 0 4px rgba(220,38,38,0.25); }
        }
        @keyframes liveDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}} />
    </>
  );
}

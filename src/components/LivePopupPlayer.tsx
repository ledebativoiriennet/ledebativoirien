"use client";

import { useEffect, useRef, useState } from "react";

interface LiveStream {
  id: string;
  title: string;
  url: string;
  platform: string;
}

interface LivePopupPlayerProps {
  stream: LiveStream;
  onClose: () => void;
}

function getEmbedUrl(stream: LiveStream): string | null {
  const { url, platform } = stream;

  if (platform === "YOUTUBE") {
    // Handle youtu.be/ID and youtube.com/watch?v=ID and /live/ID
    let videoId = "";
    try {
      const u = new URL(url);
      if (u.hostname === "youtu.be") {
        videoId = u.pathname.slice(1).split("?")[0];
      } else {
        videoId = u.searchParams.get("v") || u.pathname.split("/").pop() || "";
      }
    } catch {
      videoId = url.split("/").pop()?.split("?")[0] || "";
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`;
  }

  if (platform === "FACEBOOK") {
    const encoded = encodeURIComponent(url);
    return `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&autoplay=true&width=960`;
  }

  if (platform === "TIKTOK") {
    // TikTok lives don't have a standard embed — open in new tab button
    return null;
  }

  // OTHER: try direct iframe (works for many platforms)
  return url;
}

export default function LivePopupPlayer({ stream, onClose }: LivePopupPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPiP, setIsPiP] = useState(false);
  const embedUrl = getEmbedUrl(stream);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen().catch(() => {});
    }
  };

  const handlePiP = async () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    // PiP on iframe content (works in Chromium)
    try {
      const video = iframe.contentDocument?.querySelector("video");
      if (video) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          setIsPiP(false);
        } else {
          await video.requestPictureInPicture();
          setIsPiP(true);
        }
      } else {
        alert("PiP non disponible pour cette source vidéo.");
      }
    } catch {
      alert("PiP non supporté pour cette source. Essayez le plein écran.");
    }
  };

  const platformColors: Record<string, string> = {
    YOUTUBE: "#FF0000",
    FACEBOOK: "#1877F2",
    TIKTOK: "#000000",
    OTHER: "#6366f1",
  };

  const platformLabels: Record<string, string> = {
    YOUTUBE: "YouTube",
    FACEBOOK: "Facebook",
    TIKTOK: "TikTok",
    OTHER: "Direct",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={containerRef}
        style={{
          width: "100%",
          maxWidth: "960px",
          backgroundColor: "#0f172a",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.7)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Header bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1.25rem",
          backgroundColor: "#1e293b",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Live dot */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              backgroundColor: "#dc2626",
              borderRadius: "999px",
              padding: "0.25rem 0.65rem",
            }}>
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                backgroundColor: "white",
                animation: "livePulse 1s infinite",
              }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "white", textTransform: "uppercase" }}>
                EN DIRECT
              </span>
            </div>

            {/* Platform badge */}
            <span style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "white",
              backgroundColor: platformColors[stream.platform] || "#6366f1",
              padding: "0.2rem 0.6rem",
              borderRadius: "4px",
            }}>
              {platformLabels[stream.platform] || "Direct"}
            </span>

            <span style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: 600 }}>
              {stream.title}
            </span>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {/* PiP */}
            <button
              onClick={handlePiP}
              title="Picture in Picture"
              style={{
                width: "36px", height: "36px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.15)",
                backgroundColor: isPiP ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
                color: "white",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem",
                transition: "all 0.2s",
              }}
            >
              ⧉
            </button>

            {/* Fullscreen */}
            <button
              onClick={handleFullscreen}
              title="Plein écran"
              style={{
                width: "36px", height: "36px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.15)",
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "white",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem",
                transition: "all 0.2s",
              }}
            >
              ⛶
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              title="Fermer"
              style={{
                width: "36px", height: "36px",
                borderRadius: "8px",
                border: "1px solid rgba(220,38,38,0.4)",
                backgroundColor: "rgba(220,38,38,0.15)",
                color: "#fca5a5",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.1rem",
                fontWeight: "bold",
                transition: "all 0.2s",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Video area */}
        <div style={{ position: "relative", aspectRatio: "16/9", backgroundColor: "#000" }}>
          {embedUrl ? (
            <iframe
              ref={iframeRef}
              src={embedUrl}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              title={stream.title}
            />
          ) : (
            // TikTok fallback
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "1.5rem",
              background: "linear-gradient(135deg, #000, #1a0036)",
            }}>
              <div style={{ fontSize: "4rem" }}>🎵</div>
              <p style={{ color: "white", fontWeight: 700, fontSize: "1.1rem", textAlign: "center", padding: "0 2rem" }}>
                TikTok Live ne supporte pas l'intégration directe.
              </p>
              <a
                href={stream.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: "#000",
                  color: "white",
                  padding: "0.75rem 1.75rem",
                  borderRadius: "8px",
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                🔗 Voir sur TikTok
              </a>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}} />
    </div>
  );
}

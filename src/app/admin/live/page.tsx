"use client";

import { useState, useEffect } from "react";

interface LiveStream {
  id: string;
  title: string;
  url: string;
  platform: string;
  isActive: boolean;
  createdAt: string;
}

const platformIcons: Record<string, string> = {
  YOUTUBE: "▶️",
  FACEBOOK: "📘",
  TIKTOK: "🎵",
  OTHER: "📡",
};

const platformColors: Record<string, string> = {
  YOUTUBE: "#FF0000",
  FACEBOOK: "#1877F2",
  TIKTOK: "#000",
  OTHER: "#6366f1",
};

export default function AdminLivePage() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("Direct LDI");
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchStreams = async () => {
    const res = await fetch("/api/admin/live");
    const data = await res.json();
    setStreams(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchStreams(); }, []);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const detectPlatform = (u: string) => {
    const lower = u.toLowerCase();
    if (lower.includes("youtube") || lower.includes("youtu.be")) return "YOUTUBE";
    if (lower.includes("facebook") || lower.includes("fb.com") || lower.includes("fb.watch")) return "FACEBOOK";
    if (lower.includes("tiktok")) return "TIKTOK";
    return "OTHER";
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) { showMsg("error", "L'URL est requise."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, activate: true }),
      });
      if (res.ok) {
        showMsg("success", "✅ Live démarré avec succès !");
        setUrl("");
        setTitle("Direct LDI");
        await fetchStreams();
      } else {
        const err = await res.json();
        showMsg("error", err.error || "Erreur.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (stream: LiveStream) => {
    const res = await fetch("/api/admin/live", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: stream.id, isActive: !stream.isActive }),
    });
    if (res.ok) {
      showMsg("success", stream.isActive ? "⏹ Live arrêté." : "✅ Live activé !");
      await fetchStreams();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce live ?")) return;
    const res = await fetch("/api/admin/live", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      showMsg("success", "Supprimé.");
      await fetchStreams();
    }
  };

  const activeLive = streams.find((s) => s.isActive);
  const platform = detectPlatform(url);

  return (
    <div style={{ padding: "2rem", maxWidth: "900px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
          🔴
        </div>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Diffusion En Direct</h1>
          <p style={{ color: "#64748b", margin: "0.25rem 0 0" }}>Gérez le flux live diffusé sur le site. Un seul direct à la fois.</p>
        </div>
      </div>

      {/* Status banner */}
      {activeLive && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          backgroundColor: "#fef2f2",
          border: "2px solid #dc2626",
          borderRadius: "12px",
          padding: "1rem 1.5rem",
          marginBottom: "2rem",
          animation: "pulseBorder 2s ease-in-out infinite",
        }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#dc2626", animation: "liveDot 1s infinite", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, color: "#dc2626", fontSize: "0.85rem", textTransform: "uppercase" }}>🔴 EN DIRECT MAINTENANT</div>
            <div style={{ fontWeight: 700, color: "#0f172a", marginTop: "0.15rem" }}>{activeLive.title}</div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.15rem", wordBreak: "break-all" }}>{activeLive.url}</div>
          </div>
          <button
            onClick={() => handleToggle(activeLive)}
            style={{ backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "8px", padding: "0.6rem 1.25rem", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", flexShrink: 0 }}
          >
            ⏹ Arrêter le live
          </button>
        </div>
      )}

      {/* Notification */}
      {message && (
        <div style={{
          padding: "0.75rem 1.25rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          backgroundColor: message.type === "success" ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${message.type === "success" ? "#86efac" : "#fca5a5"}`,
          color: message.type === "success" ? "#166534" : "#991b1b",
          fontWeight: 600,
        }}>
          {message.text}
        </div>
      )}

      {/* Create form */}
      <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "2rem", marginBottom: "2rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          📡 Lancer un nouveau direct
        </h2>

        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#374151", marginBottom: "0.4rem" }}>
              Titre du direct
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Direct LDI"
              style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#374151", marginBottom: "0.4rem" }}>
              Lien du live <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/live/... ou https://facebook.com/... ou https://tiktok.com/..."
              required
              style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Platform auto-detection preview */}
          {url && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "1.2rem" }}>{platformIcons[platform]}</span>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Plateforme détectée</div>
                <div style={{ fontWeight: 800, color: platformColors[platform] || "#0f172a" }}>{platform}</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#64748b", padding: "0.5rem 0.75rem", backgroundColor: "#f1f5f9", borderRadius: "6px" }}>
              <span>📺</span> YouTube Live
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#64748b", padding: "0.5rem 0.75rem", backgroundColor: "#f1f5f9", borderRadius: "6px" }}>
              <span>📘</span> Facebook Live
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#64748b", padding: "0.5rem 0.75rem", backgroundColor: "#f1f5f9", borderRadius: "6px" }}>
              <span>🎵</span> TikTok Live
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "0.85rem 2rem",
              fontSize: "1rem",
              fontWeight: 800,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              alignSelf: "flex-start",
              transition: "all 0.2s",
            }}
          >
            {saving ? "⏳ Lancement..." : "🔴 Démarrer le direct"}
          </button>
        </form>
      </div>

      {/* History */}
      <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "2rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem" }}>
          📋 Historique des directs
        </h2>

        {loading ? (
          <p style={{ color: "#64748b" }}>Chargement...</p>
        ) : streams.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem 0" }}>Aucun direct enregistré.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {streams.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  backgroundColor: s.isActive ? "#fef2f2" : "#f8fafc",
                  border: `1px solid ${s.isActive ? "#fca5a5" : "#e2e8f0"}`,
                  borderRadius: "10px",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{platformIcons[s.platform] || "📡"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 800, color: "#0f172a" }}>{s.title}</span>
                    {s.isActive && (
                      <span style={{ backgroundColor: "#dc2626", color: "white", fontSize: "0.65rem", fontWeight: 800, padding: "0.15rem 0.5rem", borderRadius: "999px", textTransform: "uppercase" }}>
                        EN DIRECT
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.url}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.1rem" }}>
                    {new Date(s.createdAt).toLocaleString("fr-FR")}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggle(s)}
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: "6px",
                      border: `1px solid ${s.isActive ? "#dc2626" : "#22c55e"}`,
                      backgroundColor: s.isActive ? "rgba(220,38,38,0.08)" : "rgba(34,197,94,0.08)",
                      color: s.isActive ? "#dc2626" : "#16a34a",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      transition: "all 0.2s",
                    }}
                  >
                    {s.isActive ? "⏹ Arrêter" : "▶ Activer"}
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    style={{ padding: "0.45rem 0.7rem", borderRadius: "6px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#ef4444", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", transition: "all 0.2s" }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes liveDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes pulseBorder {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
          50% { box-shadow: 0 0 0 6px rgba(220,38,38,0.12); }
        }
      `}} />
    </div>
  );
}

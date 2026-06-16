"use client";

import { useState, useEffect } from "react";

type LiveUpdate = {
  id: string;
  content: string;
  authorName: string;
  isPinned: boolean;
  createdAt: string;
};

export default function LiveBlogFeed({ articleId, initialUpdates }: { articleId: string, initialUpdates: LiveUpdate[] }) {
  const [updates, setUpdates] = useState<LiveUpdate[]>(initialUpdates);
  const [lastFetch, setLastFetch] = useState<Date>(new Date());

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch(`/api/live-blog/${articleId}`);
        if (res.ok) {
          const data = await res.json();
          setUpdates(data);
          setLastFetch(new Date());
        }
      } catch (e) {
        console.error("Erreur de rafraîchissement du live blog", e);
      }
    };

    // Polling toutes les 15 secondes
    const interval = setInterval(fetchUpdates, 15000);
    return () => clearInterval(interval);
  }, [articleId]);

  const pinnedUpdates = updates.filter(u => u.isPinned);
  const regularUpdates = updates.filter(u => !u.isPinned);

  if (updates.length === 0) return null;

  return (
    <div style={{ margin: "2rem 0", padding: "1.5rem", backgroundColor: "#f8fafc", borderRadius: "12px", border: "2px solid #ef4444" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <span style={{ display: "inline-block", width: "12px", height: "12px", backgroundColor: "#ef4444", borderRadius: "50%", animation: "pulse 1.5s infinite" }}></span>
        <h3 style={{ margin: 0, color: "#b91c1c", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px" }}>En Direct</h3>
        <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--muted)" }}>
          Mis à jour à {lastFetch.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>

      {pinnedUpdates.length > 0 && (
        <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "1px dashed #fca5a5" }}>
          {pinnedUpdates.map(update => (
            <div key={update.id} style={{ backgroundColor: "#fef2f2", padding: "1rem", borderRadius: "8px", borderLeft: "4px solid #ef4444" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#991b1b", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>📌 Épinglé</span>
                <span>•</span>
                <span>{new Date(update.createdAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: "bold", lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: update.content }} />
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "relative" }}>
        {/* Timeline Line */}
        <div style={{ position: "absolute", left: "15px", top: "10px", bottom: "10px", width: "2px", backgroundColor: "#e2e8f0", zIndex: 0 }}></div>

        {regularUpdates.map(update => (
          <div key={update.id} style={{ display: "flex", gap: "1.5rem", position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "32px", flexShrink: 0 }}>
              <div style={{ width: "32px", height: "32px", backgroundColor: "white", border: "2px solid #ef4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "bold", color: "#ef4444" }}>
                {new Date(update.createdAt).getHours()}h
              </div>
            </div>
            <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", flexGrow: 1, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.5rem", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "bold", color: "var(--foreground)" }}>{update.authorName}</span>
                <span>{new Date(update.createdAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div style={{ fontSize: "0.95rem", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: update.content }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

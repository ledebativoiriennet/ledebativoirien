"use client";

import { useState, useEffect } from "react";

export default function ZenModeToggle() {
  const [isZenMode, setIsZenMode] = useState(false);

  useEffect(() => {
    if (isZenMode) {
      document.body.classList.add("zen-mode-active");
    } else {
      document.body.classList.remove("zen-mode-active");
    }
    
    // Nettoyage si on quitte le composant en mode zen
    return () => {
      document.body.classList.remove("zen-mode-active");
    };
  }, [isZenMode]);

  return (
    <button
      onClick={() => setIsZenMode(!isZenMode)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 1rem",
        borderRadius: "20px",
        border: "1px solid var(--border)",
        backgroundColor: isZenMode ? "var(--primary)" : "var(--background)",
        color: isZenMode ? "white" : "var(--foreground)",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "0.85rem",
        transition: "all 0.3s ease",
      }}
      title={isZenMode ? "Quitter le mode lecture zen" : "Activer le mode lecture zen (sans distraction)"}
      className="zen-mode-toggle"
    >
      <span style={{ fontSize: "1.2rem" }}>{isZenMode ? "👁️" : "🧘‍♂️"}</span>
      <span className="hidden sm:inline">{isZenMode ? "Quitter le mode zen" : "Mode Zen"}</span>
    </button>
  );
}

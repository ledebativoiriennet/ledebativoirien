"use client";

import { useEffect, useState, useRef } from "react";

export default function ScrollProgressSaver({ articleId }: { articleId: string }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [savedPosition, setSavedPosition] = useState(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const key = `ldi_scroll_${articleId}`;
    
    // Au chargement, vérifier s'il y a une position sauvegardée
    const saved = localStorage.getItem(key);
    if (saved) {
      const pos = parseInt(saved, 10);
      if (pos > 500) {
        setSavedPosition(pos);
        setShowPrompt(true);
        
        // Cacher automatiquement après 10 secondes
        setTimeout(() => setShowPrompt(false), 10000);
      }
    }

    // Écouter le scroll pour sauvegarder la progression
    const handleScroll = () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      
      scrollTimeout.current = setTimeout(() => {
        // Ne sauvegarder que si on a scrollé un minimum
        if (window.scrollY > 300) {
          localStorage.setItem(key, window.scrollY.toString());
        }
      }, 500); // debounce 500ms
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [articleId]);

  const handleResume = () => {
    window.scrollTo({ top: savedPosition, behavior: "smooth" });
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div 
      className="fade-in"
      style={{
        position: "fixed",
        bottom: "80px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--border)",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
        borderRadius: "24px",
        padding: "0.5rem 1rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        zIndex: 50,
        color: "var(--foreground)"
      }}
    >
      <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>📍 Reprendre la lecture ?</span>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button 
          onClick={handleResume}
          style={{
            backgroundColor: "var(--primary)",
            color: "white",
            border: "none",
            padding: "0.4rem 0.8rem",
            borderRadius: "16px",
            fontSize: "0.8rem",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Oui
        </button>
        <button 
          onClick={() => {
            setShowPrompt(false);
            localStorage.removeItem(`ldi_scroll_${articleId}`);
          }}
          style={{
            backgroundColor: "transparent",
            color: "var(--muted)",
            border: "1px solid var(--border)",
            padding: "0.4rem 0.8rem",
            borderRadius: "16px",
            fontSize: "0.8rem",
            cursor: "pointer"
          }}
        >
          Non
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";

export default function HighlightWrapper({ 
  children, 
  articleId, 
  articleTitle, 
  articleUrl 
}: { 
  children: React.ReactNode, 
  articleId: string,
  articleTitle: string,
  articleUrl: string
}) {
  const { data: session } = useSession();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim() === "") {
        setShowTooltip(false);
        return;
      }

      // Check if selection is inside wrapper
      if (wrapperRef.current && wrapperRef.current.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Position tooltip above the selection
        setTooltipPos({
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top + window.scrollY - 10
        });
        setSelectedText(selection.toString().trim());
        setShowTooltip(true);
      } else {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  const handleSave = async () => {
    if (!session?.user) {
      alert("Veuillez vous connecter pour sauvegarder un surlignage.");
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, text: selectedText })
      });
      if (res.ok) {
        alert("Citation sauvegardée dans vos favoris !");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      setShowTooltip(false);
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleShareTwitter = () => {
    const text = \`"\${selectedText}" — \${articleTitle}\`;
    const url = \`https://twitter.com/intent/tweet?text=\${encodeURIComponent(text)}&url=\${encodeURIComponent(articleUrl)}\`;
    window.open(url, "_blank");
    setShowTooltip(false);
    window.getSelection()?.removeAllRanges();
  };

  const handleShareWhatsApp = () => {
    const text = \`"\${selectedText}" — \${articleTitle}\\n\\nLire ici: \${articleUrl}\`;
    const url = \`https://wa.me/?text=\${encodeURIComponent(text)}\`;
    window.open(url, "_blank");
    setShowTooltip(false);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      {children}

      {showTooltip && (
        <div 
          className="highlight-tooltip fade-in"
          style={{
            position: "absolute",
            top: \`\${tooltipPos.y}px\`,
            left: \`\${tooltipPos.x}px\`,
            transform: "translate(-50%, -100%)",
            backgroundColor: "#111",
            color: "white",
            padding: "0.5rem",
            borderRadius: "8px",
            display: "flex",
            gap: "0.5rem",
            zIndex: 1000,
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)"
          }}
        >
          {/* Flèche pointant vers le bas */}
          <div style={{
            position: "absolute",
            bottom: "-6px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid #111"
          }} />

          <button 
            onClick={handleSave}
            disabled={isSaving}
            style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "0.85rem", fontWeight: "bold", padding: "0.2rem 0.5rem" }}
            title="Sauvegarder dans mon compte"
          >
            {isSaving ? "⏳" : "📝 Sauvegarder"}
          </button>
          <div style={{ width: "1px", backgroundColor: "#333" }} />
          <button 
            onClick={handleShareTwitter}
            style={{ background: "none", border: "none", color: "#1DA1F2", cursor: "pointer", fontSize: "1rem", padding: "0.2rem 0.5rem" }}
            title="Partager sur Twitter"
          >
            𝕏
          </button>
          <button 
            onClick={handleShareWhatsApp}
            style={{ background: "none", border: "none", color: "#25D366", cursor: "pointer", fontSize: "1rem", padding: "0.2rem 0.5rem" }}
            title="Partager sur WhatsApp"
          >
            📱
          </button>
        </div>
      )}
    </div>
  );
}

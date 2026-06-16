"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function GiftArticleButton({ articleId, articleSlug }: { articleId: string, articleSlug: string }) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [giftLink, setGiftLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const role = (session?.user as any)?.role || "USER";
  const isPremium = ["PREMIUM", "CONFIDENTIEL", "ULTIMATE", "EDITOR", "ADMIN"].includes(role);

  // N'afficher le bouton que pour les abonnés Premium
  if (!isPremium) return null;

  const handleGenerateLink = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const baseUrl = window.location.origin;
        setGiftLink(`${baseUrl}/article/${articleSlug}?giftToken=${data.token}`);
      } else {
        setError(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setError("Impossible de générer le lien pour le moment.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (giftLink) {
      navigator.clipboard.writeText(giftLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: "inline-block", position: "relative" }}>
      {!giftLink ? (
        <button 
          onClick={handleGenerateLink} 
          disabled={isLoading}
          className="btn btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          title="Offrir cet article à un ami (Bypass Paywall)"
        >
          🎁 {isLoading ? "Génération..." : "Offrir l'article"}
        </button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input 
            type="text" 
            readOnly 
            value={giftLink} 
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--primary)", fontSize: "0.8rem", width: "200px", outline: "none" }}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button 
            onClick={copyToClipboard}
            className="btn btn-primary"
            style={{ padding: "0.5rem 1rem" }}
          >
            {copied ? "Copié !" : "Copier"}
          </button>
        </div>
      )}
      {error && <div style={{ color: "#dc2626", fontSize: "0.75rem", position: "absolute", top: "100%", left: 0, marginTop: "0.5rem", width: "200px" }}>{error}</div>}
    </div>
  );
}

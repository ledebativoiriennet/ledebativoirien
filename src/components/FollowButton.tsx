"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function FollowButton({ 
  type, 
  targetId,
  initialIsFollowing = false
}: { 
  type: "author" | "tag", 
  targetId: string,
  initialIsFollowing?: boolean
}) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (session?.user && !hasFetched) {
      fetch("/api/follow")
        .then(res => res.json())
        .then(data => {
          if (type === "author" && data.authors?.includes(targetId)) setIsFollowing(true);
          if (type === "tag" && data.tags?.includes(targetId)) setIsFollowing(true);
          setHasFetched(true);
        })
        .catch(console.error);
    }
  }, [session, type, targetId, hasFetched]);

  const toggleFollow = async () => {
    if (!session?.user) {
      alert("Veuillez vous connecter pour utiliser cette fonctionnalité.");
      return;
    }

    setIsLoading(true);
    const action = isFollowing ? "unfollow" : "follow";
    
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, targetId, action })
      });
      
      if (res.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleFollow} 
      disabled={isLoading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.15rem 0.5rem",
        fontSize: "0.7rem",
        fontWeight: "bold",
        borderRadius: "12px",
        border: \`1px solid \${isFollowing ? "var(--muted)" : "var(--primary)"}\`,
        backgroundColor: isFollowing ? "var(--card-bg)" : "var(--primary)",
        color: isFollowing ? "var(--foreground)" : "white",
        cursor: "pointer",
        transition: "all 0.2s ease"
      }}
      title={isFollowing ? "Ne plus suivre" : "Suivre pour recevoir des alertes"}
    >
      {isLoading ? "..." : isFollowing ? "✓ Suivi" : "+ Suivre"}
    </button>
  );
}

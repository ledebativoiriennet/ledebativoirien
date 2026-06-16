"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function BookmarkButton({ articleId }: { articleId: string }) {
  const { data: session, status } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      fetch(`/api/bookmarks?articleId=${articleId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.bookmarked !== undefined) {
            setIsBookmarked(data.bookmarked);
          }
        });
    }
  }, [articleId, status]);

  const toggleBookmark = async () => {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ articleId }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.bookmarked);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout aux favoris", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={isLoading}
      title={isBookmarked ? "Retirer des favoris" : "Lire plus tard"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        backgroundColor: isBookmarked ? "rgba(230, 0, 0, 0.1)" : "#f1f5f9",
        transition: "all 0.2s ease",
        opacity: isLoading ? 0.6 : 1,
      }}
      className="hover-bg-muted"
    >
      <span style={{ fontSize: "1.2rem", filter: isBookmarked ? "none" : "grayscale(100%)" }}>
        {isBookmarked ? "🔖" : "📑"}
      </span>
    </button>
  );
}

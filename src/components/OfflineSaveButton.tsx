"use client";

import { useState, useEffect } from "react";
import { isArticleSavedOffline, saveArticleOffline, removeArticleOffline } from "@/lib/offline";

type OfflineSaveButtonProps = {
  article: {
    id: string;
    slug: string;
    title: string;
    content: string;
    imageUrl: string;
    excerpt: string;
  };
};

export default function OfflineSaveButton({ article }: OfflineSaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Check if article is already saved in IndexedDB
    isArticleSavedOffline(article.id).then(setIsSaved);
  }, [article.id]);

  const toggleOfflineSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      if (isSaved) {
        await removeArticleOffline(article.id);
        setIsSaved(false);
      } else {
        await saveArticleOffline({
          id: article.id,
          slug: article.slug,
          title: article.title,
          content: article.content, // HTML content
          imageUrl: article.imageUrl || "/default-article-image.jpg",
          excerpt: article.excerpt || "",
          savedAt: Date.now(),
        });
        setIsSaved(true);
      }
    } catch (e) {
      console.error("Erreur de sauvegarde hors-ligne", e);
      alert("Impossible de sauvegarder l'article hors-ligne. Votre navigateur ne le supporte peut-être pas.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={toggleOfflineSave}
      disabled={isSaving}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 1rem",
        borderRadius: "20px",
        border: "1px solid var(--border)",
        backgroundColor: isSaved ? "var(--primary)" : "var(--background)",
        color: isSaved ? "white" : "var(--foreground)",
        cursor: isSaving ? "wait" : "pointer",
        fontWeight: "bold",
        fontSize: "0.85rem",
        transition: "all 0.3s ease",
        opacity: isSaving ? 0.7 : 1
      }}
      title={isSaved ? "Retirer des lectures hors-ligne" : "Sauvegarder pour lire hors-ligne"}
    >
      <span style={{ fontSize: "1.2rem" }}>{isSaved ? "💾" : "⬇️"}</span>
      <span className="hidden sm:inline">
        {isSaving ? "Sauvegarde..." : isSaved ? "Sauvegardé" : "Hors-ligne"}
      </span>
    </button>
  );
}

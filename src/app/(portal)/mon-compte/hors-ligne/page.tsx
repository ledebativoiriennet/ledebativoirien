"use client";

import { useEffect, useState } from "react";
import { OfflineArticle, getOfflineArticles, removeArticleOffline } from "@/lib/offline";
import Link from "next/link";
import Image from "next/image";

export default function OfflineArticlesPage() {
  const [articles, setArticles] = useState<OfflineArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const saved = await getOfflineArticles();
      setArticles(saved.sort((a, b) => b.savedAt - a.savedAt));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (confirm("Retirer cet article de vos lectures hors-ligne ?")) {
      await removeArticleOffline(id);
      loadArticles();
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Chargement de vos articles hors-ligne...</div>;
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Lectures Hors-Ligne ⬇️
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
        Ces articles sont sauvegardés directement sur votre appareil. Vous pouvez les lire même sans connexion Internet (en mode avion ou dans le métro).
      </p>

      {articles.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px dashed var(--border)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📴</div>
          <p style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Aucun article sauvegardé</p>
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>Cliquez sur le bouton "Hors-ligne" sur un article pour le retrouver ici.</p>
          <Link href="/" className="btn btn-primary">
            Explorer les articles
          </Link>
        </div>
      ) : (
        <div className="grid-responsive-2col">
          {articles.map((article) => (
            <div key={article.id} className="article-card" style={{ position: "relative" }}>
              <div style={{ position: "relative", height: "200px", width: "100%", backgroundColor: "var(--muted)" }}>
                {article.imageUrl ? (
                  <Image 
                    src={article.imageUrl} 
                    alt={article.title} 
                    fill 
                    style={{ objectFit: "cover" }} 
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                    Pas d'image
                  </div>
                )}
              </div>
              <div className="article-card-content">
                <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
                  Sauvegardé le {new Date(article.savedAt).toLocaleDateString()}
                </div>
                <h3 className="article-title">
                  <Link href={`/article/${article.slug}`}>{article.title}</Link>
                </h3>
                <p className="article-excerpt" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {article.excerpt}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                  <Link href={`/article/${article.slug}`} className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                    Lire l'article
                  </Link>
                  <button 
                    onClick={() => handleRemove(article.id)}
                    style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.2rem" }}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

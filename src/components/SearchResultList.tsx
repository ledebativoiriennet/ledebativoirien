"use client";

import Link from "next/link";
import { getArticleImage } from "@/lib/utils";

interface ArticleWithCategories {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  imageCaption: string | null;
  publishedAt: Date | null;
  categories: { id: string; name: string }[];
}

interface SearchResultListProps {
  articles: ArticleWithCategories[];
  searchEventId: string;
}

export default function SearchResultList({ articles, searchEventId }: SearchResultListProps) {
  const handleTrackClick = async (position: number) => {
    try {
      await fetch("/api/search/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchEventId, position }),
      });
    } catch (e) {
      console.error("Failed to track click", e);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
      {articles.map((article, index) => {
        const imgUrl = getArticleImage(article as any);
        const position = index + 1;
        return (
          <Link 
            href={`/article/${article.slug}`} 
            key={article.id}
            onClick={() => handleTrackClick(position)}
          >
            <div className="article-card" style={{ height: '100%' }}>
              <div className="article-card-image" style={{ height: '180px', position: 'relative' }}>
                {imgUrl ? (
                  <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ background: 'var(--foreground)', color: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>LDI</div>
                )}
                {article.categories[0] && (
                  <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', backgroundColor: 'var(--primary)', color: 'white', fontSize: '0.6rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', borderRadius: '2px', textTransform: 'uppercase' }}>
                    {article.categories[0].name}
                  </div>
                )}
              </div>
              <div className="article-card-content" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                  {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR') : ""}
                </div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.5rem' }}>{article.title}</h2>
                {article.excerpt && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {article.excerpt}
                  </p>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

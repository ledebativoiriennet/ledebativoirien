import React from 'react';
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MainNavigation from "@/components/MainNavigation";

export const metadata = {
  title: "Toute l'actualité en continu - Le Débat Ivoirien"
};

export const revalidate = 60;

export default async function EnContinuPage() {
  const articles = await prisma.article.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    take: 100, // Fetch the last 100 articles
    include: { categories: true }
  });

  return (
    <>
      <MainNavigation categories={[]} />
      <main className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', color: 'var(--primary)', borderBottom: '4px solid var(--border)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>⏱️</span> L'actualité en continu
        </h1>
        
        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--muted)', fontSize: '1.2rem' }}>
            Aucun article n'est disponible pour le moment.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {articles.map((article) => {
              const date = new Date(article.publishedAt || new Date());
              return (
                <div key={article.id} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: '80px', flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>
                      {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 'bold', marginTop: '0.2rem', textTransform: 'capitalize' }}>
                      {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {article.categories && article.categories.length > 0 && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem', display: 'block' }}>
                        {article.categories[0].name}
                      </span>
                    )}
                    <Link href={`/article/${article.slug}`} style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--foreground)', textDecoration: 'none', lineHeight: 1.4, display: 'block', marginBottom: '0.5rem' }}>
                      {article.title}
                    </Link>
                    {article.excerpt && (
                      <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold' }}>
            ← Retour à l'accueil
          </Link>
        </div>
      </main>
    </>
  );
}

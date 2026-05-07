import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archives - Le Débat Ivoirien",
  description: "Consultez les archives de tous les articles publiés sur Le Débat Ivoirien.",
};

export default async function ArchivesPage() {
  const articles = await prisma.article.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    take: 100, // Show the 100 most recent for now
    include: { categories: true }
  });

  // Group by year and month
  const grouped = articles.reduce((acc: any, article) => {
    const date = new Date(article.publishedAt!);
    const year = date.getFullYear();
    const month = date.toLocaleString('fr-FR', { month: 'long' });
    
    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(article);
    return acc;
  }, {});

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="container" style={{ padding: '4rem 1rem', minHeight: '70vh' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--primary)', borderBottom: '4px solid var(--border)', paddingBottom: '1rem' }}>
        Archives du journal
      </h1>

      <div style={{ maxWidth: '800px' }}>
        {years.length === 0 ? (
          <p style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>Aucun article archivé pour le moment.</p>
        ) : (
          years.map(year => (
            <div key={year} style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--foreground)' }}>{year}</h2>
              {Object.keys(grouped[year]).map(month => (
                <div key={month} style={{ marginBottom: '2rem', paddingLeft: '1.5rem', borderLeft: '2px solid var(--primary)' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'capitalize' }}>{month}</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {grouped[year][month].map((article: any) => (
                      <li key={article.id}>
                        <Link href={`/article/${article.slug}`} style={{ fontSize: '1.1rem', color: 'var(--foreground)', textDecoration: 'none', fontWeight: 600 }}>
                          <span style={{ color: 'var(--muted)', fontSize: '0.9rem', marginRight: '1rem', fontWeight: 'normal' }}>
                            {new Date(article.publishedAt!).toLocaleDateString('fr-FR', { day: 'numeric' })}
                          </span>
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      
      <div style={{ marginTop: '4rem', padding: '2rem', backgroundColor: '#f1f5f9', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Vous recherchez un article spécifique ?</p>
        <Link href="/search" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>
          Utiliser la recherche avancée
        </Link>
      </div>
    </div>
  );
}

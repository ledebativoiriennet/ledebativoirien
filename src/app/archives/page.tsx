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

  // Group by year, month and day
  const grouped = articles.reduce((acc: any, article) => {
    const date = new Date(article.publishedAt!);
    const year = date.getFullYear();
    const month = date.toLocaleString('fr-FR', { month: 'long' });
    const day = date.getDate();
    
    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = {};
    if (!acc[year][month][day]) acc[year][month][day] = [];
    acc[year][month][day].push(article);
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.2rem 1rem', borderRadius: '4px', fontWeight: 900 }}>{year}</span>
                <div style={{ height: '2px', backgroundColor: 'var(--border)', flex: 1 }}></div>
              </div>

              {Object.keys(grouped[year]).map(month => (
                <div key={month} style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.2rem', textTransform: 'capitalize', color: 'var(--primary)' }}>{month}</h3>
                  
                  {Object.keys(grouped[year][month]).sort((a, b) => Number(b) - Number(a)).map(day => (
                    <div key={day} style={{ marginBottom: '1.5rem', paddingLeft: '1rem', borderLeft: '3px solid #e2e8f0' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📅 Jour {day}
                      </h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {grouped[year][month][day].map((article: any) => (
                          <li key={article.id}>
                            <Link href={`/article/${article.slug}`} style={{ fontSize: '1.05rem', color: 'var(--foreground)', textDecoration: 'none', fontWeight: 600, display: 'block' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', marginRight: '0.75rem', opacity: 0.8 }}>
                                {new Date(article.publishedAt!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {article.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
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

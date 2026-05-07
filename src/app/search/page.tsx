import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getArticleImage } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Résultats de recherche - Le Débat Ivoirien",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: query } = await searchParams;

  if (!query) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Recherche</h1>
        <p style={{ color: 'var(--muted)' }}>Veuillez saisir un mot-clé pour effectuer une recherche.</p>
      </div>
    );
  }

  const articles = await prisma.article.findMany({
    where: {
      publishedAt: { not: null },
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
        { excerpt: { contains: query } },
      ],
    },
    orderBy: { publishedAt: 'desc' },
    take: 40,
    include: { categories: true },
  });

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '70vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', borderBottom: '4px solid var(--primary)', paddingBottom: '0.5rem', display: 'inline-block' }}>
        Résultats pour : "{query}"
      </h1>
      
      <p style={{ marginBottom: '2rem', color: 'var(--muted)' }}>
        {articles.length} {articles.length > 1 ? 'articles trouvés' : 'article trouvé'}
      </p>

      {articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Aucun résultat trouvé</h2>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Désolé, nous n'avons trouvé aucun article correspondant à votre recherche.</p>
          <Link href="/" style={{ display: 'inline-block', marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>
            Retour à l'accueil
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {articles.map((article) => {
            const imgUrl = getArticleImage(article);
            return (
              <Link href={`/article/${article.slug}`} key={article.id}>
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
                      {new Date(article.publishedAt!).toLocaleDateString('fr-FR')}
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
      )}
    </div>
  );
}

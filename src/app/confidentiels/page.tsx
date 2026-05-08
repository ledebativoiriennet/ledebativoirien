import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getArticleImage } from "@/lib/utils";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Les Confidentiels - Le Débat Ivoirien",
  description: "Accédez à nos informations exclusives, brèves de couloirs et indiscrétions politiques en Côte d'Ivoire.",
};

export default async function ConfidentielsPage() {
  const articles = await prisma.article.findMany({
    where: { 
      isConfidentiel: true,
      publishedAt: { not: null }
    },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: { author: true, categories: true }
  });

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 900, 
          textTransform: 'uppercase', 
          color: '#7f1d1d',
          letterSpacing: '-0.05em',
          marginBottom: '0.5rem'
        }}>
          🔒 Les Confidentiels
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--muted)', maxWidth: '700px', margin: '0 auto' }}>
          Indiscrétions, coulisses du pouvoir et informations exclusives sélectionnées par la rédaction du Débat Ivoirien.
        </p>
        <div style={{ width: '80px', height: '4px', backgroundColor: '#7f1d1d', margin: '1.5rem auto 0' }}></div>
      </div>
      
      {articles.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {articles.map(article => {
            const imgUrl = getArticleImage(article);
            return (
              <Link href={`/article/${article.slug}`} key={article.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="article-card hover-scale" style={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}>
                  <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
                    {imgUrl ? (
                      <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ 
                        background: 'linear-gradient(135deg, #7f1d1d, #b91c1c)', 
                        color: 'white', 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '3rem', 
                        fontWeight: 900 
                      }}>LDI</div>
                    )}
                    <div style={{ 
                      position: 'absolute', 
                      top: '1rem', 
                      left: '1rem',
                      backgroundColor: '#7f1d1d',
                      color: 'white',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      CONFIDENTIEL
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                      {new Date(article.publishedAt || new Date()).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
                      {article.title}
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                      {article.excerpt || article.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...'}
                    </p>
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#7f1d1d' }}>
                      Lire l'exclusivité →
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed var(--border)' }}>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>Aucun article confidentiel n'est disponible pour le moment.</p>
        </div>
      )}
    </div>
  );
}

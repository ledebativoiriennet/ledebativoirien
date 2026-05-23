import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ArticleActionButtons from "./ArticleActionButtons";
import TogglePremiumButton from "./TogglePremiumButton";
import ToggleFeaturedButton from "./ToggleFeaturedButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminArticleSearch from "./AdminArticleSearch";

export default async function AdminArticles({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page, q } = await searchParams;
  const currentPage = Number(page) || 1;
  const perPage = 20;

  const whereClause = q 
    ? { title: { contains: q } } // SQLite (default for development here maybe?) or Prisma doesn't always support 'mode' for all providers, let's keep it simple first or check prisma provider
    : {};

  const [totalArticles, articles] = await Promise.all([
    prisma.article.count({ where: whereClause }),
    prisma.article.findMany({
      where: whereClause,
      skip: (currentPage - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: 'desc' }, // Order by creation date to see drafts easily
      include: { author: true, categories: true }
    })
  ]);

  const totalPages = Math.ceil(totalArticles / perPage);

  const session = await getServerSession(authOptions);
  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email as string },
    select: { role: true }
  });
  const canApprove = dbUser?.role === "ADMIN" || dbUser?.role === "EDITOR";

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>Articles ({totalArticles})</h1>
        <Link href="/admin/articles/create" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
          + Nouvel Article
        </Link>
      </div>

      <AdminArticleSearch />

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem', width: '50%' }}>Titre</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Statut</th>
              <th className="desktop-only" style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Auteur</th>
              <th className="desktop-only" style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Catégories</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Publication</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(article => (
              <tr key={article.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem' }}>
                  <Link href={`/admin/articles/${article.id}/edit`} style={{ fontWeight: 'bold', color: '#0f172a', textDecoration: 'none', display: 'block' }}>
                    {article.title}
                  </Link>
                  <div style={{ marginTop: '0.5rem' }}>
                    <Link href={`/article/${article.slug}`} target="_blank" style={{ fontSize: '0.75rem', backgroundColor: '#e2e8f0', color: '#334155', padding: '0.2rem 0.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
                      👁️ Visualiser
                    </Link>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  {!article.publishedAt && (
                    <span style={{ backgroundColor: '#ffedd5', color: '#c2410c', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '0.2rem' }}>
                      ⏳ En attente
                    </span>
                  )}
                  {article.isPremium ? (
                    <span style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block' }}>⭐ Premium</span>
                  ) : (
                    <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block' }}>Gratuit</span>
                  )}
                  {article.isFeatured && (
                    <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block', marginLeft: '0.4rem' }}>🌟 À la Une</span>
                  )}
                  {canApprove && (
                    <div style={{ marginTop: '0.2rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <TogglePremiumButton articleId={article.id} isPremium={article.isPremium} />
                      <ToggleFeaturedButton articleId={article.id} isFeatured={article.isFeatured} />
                    </div>
                  )}
                </td>
                <td className="desktop-only" style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                  {article.author?.name || 'Rédaction'}
                </td>
                <td className="desktop-only" style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                  {article.categories.map(c => c.name).join(', ')}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                  {article.publishedAt ? (
                    <div>
                      {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
                      {canApprove && <ArticleActionButtons articleId={article.id} isPublished={true} />}
                    </div>
                  ) : (
                    <div>
                      <span style={{ color: '#c2410c', fontWeight: 'bold' }}>Brouillon</span>
                      {canApprove && <ArticleActionButtons articleId={article.id} isPublished={false} />}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          {/* Bouton Précédent */}
          {currentPage > 1 ? (
            <Link 
              href={`/admin/articles?page=${currentPage - 1}`}
              style={{ padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1' }}
            >
              « Précédent
            </Link>
          ) : (
            <span style={{ padding: '0.5rem 1rem', borderRadius: '4px', color: '#cbd5e1', border: '1px solid #f1f5f9', cursor: 'not-allowed' }}>« Précédent</span>
          )}

          {/* Numéros de pages (Fenêtre glissante) */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => {
              // On affiche la 1ère, la dernière, et les pages autour de l'actuelle
              return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2;
            })
            .map((p, index, array) => {
              const showEllipsis = index > 0 && p !== array[index - 1] + 1;
              return (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {showEllipsis && <span style={{ color: '#94a3b8' }}>...</span>}
                  <Link 
                    href={`/admin/articles?page=${p}`}
                    style={{
                      padding: '0.5rem 0.8rem',
                      minWidth: '2.5rem',
                      textAlign: 'center',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      backgroundColor: p === currentPage ? 'var(--primary)' : 'white',
                      color: p === currentPage ? 'white' : '#475569',
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    {p}
                  </Link>
                </div>
              );
            })}

          {/* Bouton Suivant */}
          {currentPage < totalPages ? (
            <Link 
              href={`/admin/articles?page=${currentPage + 1}`}
              style={{ padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1' }}
            >
              Suivant »
            </Link>
          ) : (
            <span style={{ padding: '0.5rem 1rem', borderRadius: '4px', color: '#cbd5e1', border: '1px solid #f1f5f9', cursor: 'not-allowed' }}>Suivant »</span>
          )}
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';

interface Article {
  slug: string;
  title: string;
  categoryName?: string;
}

export default function InlineArticleRecommendation({ article }: { article: Article }) {
  if (!article) return null;

  return (
    <div style={{ margin: '2rem 0', padding: '1.5rem', backgroundColor: 'var(--card-bg)', borderLeft: '4px solid var(--primary)', borderRadius: '0 8px 8px 0', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ backgroundColor: 'var(--primary)', color: 'white', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>À lire aussi</span>
        {article.categoryName && <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>{article.categoryName}</span>}
      </div>
      <Link href={`/article/${article.slug}`} style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, color: 'var(--foreground)', textDecoration: 'none', lineHeight: 1.4 }} className="hover:text-primary transition-colors">
        {article.title}
      </Link>
    </div>
  );
}

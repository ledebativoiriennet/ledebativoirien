import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleImage } from "@/lib/utils";
import { Metadata } from "next";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });

  if (!category) return { title: 'Catégorie introuvable' };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ledebativoirien.net';
  
  return {
    title: `Actualités ${category.name} - Le Débat Ivoirien`,
    description: `Retrouvez toutes les dernières actualités et articles d'investigation sur le thème : ${category.name}.`,
    alternates: {
      canonical: `${baseUrl}/category/${category.slug}`,
    },
    openGraph: {
      title: `Actualités ${category.name} | Le Débat Ivoirien`,
      description: `Toutes les informations exclusives concernant : ${category.name}.`,
      url: `${baseUrl}/category/${category.slug}`,
      siteName: 'Le Débat Ivoirien',
      type: 'website',
    }
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug }
  });

  if (!category) return notFound();

  const articles = await prisma.article.findMany({
    where: { 
      categories: { some: { id: category.id } },
      publishedAt: { not: null }
    },
    orderBy: { publishedAt: "desc" },
    take: 30,
    include: { author: true }
  });

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
      <h1 className="portal-section-title" style={{ fontSize: '2rem', display: 'inline-block', marginBottom: '2rem' }}>
        {category.name.replace(/&amp;/g, '&')}
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {articles.map(article => {
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
                </div>
                <div className="article-card-content">
                  <div className="article-meta">
                    {new Date(article.publishedAt || new Date()).toLocaleDateString("fr-FR")}
                  </div>
                  <h2 className="article-title" style={{ fontSize: '1.1rem' }}>
                    {article.title}
                    {article.isPremium && <span className="premium-badge">PR</span>}
                    {article.isConfidentiel && <span style={{ backgroundColor: '#7f1d1d', color: 'white', padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '0.6rem', fontWeight: 'bold', marginLeft: '0.5rem', verticalAlign: 'middle' }}>🔒 CONF.</span>}
                  </h2>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

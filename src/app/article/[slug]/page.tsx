import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Paywall } from "@/components/Paywall";
import Link from "next/link";
import { getArticleImage } from "@/lib/utils";
import { AdSlot } from "@/components/AdSlot";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SocialShareButtons from "@/components/SocialShareButtons";
import ArticleStatsRecorder from "@/components/ArticleStatsRecorder";
import DownloadPdfButton from "@/components/DownloadPdfButton";
import { LikeButton } from "@/components/LikeButton";
import AdBanner from "@/components/AdBanner";
import { Metadata, ResolvingMetadata } from "next";
import NewsletterWidget from "@/components/NewsletterWidget";
import AuthorSubscribeButton from "@/components/AuthorSubscribeButton";

export const revalidate = 60;

function truncateHtmlToFirstParagraph(html: string): string {
  const regex = /<\/p>/gi;
  let match;
  let splitIndex = -1;
  
  while ((match = regex.exec(html)) !== null) {
    const htmlUpToMatch = html.substring(0, match.index + 4);
    const textOnly = htmlUpToMatch.replace(/<[^>]+>/g, '').trim();
    if (textOnly.length > 50) {
      splitIndex = match.index + 4;
      break;
    }
  }
  
  if (splitIndex !== -1) {
    return html.substring(0, splitIndex);
  }
  return html.substring(0, 400);
}

type Props = {
  params: Promise<{ slug: string }>
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { categories: true, author: true }
  });

  if (!article) return { title: 'Article introuvable' };

  const previousImages = (await parent).openGraph?.images || [];
  const articleImg = getArticleImage(article);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ledebativoirien.net';
  
  const description = article.excerpt || article.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';

  return {
    title: `${article.title} - Le Débat Ivoirien`,
    description: description,
    alternates: {
      canonical: `${baseUrl}/article/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: description,
      url: `${baseUrl}/article/${article.slug}`,
      siteName: 'Le Débat Ivoirien',
      images: articleImg ? [articleImg, ...previousImages] : previousImages,
      locale: 'fr_CI',
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      authors: article.author?.name ? [article.author.name] : ['La Rédaction'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: description,
      images: articleImg ? [articleImg] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { author: true, categories: true },
  });

  if (!article) return notFound();

  const session = await getServerSession(authOptions);

  // Sécurité : Empêcher l'accès public à un article en attente (brouillon)
  if (!article.publishedAt) {
    const dbUser = session?.user?.email ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } }) : null;
    if (dbUser?.role !== "ADMIN" && dbUser?.role !== "EDITOR" && dbUser?.role !== "CONTRIBUTOR") {
      return notFound(); // Simule que la page n'existe pas pour les utilisateurs normaux
    }
  }

  // Fetch side content
  const [popularArticles, relatedArticles, flashNewsItems] = await Promise.all([
    prisma.article.findMany({ where: { publishedAt: { not: null } }, take: 5, orderBy: { publishedAt: 'desc' }, include: { categories: true } }), // Mock popular
    prisma.article.findMany({
      where: { 
        id: { not: article.id },
        publishedAt: { not: null },
        categories: { some: { id: article.categories[0]?.id } }
      },
      take: 4,
      orderBy: { publishedAt: 'desc' }
    }),
    prisma.flashNews.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
  ]);

  // session est déjà déclaré plus haut
  // Stats for the article
  let initialLiked = false;
  let isPremiumSubscriber = false;
  const initialLikeCount = await prisma.articleLike.count({ where: { articleId: article.id } });

  if (session?.user) {
    const userLike = await prisma.articleLike.findUnique({
      where: { userId_articleId: { userId: (session.user as any).id, articleId: article.id } }
    });
    initialLiked = !!userLike;

    const role = (session.user as any).role;
    isPremiumSubscriber = role === "ADMIN" || role === "EDITOR" || role === "PREMIUM";
  }

  // Determine if paywall should be shown
  const showPaywall = article.isPremium && !isPremiumSubscriber;

  // Fetch View Statistics
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0,0,0,0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayViews, weekViews, monthViews, totalViews] = await Promise.all([
    prisma.articleView.count({ where: { articleId: article.id, viewedAt: { gte: startOfDay } } }),
    prisma.articleView.count({ where: { articleId: article.id, viewedAt: { gte: startOfWeek } } }),
    prisma.articleView.count({ where: { articleId: article.id, viewedAt: { gte: startOfMonth } } }),
    prisma.articleView.count({ where: { articleId: article.id } })
  ]);

  let contentToShow = article.content;
  if (showPaywall) {
    contentToShow = truncateHtmlToFirstParagraph(article.content);
  }

  const mainImageUrl = getArticleImage(article);

  return (
    <div className="article-layout container" style={{ marginTop: "2rem", marginBottom: "4rem" }}>
      {session?.user && <ArticleStatsRecorder articleId={article.id} />}
      
      {/* CENTER COLUMN: Article Content & Bottom related */}
      <div className="portal-col-center">
        <article className="article-main-container">
          
          {/* JSON-LD Structured Data for NewsArticle */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                "headline": article.title,
                "image": mainImageUrl ? [mainImageUrl] : [],
                "datePublished": article.publishedAt?.toISOString(),
                "dateModified": article.updatedAt?.toISOString(),
                "author": [{
                    "@type": "Person",
                    "name": article.author?.name || "La Rédaction"
                }],
                "publisher": {
                  "@type": "Organization",
                  "name": "Le Débat Ivoirien",
                  "logo": {
                    "@type": "ImageObject",
                    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ledebativoirien.net'}/logo.png`
                  }
                },
                "description": article.excerpt || article.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'
              })
            }}
          />

          <div className="article-meta" style={{ marginBottom: "1rem" }}>
            {article.categories.map((c) => (
              <span key={c.id} style={{ color: "var(--secondary)", fontWeight: "bold", textTransform: "uppercase", fontSize: "0.8rem" }}>{c.name}</span>
            ))}
          </div>
          
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.2 }}>
            {article.title}
          </h1>
          
          <div className="article-meta-info" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#64748b" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>📅 {new Date(article.publishedAt || new Date()).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }} title="Lectures depuis la publication">👁️ {totalViews.toLocaleString()} vues</span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }} title="Aujourd'hui / Semaine / Mois">📊 {todayViews.toLocaleString()} / {weekViews.toLocaleString()} / {monthViews.toLocaleString()}</span>
            {article.isPremium && <span className="premium-badge">PREMIUM</span>}
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>⏱️ 5 min</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <SocialShareButtons title={article.title} layout="horizontal" />
            <DownloadPdfButton 
              articleTitle={article.title}
              articleContent={article.content}
              articleDate={new Date(article.publishedAt || new Date()).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' })}
              articleImage={article.imageUrl || mainImageUrl || undefined}
              authorName={article.author?.name || undefined}
              isPremium={article.isPremium}
              userHasAccess={!showPaywall}
            />
          </div>

          <AdBanner slot="ARTICLE_TOP" />

          {/* Image de couverture (Nouveaux articles) */}
          {article.imageUrl && (
            <div style={{ marginBottom: "2rem", borderRadius: "8px", overflow: "hidden" }}>
              <img src={article.imageUrl} alt={article.title} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          )}

          {/* Vidéo de l'article */}
          {(article.videoUrl || article.videoFile) && (
            <div style={{ marginBottom: "2rem" }}>
              {article.videoFile ? (
                <div style={{ borderRadius: "8px", overflow: "hidden", backgroundColor: "black" }}>
                  <video src={article.videoFile} controls style={{ width: "100%", maxHeight: "500px", display: "block" }} />
                </div>
              ) : article.videoUrl ? (
                (() => {
                  let embedUrl = article.videoUrl;
                  if (article.videoUrl.includes('youtube.com/watch?v=')) {
                    const id = article.videoUrl.split('v=')[1]?.split('&')[0];
                    embedUrl = `https://www.youtube.com/embed/${id}`;
                  } else if (article.videoUrl.includes('youtu.be/')) {
                    const id = article.videoUrl.split('youtu.be/')[1]?.split('?')[0];
                    embedUrl = `https://www.youtube.com/embed/${id}`;
                  }

                  if (embedUrl.includes('youtube.com/embed/')) {
                    return (
                      <div style={{ borderRadius: "8px", overflow: "hidden", position: "relative", paddingBottom: "56.25%", height: 0, backgroundColor: "#000" }}>
                        <iframe 
                          src={embedUrl}
                          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        />
                      </div>
                    );
                  }
                  
                  if (article.videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
                    return (
                      <div style={{ borderRadius: "8px", overflow: "hidden", backgroundColor: "black" }}>
                        <video src={article.videoUrl} controls style={{ width: "100%", maxHeight: "500px", display: "block" }} />
                      </div>
                    );
                  }

                  return (
                    <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ marginBottom: '0.5rem' }}>Vidéo externe disponible :</p>
                      <a href={article.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                        Regarder la vidéo
                      </a>
                    </div>
                  );
                })()
              ) : null}
            </div>
          )}

          <AdBanner slot="ARTICLE_MIDDLE" />

          {/* Chapô (Extrait) */}
          {article.excerpt && (
            <div style={{ fontSize: "1.15rem", fontWeight: 700, lineHeight: 1.6, marginBottom: "2rem", color: "var(--foreground)" }}>
              {article.excerpt}
            </div>
          )}

          <div style={{ position: "relative" }}>
            <div 
              className="article-content"
              style={{ 
                position: "relative",
                paddingBottom: showPaywall ? "40px" : "0"
              }} 
            >
              <div dangerouslySetInnerHTML={{ __html: contentToShow }} />
              
              {showPaywall && (
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: "100px",
                  background: "linear-gradient(to bottom, transparent, var(--background))",
                  pointerEvents: "none"
                }} />
              )}
            </div>

            {showPaywall && (
              <div style={{ position: "relative", zIndex: 10, marginTop: "-2rem" }}>
                <Paywall />
              </div>
            )}
          </div>

          {/* Tags */}
          <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontWeight: "bold", marginRight: "0.5rem" }}>Mots-clés :</span>
              {["Actualité", "Côte d'Ivoire", "Développement", "Politique"].map(tag => (
                <span key={tag} style={{ backgroundColor: "#f1f5f9", padding: "0.2rem 0.6rem", borderRadius: "15px", fontSize: "0.75rem", color: "var(--muted)" }}>#{tag}</span>
              ))}
            </div>
            <LikeButton articleId={article.id} initialLiked={initialLiked} initialCount={initialLikeCount} />
          </div>
          
          <SocialShareButtons title={article.title} layout="horizontal" />
        </article>

        <AdBanner slot="ARTICLE_BOTTOM" />

        {/* À lire également (Recommandations) */}
        <div style={{ marginTop: "2rem" }}>
          <h2 className="portal-section-title dark" style={{ borderBottom: "2px solid var(--primary)" }}>À lire également</h2>
          <div className="grid-responsive-2col" style={{ marginTop: "1rem" }}>
            {relatedArticles.map(rel => {
              const relImg = getArticleImage(rel);
              return (
                <Link href={`/article/${rel.slug}`} key={rel.id} style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: "140px", backgroundColor: "var(--muted)" }}>
                    {relImg && <img src={relImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.3 }}>{rel.title}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Commentaires (Mock) */}
        <div style={{ marginTop: "2rem", backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem" }}>
          <h2 className="portal-section-title" style={{ backgroundColor: "#334155", borderColor: "#1e293b" }}>Réactions (12)</h2>
          <div style={{ marginTop: "1rem" }}>
            <textarea placeholder="Partagez votre opinion sur cet article..." style={{ width: "100%", padding: "1rem", borderRadius: "4px", border: "1px solid var(--border)", minHeight: "100px", fontFamily: "inherit" }}></textarea>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
              <button className="btn btn-primary">Publier</button>
            </div>
          </div>
          <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e2e8f0", flexShrink: 0 }}></div>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Kouassi M. <span style={{ fontWeight: "normal", color: "var(--muted)", fontSize: "0.75rem", marginLeft: "0.5rem" }}>Il y a 2 heures</span></div>
                <p style={{ fontSize: "0.9rem", marginTop: "0.2rem", lineHeight: 1.4 }}>Excellente analyse de la situation actuelle. Il est temps que des mesures concrètes soient prises.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Sidebar widgets */}
      <aside className="portal-col-right">
        {/* Les Plus Lus */}
        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <h2 className="portal-section-title dark">Les plus lus</h2>
          <div style={{ padding: "1rem" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {popularArticles.map((article, i) => (
                <li key={article.id} style={{ display: "flex", gap: "1rem", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "2rem", fontWeight: 900, color: "var(--border)", lineHeight: 1 }}>{i + 1}</span>
                  <Link href={`/article/${article.slug}`} style={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.3 }}>
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ad Placeholder Vertical */}
        <div style={{ marginBottom: "1.5rem" }}>
          <AdSlot format="skyscraper" />
        </div>

        {/* Dépêches Widget */}
        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <h2 className="portal-section-title" style={{ backgroundColor: "#dc2626", borderColor: "#991b1b" }}>Flash Infos</h2>
          <div style={{ padding: "0" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: '300px', overflowY: 'auto' }}>
              {flashNewsItems.map((flash) => (
                <li key={flash.id} style={{ display: "flex", gap: "0.75rem", padding: "0.75rem", borderBottom: "1px solid var(--border)", alignItems: 'flex-start' }}>
                  <div style={{ color: "#dc2626", fontWeight: 900, fontSize: "0.8rem", flexShrink: 0 }}>{flash.time}</div>
                  <div>
                    <div style={{ fontSize: "0.85rem", lineHeight: 1.3 }}>{flash.content}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Widget */}
        <NewsletterWidget />

        {/* Auteur */}
        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem", textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ width: "80px", height: "80px", backgroundColor: "#e2e8f0", borderRadius: "50%", margin: "0 auto 1rem auto", overflow: "hidden" }}>
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>👤</div>
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>{article.author?.name || "La Rédaction"}</h3>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "0.5rem 0 1rem 0" }}>Journaliste / Éditorialiste</p>
          <AuthorSubscribeButton authorId={article.authorId as string | undefined} authorName={article.author?.name} />
        </div>

        {/* Partage */}
        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem" }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "1rem", borderBottom: "2px solid var(--primary)", paddingBottom: "0.5rem" }}>Partager l'article</h4>
          <SocialShareButtons title={article.title} layout="vertical" />
        </div>
      </aside>
    </div>
  );
}

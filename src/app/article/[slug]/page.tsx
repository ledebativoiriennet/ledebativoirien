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
import ArticleAudioPlayer from "@/components/ArticleAudioPlayer";
import TextSizeAdjuster from "@/components/TextSizeAdjuster";
import TableOfContents from "@/components/TableOfContents";
import InlineArticleRecommendation from "@/components/InlineArticleRecommendation";
import { Metadata, ResolvingMetadata } from "next";
import NewsletterWidget from "@/components/NewsletterWidget";
import AuthorSubscribeButton from "@/components/AuthorSubscribeButton";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import GoogleAdSlot from "@/components/GoogleAdSlot";
import SafeImage from "@/components/SafeImage";
import WhatsAppAd from "@/components/WhatsAppAd";

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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ledebativoirien.net';
  let articleImg = getArticleImage(article);
  if (articleImg && !articleImg.startsWith('http')) {
    articleImg = `${baseUrl}${articleImg.startsWith('/') ? '' : '/'}${articleImg}`;
  }
  
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
    include: { author: true, categories: true, tags: true },
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

  // Fetch side content and settings
  const [popularArticles, relatedArticles, flashNewsItems, siteSettings] = await Promise.all([
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
    prisma.flashNews.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    prisma.siteSettings.findUnique({ where: { id: "global" } })
  ]);

  // session est déjà déclaré plus haut
  // Stats for the article
  let initialLiked = false;
  // Determine subscriber levels
  let isPremiumSubscriber = false;
  let isConfidentielSubscriber = false;

  const initialLikeCount = await prisma.articleLike.count({ where: { articleId: article.id } });

  if (session?.user) {
    const userLike = await prisma.articleLike.findUnique({
      where: { userId_articleId: { userId: (session.user as any).id, articleId: article.id } }
    });
    initialLiked = !!userLike;

    const role = (session.user as any).role;
    isPremiumSubscriber = role === "ADMIN" || role === "EDITOR" || role === "PREMIUM" || role === "ULTIMATE";
    isConfidentielSubscriber = role === "ADMIN" || role === "EDITOR" || role === "CONFIDENTIEL" || role === "ULTIMATE";
  }

  // Determine if paywall should be shown
  let showPaywall = false;
  if (article.isConfidentiel) {
    showPaywall = !isConfidentielSubscriber;
  } else if (article.isPremium) {
    showPaywall = !isPremiumSubscriber;
  }

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

  // Récupérer un article recommandé pour l'injection au milieu du texte
  const relatedArticle = await prisma.article.findFirst({
    where: {
      id: { not: article.id },
      categories: { some: { id: article.categories[0]?.id } },
      publishedAt: { not: null }
    },
    orderBy: { publishedAt: 'desc' },
    select: { slug: true, title: true, categories: { select: { name: true } } }
  });

  // Calcul du temps de lecture (environ 200 mots par minute)
  const wordCount = article.content.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(word => word.length > 0).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const mainImageUrl = getArticleImage(article);

  return (
    <>
      <ReadingProgressBar />
      <ArticleStatsRecorder articleId={article.id} />
      <div className="article-layout" style={{ marginTop: "clamp(0.5rem, 5vw, 2rem)", marginBottom: "4rem" }}>
      
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
            {article.isConfidentiel && <span style={{ backgroundColor: '#7f1d1d', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>🔒 CONFIDENTIEL</span>}
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }} title="Temps de lecture estimé">⏱️ {readTime} min</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <ArticleAudioPlayer title={article.title} content={contentToShow} />
              <TextSizeAdjuster />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <SocialShareButtons title={article.title} layout="horizontal" />
              <DownloadPdfButton 
                articleTitle={article.title}
                articleContent={article.content}
                articleDate={new Date(article.publishedAt || new Date()).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' })}
                articleImage={article.imageUrl || mainImageUrl || undefined}
                authorName={article.author?.name || undefined}
                isPremium={article.isPremium}
                userHasAccess={!showPaywall}
                isPremiumUser={isPremiumSubscriber}
              />
            </div>
          </div>

          <AdBanner slot="ARTICLE_TOP" />

          {/* Image de couverture (Nouveaux articles) */}
          {article.imageUrl && (
            <div style={{ marginBottom: "2rem", borderRadius: "8px", overflow: "hidden" }}>
              <div className="image-watermark-container">
                <SafeImage src={article.imageUrl} alt={article.title} style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
              {(article as any).imageCaption && (
                <p style={{ fontSize: "0.75rem", color: "#64748b", fontStyle: "italic", textAlign: "center", padding: "0.4rem 0.75rem", backgroundColor: "#f8fafc", margin: 0, borderTop: "1px solid #e2e8f0" }}>
                  📷 {(article as any).imageCaption}
                </p>
              )}
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
              {(article as any).videoCaption && (
                <p style={{ fontSize: "0.75rem", color: "#64748b", fontStyle: "italic", textAlign: "center", padding: "0.4rem 0.75rem", backgroundColor: "#f8fafc", margin: "0.25rem 0 0 0", borderRadius: "0 0 8px 8px", border: "1px solid #e2e8f0", borderTop: "none" }}>
                  🎬 {(article as any).videoCaption}
                </p>
              )}
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
              {(() => {
            if (!showPaywall && relatedArticle) {
              // On divise par la balise de fin de paragraphe. Le 'i' rend insensible à la casse.
              // En utilisant une expression régulière avec capture, on garde le délimiteur dans le tableau résultant.
              const parts = contentToShow.split(/(<\/p>)/i);
              
              // Si on a plus de 3 paragraphes (3 * 2 parts = 6), on injecte après le 3ème
              if (parts.length > 6) {
                const chunk1 = parts.slice(0, 6).join('');
                const chunk2 = parts.slice(6).join('');
                
                return (
                  <>
                    <div dangerouslySetInnerHTML={{ __html: chunk1 }} />
                    <InlineArticleRecommendation article={{ slug: relatedArticle.slug, title: relatedArticle.title, categoryName: relatedArticle.categories[0]?.name }} />
                    <div dangerouslySetInnerHTML={{ __html: chunk2 }} />
                  </>
                );
              }
            }

            // Fallback (si paywall ou article trop court)
            return (
              <div dangerouslySetInnerHTML={{ __html: contentToShow }} />
            );
          })()}
              
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
                <Paywall type={article.isConfidentiel ? 'confidentiel' : 'premium'} />
              </div>
            )}
          </div>

          <GoogleAdSlot adSlot="9260624933" />

          {article.tags && article.tags.length > 0 && (
            <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontWeight: "bold", marginRight: "0.5rem" }}>Mots-clés :</span>
                {article.tags.map(tag => (
                  <Link 
                    key={tag.id} 
                    href={`/tag/${tag.slug}`}
                    style={{ backgroundColor: "#f1f5f9", padding: "0.2rem 0.6rem", borderRadius: "15px", fontSize: "0.75rem", color: "var(--muted)", textDecoration: "none" }}
                    className="hover-primary"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
              <LikeButton articleId={article.id} initialLiked={initialLiked} initialCount={initialLikeCount} />
            </div>
          )}
          {!article.tags?.length && (
            <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
              <LikeButton articleId={article.id} initialLiked={initialLiked} initialCount={initialLikeCount} />
            </div>
          )}
          
          <SocialShareButtons title={article.title} layout="horizontal" />

          {/* Signature Journaliste */}
          <div style={{ marginTop: "3rem", padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", backgroundColor: "#f8fafc", display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#e2e8f0", overflow: "hidden", flexShrink: 0 }}>
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>👤</div>
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: "bold", textTransform: "uppercase" }}>Article rédigé par</div>
              <Link href="/redaction" style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--foreground)", textDecoration: "none" }}>
                {article.author?.name || "La Rédaction"}
              </Link>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "0.2rem 0 0 0" }}>Journaliste / Le Débat Ivoirien</p>
            </div>
          </div>

          {/* Mention droits d'auteur */}
          <div style={{
            marginTop: "2rem",
            padding: "1rem 1.25rem",
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            borderLeft: "4px solid var(--primary)",
            borderRadius: "var(--radius)",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
          }}>
            <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>©</span>
            <p style={{
              margin: 0,
              fontSize: "0.78rem",
              color: "var(--muted)",
              lineHeight: 1.6,
              fontStyle: "italic",
            }}>
              <strong style={{ color: "var(--foreground)", fontStyle: "normal" }}>Droits d'auteur :</strong>{" "}
              Sauf autorisation de la rédaction ou partenariat pré-établi, la reprise des articles de{" "}
              <a href="https://www.ledebativoirien.net" style={{ color: "var(--primary)", fontWeight: "bold" }}>
                www.ledebativoirien.net
              </a>
              , même partielle, est strictement interdite. Tout contrevenant s'expose à des poursuites.
            </p>
          </div>
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
                  <div className="image-watermark-container" style={{ height: "140px", backgroundColor: "var(--muted)" }}>
                    {relImg && <SafeImage src={relImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
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
        {/* Table des Matières (Sticky) */}
        <div style={{ marginBottom: "1.5rem" }}>
          <TableOfContents />
        </div>

        <GoogleAdSlot adSlot="3353692131" />
        <WhatsAppAd />

        {/* Les Plus Lus */}
        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "2rem" }}>
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

        {/* Facebook Widget */}
        {siteSettings?.facebookUrl && (
          <div style={{ backgroundColor: "#1877F2", color: "white", padding: "1.5rem", borderRadius: "var(--radius)", textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.5rem" }}>Rejoignez-nous</h3>
            <p style={{ fontSize: "0.85rem", marginBottom: "1rem", opacity: 0.9 }}>Suivez Le Débat Ivoirien sur Facebook pour ne rien manquer.</p>
            <a href={siteSettings.facebookUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", backgroundColor: "white", color: "#1877F2", padding: "0.6rem 1.2rem", borderRadius: "4px", fontWeight: "bold", textDecoration: "none", fontSize: "0.9rem" }}>
              S'abonner à la page
            </a>
          </div>
        )}

        {/* Auteur */}
        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem", textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ width: "80px", height: "80px", backgroundColor: "#e2e8f0", borderRadius: "50%", margin: "0 auto 1rem auto", overflow: "hidden" }}>
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>👤</div>
          </div>
          <Link href="/redaction" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>{article.author?.name || "La Rédaction"}</h3>
          </Link>
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
    </>
  );
}

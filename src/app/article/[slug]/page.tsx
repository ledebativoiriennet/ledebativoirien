import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Paywall } from "@/components/Paywall";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import Link from "next/link";
import { getArticleImage } from "@/lib/utils";
import { AdSlot } from "@/components/AdSlot";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SocialShareButtons from "@/components/SocialShareButtons";
import ArticleStatsRecorder from "@/components/ArticleStatsRecorder";
import DownloadPdfButton from "@/components/DownloadPdfButton";
import { LikeButton } from "@/components/LikeButton";
import BookmarkButton from "@/components/BookmarkButton";
import GiftArticleButton from "@/components/GiftArticleButton";
import HighlightWrapper from "@/components/HighlightWrapper";
import FollowButton from "@/components/FollowButton";
import ArticlePollWidget from "@/components/ArticlePollWidget";
import AdBanner from "@/components/AdBanner";
import ArticleAudioPlayer from "@/components/ArticleAudioPlayer";
import TextSizeAdjuster from "@/components/TextSizeAdjuster";
import ZenModeToggle from "@/components/ZenModeToggle";
import ScrollProgressSaver from "@/components/ScrollProgressSaver";
import ArticleQuizWidget from "@/components/ArticleQuizWidget";
import OfflineSaveButton from "@/components/OfflineSaveButton";
import TableOfContents from "@/components/TableOfContents";
import InlineArticleRecommendation from "@/components/InlineArticleRecommendation";
import MeteredPaywallTracker from "@/components/MeteredPaywallTracker";
import ArticleDebateWidget from "@/components/ArticleDebateWidget";
import LiveBlogFeed from "@/components/LiveBlogFeed";
import { Metadata, ResolvingMetadata } from "next";
import NewsletterWidget from "@/components/NewsletterWidget";
import AuthorSubscribeButton from "@/components/AuthorSubscribeButton";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import GoogleAdSlot from "@/components/GoogleAdSlot";
import SafeImage from "@/components/SafeImage";
import WhatsAppAd from "@/components/WhatsAppAd";
import ArticleComments from "@/components/ArticleComments";
import PromoLucarne from "@/components/promo/PromoLucarne";
import ArticleSummary from "@/components/ArticleSummary";

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
  
  const description = article.seoDescription || article.excerpt || article.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';
  const metaTitle = article.seoTitle || `${article.title} - Le Débat Ivoirien`;

  return {
    title: metaTitle,
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

export default async function ArticlePage({ params, searchParams }: { params: Props["params"], searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const giftToken = typeof resolvedSearchParams?.giftToken === 'string' ? resolvedSearchParams.giftToken : null;
  
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { 
      author: true, 
      categories: true, 
      tags: true, 
      relatedArticles: true,
      polls: {
        where: { isActive: true },
        include: { options: true },
        take: 1
      },
      quiz: {
        include: { questions: true }
      },
      debate: {
        include: {
          arguments: {
            include: { user: { select: { name: true } } }
          }
        }
      },
      liveUpdates: {
        orderBy: { createdAt: 'desc' }
      }
    },
  });

  if (!article) return notFound();

  const session = await getServerSession(authOptions);
  const dbUser = session?.user?.email ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } }) : null;

  // Sécurité : Empêcher l'accès public à un article en attente (brouillon) ou planifié dans le futur
  if (!article.publishedAt || (article.publishedAt > new Date())) {
    if (dbUser?.role !== "ADMIN" && dbUser?.role !== "EDITOR" && dbUser?.role !== "CONTRIBUTOR") {
      return notFound(); // Simule que la page n'existe pas pour les utilisateurs normaux
    }
  }

  // Fetch side content and settings
  const [popularArticles, automatedRelatedArticles, flashNewsItems, siteSettings] = await Promise.all([
    prisma.article.findMany({ where: { publishedAt: { not: null, lte: new Date() } }, take: 5, orderBy: { publishedAt: 'desc' }, include: { categories: true } }), // Mock popular
    prisma.article.findMany({
      where: { 
        id: { not: article.id },
        publishedAt: { not: null, lte: new Date() },
        categories: { some: { id: article.categories[0]?.id } }
      },
      take: 4,
      orderBy: { publishedAt: 'desc' }
    }),
    prisma.flashNews.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    prisma.siteSettings.findUnique({ where: { id: "global" } })
  ]);

  // Merge manual related articles with automated ones
  const finalRelatedArticles = [...article.relatedArticles, ...automatedRelatedArticles]
    .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // Remove duplicates
    .slice(0, 4);

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

  // Vérifier le jeton cadeau
  let isGifted = false;
  if (showPaywall && giftToken) {
    const giftLink = await prisma.giftLink.findUnique({
      where: { token: giftToken }
    });
    
    if (giftLink && giftLink.articleId === article.id && giftLink.usedCount < giftLink.maxUses && giftLink.expiresAt > new Date()) {
      showPaywall = false;
      isGifted = true;
      // Ne pas incrémenter le compteur ici car cela s'exécute à chaque chargement de la page par le bénéficiaire.
      // Dans un système complet, on marquerait le token utilisé via un cookie ou une API au premier accès.
      // Pour faire simple, on bypass juste s'il est valide.
    }
  }

  // --- METERED PAYWALL LOGIC ---
  let isMeteredPaywall = false;
  if (!showPaywall && !isPremiumSubscriber && !isConfidentielSubscriber && !isGifted) {
    if (!session?.user) {
      // Unauthenticated User (limit: 3)
      const cookieStore = await cookies();
      const readArticlesStr = cookieStore.get('metered_read_articles')?.value;
      let readArticles: string[] = [];
      if (readArticlesStr) {
        try { readArticles = JSON.parse(decodeURIComponent(readArticlesStr)); } catch (e) {}
      }
      
      if (!readArticles.includes(article.id) && readArticles.length >= 3) {
        showPaywall = true;
        isMeteredPaywall = true;
      }
    } else {
      // Free Authenticated User (limit: 10)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0,0,0,0);
      
      const distinctArticlesRead = await prisma.readingHistory.findMany({
        where: {
          userId: (session.user as any).id,
          readAt: { gte: startOfMonth },
          articleId: { not: article.id }
        },
        distinct: ['articleId'],
        select: { articleId: true }
      });
      
      if (distinctArticlesRead.length >= 10) {
        showPaywall = true;
        isMeteredPaywall = true;
      }
    }
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

  // Rewrite all old Wordpress domain URLs to point to the new production domain
  contentToShow = contentToShow.replace(/http:\/\/ledebativoirien\.africanewsquick\.net/g, "https://ledebativoirien.net");
  contentToShow = contentToShow.replace(/https:\/\/ledebativoirien\.africanewsquick\.net/g, "https://ledebativoirien.net");

  let cleanImageUrl = article.imageUrl;
  if (cleanImageUrl && cleanImageUrl.includes("ledebativoirien.africanewsquick.net")) {
    cleanImageUrl = cleanImageUrl
      .replace("http://ledebativoirien.africanewsquick.net", "https://ledebativoirien.net")
      .replace("https://ledebativoirien.africanewsquick.net", "https://ledebativoirien.net");
  }


  // Récupérer un article recommandé pour l'injection au milieu du texte
  const relatedArticle = await prisma.article.findFirst({
    where: {
      id: { not: article.id },
      categories: { some: { id: article.categories[0]?.id } },
      publishedAt: { not: null, lte: new Date() }
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

          <MeteredPaywallTracker articleId={article.id} />
          <ScrollProgressSaver articleId={article.id} />

          <div className="article-meta" style={{ marginBottom: "1rem" }}>
            {article.categories.map((c) => (
              <span key={c.id} style={{ color: "var(--secondary)", fontWeight: "bold", textTransform: "uppercase", fontSize: "0.8rem" }}>{c.name}</span>
            ))}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 900, flex: 1, lineHeight: 1.2, margin: 0 }}>
              {article.title}
            </h1>
            {(dbUser?.role === "ADMIN" || dbUser?.role === "EDITOR") && (
              <Link 
                href={`/admin/articles/${article.id}/edit`}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  whiteSpace: 'nowrap'
                }}
                className="hover-primary"
              >
                ✏️ Modifier
              </Link>
            )}
          </div>
          
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
              <ZenModeToggle />
              <OfflineSaveButton article={{
                id: article.id,
                slug: article.slug,
                title: article.title,
                content: contentToShow,
                imageUrl: mainImageUrl,
                excerpt: article.excerpt || ""
              }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <BookmarkButton articleId={article.id} />
              {(article.isPremium || article.isConfidentiel) && (
                <GiftArticleButton articleId={article.id} articleSlug={article.slug} />
              )}
              <SocialShareButtons title={article.title} layout="horizontal" />
              <DownloadPdfButton 
                articleTitle={article.title}
                articleContent={article.content}
                articleDate={new Date(article.publishedAt || new Date()).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' })}
                articleImage={cleanImageUrl || mainImageUrl || undefined}
                authorName={article.author?.name || undefined}
                isPremium={article.isPremium}
                userHasAccess={!showPaywall}
                isPremiumUser={isPremiumSubscriber}
              />
            </div>
          </div>

          <AdBanner slot="ARTICLE_TOP" />

          {/* Image de couverture (Nouveaux articles) */}
          {cleanImageUrl && (
            <div style={{ marginBottom: "2rem", borderRadius: "8px", overflow: "hidden" }}>
              <div className="image-watermark-container">
                <SafeImage src={cleanImageUrl} alt={article.title} style={{ width: "100%", height: "auto", display: "block" }} />
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

          {/* Résumé automatique des points clés */}
          <ArticleSummary content={article.content} />

          {article.isLiveBlog && (
            <LiveBlogFeed articleId={article.id} initialUpdates={(article as any).liveUpdates || []} />
          )}

          <HighlightWrapper articleId={article.id} articleTitle={article.title} articleUrl={`${process.env.NEXT_PUBLIC_SITE_URL}/article/${article.slug}`}>
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
                {isMeteredPaywall ? (
                  <div style={{ padding: "2rem", backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border)", textAlign: "center", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚧</div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Vous avez atteint votre limite d'articles gratuits</h3>
                    <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
                      {!session?.user 
                        ? "Vous avez lu vos 3 articles gratuits ce mois-ci. Créez un compte gratuitement pour en lire 7 de plus !" 
                        : "Vous avez lu vos 10 articles gratuits ce mois-ci. Abonnez-vous pour un accès illimité à toute l'actualité."}
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                      {!session?.user && (
                        <Link href="/register" className="btn btn-primary">Créer un compte gratuit</Link>
                      )}
                      <Link href="/abonnement" className={!session?.user ? "btn btn-secondary" : "btn btn-primary"}>Voir les offres d'abonnement</Link>
                    </div>
                  </div>
                ) : (
                  <Paywall type={article.isConfidentiel ? 'confidentiel' : 'premium'} />
                )}
              </div>
            )}
          </div>
          </HighlightWrapper>

          <GoogleAdSlot adSlot="9260624933" />

          {article.tags && article.tags.length > 0 && (
            <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontWeight: "bold", marginRight: "0.5rem" }}>Mots-clés :</span>
                {article.tags.map(tag => (
                  <div key={tag.id} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Link 
                      href={`/tag/${tag.slug}`}
                      style={{ backgroundColor: "#f1f5f9", padding: "0.2rem 0.6rem", borderRadius: "15px", fontSize: "0.75rem", color: "var(--muted)", textDecoration: "none" }}
                      className="hover-primary"
                    >
                      #{tag.name}
                    </Link>
                    <FollowButton type="tag" targetId={tag.id} />
                  </div>
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
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Link href="/redaction" style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--foreground)", textDecoration: "none" }}>
                  {article.author?.name || "La Rédaction"}
                </Link>
                {article.author && <FollowButton type="author" targetId={article.author.id} />}
              </div>
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

        {article.polls && article.polls.length > 0 && (
          <ArticlePollWidget poll={article.polls[0]} />
        )}

        {article.debate && article.debate.isActive && (
          <ArticleDebateWidget debate={article.debate} />
        )}


        <AdBanner slot="ARTICLE_BOTTOM" />

        {/* À lire également (Recommandations) */}
        <div style={{ marginTop: "2rem" }}>
          <h2 className="portal-section-title dark" style={{ borderBottom: "2px solid var(--primary)" }}>À lire également</h2>
          <div className="grid-responsive-2col" style={{ marginTop: "1rem" }}>
            {finalRelatedArticles.map(rel => {
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

        {/* Section Quiz (Gamification) */}
        {article.quiz && (
          <ArticleQuizWidget quiz={article.quiz} />
        )}

        <ArticleComments articleId={article.id} />
        </article>
      </div>

      {/* RIGHT COLUMN: Sidebar widgets */}
      <aside className="portal-col-right">
        <SubscriptionBanner />
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

        <PromoLucarne />

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

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Paywall } from "@/components/Paywall";
import Link from "next/link";
import { extractFirstImageUrl } from "@/lib/utils";
import { AdSlot } from "@/components/AdSlot";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordArticleRead } from "@/app/actions/user-stats";
import { LikeButton } from "@/components/LikeButton";
import AdBanner from "@/components/AdBanner";
import { Metadata, ResolvingMetadata } from "next";
import NewsletterWidget from "@/components/NewsletterWidget";
import AuthorSubscribeButton from "@/components/AuthorSubscribeButton";

export const revalidate = 60;

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
  const articleImg = article.imageUrl || extractFirstImageUrl(article.content);
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
    // Record reading history in the background
    recordArticleRead(article.id).catch(console.error);

    const userLike = await prisma.articleLike.findUnique({
      where: { userId_articleId: { userId: (session.user as any).id, articleId: article.id } }
    });
    initialLiked = !!userLike;

    // Bypassing JWT cache by checking the DB directly to see if user has an active subscription
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      include: { subscriptions: { where: { status: 'ACTIVE' } } }
    });
    if (dbUser) {
      isPremiumSubscriber = dbUser.role === "ADMIN" || dbUser.role === "EDITOR" || dbUser.subscriptions.length > 0;
    }
  }

  // Determine if paywall should be shown
  const showPaywall = article.isPremium && !isPremiumSubscriber;

  let contentToShow = article.content;
  // We don't cut the HTML string directly to avoid unclosed tags breaking the layout.
  // The CSS maxHeight: "500px" + overflow: "hidden" handles the cutoff visually.

  const mainImageUrl = extractFirstImageUrl(article.content);

  return (
    <div className="article-layout container" style={{ marginTop: "2rem", marginBottom: "4rem" }}>
      
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
          
          <div className="article-meta-info">
            <span>Publié le {new Date(article.publishedAt || new Date()).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            {article.isPremium && <span className="premium-badge">PREMIUM</span>}
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>⏱️ 5 min de lecture</span>
          </div>

          <AdBanner slot="ARTICLE_TOP" />

          <div style={{ position: "relative" }}>
            <div 
              className="article-content"
              style={{ 
                position: "relative",
                maxHeight: showPaywall ? "500px" : "none",
                overflow: "hidden"
              }} 
            >
              <div dangerouslySetInnerHTML={{ __html: contentToShow }} />
              
              {showPaywall && (
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: "250px",
                  background: "linear-gradient(to bottom, transparent, var(--card-bg))",
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
        </article>

        <AdBanner slot="ARTICLE_BOTTOM" />

        {/* À lire également (Recommandations) */}
        <div style={{ marginTop: "2rem" }}>
          <h2 className="portal-section-title dark" style={{ borderBottom: "2px solid var(--primary)" }}>À lire également</h2>
          <div className="grid-responsive-2col" style={{ marginTop: "1rem" }}>
            {relatedArticles.map(rel => {
              const relImg = extractFirstImageUrl(rel.content);
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
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button style={{ padding: "0.75rem", backgroundColor: "#1877F2", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Facebook</button>
            <button style={{ padding: "0.75rem", backgroundColor: "#000000", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>X (Twitter)</button>
            <button style={{ padding: "0.75rem", backgroundColor: "#25D366", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>WhatsApp</button>
            <button style={{ padding: "0.75rem", backgroundColor: "#0A66C2", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>LinkedIn</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

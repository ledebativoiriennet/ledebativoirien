import { prisma } from "@/lib/prisma";
import { getArticleImage } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import MainNavigation from "@/components/MainNavigation";

// Seuil de fraîcheur : 4 heures en millisecondes
const RECENT_THRESHOLD_MS = 4 * 60 * 60 * 1000;
import NewsletterWidget from "@/components/NewsletterWidget";
import { AdSlot } from "@/components/AdSlot";
import AdBanner from "@/components/AdBanner";
import SportsModule from "@/components/SportsModule";
import { PollWidget } from "@/components/PollWidget";
import PersonalizedFeed from "@/components/PersonalizedFeed";
import HomeAudioModule from "@/components/HomeAudioModule";
import GoogleAdSlot from "@/components/GoogleAdSlot";
import SafeImage from "@/components/SafeImage";
import WhatsAppAd from "@/components/WhatsAppAd";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import WebTVModule from "@/components/WebTVModule";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  // Fetch massive data in parallel for high density
  const [
    recentArticles,
    poll,
    obituaries,
    politiqueArticles,
    videos,
    activities,
    flashNewsItems,
    cultureArticles,
    jobOffers,
    weatherReport,
    breakingNews,
    titrologieItems,
    siteSettings,
    quote,
    faitsDiversArticles,
    economieArticles,
    pressReleases,
    publieReportageArticles,
    audioArticles,
    internationalArticles,
    cedeauArticles,
    aLaUneArticles,
    actualiteArticles,
    brvmIndicators,
    trendingTags,
    societeArticles,
    chroniqueArticles,
    confidentielArticles,
    dossiersArticles,
    cultureArticlesFetched,
    footballArticles
  ] = await Promise.all([
    prisma.article.findMany({
      where: { publishedAt: { not: null } },
      take: 150, // Increase pool for deduplication
      orderBy: { publishedAt: "desc" },
      include: { categories: true },
    }),
    prisma.poll.findFirst({ where: { isActive: true }, include: { options: true }, orderBy: { createdAt: 'desc' } }),
    prisma.obituary.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: { in: ['politique', 'politiques'] } } } }, take: 15, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.video.findMany({ take: 100, orderBy: { createdAt: 'desc' } }),
    prisma.activity.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
    prisma.flashNews.findMany({ take: 6, orderBy: { createdAt: 'desc' } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: { in: ['culture', 'arts'] } } } }, take: 4, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.jobOffer.findMany({ take: 4, orderBy: { createdAt: 'desc' }, where: { isActive: true } }),
    prisma.weatherReport.findFirst({ orderBy: { date: 'desc' } }),
    prisma.breakingNews.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } }),
    prisma.titrologie.findMany({ orderBy: { date: 'desc' }, take: 4 }),
    prisma.siteSettings.findUnique({ where: { id: "global" } }),
    prisma.quote.findFirst({ where: { isActive: true } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: { in: ['faits-divers', 'faits_divers', 'societe'] } } } }, take: 15, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: { in: ['economie', 'economie-finances', 'finances'] } } } }, take: 15, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.pressRelease.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: 'publie-reportage' } } }, take: 4, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.article.findMany({ where: { isAudioAvailable: true, publishedAt: { not: null } }, take: 100, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: { in: ['international', 'internationale', 'diplomatie'] } } } }, take: 4, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: { in: ['afrique-occidentale', 'cedeau', 'afrique', 'benin', 'togo', 'mali', 'burkina-faso', 'senegal', 'guinee'] } } } }, take: 10, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: 'a-la-une' } } }, take: 5, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: 'actualite' } } }, take: 15, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.marketIndicator.findMany({ where: { group: 'BRVM' }, take: 3, orderBy: { order: 'asc' } }),
    prisma.tag.findMany({ 
      where: { articles: { some: { publishedAt: { not: null } } } },
      include: {
        articles: {
          where: { publishedAt: { not: null } },
          select: {
            _count: {
              select: { views: true }
            }
          }
        }
      }
    }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: 'societe' } } }, take: 10, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: 'chronique' } } }, take: 10, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.article.findMany({ where: { isConfidentiel: true, publishedAt: { not: null } }, take: 8, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: 'dossiers' } } }, take: 5, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: { in: ['art-culture', 'culture'] } } } }, take: 5, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: 'football' } } }, take: 4, orderBy: { publishedAt: 'desc' }, include: { categories: true } })
  ]);

  if (!recentArticles || recentArticles.length === 0) {
    return <div>Aucun article disponible. Le chargement des données est peut-être en cours.</div>;
  }

  // Trier les tags par nombre total de vues des articles associés
  const processedTrendingTags = trendingTags
    .map(tag => ({
      ...tag,
      totalViews: tag.articles.reduce((sum: number, art: any) => sum + (art._count?.views || 0), 0)
    }))
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 7);

  // Deduplication tracking
  const displayedIds = new Set<string>();

  const getUnique = (articles: any[], count: number) => {
    const unique = [];
    for (const art of articles) {
      if (!displayedIds.has(art.id)) {
        unique.push(art);
        displayedIds.add(art.id);
        if (unique.length === count) break;
      }
    }
    return unique;
  };

  // Split recent articles for "A la Une"
  const aLaUne = aLaUneArticles.length >= 5 ? aLaUneArticles : getUnique(recentArticles, 5);
  // Ensure IDs are tracked even if we use category-specific fetch
  aLaUne.forEach(a => displayedIds.add(a.id));

  // Select items for the main grid categories
  const cedeauItems = getUnique(cedeauArticles, 4);
  const politiqueItems = getUnique(politiqueArticles, 4);
  const economieItems = getUnique(economieArticles, 4);
  const faitsDiversItems = getUnique(faitsDiversArticles, 4);
  const actualiteSidebar = getUnique([...actualiteArticles, ...recentArticles], 7)
    .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
  const societeItems = getUnique(societeArticles, 5);
  const chroniqueItems = getUnique(chroniqueArticles, 5);

  const brvmGrp = brvmIndicators;

  const plusDeNews = getUnique(recentArticles, 8); // For the bottom section

  const mainFeatured = aLaUne[0];
  const subFeatured = aLaUne.slice(1);

  return (
    <>
    <div>
      <AdBanner slot="HOME_TOP" />

      {/* Trending Tags (Hashtags) */}
      {processedTrendingTags && processedTrendingTags.length > 0 && (
        <div style={{ padding: '0.5rem 0', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
          <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', flexShrink: 0 }}>
              🔥 Tendances :
            </span>
            {processedTrendingTags.map((tag: any) => (
              <a
                key={tag.id}
                href={`/tag/${tag.slug}`}
                style={{
                  display: 'inline-block',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
              >
                #{tag.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>

    <div className="portal-layout">
      {/* LEFT COLUMN: Titrologie & Services */}
      <aside className="portal-col-left">

        {/* Section Actualités */}
        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <h2 className="portal-section-title" style={{ backgroundColor: "var(--primary)" }}>Actualités</h2>
          <div style={{ padding: "1rem" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
              {actualiteSidebar.map((article) => {
                const imgUrl = getArticleImage(article);
                return (
                  <li key={article.id} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <div className="image-watermark-container" style={{ width: "50px", height: "50px", backgroundColor: "var(--muted)", flexShrink: 0, borderRadius: "4px", overflow: "hidden" }}>
                      {imgUrl && <SafeImage src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <Link href={`/article/${article.slug}`} style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.2, flex: 1 }}>
                      {article.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link href="/category/actualite" style={{ display: 'block', textAlign: 'center', fontSize: '0.8rem', marginTop: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>
              Voir toute l'actualité
            </Link>
          </div>
        </div>

        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          <h2 className="portal-section-title dark">Titrologie</h2>
          <div style={{ padding: "1rem" }}>
            <div className="grid-responsive-titrologie">
              {titrologieItems && titrologieItems.length > 0 ? (
                titrologieItems.map(item => (
                  <div key={item.id} className="image-watermark-container" style={{ height: '180px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <SafeImage src={item.imageUrl} alt={item.newspaperName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', padding: '1rem', fontSize: '0.8rem' }}>Les unes de journaux du jour ne sont pas encore disponibles.</div>
              )}
            </div>
            <Link href="/titrologie" style={{ display: 'block', textAlign: 'center', fontSize: '0.8rem', marginTop: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>
              Voir toute la titrologie
            </Link>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <PersonalizedFeed />
        </div>

        <WhatsAppAd />

        <AdBanner slot="HOME_SIDEBAR" />



        {/* Ad Placeholder Vertical */}
        <div style={{ marginTop: "1.5rem" }}>
          <AdSlot format="skyscraper" />
        </div>

        <SportsModule />
        
        {/* Humour / Caricature */}
        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginTop: "1.5rem" }}>
          <h2 className="portal-section-title" style={{ backgroundColor: "#ea580c", borderColor: "#c2410c" }}>Le Dessin de Presse</h2>
          <div style={{ padding: "1rem" }}>
            <div style={{ aspectRatio: "1/1", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "var(--muted)", borderRadius: "4px" }}>
              🎨
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '0.5rem' }}>La caricature du jour</p>
          </div>
        </div>

        {/* Offres d'Emploi */}
        {jobOffers && jobOffers.length > 0 && (
          <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginTop: "1.5rem" }}>
            <h2 className="portal-section-title" style={{ backgroundColor: "#0284c7", borderColor: "#0369a1" }}>Offres d'Emploi</h2>
            <div style={{ padding: "0" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {jobOffers.map((job) => (
                  <li key={job.id} style={{ borderBottom: "1px solid var(--border)", padding: "0.75rem 1rem" }}>
                    <Link href={job.url || "#"} style={{ display: "block" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground)" }}>{job.title}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.25rem", fontSize: "0.7rem", color: "var(--muted)" }}>
                        <span>📍 {job.location || "Côte d'Ivoire"}</span>
                        <span style={{ fontWeight: "bold", color: "#0284c7" }}>{job.company}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/emplois" style={{ display: "block", textAlign: "center", fontSize: "0.8rem", padding: "0.5rem", backgroundColor: "#f8fafc", color: "var(--primary)", fontWeight: "bold", borderTop: "1px solid var(--border)" }}>Toutes les offres</Link>
            </div>
          </div>
        )}

        {/* Communiqués */}
        {pressReleases && pressReleases.length > 0 && (
          <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginTop: "1.5rem" }}>
            <h2 className="portal-section-title" style={{ backgroundColor: "#10b981", borderColor: "#059669" }}>Communiqués</h2>
            <div style={{ padding: "0" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {pressReleases.map((pr) => (
                  <li key={pr.id} style={{ borderBottom: "1px solid var(--border)", padding: "0.75rem 1rem" }}>
                    <Link href={pr.url || "#"} target={pr.url ? "_blank" : undefined} style={{ display: "block" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground)" }}>{pr.title}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.25rem", fontSize: "0.7rem", color: "var(--muted)" }}>
                        <span style={{ fontWeight: "bold", color: "#10b981" }}>{pr.company}</span>
                        <span>{new Date(pr.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/communiques" style={{ display: "block", textAlign: "center", fontSize: "0.8rem", padding: "0.5rem", backgroundColor: "#f8fafc", color: "var(--primary)", fontWeight: "bold", borderTop: "1px solid var(--border)" }}>Voir tous les communiqués</Link>
            </div>
          </div>
        )}

        {/* Chronique Widget - NEW POSITION LEFT */}
        {chroniqueItems && chroniqueItems.length > 0 && (
          <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "1.5rem" }}>
            <h2 className="portal-section-title" style={{ backgroundColor: "#1e3a8a" }}>Chroniques</h2>
            <div style={{ padding: "1rem" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {chroniqueItems.map((article) => {
                  const imgUrl = getArticleImage(article);
                  return (
                    <li key={article.id} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      <div className="image-watermark-container" style={{ width: "50px", height: "50px", backgroundColor: "var(--muted)", flexShrink: 0, borderRadius: "4px", overflow: "hidden" }}>
                        {imgUrl && <SafeImage src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <Link href={`/article/${article.slug}`} style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.2, flex: 1 }}>
                        {article.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* Faits Divers - DÉPLACÉ ICI (colonne gauche) */}
        {faitsDiversItems && faitsDiversItems.length > 0 && (
          <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginTop: "1.5rem" }}>
            <h2 className="portal-section-title" style={{ backgroundColor: "#b91c1c", borderColor: "#991b1b", display: "flex", justifyContent: "space-between" }}>
              <span>Faits Divers</span>
              <Link href="/category/faits-divers" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", textDecoration: "none", fontWeight: "normal" }}>Voir tout</Link>
            </h2>
            <div style={{ padding: "0" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {faitsDiversItems.map((article) => {
                  const imgUrl = getArticleImage(article);
                  return (
                    <li key={article.id} style={{ borderBottom: "1px solid var(--border)", padding: "0.75rem 1rem" }}>
                      <Link href={`/article/${article.slug}`} style={{ display: "flex", gap: "0.75rem" }}>
                        <div className="image-watermark-container" style={{ width: "60px", height: "60px", backgroundColor: "var(--muted)", flexShrink: 0, borderRadius: "4px", overflow: "hidden" }}>
                          {imgUrl && <SafeImage src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "0.65rem", color: "#b91c1c", fontWeight: "bold", textTransform: "uppercase", marginBottom: "0.2rem" }}>Faits Divers</div>
                          <h3 style={{ fontSize: "0.8rem", fontWeight: 700, lineHeight: 1.3 }}>{article.title}</h3>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </aside>

      {/* CENTER COLUMN: Thematic Hub */}
      <div className="portal-col-center">
        {/* New Premium Hero */}
        <div style={{ marginBottom: "2.5rem" }}>
          <Link href={`/article/${mainFeatured.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{ 
              borderRadius: '24px', 
              overflow: 'hidden', 
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              backgroundColor: '#fff',
              border: '1px solid var(--border)'
            }}>
              <div className="image-watermark-container" style={{ 
                position: 'relative', 
                height: '450px', 
                backgroundColor: '#0f172a'
              }}>
                {getArticleImage(mainFeatured) ? (
                  <SafeImage src={getArticleImage(mainFeatured) as string} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0f172a, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '4rem', fontWeight: 900, color: 'white', opacity: 0.1 }}>LE DÉBAT IVOIRIEN</span>
                  </div>
                )}
                <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                   <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>
                    À LA UNE
                  </span>
                </div>
              </div>
              <div style={{ 
                padding: '2rem 2.5rem', 
                color: 'var(--foreground)'
              }}>
                <div style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  {mainFeatured.categories[0]?.name || "ACTUALITÉ"}
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.1, margin: '0.5rem 0', letterSpacing: '-0.03em', color: 'var(--foreground)' }}>
                  {mainFeatured.title}
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: '100%', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginTop: '1rem', lineHeight: 1.6 }}>
                  {mainFeatured.excerpt || "L'information brute, l'analyse experte, le débat indépendant."}
                </p>
                <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  Lire la suite →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* BRVM / Market Quick View */}
        <div style={{ marginBottom: "3rem", display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
           {brvmGrp.map((ind: any) => (
             <Link href="/economie/dashboard" key={ind.id} style={{ textDecoration: 'none', backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{ind.label}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--foreground)', marginBottom: '0.2rem' }}>{ind.value}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: ind.trend === 'UP' ? '#22c55e' : '#ef4444' }}>
                  {ind.trend === 'UP' ? '▲' : '▼'} {ind.extraText || (ind.trend === 'UP' ? '+0.42%' : '-0.15%')}
                </div>
             </Link>
           ))}
           <Link href="/economie/dashboard" style={{ textDecoration: 'none', backgroundColor: 'var(--primary)', padding: '1.5rem', borderRadius: '16px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase' }}>Dashboard Éco</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Voir toutes les cotations BRVM</div>
           </Link>
        </div>

        {/* PROMINENT KIOSQUE PDF BLOCK */}
        <div style={{ 
          marginBottom: "3rem", 
          padding: "2rem", 
          borderRadius: "24px", 
          backgroundImage: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", 
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)"
        }}>
          <div style={{ 
            position: "absolute", 
            top: "-20px", 
            right: "-20px", 
            fontSize: "12rem", 
            opacity: 0.05, 
            transform: "rotate(15deg)",
            pointerEvents: "none"
          }}>📰</div>
          <div style={{ flex: 1, position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span style={{ backgroundColor: "#ec1a24", color: "white", padding: "0.3rem 0.8rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase" }}>Premium</span>
              <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: "bold" }}>ÉDITION NUMÉRIQUE</span>
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, lineHeight: 1.1, marginBottom: "1rem" }}>Le Journal en PDF</h2>
            <p style={{ fontSize: "1rem", color: "#94a3b8", marginBottom: "1.5rem", maxWidth: "400px" }}>Retrouvez toute l'actualité de votre quotidien préféré en version numérique haute définition.</p>
            <Link href="/marketplace" style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "0.5rem",
              backgroundColor: "white", 
              color: "#0f172a", 
              padding: "0.75rem 1.75rem", 
              borderRadius: "12px", 
              fontWeight: "900", 
              fontSize: "0.95rem", 
              textDecoration: "none",
              boxShadow: "0 4px 6px rgba(255,255,255,0.1)"
            }} className="hover-scale">
              Accéder au kiosque 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div style={{ width: "180px", height: "240px", backgroundColor: "#334155", borderRadius: "12px", border: "4px solid #475569", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(5deg)", boxShadow: "0 10px 15px rgba(0,0,0,0.3)" }}>
             <div style={{ textAlign: "center" }}>
               <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "white", opacity: 0.5 }}>LDI</div>
               <div style={{ fontSize: "0.6rem", color: "white", opacity: 0.3 }}>PDF READER</div>
             </div>
          </div>
        </div>



        {/* Confidentiels Section */}
        {confidentielArticles && confidentielArticles.length > 0 && (
          <div style={{ marginBottom: "3rem", backgroundColor: "#fff5f5", border: "1px solid #feb2b2", borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #feb2b2", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#7f1d1d", color: "white" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                🔒 Les Confidentiels
              </h2>
              <Link href="/confidentiels" style={{ fontSize: "0.8rem", color: "white", textDecoration: "none", fontWeight: "bold" }}>Voir tout →</Link>
            </div>
            <div style={{ padding: "1rem" }}>
              <div style={{ display: "flex", gap: "1.5rem", overflowX: "auto", paddingBottom: "0.5rem", WebkitOverflowScrolling: "touch" }}>
                {confidentielArticles.map((article: any) => (
                  <Link key={article.id} href={`/article/${article.slug}`} style={{ flexShrink: 0, width: "240px", textDecoration: "none" }}>
                    <div style={{ fontSize: "0.65rem", color: "#b91c1c", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.3rem" }}>
                      {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
                    </div>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--foreground)", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", margin: 0 }}>
                      {article.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <GoogleAdSlot adSlot="9260624933" />

        {/* Dossiers & Enquêtes - CENTERED */}
        {dossiersArticles && dossiersArticles.length > 0 && (
          <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "2.5rem" }}>
            <h2 className="portal-section-title dark" style={{ backgroundColor: "#1e293b", borderColor: "#334155", display: "flex", justifyContent: "space-between" }}>
              <span>🔍 Dossiers & Enquêtes</span>
              <Link href="/category/dossiers" style={{ fontSize: "0.8rem", color: "white", textDecoration: "none", fontWeight: "normal" }}>Voir tout</Link>
            </h2>
            <div style={{ padding: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                {dossiersArticles.map((article: any) => (
                  <Link href={`/article/${article.slug}`} key={article.id} style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "0.5rem" }}>{article.title}</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--muted)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {article.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tendances Culturelles - CENTERED VISUAL GRID */}
        {(cultureArticlesFetched && cultureArticlesFetched.length > 0) && (
          <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "2.5rem" }}>
            <h2 className="portal-section-title" style={{ backgroundColor: "#9333ea", borderColor: "#7e22ce" }}>✨ Art & Culture</h2>
            <div style={{ padding: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
                {cultureArticlesFetched.map((article: any) => {
                  const imgUrl = getArticleImage(article);
                  return (
                    <Link href={`/article/${article.slug}`} key={article.id} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div style={{ height: "150px", backgroundColor: "#f3e8ff", borderRadius: "12px", overflow: "hidden", border: "1px solid #e9d5ff" }}>
                        {imgUrl ? <SafeImage src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : null}
                      </div>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: 800, lineHeight: 1.3 }}>{article.title}</h3>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Publicité Milieu de page */}
        <AdBanner slot="HOME_MIDDLE" />


        {/* Thematic Blocks */}
        <div className="grid-responsive-2col" style={{ gap: "1.5rem" }}>

          {/* Politique Block */}
          {politiqueItems && politiqueItems.length > 0 && (
            <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", gridColumn: "1 / -1" }}>
              <h2 className="portal-section-title dark" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>⚖️ Politique</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--primary)' }}><Link href="/category/politique">Voir tout</Link></span>
              </h2>
              <div style={{ padding: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  {politiqueItems.map((article) => {
                    const imgUrl = getArticleImage(article);
                    return (
                      <Link href={`/article/${article.slug}`} key={article.id} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div style={{ height: "120px", backgroundColor: "var(--muted)", overflow: "hidden", borderRadius: "4px" }}>
                          {imgUrl ? <SafeImage src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <div style={{ background: 'var(--foreground)', color: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>LDI</div>}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.65rem", color: "var(--primary)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                            Politique
                          </div>
                          <h3 style={{ fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.3 }}>{article.title}</h3>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>


      </div>

      {/* RIGHT COLUMN: Pubs & Les Plus Lus */}
      <aside className="portal-col-right">
        {/* Dépêches Widget */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <style dangerouslySetInnerHTML={{ __html: `
            .home-flash-header {
              background: #cc0000;
              color: #fff;
              padding: 0.55rem 1rem;
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 3px solid #aa0000;
            }
            .home-flash-title {
              font-size: 0.9rem;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            .home-flash-title::before {
              content: '';
              display: inline-block;
              width: 8px;
              height: 8px;
              background: #fff;
              border-radius: 50%;
              animation: home-pulse-dot 1.5s infinite;
            }
            @keyframes home-pulse-dot {
              0%   { opacity: 1; transform: scale(1); }
              50%  { opacity: 0.4; transform: scale(0.8); }
              100% { opacity: 1; transform: scale(1); }
            }
            .home-flash-item {
              display: flex;
              align-items: flex-start;
              gap: 0.6rem;
              padding: 0.6rem 0.75rem;
              border-bottom: 1px solid #f0f0f0;
              transition: background 0.15s ease;
            }
            .home-flash-item:last-child { border-bottom: none; }
            .home-flash-item:hover { background: #fef9f9; }

            .home-flash-time {
              flex-shrink: 0;
              min-width: 38px;
              font-size: 0.7rem;
              font-weight: 700;
              text-align: right;
              font-family: 'Arial Narrow', Arial, sans-serif;
            }
            .home-flash-bullet {
              flex-shrink: 0;
              width: 5px;
              height: 5px;
              border-radius: 50%;
              margin-top: 0.4rem;
            }
            .home-flash-content {
              flex: 1;
              font-size: 0.8rem;
              line-height: 1.4;
              color: #1a1a1a;
            }
            
            /* État récent vs ancien */
            .home-flash-item--recent .home-flash-time { color: #cc0000; }
            .home-flash-item--recent .home-flash-bullet { background: #cc0000; }
            .home-flash-item--stale .home-flash-time { color: #aaa; }
            .home-flash-item--stale .home-flash-bullet { background: #ccc; }
            .home-flash-item--stale .home-flash-content { color: #666; }
          `}} />
          
          <Link href="/depeches" style={{ textDecoration: 'none' }} className="home-flash-header">
            <div className="home-flash-title">Flash Infos</div>
            <span style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 700 }}>DIRECT ›</span>
          </Link>

          <div style={{ padding: "0" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: '350px', overflowY: 'auto' }}>
              {flashNewsItems.map((flash) => {
                const isRecent = Date.now() - new Date(flash.createdAt).getTime() < RECENT_THRESHOLD_MS;
                const timeStr = new Date(flash.createdAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <li key={flash.id} className={`home-flash-item ${isRecent ? 'home-flash-item--recent' : 'home-flash-item--stale'}`}>
                    <div className="home-flash-time">{timeStr}</div>
                    <div className="home-flash-bullet" />
                    <div className="home-flash-content">
                      {flash.link ? (
                        <Link href={flash.link} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {flash.content}
                        </Link>
                      ) : (
                        flash.content
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <Link href="/depeches" style={{ display: "block", textAlign: "center", fontSize: "0.75rem", padding: "0.55rem", backgroundColor: "#f8fafc", color: "#cc0000", fontWeight: "800", borderTop: "1px solid #ddd", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Plus de flash infos...
            </Link>
          </div>
        </div>

        <SubscriptionBanner />


        {/* Météo Widget */}
        {weatherReport && (
          <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "1.5rem", position: 'relative', backgroundImage: 'linear-gradient(to bottom, #38bdf8, #0ea5e9)', color: 'white' }}>
             <div style={{ padding: '1rem', height: '120px', position: 'relative' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <div style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase' }}>{weatherReport.city}</div>
                   <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>{weatherReport.condition}</div>
                 </div>
                 <div style={{ fontSize: '3rem', lineHeight: 1 }}>{weatherReport.icon}</div>
               </div>
               <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                 <span style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 0.8 }}>{weatherReport.temperature}°</span>
                 <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>C</span>
               </div>
               {weatherReport.apparentTemperature != null && (
                 <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', fontSize: '0.7rem', opacity: 0.9, textAlign: 'right' }}>
                   <span>Ressenti&nbsp;</span>
                   <span style={{ fontWeight: 900 }}>{weatherReport.apparentTemperature}°C</span>
                 </div>
               )}
             </div>
             
             {/* 3 Days Forecast */}
             {(weatherReport.forecast1Day || weatherReport.forecast2Day || weatherReport.forecast3Day) && (
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                 {weatherReport.forecast1Day && (
                   <div style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                     <div style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{weatherReport.forecast1Day}</div>
                     <div style={{ fontSize: '1.2rem', margin: '0.2rem 0' }}>{weatherReport.forecast1Icon}</div>
                     <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{weatherReport.forecast1Temp}°</div>
                   </div>
                 )}
                 {weatherReport.forecast2Day && (
                   <div style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                     <div style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{weatherReport.forecast2Day}</div>
                     <div style={{ fontSize: '1.2rem', margin: '0.2rem 0' }}>{weatherReport.forecast2Icon}</div>
                     <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{weatherReport.forecast2Temp}°</div>
                   </div>
                 )}
                 {weatherReport.forecast3Day && (
                   <div style={{ padding: '0.5rem', textAlign: 'center' }}>
                     <div style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{weatherReport.forecast3Day}</div>
                     <div style={{ fontSize: '1.2rem', margin: '0.2rem 0' }}>{weatherReport.forecast3Icon}</div>
                     <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{weatherReport.forecast3Temp}°</div>
                   </div>
                 )}
               </div>
             )}
          </div>
        )}



        {/* Activités Widget */}
        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <h2 className="portal-section-title dark">Activités Gouv</h2>
          <div style={{ padding: "1rem" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
              {activities.map((activity) => (
                <li key={activity.id} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <div style={{ width: "60px", height: "60px", backgroundColor: "var(--muted)", flexShrink: 0, borderRadius: "4px", overflow: "hidden" }}>
                    {activity.imageUrl && <SafeImage src={activity.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.2 }}>{activity.title}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--primary)", fontWeight: "bold", marginTop: "0.3rem" }}>{activity.date}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>📍 {activity.location}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ad Placeholder */}
        <div style={{ width: "100%", height: "250px", backgroundColor: "#f1f5f9", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.8rem", marginBottom: "1.5rem" }}>
          <AdSlot format="rectangle" />
        </div>

        {/* Poll Widget */}
        {poll && (
          <PollWidget poll={poll} />
        )}

        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <h2 className="portal-section-title dark">Les plus lus</h2>
          <div style={{ padding: "1rem" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {subFeatured.map((article, i) => (
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

        {/* Société Widget - NEW POSITION RIGHT */}
        {societeItems && societeItems.length > 0 && (
          <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "1.5rem" }}>
            <h2 className="portal-section-title dark">Société</h2>
            <div style={{ padding: "0" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {societeItems.map((article) => {
                  const imgUrl = getArticleImage(article);
                  return (
                    <li key={article.id} style={{ borderBottom: "1px solid var(--border)", padding: "0.75rem 1rem" }}>
                      <Link href={`/article/${article.slug}`} style={{ display: "flex", gap: "0.75rem" }}>
                        <div style={{ width: "60px", height: "60px", backgroundColor: "var(--muted)", flexShrink: 0, borderRadius: "4px", overflow: "hidden" }}>
                          {imgUrl && <SafeImage src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.3 }}>{article.title}</div>
                          <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: "0.25rem" }}>{new Date(article.publishedAt).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link href="/category/societe" style={{ display: "block", textAlign: "center", fontSize: "0.8rem", padding: "0.5rem", backgroundColor: "#f8fafc", color: "var(--primary)", fontWeight: "bold", borderTop: "1px solid var(--border)" }}>Voir tout Société</Link>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginTop: "1.5rem" }}>
          <h2 className="portal-section-title" style={{ backgroundColor: "black", borderColor: "gray" }}>Nécrologie</h2>
          <div style={{ padding: "1rem" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {obituaries.map((ob) => (
                <li key={ob.id} style={{ display: "flex", gap: "0.75rem", alignItems: "center", borderBottom: "1px dashed var(--border)", paddingBottom: "0.75rem" }}>
                  <div style={{ width: "40px", height: "40px", backgroundColor: "#e2e8f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>✝️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.2 }}>{ob.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.2rem" }}>{ob.details}</div>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/necrologie" style={{ display: "block", textAlign: "center", fontSize: "0.8rem", color: "var(--primary)", fontWeight: "bold", marginTop: "1rem" }}>Voir tous les avis</Link>
          </div>
        </div>

        {/* Offres d'Emploi Widget */}
        {jobOffers && jobOffers.length > 0 && (
          <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginTop: "1.5rem" }}>
            <h2 className="portal-section-title" style={{ backgroundColor: "#eab308", borderColor: "#ca8a04" }}>Offres d'Emploi</h2>
            <div style={{ padding: "1rem" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {jobOffers.map((job) => (
                  <li key={job.id} style={{ display: "flex", gap: "0.75rem", borderBottom: "1px dashed var(--border)", paddingBottom: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.2 }}>{job.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "bold", marginTop: "0.2rem" }}>🏢 {job.company}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.2rem" }}>📍 {job.location}</div>
                      {job.url && (
                        <Link href={job.url} target="_blank" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.7rem', backgroundColor: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#475569', fontWeight: 'bold' }}>Voir l'offre →</Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/emplois" style={{ display: "block", textAlign: "center", fontSize: "0.8rem", color: "var(--primary)", fontWeight: "bold", marginTop: "1rem" }}>Toutes les offres</Link>
            </div>
          </div>
        )}

        {/* Newsletter Widget */}
        <NewsletterWidget />

        {/* Citation du Jour */}
        {quote ? (
          <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginTop: "1.5rem", padding: "1.5rem", textAlign: "center", position: "relative" }}>
            <div style={{ fontSize: "3rem", color: "var(--muted)", opacity: 0.3, position: "absolute", top: "-10px", left: "10px", lineHeight: 1 }}>"</div>
            <p style={{ fontSize: "0.9rem", fontStyle: "italic", fontWeight: 600, color: "var(--foreground)", position: "relative", zIndex: 1, margin: "1rem 0" }}>
              "{quote.text}"
            </p>
            <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--primary)" }}>{quote.author}</div>
          </div>
        ) : (
          <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginTop: "1.5rem", padding: "1.5rem", textAlign: "center", position: "relative" }}>
            <div style={{ fontSize: "3rem", color: "var(--muted)", opacity: 0.3, position: "absolute", top: "-10px", left: "10px", lineHeight: 1 }}>"</div>
            <p style={{ fontSize: "0.9rem", fontStyle: "italic", fontWeight: 600, color: "var(--foreground)", position: "relative", zIndex: 1, margin: "1rem 0" }}>
              "La paix n'est pas un vain mot, c'est un comportement."
            </p>
            <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--primary)" }}>Félix Houphouët-Boigny</div>
          </div>
        )}

        {/* Real Facebook Page Plugin */}
        {siteSettings?.facebookUrl && (
          <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginTop: "1.5rem" }}>
            <div style={{ padding: "0.75rem 1rem", backgroundColor: "#1877F2", color: "white", fontWeight: "bold", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Suivez-nous sur Facebook
            </div>
            <div style={{ width: "100%", overflow: "hidden", backgroundColor: "white" }}>
              <iframe 
                src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(siteSettings.facebookUrl)}&tabs=timeline&width=340&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`}
                width="100%" 
                height="600" 
                style={{ border: "none", overflow: "hidden" }} 
                scrolling="no" 
                frameBorder="0" 
                allowFullScreen={true} 
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              ></iframe>
            </div>
          </div>
        )}
      </aside>

    </div>



    {/* FULL-WIDTH FOOTBALL BLOCK */}
    {footballArticles && footballArticles.length > 0 && (
      <div className="container" style={{ marginTop: '3rem' }}>
        <h2 className="portal-section-title" style={{ display: "flex", justifyContent: "space-between", borderBottom: '2px solid #dc2626', backgroundColor: '#fef2f2' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b' }}>⚽ Football Ivoirien & International</span>
          <Link href="/category/football" style={{ fontSize: "0.8rem", color: "#dc2626", textDecoration: "none", fontWeight: "bold" }}>Voir tout</Link>
        </h2>
        <div style={{ padding: "1.5rem", backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderTop: "none", borderRadius: "0 0 var(--radius) var(--radius)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
            {footballArticles.map((article: any) => {
              const imgUrl = getArticleImage(article);
              return (
                <Link href={`/article/${article.slug}`} key={`fb-fw-${article.id}`} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ height: "150px", backgroundColor: "#fef2f2", overflow: "hidden", borderRadius: "12px", border: "1px solid #fee2e2" }}>
                    {imgUrl ? <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : null}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#dc2626", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.3rem" }}>
                      Football
                    </div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, lineHeight: 1.3 }}>{article.title}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    )}

    {/* FULL-WIDTH ÉCONOMIE & FINANCES */}
    {economieItems && economieItems.length > 0 && (
      <div className="container" style={{ marginTop: '3rem' }}>
        <h2 className="portal-section-title" style={{ display: "flex", justifyContent: "space-between", borderBottom: '2px solid #0369a1', backgroundColor: '#f0f9ff' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#075985' }}>📈 Économie & Finances</span>
          <Link href="/category/economie" style={{ fontSize: "0.8rem", color: "#0369a1", textDecoration: "none", fontWeight: "bold" }}>Voir tout</Link>
        </h2>
        <div style={{ padding: "1.5rem", backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderTop: "none", borderRadius: "0 0 var(--radius) var(--radius)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
            {economieItems.map((article) => {
              const imgUrl = getArticleImage(article);
              return (
                <Link href={`/article/${article.slug}`} key={`eco-fw-${article.id}`} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ height: "150px", backgroundColor: "#f0f9ff", overflow: "hidden", borderRadius: "8px", border: "1px solid #bae6fd" }}>
                    {imgUrl ? <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : null}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#0369a1", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.3rem" }}>
                      Économie
                    </div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, lineHeight: 1.3 }}>{article.title}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    )}

    {/* FULL-WIDTH AFRIQUE DE L'OUEST */}
    {cedeauItems && cedeauItems.length > 0 && (
      <div className="container" style={{ marginTop: '3rem' }}>
        <h2 className="portal-section-title" style={{ display: "flex", justifyContent: "space-between", borderBottom: '2px solid #059669', backgroundColor: '#ecfdf5' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46' }}>🌍 Afrique de l'Ouest</span>
          <Link href="/category/afrique-occidentale" style={{ fontSize: "0.8rem", color: "#059669", textDecoration: "none", fontWeight: "bold" }}>Voir tout</Link>
        </h2>
        <div style={{ padding: "1.5rem", backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderTop: "none", borderRadius: "0 0 var(--radius) var(--radius)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
            {cedeauItems.map((article) => {
              const imgUrl = getArticleImage(article);
              return (
                <Link href={`/article/${article.slug}`} key={`cedeau-fw-${article.id}`} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ height: "150px", backgroundColor: "#f0fdf4", overflow: "hidden", borderRadius: "8px", border: "1px solid #d1fae5" }}>
                    {imgUrl ? <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : null}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#059669", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.3rem" }}>
                      Afrique de l'Ouest
                    </div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, lineHeight: 1.3 }}>{article.title}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    )}

    {/* FULL-WIDTH PLUS DE NEWS */}
    <div className="container" style={{ marginTop: '3rem' }}>
      <h2 className="portal-section-title dark" style={{ display: "flex", justifyContent: "space-between", borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>Plus de News</span>
        <Link href="/en-continu" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', alignSelf: 'flex-end' }}>Voir tout le flux</Link>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
        {plusDeNews.map((article) => {
          const imgUrl = getArticleImage(article);
          const catName = article.categories[0]?.name || "Général";
          return (
            <Link href={`/article/${article.slug}`} key={`more-${article.id}`} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", backgroundColor: "var(--card-bg)", borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)", transition: "transform 0.2s" }} className="hover-scale">
              <div style={{ aspectRatio: "16/9", backgroundColor: "var(--muted)", overflow: "hidden", position: "relative" }}>
                {imgUrl ? <img src={imgUrl} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{width:'100%',height:'100%',background:'var(--foreground)'}} />}
                <div style={{ position: "absolute", top: "0.5rem", left: "0.5rem", backgroundColor: "var(--primary)", color: "white", fontSize: "0.65rem", fontWeight: "bold", padding: "0.2rem 0.5rem", borderRadius: "2px", textTransform: "uppercase" }}>{catName}</div>
              </div>
              <div style={{ padding: "1rem" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "0.5rem" }}>{new Date(article.publishedAt || new Date()).toLocaleDateString("fr-FR")}</div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.3 }}>{article.title}</h3>
                {article.excerpt && (
                  <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{article.excerpt}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>

    {/* FULL-WIDTH ESPACE PUBLIE-REPORTAGE */}
    <div className="container" style={{ marginTop: '3rem' }}>
      <h2 className="portal-section-title dark" style={{ display: "flex", justifyContent: "space-between", borderBottom: '2px solid #f59e0b', paddingBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b' }}>Publie-reportage</span>
        <Link href="/category/publie-reportage" style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 'bold', alignSelf: 'flex-end' }}>Voir tous les reportages</Link>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
        {(publieReportageArticles && publieReportageArticles.length > 0 ? publieReportageArticles : recentArticles.slice(0, 4)).map((article) => {
          const imgUrl = getArticleImage(article);
          return (
            <Link href={`/article/${article.slug}`} key={`pub-${article.id}`} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", backgroundColor: "var(--card-bg)", borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)", transition: "transform 0.2s" }} className="hover-scale">
              <div style={{ aspectRatio: "16/9", backgroundColor: "var(--muted)", overflow: "hidden", position: "relative" }}>
                {imgUrl ? <img src={imgUrl} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{width:'100%',height:'100%',background:'var(--foreground)'}} />}
                <div style={{ position: "absolute", top: "0.5rem", left: "0.5rem", backgroundColor: "#f59e0b", color: "white", fontSize: "0.65rem", fontWeight: "bold", padding: "0.2rem 0.5rem", borderRadius: "2px", textTransform: "uppercase" }}>Publie-reportage</div>
              </div>
              <div style={{ padding: "1rem" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "0.5rem" }}>{new Date(article.publishedAt || new Date()).toLocaleDateString("fr-FR")}</div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.3 }}>{article.title}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{article.excerpt || "Découvrez nos publi-reportages exclusifs mettant en avant les initiatives et les acteurs clés du moment."}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>

    {/* FULL-WIDTH ESPACE PUBLICITAIRE HORIZONTAL */}
    <div className="container" style={{ marginTop: '3rem' }}>
      <AdSlot format="leaderboard" />
    </div>

    {/* FULL-WIDTH ESPACE INTERNATIONAL */}
    <div className="container" style={{ marginTop: '3rem' }}>
      <h2 className="portal-section-title dark" style={{ display: "flex", justifyContent: "space-between", borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>International & Diplomatie</span>
        <Link href="/category/internationale" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', alignSelf: 'flex-end' }}>Voir plus d'actualités internationales</Link>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
        {internationalArticles.map((article) => {
          const imgUrl = getArticleImage(article);
          return (
            <Link href={`/article/${article.slug}`} key={`intl-${article.id}`} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", backgroundColor: "var(--card-bg)", borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)", transition: "transform 0.2s" }} className="hover-scale">
              <div style={{ aspectRatio: "16/9", backgroundColor: "var(--muted)", overflow: "hidden", position: "relative" }}>
                {imgUrl ? <img src={imgUrl} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{width:'100%',height:'100%',background:'var(--foreground)'}} />}
                <div style={{ position: "absolute", top: "0.5rem", left: "0.5rem", backgroundColor: "var(--primary)", color: "white", fontSize: "0.65rem", fontWeight: "bold", padding: "0.2rem 0.5rem", borderRadius: "2px", textTransform: "uppercase" }}>Diplomatie</div>
              </div>
              <div style={{ padding: "1rem" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "0.5rem" }}>{new Date(article.publishedAt || new Date()).toLocaleDateString("fr-FR")}</div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.3 }}>{article.title}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{article.excerpt || "Retrouvez les dernières informations sur les relations internationales et la diplomatie ivoirienne à travers le monde."}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>



    {/* FULL-WIDTH ESPACE CULTURE */}
    <div className="container" style={{ marginTop: '3rem' }}>
      <h2 className="portal-section-title dark" style={{ display: "flex", justifyContent: "space-between", borderBottom: '2px solid #9333ea', paddingBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#9333ea' }}>Culture &amp; Arts</span>
        <Link href="/category/culture" style={{ fontSize: '0.8rem', color: '#9333ea', fontWeight: 'bold', alignSelf: 'flex-end' }}>Voir plus de culture</Link>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
        {(cultureArticles.length > 0 ? cultureArticles : recentArticles.slice(6, 10)).slice(0, 4).map((article) => {
          const imgUrl = getArticleImage(article);
          return (
            <Link href={`/article/${article.slug}`} key={`cult-${article.id}`} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", backgroundColor: "var(--card-bg)", borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)", transition: "transform 0.2s" }} className="hover-scale">
              <div style={{ aspectRatio: "16/9", backgroundColor: "var(--muted)", overflow: "hidden", position: "relative" }}>
                {imgUrl ? <img src={imgUrl} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{width:'100%',height:'100%',background:'var(--foreground)'}} />}
                <div style={{ position: "absolute", top: "0.5rem", left: "0.5rem", backgroundColor: "#9333ea", color: "white", fontSize: "0.65rem", fontWeight: "bold", padding: "0.2rem 0.5rem", borderRadius: "2px", textTransform: "uppercase" }}>Culture</div>
              </div>
              <div style={{ padding: "1rem" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "0.5rem" }}>{new Date(article.publishedAt || new Date()).toLocaleDateString("fr-FR")}</div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.3 }}>{article.title}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{article.excerpt || "Actualité des arts, spectacles et de la création culturelle."}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>

    {/* FULL-WIDTH ESPACE PHOTO */}
    <section style={{ backgroundColor: '#0f172a', color: 'white', padding: '3rem 0', marginTop: '3rem' }}>
      <div className="container">
        <h2 className="portal-section-title" style={{ backgroundColor: 'transparent', borderBottom: '2px solid var(--primary)', padding: '0 0 0.5rem 0', display: 'inline-block' }}>En Images</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          {recentArticles.slice(0, 4).map(article => {
            const imgUrl = getArticleImage(article);
            return (
              <Link href={`/article/${article.slug}`} key={`photo-${article.id}`} style={{ display: 'block', position: 'relative', aspectRatio: '4/3', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden', transform: 'translateZ(0)' }}>
                {imgUrl ? <img src={imgUrl} alt={article.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="hover-scale" /> : <div style={{position: 'absolute', top: 0, left: 0, width:'100%',height:'100%',background:'var(--muted)'}} />}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '1.5rem 1rem 1rem 1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>{article.title}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>

    {/* FULL-WIDTH ESPACE VIDEOS */}
    <WebTVModule videos={videos} />

    {/* FULL-WIDTH ESPACE ACTU AUDIO */}
    <HomeAudioModule 
      articles={audioArticles.map(a => ({
        id: a.id,
        title: a.title,
        content: a.content,
        slug: a.slug,
        imageUrl: getArticleImage(a) as string | null,
        categoryName: a.categories[0]?.name
      }))} 
    />

    </>
  );
}

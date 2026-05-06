import { prisma } from "@/lib/prisma";
import { getArticleImage } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import MainNavigation from "@/components/MainNavigation";
import NewsletterWidget from "@/components/NewsletterWidget";
import { AdSlot } from "@/components/AdSlot";
import AdBanner from "@/components/AdBanner";
import SportsModule from "@/components/SportsModule";
import { PollWidget } from "@/components/PollWidget";
import PersonalizedFeed from "@/components/PersonalizedFeed";
import HomeAudioModule from "@/components/HomeAudioModule";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  // Fetch massive data in parallel for high density
  const [
    recentArticles,
    topCategories,
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
    trendingTags
  ] = await Promise.all([
    prisma.article.findMany({
      where: { publishedAt: { not: null } },
      take: 25,
      orderBy: { publishedAt: "desc" },
      include: { categories: true },
    }),
    prisma.category.findMany({
      where: { articles: { some: {} } },
      take: 4,
      include: {
        articles: {
          take: 5,
          orderBy: { publishedAt: "desc" },
        }
      }
    }),
    prisma.poll.findFirst({ where: { isActive: true }, include: { options: true }, orderBy: { createdAt: 'desc' } }),
    prisma.obituary.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: 'politique' } } }, take: 4, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.video.findMany({ take: 4, orderBy: { createdAt: 'desc' } }),
    prisma.activity.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
    prisma.flashNews.findMany({ take: 6, orderBy: { createdAt: 'desc' } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: { in: ['culture', 'arts'] } } } }, take: 4, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.jobOffer.findMany({ take: 4, orderBy: { createdAt: 'desc' }, where: { isActive: true } }),
    prisma.weatherReport.findFirst({ orderBy: { date: 'desc' } }),
    prisma.breakingNews.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } }),
    prisma.titrologie.findMany({ orderBy: { date: 'desc' }, take: 4 }),
    prisma.siteSettings.findUnique({ where: { id: "global" } }),
    prisma.quote.findFirst({ where: { isActive: true } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: 'faits-divers' } } }, take: 4, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: 'economie' } } }, take: 4, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.pressRelease.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: 'publie-reportage' } } }, take: 4, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.article.findMany({ where: { isAudioAvailable: true, publishedAt: { not: null } }, take: 8, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
    prisma.article.findMany({ where: { publishedAt: { not: null }, categories: { some: { slug: { in: ['international', 'internationale', 'diplomatie'] } } } }, take: 4, orderBy: { publishedAt: 'desc' }, include: { categories: true } }),
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
    })
  ]);

  if (!recentArticles || recentArticles.length === 0) {
    return <div>Aucun article disponible. Le chargement des données est peut-être en cours.</div>;
  }

  // Trier les tags par nombre total de vues des articles associés
  const processedTrendingTags = trendingTags
    .map(tag => ({
      ...tag,
      totalViews: tag.articles.reduce((sum, art) => sum + art._count.views, 0)
    }))
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 7);

  // Split recent articles for "A la Une"
  const aLaUne = recentArticles.slice(0, 5);
  const flashInfo = recentArticles.slice(0, 15); // Show all recent articles in En Continu

  const mainFeatured = aLaUne[0];
  const subFeatured = aLaUne.slice(1);

  return (
    <>
    <div className="container">
      <AdBanner slot="HOME_TOP" />
      <SportsModule />

      {/* Trending Tags (Hashtags) */}
      {processedTrendingTags && processedTrendingTags.length > 0 && (
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          overflowX: 'auto', 
          padding: '0.75rem 0', 
          marginBottom: '1rem',
          borderBottom: '1px solid var(--border)',
          scrollbarWidth: 'none',
          whiteSpace: 'nowrap',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}># Tendances :</span>
          {processedTrendingTags.map(tag => (
            <Link 
              key={tag.id} 
              href={`/tag/${tag.slug}`}
              style={{ 
                fontSize: '0.85rem', 
                color: 'var(--foreground)', 
                textDecoration: 'none', 
                fontWeight: 600,
                transition: 'color 0.2s'
              }}
              className="hover-primary"
            >
              #{tag.name.replace(/\s+/g, '')}
            </Link>
          ))}
        </div>
      )}
    </div>

    <div className="portal-layout">
      {/* LEFT COLUMN: Fil Info Continu & Widgets */}
      <aside className="portal-col-left">
        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <h2 className="portal-section-title">En Continu</h2>
          <div className="flash-info-container" style={{ padding: "0 1rem 1rem 1rem" }}>
            {flashInfo.length > 0 ? (
              flashInfo.map((article) => (
                <div key={article.id} className="flash-item">
                  <span className="time">{new Date(article.publishedAt!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <Link href={`/article/${article.slug}`} style={{ textDecoration: 'none', color: 'var(--foreground)', fontWeight: 600 }}>
                    {article.title}
                  </Link>
                  {article.categories && article.categories[0] && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', backgroundColor: '#e2e8f0', padding: '0.1rem 0.3rem', borderRadius: '2px', color: '#475569', fontWeight: 'bold' }}>
                      {article.categories[0].name}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
                Aucun article récent.
              </div>
            )}
          </div>
          <Link href="/en-continu" style={{ display: "block", textAlign: "center", fontSize: "0.8rem", padding: "0.5rem", backgroundColor: "#f8fafc", color: "var(--primary)", fontWeight: "bold", borderTop: "1px solid var(--border)" }}>Toute l'actualité en continu</Link>
        </div>

        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          <h2 className="portal-section-title dark">Titrologie</h2>
          <div style={{ padding: "1rem" }}>
            <div className="grid-responsive-titrologie">
              {titrologieItems && titrologieItems.length > 0 ? (
                titrologieItems.map(item => (
                  <div key={item.id} style={{ height: '180px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <img src={item.imageUrl} alt={item.newspaperName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

        {/* Tendances Culturelles */}
        {cultureArticles && cultureArticles.length > 0 && (
          <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginTop: "1.5rem" }}>
            <h2 className="portal-section-title" style={{ backgroundColor: "#9333ea", borderColor: "#7e22ce" }}>Tendances Culturelles</h2>
            <div className="compact-list" style={{ padding: "1rem" }}>
              {cultureArticles.map((article) => {
                const imgUrl = getArticleImage(article);
                return (
                  <Link href={`/article/${article.slug}`} key={article.id} className="compact-item" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '60px', backgroundColor: '#e2e8f0', flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}>
                      {imgUrl ? <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <div style={{width:'100%',height:'100%',background:'var(--foreground)'}} />}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "0.8rem", fontWeight: 700, lineHeight: 1.3 }}>{article.title}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <AdBanner slot="HOME_SIDEBAR" />

        {/* Marketplace PDF Widget */}
        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginTop: "1.5rem", padding: "1.5rem", textAlign: "center", position: "relative", backgroundImage: "linear-gradient(to right bottom, #ec1a24, #991b1b)", color: "white", boxShadow: "0 4px 6px rgba(236, 26, 36, 0.2)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 900, marginBottom: "0.5rem", textTransform: "uppercase" }}>Le Journal en PDF</div>
          <p style={{ fontSize: "0.85rem", marginBottom: "1.5rem", opacity: 0.9 }}>Téléchargez et lisez l'édition numérique complète du journal Le Débat Ivoirien.</p>
          <Link href="/marketplace" style={{ display: "inline-block", backgroundColor: "white", color: "#ec1a24", padding: "0.6rem 1.5rem", borderRadius: "9999px", fontWeight: "bold", fontSize: "0.9rem", textDecoration: "none", transition: "transform 0.2s" }} className="hover-scale">
            Accéder au kiosque
          </Link>
        </div>

        {/* Dossiers & Enquêtes */}
        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginTop: "1.5rem" }}>
          <h2 className="portal-section-title dark" style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}>Dossiers & Enquêtes</h2>
          <div className="compact-list" style={{ padding: "1rem" }}>
            {recentArticles.slice(16, 19).map((article) => (
              <Link href={`/article/${article.slug}`} key={article.id} className="compact-item" style={{ marginBottom: '1rem', display: 'block' }}>
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.3, marginBottom: "0.2rem" }}>{article.title}</h3>
                <p style={{ fontSize: "0.7rem", color: "var(--muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {article.excerpt || "Découvrez notre enquête exclusive sur ce sujet de société qui fait débat..."}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Ad Placeholder Vertical */}
        <div style={{ marginTop: "1.5rem" }}>
          <AdSlot format="skyscraper" />
        </div>
        
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


      </aside>

      {/* CENTER COLUMN: A la Une & Categories */}
      <div className="portal-col-center">
        {/* A la Une Mosaic */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginBottom: "2rem" }}>
          <Link href={`/article/${mainFeatured.slug}`} style={{ display: "block" }}>
            <div className="main-featured-card" style={{ position: "relative", backgroundColor: "#e2e8f0", borderRadius: "var(--radius)", overflow: "hidden" }}>
              {getArticleImage(mainFeatured) ? (
                <img src={getArticleImage(mainFeatured) as string} alt={mainFeatured.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--foreground)', color: 'white', opacity: 0.8 }}>
                  <span style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-0.05em' }}>LeDébat</span>
                  <span style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.02em', marginTop: '-1rem' }}>IVOIRIEN</span>
                </div>
              )}
              <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)", padding: "2rem 1rem 1rem 1rem", color: "white" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                  {mainFeatured.categories[0]?.name || "Général"}
                </div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1.2 }}>
                  {mainFeatured.title}
                </h1>
              </div>
            </div>
          </Link>
          
          <div className="grid-responsive-2col">
            {subFeatured.slice(0, 2).map((article) => {
              const imgUrl = getArticleImage(article);
              return (
                <Link href={`/article/${article.slug}`} key={article.id}>
                  <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", height: "100%" }}>
                    <div style={{ height: "120px", backgroundColor: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", position: "relative" }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ background: 'var(--foreground)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>LDI</div>
                      )}
                    </div>
                    <div style={{ padding: "0.75rem" }}>
                      <h2 style={{ fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.3 }}>{article.title}</h2>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Publicité Milieu de page */}
        <AdBanner slot="HOME_MIDDLE" />

        {/* Flux Personnalisé pour l'utilisateur (Server Component) */}
        <PersonalizedFeed />

        {/* Thematic Blocks */}
        <div className="grid-responsive-2col" style={{ gap: "1.5rem" }}>
          {topCategories.map((category) => (
            <div key={category.id} style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
              <h2 className="portal-section-title">{category.name}</h2>
              <div className="compact-list" style={{ padding: "1rem" }}>
                {category.articles.map((article, idx) => {
                  const imgUrl = getArticleImage(article);
                  return (
                    <Link href={`/article/${article.slug}`} key={article.id} className="compact-item">
                      {idx === 0 && (
                        <div className="compact-thumb" style={{ overflow: 'hidden' }}>
                          {imgUrl ? (
                            <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ background: 'var(--foreground)', color: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>LDI</div>
                          )}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        {idx === 0 && (
                          <div className="compact-meta">
                            {new Date(article.publishedAt || new Date()).toLocaleDateString("fr-FR")}
                          </div>
                        )}
                        <h3 className="compact-title" style={{ fontSize: idx === 0 ? "1rem" : "0.85rem" }}>
                          {article.title}
                        </h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Politique Block */}
          {politiqueArticles && politiqueArticles.length > 0 && (
            <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", gridColumn: "1 / -1" }}>
              <h2 className="portal-section-title dark" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Politique</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--primary)' }}><Link href="/category/politique">Voir tout</Link></span>
              </h2>
              <div style={{ padding: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  {politiqueArticles.map((article) => {
                    const imgUrl = getArticleImage(article);
                    return (
                      <Link href={`/article/${article.slug}`} key={article.id} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div style={{ height: "120px", backgroundColor: "var(--muted)", overflow: "hidden", borderRadius: "4px" }}>
                          {imgUrl ? <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <div style={{ background: 'var(--foreground)', color: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>LDI</div>}
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

        {/* Economie */}
        {economieArticles.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h2 className="portal-section-title" style={{ display: "flex", justifyContent: "space-between", borderBottom: '2px solid var(--primary)' }}>
              <span>Économie</span>
              <Link href="/category/economie" style={{ fontSize: "0.8rem", color: "var(--muted)", textDecoration: "none", fontWeight: "normal" }}>Voir tout</Link>
            </h2>
            <div className="grid-responsive-2col" style={{ marginTop: "1rem" }}>
              {economieArticles.map((article) => {
                const imgUrl = getArticleImage(article);
                return (
                  <Link href={`/article/${article.slug}`} key={article.id} style={{ display: "flex", gap: "0.75rem", backgroundColor: "var(--card-bg)", padding: "0.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                    <div style={{ width: "80px", height: "80px", backgroundColor: "var(--muted)", flexShrink: 0, overflow: "hidden", borderRadius: "4px" }}>
                      {imgUrl ? <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : null}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--primary)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                        Économie
                      </div>
                      <h3 style={{ fontSize: "0.8rem", fontWeight: 700, lineHeight: 1.3 }}>{article.title}</h3>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Faits Divers */}
        {faitsDiversArticles.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h2 className="portal-section-title" style={{ display: "flex", justifyContent: "space-between", borderBottom: '2px solid var(--primary)' }}>
              <span>Faits Divers</span>
              <Link href="/category/faits-divers" style={{ fontSize: "0.8rem", color: "var(--muted)", textDecoration: "none", fontWeight: "normal" }}>Voir tout</Link>
            </h2>
            <div className="grid-responsive-2col" style={{ marginTop: "1rem" }}>
              {faitsDiversArticles.map((article) => {
                const imgUrl = getArticleImage(article);
                return (
                  <Link href={`/article/${article.slug}`} key={article.id} style={{ display: "flex", gap: "0.75rem", backgroundColor: "var(--card-bg)", padding: "0.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                    <div style={{ width: "80px", height: "80px", backgroundColor: "var(--muted)", flexShrink: 0, overflow: "hidden", borderRadius: "4px" }}>
                      {imgUrl ? <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : null}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--primary)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                        Faits Divers
                      </div>
                      <h3 style={{ fontSize: "0.8rem", fontWeight: 700, lineHeight: 1.3 }}>{article.title}</h3>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: Pubs & Les Plus Lus */}
      <aside className="portal-col-right">
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

        {/* Dépêches Widget */}
        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <h2 className="portal-section-title" style={{ backgroundColor: "#dc2626", borderColor: "#991b1b" }}>Flash Infos / Dépêches</h2>
          <div style={{ padding: "0" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: '300px', overflowY: 'auto' }}>
              {flashNewsItems.map((flash) => (
                <li key={flash.id} style={{ display: "flex", gap: "0.75rem", padding: "0.75rem", borderBottom: "1px solid var(--border)", alignItems: 'flex-start' }}>
                  <div style={{ color: "#dc2626", fontWeight: 900, fontSize: "0.8rem", flexShrink: 0 }}>{flash.time}</div>
                  <div>
                    <div style={{ fontSize: "0.85rem", lineHeight: 1.3 }}>{flash.content}</div>
                    {flash.source && <div style={{ fontSize: "0.6rem", color: "var(--muted)", marginTop: "0.2rem", fontWeight: "bold" }}>Source: {flash.source}</div>}
                  </div>
                </li>
              ))}
            </ul>
            <Link href="#" style={{ display: "block", textAlign: "center", fontSize: "0.8rem", padding: "0.5rem", backgroundColor: "#f8fafc", color: "var(--primary)", fontWeight: "bold", borderTop: "1px solid var(--border)" }}>Toutes les dépêches</Link>
          </div>
        </div>

        {/* Activités Widget */}
        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <h2 className="portal-section-title dark">Agenda / Activités</h2>
          <div style={{ padding: "1rem" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
              {activities.map((activity) => (
                <li key={activity.id} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <div style={{ width: "60px", height: "60px", backgroundColor: "var(--muted)", flexShrink: 0, borderRadius: "4px", overflow: "hidden" }}>
                    {activity.imageUrl && <img src={activity.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
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

        {/* Facebook Embed */}
        {siteSettings?.facebookUrl && (
          <Link href={siteSettings.facebookUrl} target="_blank" style={{ display: 'block', backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginTop: "1.5rem", textDecoration: 'none' }} className="hover-scale">
            <div style={{ padding: "1rem", backgroundColor: "#1877F2", color: "white", display: "flex", alignItems: "center", gap: "0.75rem" }}>
               <div style={{ fontSize: "1.5rem", fontWeight: "bold", backgroundColor: "white", color: "#1877F2", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}>f</div>
               <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Rejoignez-nous sur Facebook</div>
            </div>
            <div style={{ height: "150px", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.5rem" }}>
               <div style={{ display: "flex", gap: "0.5rem" }}>
                 {[1,2,3,4,5].map(n => <div key={n} style={{width:"30px", height:"30px", borderRadius:"50%", backgroundColor:"#cbd5e1"}}></div>)}
               </div>
               <span style={{fontSize: "0.75rem", color: "var(--muted)"}}>Découvrez notre communauté</span>
            </div>
          </Link>
        )}
      </aside>

    </div>

    {/* FULL-WIDTH PLUS DE NEWS */}
    <div className="container" style={{ marginTop: '3rem' }}>
      <h2 className="portal-section-title dark" style={{ display: "flex", justifyContent: "space-between", borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>Plus de News</span>
        <Link href="/en-continu" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', alignSelf: 'flex-end' }}>Voir tout le flux</Link>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
        {recentArticles.slice(10, 18).map((article) => {
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

    {/* FULL-WIDTH ESPACE SPORT */}
    <div className="container" style={{ marginTop: '3rem' }}>
      <h2 className="portal-section-title dark" style={{ display: "flex", justifyContent: "space-between", borderBottom: '2px solid #22c55e', paddingBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#22c55e' }}>Sport</span>
        <Link href="#" style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 'bold', alignSelf: 'flex-end' }}>Toute l'actualité sportive</Link>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
        {recentArticles.slice(10, 14).map((article) => {
          const imgUrl = getArticleImage(article);
          return (
            <Link href={`/article/${article.slug}`} key={`sport-${article.id}`} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", backgroundColor: "var(--card-bg)", borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)", transition: "transform 0.2s" }} className="hover-scale">
              <div style={{ aspectRatio: "16/9", backgroundColor: "var(--muted)", overflow: "hidden", position: "relative" }}>
                {imgUrl ? <img src={imgUrl} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{width:'100%',height:'100%',background:'var(--foreground)'}} />}
                <div style={{ position: "absolute", top: "0.5rem", left: "0.5rem", backgroundColor: "#22c55e", color: "white", fontSize: "0.65rem", fontWeight: "bold", padding: "0.2rem 0.5rem", borderRadius: "2px", textTransform: "uppercase" }}>Sport</div>
              </div>
              <div style={{ padding: "1rem" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "0.5rem" }}>{new Date(article.publishedAt || new Date()).toLocaleDateString("fr-FR")}</div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.3 }}>{article.title}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{article.excerpt || "Les derniers résultats et analyses du monde du sport ivoirien et international."}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>

    {/* FULL-WIDTH ESPACE CULTURE */}
    <div className="container" style={{ marginTop: '3rem' }}>
      <h2 className="portal-section-title dark" style={{ display: "flex", justifyContent: "space-between", borderBottom: '2px solid #9333ea', paddingBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#9333ea' }}>Culture & Arts</span>
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
    <section style={{ backgroundColor: '#1e293b', color: 'white', padding: '3rem 0' }}>
      <div className="container">
        <h2 className="portal-section-title" style={{ backgroundColor: 'transparent', borderBottom: '2px solid var(--primary)', padding: '0 0 0.5rem 0', display: 'inline-block' }}>Web TV LDI - En Vidéo</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          {videos.map((vid) => (
            <div key={`video-${vid.id}`} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", cursor: "pointer" }}>
              <div style={{ aspectRatio: "16/9", backgroundColor: "black", position: "relative", borderRadius: "4px", overflow: "hidden", transform: 'translateZ(0)' }}>
                <img src={`https://picsum.photos/seed/${vid.id}/600/400`} alt={vid.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.2rem", boxShadow: "0 4px 6px rgba(0,0,0,0.3)" }}>
                  ▶
                </div>
              </div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.3 }}>{vid.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>

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

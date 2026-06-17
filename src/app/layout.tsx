import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Providers } from "@/components/Providers";
import VisitorTracker from "@/components/VisitorTracker";
import { UserMenu } from "@/components/UserMenu";
import { prisma } from "@/lib/prisma";
import { GoogleAnalytics } from '@next/third-parties/google';
import Script from "next/script";
import MainNavigation from "@/components/MainNavigation";
import ThemeToggle from "@/components/ThemeToggle";
import { PushNotificationPrompt, ConsentManagerButton } from "@/components/PushNotificationPrompt";
import { CookieConsentPopup } from "@/components/CookieConsentPopup";
import PopupAd from "@/components/PopupAd";
import WhatsAppPopup from "@/components/WhatsAppPopup";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import GoogleAdSlot from "@/components/GoogleAdSlot";
import WorldCupTicker from "@/components/WorldCupTicker";
import { getMatchesAndSync } from "@/lib/sports";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import LiveStreamBadge from "@/components/LiveStreamBadge";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ledebativoirien.net'),
  title: "Le Débat Ivoirien - Actualités en continu",
  description: "Portail d'informations et d'investigations. L'actualité en Côte d'Ivoire et dans le monde.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  
  const targetSlugs = ["a-la-une", "actualite", "politique", "economie", "diplomatie", "internationale", "societe", "sports", "culture"];
  
  // Robustness: Ensure these categories exist in the database
  try {
    const slugsToEnsure = ["diplomatie", "internationale", "publie-reportage"];
    const existingCats = await prisma.category.findMany({
      where: { slug: { in: slugsToEnsure } },
      select: { slug: true }
    });
    const existingSlugs = existingCats.map(c => c.slug);
    
    if (!existingSlugs.includes("diplomatie")) {
      await prisma.category.create({ data: { name: "Diplomatie", slug: "diplomatie" } }).catch(() => {});
    }
    if (!existingSlugs.includes("internationale")) {
      await prisma.category.create({ data: { name: "International", slug: "internationale" } }).catch(() => {});
    }
    if (!existingSlugs.includes("publie-reportage")) {
      await prisma.category.create({ data: { name: "Publie-reportage", slug: "publie-reportage" } }).catch(() => {});
    }
  } catch (e) {
    console.error("Error ensuring categories:", e);
  }

  let rawCategories = await prisma.category.findMany({
    where: { slug: { in: targetSlugs } }
  });

  // Fetch articles separately to avoid SQLite parameter limit errors with nested not:null filters
  let navCategories = await Promise.all(
    rawCategories.map(async (category) => {
      const articles = await prisma.article.findMany({
        where: {
          categories: { some: { id: category.id } },
          publishedAt: { not: null }
        },
        take: 3,
        orderBy: { publishedAt: 'desc' },
        select: { id: true, slug: true, title: true, imageUrl: true, publishedAt: true }
      });
      return { ...category, articles };
    })
  );

  // Sort them to match the targetSlugs array order
  navCategories.sort((a, b) => targetSlugs.indexOf(a.slug) - targetSlugs.indexOf(b.slug));

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const [indicators, siteSettings, skinAd, visitorCount, wcMatches] = await Promise.all([
    prisma.marketIndicator.findMany({ orderBy: { order: 'asc' } }),
    prisma.siteSettings.findUnique({ where: { id: "global" } }),
    prisma.advertisement.findFirst({
      where: {
        slot: 'SITE_SKIN',
        status: 'ACTIVE',
        OR: [
          { startDate: null },
          { startDate: { lte: new Date() } }
        ],
        AND: [
          { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }
        ]
      }
    }),
    prisma.visitor.count(),
    getMatchesAndSync()
  ]);



  const breakingNews = await prisma.breakingNews.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  const breakingText = breakingNews.length > 0 
    ? breakingNews.map(bn => bn.content).join(' &nbsp; &nbsp; | &nbsp; &nbsp; ') 
    : "Bienvenue sur Le Débat Ivoirien - L'actualité en continu";

  const getGroup = (groupName: string) => indicators.filter(i => i.group === groupName);
  const cacaoGrp = getGroup('CACAO');
  const anacardeGrp = getGroup('ANACARDE');
  const metaux1Grp = getGroup('METAUX1');
  const metaux2Grp = getGroup('METAUX2');
  const monnaiesGrp = getGroup('MONNAIES');
  const energieGrp = getGroup('ENERGIE');
  const brvmGrp = getGroup('BRVM');

  const getTrendIcon = (trend: string) => {
    if (trend === 'UP') return '↑';
    if (trend === 'DOWN') return '↓';
    return '—';
  };
  const getTrendColor = (trend: string) => {
    if (trend === 'UP') return '#22c55e';
    if (trend === 'DOWN') return '#ef4444';
    return '#4b5563';
  };

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#cc0000" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="google-adsense-account" content={process.env.NEXT_PUBLIC_ADSENSE_ID || "ca-pub-4879894549191568"} />
        <script 
          async 
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID || "ca-pub-4879894549191568"}`}
          crossOrigin="anonymous"
        ></script>
        {skinAd && (
          <style dangerouslySetInnerHTML={{ __html: `
            body {
              background-color: transparent !important;
            }
            body::before {
              content: "";
              position: ${siteSettings?.siteSkinAttachment === 'scroll' ? 'absolute' : 'fixed'};
              top: -5px; left: -5px; right: -5px; bottom: -5px;
              background-image: url('${skinAd.imageUrl}');
              background-attachment: ${siteSettings?.siteSkinAttachment || 'fixed'};
              background-size: cover;
              background-position: center top;
              background-repeat: no-repeat;
              filter: blur(${siteSettings?.siteSkinBlur || 0}px) brightness(${siteSettings?.siteSkinBrightness ?? 100}%);
              z-index: -1;
            }
            @media (max-width: 768px) {
              body {
                background-color: var(--background) !important;
              }
              body::before {
                display: none !important;
              }
              .site-wrapper {
                background-color: var(--background) !important;
              }
            }
          ` }} />
        )}
        <Script id="pwa-sw-register" strategy="lazyOnload">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('Service Worker registration successful with scope: ', registration.scope);
                  },
                  function(err) {
                    console.log('Service Worker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
      </head>
      <body className={inter.variable}>
        <ScrollProgressBar />
        <GoogleAnalytics gaId="G-KS8F2KC63J" />
        {siteSettings?.headerCode && (
          <div dangerouslySetInnerHTML={{ __html: siteSettings.headerCode }} />
        )}
        {skinAd && skinAd.linkUrl && (
          <a 
            href={skinAd.linkUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, cursor: 'pointer' }}
            title={skinAd.title}
          >
            <span style={{ display: 'none' }}>{skinAd.title}</span>
          </a>
        )}
        <div className="site-wrapper" style={{ position: 'relative', zIndex: 1, backgroundColor: skinAd ? 'transparent' : 'var(--background)', width: '100%' }}>
        <CookieConsentPopup />
        <PushNotificationPrompt />
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        <VisitorTracker />
        <Providers>
          <header className="header">
            <div className="container main-header">
              <a href="/" className="logo-container" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <img src="/logo.png" alt="Logo Le Débat Ivoirien" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
              </a>

              {/* Kiosque PDF prominent link after connection */}
              {session && (
                <Link href="/marketplace" style={{ 
                  backgroundColor: '#ffeb3b', 
                  color: '#111', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '4px', 
                  fontWeight: 'bold', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  textDecoration: 'none', 
                  fontSize: '0.85rem', 
                  border: '1px solid #fbc02d', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  marginLeft: '1rem'
                }} className="kiosque-link-desktop hidden-on-mobile">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  KIOSQUE PDF
                </Link>
              )}
              <div className="header-actions">
                <form action="/search" method="GET" className="hidden-on-mobile" style={{ flex: 1, position: 'relative' }}>
                  <input 
                    name="q" 
                    type="text" 
                    placeholder="Rechercher..." 
                    className="input search-input" 
                    style={{ padding: '0.5rem', width: '100%', paddingRight: '2rem' }} 
                  />
                  <button type="submit" style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                    🔍
                  </button>
                </form>
                <LiveStreamBadge />
                <Link href="/jeux/sudoku" style={{ textDecoration: 'none', fontSize: '1.2rem', padding: '0.2rem' }} title="Sudoku">
                  🧩
                </Link>
                <ThemeToggle />
                <UserMenu />
              </div>
            </div>
          </header>

          <div className="sticky-nav-wrapper" style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'var(--background)' }}>
            {/* Mega Menu */}
            <div style={{ backgroundColor: '#111111', color: 'white' }}>
              <div className="container" style={{ padding: 0 }}>
                <MainNavigation categories={navCategories} isAuthenticated={!!session} />
              </div>
            </div>

            {/* BREAKING NEWS */}
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', height: '40px', overflow: 'hidden' }}>
              <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, zIndex: 1 }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'white', animation: 'pulse 2s infinite' }}></div>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '0.9rem', letterSpacing: '0.5px' }}>BREAKING NEWS</span>
                </div>
                <div dangerouslySetInnerHTML={{ __html: `<marquee scrollamount="5" style="font-weight: 700; font-size: 0.9rem; width: 100%;">${breakingText}</marquee>` }} style={{ flex: 1, display: 'flex', alignItems: 'center' }} />
              </div>
            </div>
          </div>
          
          {/* Indicators Strip - Abidjan.net Style */}
          <div style={{ backgroundColor: 'white', borderBottom: '1px solid var(--border)', padding: '0.5rem 0' }}>
            <div className="container">
              <Link href="/economie/dashboard" style={{ textDecoration: 'none', display: 'block' }} title="Voir le Dashboard Économique complet">
                <div className="financial-ticker-scroll">
                  {/* Block 1: Café-Cacao */}
                {cacaoGrp.length > 0 && (
                  <div className="financial-ticker-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.3rem', marginBottom: '0.3rem' }}>
                        <div style={{ fontWeight: 900, fontSize: '0.6rem', lineHeight: 1, color: '#111827', textTransform: 'uppercase' }}>
                          <span style={{color: '#d97706'}}>🌍</span> Bourse Mond.<br/>
                          <span style={{color: '#15803d'}}>CAFÉ-CACAO</span>
                        </div>
                        <div style={{ fontSize: '0.5rem', color: '#9ca3af', textTransform: 'uppercase' }}>{cacaoGrp[0].dateLabel}</div>
                      </div>
                      {cacaoGrp.map(ind => (
                        <div key={ind.id} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                          <span style={{ color: '#64748b' }}>{ind.label}</span> 
                          <span style={{ color: getTrendColor(ind.trend), fontWeight: 400 }}>{getTrendIcon(ind.trend)} {ind.value}</span>
                        </div>
                      ))}
                    </div>
                )}
                 {/* Block 1.5: BRVM */}
                 {brvmGrp.length > 0 && (
                   <div className="financial-ticker-item">
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.3rem', marginBottom: '0.3rem' }}>
                       <span style={{ fontSize: '1rem' }}>📈</span>
                       <span style={{ fontWeight: 900, fontSize: '0.7rem', color: '#1e3a8a', textTransform: 'uppercase' }}>Indices BRVM</span>
                       <div style={{ fontSize: '0.5rem', color: '#9ca3af', textTransform: 'uppercase' }}>{brvmGrp[0].dateLabel}</div>
                     </div>
                     {brvmGrp.map(ind => (
                       <div key={ind.id} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                         <span style={{ color: '#64748b' }}>{ind.label}</span>
                         <span style={{ color: getTrendColor(ind.trend), fontWeight: 700 }}>{getTrendIcon(ind.trend)} {ind.value}</span>
                       </div>
                     ))}
                   </div>
                 )}
  
                {/* Block 2: Anacarde */}
                {anacardeGrp.length > 0 && (
                  <div className="financial-ticker-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.3rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '1rem' }}>🥜</span>
                      <span style={{ fontWeight: 800, fontSize: '0.6rem', color: '#166534', textTransform: 'uppercase' }}>Anacarde</span>
                      <div style={{ fontSize: '0.5rem', color: '#9ca3af', textTransform: 'uppercase' }}>{anacardeGrp[0].dateLabel}</div>
                    </div>
                    {anacardeGrp.map(ind => (
                      <div key={ind.id} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                        <span style={{ color: '#64748b' }}>{ind.label}</span>
                        <span style={{ color: getTrendColor(ind.trend), fontWeight: 400 }}>{getTrendIcon(ind.trend)} {ind.value}</span>
                      </div>
                    ))}
                  </div>
                )}
  
                {/* Block 3: Métaux Précieux (Or, Zinc) */}
                {metaux1Grp.length > 0 && (
                  <div className="financial-ticker-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.3rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 900, fontSize: '0.7rem', color: '#b45309', textTransform: 'uppercase' }}>MINES</span>
                      <div style={{ fontSize: '0.5rem', color: '#9ca3af', textTransform: 'uppercase' }}>{metaux1Grp[0].dateLabel}</div>
                    </div>
                    {metaux1Grp.map(ind => (
                      <div key={ind.id} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                        <span style={{ color: '#64748b' }}>{ind.label}</span>
                        <span style={{ color: getTrendColor(ind.trend), fontWeight: 400 }}>{getTrendIcon(ind.trend)} {ind.value}</span>
                      </div>
                    ))}
                  </div>
                )}
  
                {/* Block 5: Monnaies */}
                {monnaiesGrp.length > 0 && (
                  <div className="financial-ticker-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.3rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 900, fontSize: '0.7rem', color: '#1e3a8a', textTransform: 'uppercase' }}>DEVISES</span>
                      <div style={{ fontSize: '0.5rem', color: '#9ca3af', textTransform: 'uppercase' }}>{monnaiesGrp[0].dateLabel}</div>
                    </div>
                    {monnaiesGrp.map(ind => (
                      <div key={ind.id} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                        <span style={{ color: '#64748b' }}>{ind.label}</span>
                        <span style={{ color: getTrendColor(ind.trend), fontWeight: 400 }}>{getTrendIcon(ind.trend)} {ind.value}</span>
                      </div>
                    ))}
                  </div>
                )}
  
                {/* Block 6: Énergie & Coton */}
                {energieGrp.length > 0 && (
                  <div className="financial-ticker-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.3rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 900, fontSize: '0.7rem', color: '#0ea5e9', textTransform: 'uppercase' }}>ÉNERGIE</span>
                      <div style={{ fontSize: '0.5rem', color: '#9ca3af', textTransform: 'uppercase' }}>{energieGrp[0].dateLabel}</div>
                    </div>
                    {energieGrp.map(ind => (
                      <div key={ind.id} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                        <span style={{ color: '#64748b' }}>{ind.label}</span>
                        <span style={{ color: getTrendColor(ind.trend), fontWeight: 400 }}>{getTrendIcon(ind.trend)} {ind.value}</span>
                      </div>
                    ))}
                  </div>
                )}
  
                </div>
              </Link>
            </div>
          </div>

          {/* World Cup Daily Matches Ticker */}
          <WorldCupTicker initialMatches={wcMatches} />
        
        <main style={{ minHeight: '60vh', width: '100%' }}>
          <div className="container">
            <GoogleAdSlot adSlot="3353692131" format="horizontal" />
            {children}
            <GoogleAdSlot adSlot="1597757330" format="horizontal" />
          </div>
        </main>

        <WhatsAppPopup />
        <footer style={{ width: '100%', backgroundColor: 'var(--foreground)', color: 'white', marginTop: '4rem', paddingTop: '4rem', paddingBottom: '2rem' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--primary)', borderLeftColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>LDI</div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 0.9 }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.05em' }}>LeDébat</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.02em', fontFamily: 'Impact, sans-serif' }}>IVOIRIEN</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Parce qu'on a tous le droit de penser. Le Débat Ivoirien est votre portail d'information et d'investigation en continu.</p>
              {siteSettings && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  {siteSettings.facebookUrl && (
                    <a href={siteSettings.facebookUrl} target="_blank" rel="noopener noreferrer" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>f</a>
                  )}
                  {siteSettings.twitterUrl && (
                    <a href={siteSettings.twitterUrl} target="_blank" rel="noopener noreferrer" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>𝕏</a>
                  )}
                  {siteSettings.youtubeUrl && (
                    <a href={siteSettings.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>▶</a>
                  )}
                </div>
              )}
              <div style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.85rem' }}>👁️</span> 
                <span style={{ fontWeight: 'bold', color: 'white' }}>{visitorCount.toLocaleString('fr-FR')}</span> 
                <span>visiteurs totaux</span>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary)' }}>Rubriques</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navCategories.slice(0,5).map(c => <li key={c.id}><Link href={`/category/${c.slug}`}>{c.name.replace(/&amp;/g, '&')}</Link></li>)}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary)' }}>Services</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><Link href="/abonnement">Abonnement Premium</Link></li>
                <li><Link href="/offres-entreprises" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Offre Entreprises (B2B)</Link></li>
                <li><Link href="/annonceurs">Espace Annonceurs</Link></li>
                <li><Link href="/archives">Archives</Link></li>
                <li><Link href="/#newsletter">Newsletter</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary)' }}>Contact</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Editeur: OZYL-WHAZNEY EDITIONS</li>
                <li>E-mail: ledebativoirien@gmail.com</li>
                <li>Tél: (+225) 07 59 69 79 65</li>
                <li>Tél: 01 40 00 74 24 / 07 09 60 59 58</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary)' }}>Informations Légales</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><Link href="/cgu">CGU</Link></li>
                <li><Link href="/mentions-legales">Mentions Légales</Link></li>
                <li><Link href="/confidentialite">Confidentialité</Link></li>
                <li><Link href="/cookies">Cookies</Link></li>
                <li><Link href="/accessibilite">Accessibilité</Link></li>
                <li><ConsentManagerButton /></li>
              </ul>
            </div>
          </div>
          <div className="container" style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #334155', paddingTop: '2rem' }}>
            <div>© {new Date().getFullYear()} Le Débat Ivoirien. Tous droits réservés. - Développée par <a href="https://www.cornerstoneros.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Cornerstoneros</a></div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>Application LDI - v1.0.0</div>
          </div>
        </footer>

        <PopupAd />
        {siteSettings?.footerCode && (
          <div dangerouslySetInnerHTML={{ __html: siteSettings.footerCode }} />
        )}
        </Providers>
        </div>
      </body>
    </html>
  );
}

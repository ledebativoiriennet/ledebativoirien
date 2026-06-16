import { prisma } from "@/lib/prisma";
import AnalyticsChartsClient from "./AnalyticsChartsClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function AdminDashboard() {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalArticles,
    totalUsers,
    subscriptions,
    totalLeads,
    totalLikes,
    recentReads
  ] = await Promise.all([
    prisma.article.count(),
    prisma.user.count(),
    prisma.subscription.findMany(), // We fetch all to calculate revenues
    prisma.adInquiry.count(),
    prisma.articleLike.count(),
    prisma.articleView.findMany({
      where: { viewedAt: { gte: sevenDaysAgo } },
      select: { viewedAt: true }
    })
  ]);

  // Helper to fetch top articles
  const getTopArticles = async (since: Date) => {
    const views = await prisma.articleView.groupBy({
      by: ['articleId'],
      _count: { articleId: true },
      where: { viewedAt: { gte: since } },
      orderBy: { _count: { articleId: 'desc' } },
      take: 10,
    });

    if (views.length === 0) return [];

    const articleIds = views.map(v => v.articleId);
    const articles = await prisma.article.findMany({
      where: { id: { in: articleIds } },
      select: { id: true, title: true, slug: true, categories: { select: { name: true }, take: 1 } }
    });

    return views.map(v => {
      const art = articles.find(a => a.id === v.articleId);
      return {
        count: v._count.articleId,
        id: art?.id,
        title: art?.title,
        slug: art?.slug,
        category: art?.categories?.[0]?.name || "Non catégorisé"
      };
    }).filter(h => h.title);
  };

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(startOfMonth.getDate() - 30);

  const [
    topDay, topWeek, topMonth, 
    visitorsAll, visitorsToday, visitorsWeek, visitorsMonth, 
    countryStatsRaw, browserStatsRaw, deviceStatsRaw, brandStatsRaw,
    marketplacePurchases,
    pendingManualCount,
    botCount,
    goodBotCount,
    badBotCount,
    topBotsRaw,
    rawDayVisits,
    rawWeekVisits,
    rawMonthVisits,
    rawYearVisits,
    sourceStatsRaw
  ] = await Promise.all([
    getTopArticles(startOfDay),
    getTopArticles(sevenDaysAgo),
    getTopArticles(startOfMonth),
    prisma.visitor.count(),
    prisma.visitor.count({ where: { visitedAt: { gte: startOfDay } } }),
    prisma.visitor.count({ where: { visitedAt: { gte: sevenDaysAgo } } }),
    prisma.visitor.count({ where: { visitedAt: { gte: startOfMonth } } }),
    prisma.visitor.groupBy({ by: ['country'], _count: { _all: true }, orderBy: { _count: { country: 'desc' } }, take: 10 }),
    prisma.visitor.groupBy({ by: ['browser'], _count: { _all: true }, orderBy: { _count: { browser: 'desc' } }, take: 10 }),
    prisma.visitor.groupBy({ by: ['device'], _count: { _all: true }, orderBy: { _count: { device: 'desc' } }, take: 10 }),
    prisma.visitor.groupBy({ by: ['brand'], _count: { _all: true }, orderBy: { _count: { brand: 'desc' } }, take: 10 }),
    prisma.purchase.findMany({ where: { status: 'COMPLETED' } }), // Only completed for revenue
    prisma.purchase.count({ where: { status: 'PENDING', paymentMethod: 'MANUAL_TRANSFER' } }), // Pending manual
    
    // Bot Statistics
    prisma.visitor.count({ where: { isBot: true } }),
    prisma.visitor.count({ where: { isBot: true, botCategory: 'GOOD' } }),
    prisma.visitor.count({ where: { isBot: true, botCategory: 'BAD' } }),
    prisma.visitor.groupBy({ 
      by: ['botName'], 
      where: { isBot: true }, 
      _count: { _all: true }, 
      orderBy: { _count: { botName: 'desc' } }, 
      take: 5 
    }),

    // Visits Chart Data
    // Day (Last 24 hours, grouped by hour)
    prisma.$queryRaw`SELECT strftime('%H', datetime(visitedAt / 1000, 'unixepoch')) as label, COUNT(*) as count FROM Visitor WHERE visitedAt >= ${now.getTime() - 24*3600000} AND isBot = 0 GROUP BY label ORDER BY label` as Promise<{label: string, count: number}[]>,
    
    // Week (Last 7 days, grouped by day)
    prisma.$queryRaw`SELECT strftime('%Y-%m-%d', datetime(visitedAt / 1000, 'unixepoch')) as label, COUNT(*) as count FROM Visitor WHERE visitedAt >= ${now.getTime() - 7*86400000} AND isBot = 0 GROUP BY label ORDER BY label` as Promise<{label: string, count: number}[]>,
    
    // Month (Last 30 days, grouped by day)
    prisma.$queryRaw`SELECT strftime('%Y-%m-%d', datetime(visitedAt / 1000, 'unixepoch')) as label, COUNT(*) as count FROM Visitor WHERE visitedAt >= ${now.getTime() - 30*86400000} AND isBot = 0 GROUP BY label ORDER BY label` as Promise<{label: string, count: number}[]>,
    
    // Year (Last 12 months, grouped by month)
    prisma.$queryRaw`SELECT strftime('%Y-%m', datetime(visitedAt / 1000, 'unixepoch')) as label, COUNT(*) as count FROM Visitor WHERE visitedAt >= ${now.getTime() - 365*86400000} AND isBot = 0 GROUP BY label ORDER BY label` as Promise<{label: string, count: number}[]>,

    prisma.visitor.groupBy({ by: ['source'], _count: { _all: true } })
  ]);


  // Post-processing visit data to ensure all periods are represented
  const processVisitData = (raw: {label: string, count: number}[], type: 'day' | 'week' | 'month' | 'year') => {
    const data: { label: string, count: number }[] = [];
    const now = new Date();

    if (type === 'day') {
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 3600000);
        const label = d.getHours().toString().padStart(2, '0');
        const found = raw.find(r => r.label === label);
        data.push({ label: `${label}h`, count: Number(found?.count || 0) });
      }
    } else if (type === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        const label = d.toISOString().split('T')[0];
        const found = raw.find(r => r.label === label);
        data.push({ 
          label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }), 
          count: Number(found?.count || 0) 
        });
      }
    } else if (type === 'month') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        const label = d.toISOString().split('T')[0];
        const found = raw.find(r => r.label === label);
        data.push({ 
          label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), 
          count: Number(found?.count || 0) 
        });
      }
    } else if (type === 'year') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        const found = raw.find(r => r.label === label);
        data.push({ 
          label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), 
          count: Number(found?.count || 0) 
        });
      }
    }
    return data;
  };

  const visitsData = {
    day: processVisitData(rawDayVisits as any, 'day'),
    week: processVisitData(rawWeekVisits as any, 'week'),
    month: processVisitData(rawMonthVisits as any, 'month'),
    year: processVisitData(rawYearVisits as any, 'year'),
  };

  const mapStats = (stats: any[], key: string) => stats.map(s => ({ name: s[key] || 'Inconnu', value: s._count._all }));
  const countryData = mapStats(countryStatsRaw, 'country');
  const browserData = mapStats(browserStatsRaw, 'browser');
  const deviceData = mapStats(deviceStatsRaw, 'device');
  const brandData = mapStats(brandStatsRaw, 'brand');
  const sourceData = mapStats(sourceStatsRaw, 'source')
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const totalBots = botCount;
  const goodBots = goodBotCount;
  const badBots = badBotCount;
  const topBots = topBotsRaw.map(b => ({ name: b.botName || 'Inconnu', count: b._count._all }));

  // Calcul du CA Estimé et Répartition
  let totalRevenue = 0;
  let activePremium = 0;
  let revenueLast7Days = 0;
  
  // Add Marketplace Revenue
  marketplacePurchases.forEach((p: any) => {
    totalRevenue += p.amount;
    if (new Date(p.createdAt) >= sevenDaysAgo) {
      revenueLast7Days += p.amount;
    }
  });

  const revenueByPlan = {
    quotidien: 0,
    hebdomadaire: 0,
    mensuel: 0,
    annuel: 0
  };

  subscriptions.forEach(sub => {
    if (sub.status === 'ACTIVE') activePremium++;
    
    const plan = sub.plan.toLowerCase();
    let subRevenue = 0;

    if (plan.includes('quotidien') || plan.includes('jour')) { subRevenue = 200; revenueByPlan.quotidien += subRevenue; }
    else if (plan.includes('hebdomadaire') || plan.includes('semaine')) { subRevenue = 700; revenueByPlan.hebdomadaire += subRevenue; }
    else if (plan.includes('mensuel') || plan.includes('mois')) { subRevenue = 2000; revenueByPlan.mensuel += subRevenue; }
    else if (plan.includes('annuel') || plan.includes('an')) { subRevenue = 20000; revenueByPlan.annuel += subRevenue; }
    else { subRevenue = 1000; } // Plan par défaut non identifié
    
    totalRevenue += subRevenue;

    // Chiffre d'affaire généré les 7 derniers jours
    const subDate = new Date(sub.startDate);
    if (subDate >= sevenDaysAgo) {
      revenueLast7Days += subRevenue;
    }
  });

  const arpu = activePremium > 0 ? (totalRevenue / activePremium).toFixed(0) : 0;

  // Groupement des lectures par jour pour le graphique
  const readsByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    readsByDay[d.toLocaleDateString('fr-FR', { weekday: 'short' })] = 0;
  }
  
  recentReads.forEach(view => {
    const day = new Date(view.viewedAt).toLocaleDateString('fr-FR', { weekday: 'short' });
    if (readsByDay[day] !== undefined) {
      readsByDay[day]++;
    }
  });

  const chartData = Object.entries(readsByDay).map(([day, count]) => ({ day, count }));
  const maxReads = Math.max(...chartData.map(d => d.count), 1); // Eviter division par zéro

  return (
    <div>
      {pendingManualCount > 0 && (
        <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🔔</span>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#9a3412' }}>{pendingManualCount} paiement(s) manuel(s) en attente</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#c2410c' }}>Veuillez vérifier les références SMS et valider les ventes.</p>
            </div>
          </div>
          <a href="/admin/marketplace/ventes" style={{ backgroundColor: '#ea580c', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.9rem' }}>
            Valider les ventes
          </a>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>Tableau de bord <span style={{ color: '#64748b', fontSize: '1rem', fontWeight: 'normal' }}>(Style AdSense)</span></h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <a href="/admin/marketplace/ventes" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', textDecoration: 'none' }}>
            🛒 Ventes Kiosque
          </a>
          <div style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Derniers 7 jours
          </div>
        </div>
      </div>

      {/* REVENUS ET METRIQUES CLES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: '4px solid #10b981' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Revenus Estimés (Total)</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a' }}>{totalRevenue.toLocaleString('fr-FR')}</span>
            <span style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 'bold' }}>FCFA</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 'bold' }}>↑ Basé sur {subscriptions.length} paiements</p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: '4px solid #3b82f6' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Abonnés Actifs</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a' }}>{activePremium}</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Sur un total de {totalUsers} inscrits</p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: '4px solid #8b5cf6' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Pages Vues (7 jours)</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a' }}>{recentReads.length}</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Lectures d'articles traçables</p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: '4px solid #ef4444' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Engagement Global</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a' }}>{totalLikes}</span>
            <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'bold' }}>J'aime</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.5rem', fontWeight: 'bold' }}>{totalLeads} demande(s) annonceurs en attente</p>
        </div>

      </div>

      {/* GRAPHIQUE D'AUDIENCE & ACTIVITÉ ÉCONOMIQUE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        

        {/* Activité Économique */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>Détails Économiques (Abonnements)</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>Généré (7 derniers jours)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>+ {revenueLast7Days.toLocaleString('fr-FR')} FCFA</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>Revenu Moyen (ARPU)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>{arpu} FCFA <span style={{fontSize:'0.8rem', fontWeight:'normal'}}>/ abonné</span></div>
            </div>
          </div>

          <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#475569', marginBottom: '1rem' }}>Répartition par type d'offre</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Pass Quotidien (200F)</span>
              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{revenueByPlan.quotidien.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Pass Hebdomadaire (700F)</span>
              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{revenueByPlan.hebdomadaire.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Pass Mensuel (2000F)</span>
              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{revenueByPlan.mensuel.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Pass Annuel (20000F)</span>
              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{revenueByPlan.annuel.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

        </div>
      </div>

      {/* CLASSEMENTS DES ARTICLES */}
      <div style={{ marginTop: '3rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem' }}>🔥 Palmarès des Articles (Top 10)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* Top Jour */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: '4px solid #f59e0b' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Aujourd'hui</h3>
            {topDay.length === 0 ? <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Aucune lecture enregistrée aujourd'hui.</p> : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {topDay.map((art, i) => (
                  <li key={art.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: i < 3 ? '#f59e0b' : '#94a3b8', width: '20px' }}>{i + 1}</span>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <a href={`/article/${art.slug}`} target="_blank" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{art.title}</a>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>{art.category}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#3b82f6', backgroundColor: '#eff6ff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{art.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Top Semaine */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: '4px solid #3b82f6' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>7 Derniers Jours</h3>
            {topWeek.length === 0 ? <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Aucune lecture enregistrée cette semaine.</p> : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {topWeek.map((art, i) => (
                  <li key={art.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: i < 3 ? '#3b82f6' : '#94a3b8', width: '20px' }}>{i + 1}</span>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <a href={`/article/${art.slug}`} target="_blank" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{art.title}</a>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>{art.category}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#3b82f6', backgroundColor: '#eff6ff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{art.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Top Mois */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: '4px solid #8b5cf6' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>30 Derniers Jours</h3>
            {topMonth.length === 0 ? <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Aucune lecture enregistrée ce mois.</p> : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {topMonth.map((art, i) => (
                  <li key={art.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: i < 3 ? '#8b5cf6' : '#94a3b8', width: '20px' }}>{i + 1}</span>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <a href={`/article/${art.slug}`} target="_blank" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{art.title}</a>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>{art.category}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#3b82f6', backgroundColor: '#eff6ff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{art.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>

      <AnalyticsChartsClient 
        countryData={countryData.length ? countryData : [{name: "Aucune donnée", value: 1}]}
        browserData={browserData.length ? browserData : [{name: "Aucune donnée", value: 1}]}
        deviceData={deviceData.length ? deviceData : [{name: "Aucune donnée", value: 1}]}
        brandData={brandData.length ? brandData : [{name: "Aucune donnée", value: 1}]}
        sourceData={sourceData.length ? sourceData : [{name: "Aucune donnée", value: 1}]}
        visitsData={visitsData}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Visiteurs Aujourd'hui</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{visitorsToday}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Visiteurs (7 Jours)</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#3b82f6' }}>{visitorsWeek}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Visiteurs (30 Jours)</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#8b5cf6' }}>{visitorsMonth}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Visiteurs (Total)</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>{visitorsAll}</div>
        </div>
      </div>

      {/* SECTION BOTS */}
      <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: '4px solid #64748b' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>🤖 Activité des Robots</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>TOTAL</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalBots}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>BONS (SEO)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{goodBots}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>MAUVAIS / BLOQUÉS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{badBots}</div>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Les "bons" robots incluent Googlebot, Bingbot, etc. Les "mauvais" sont les scrapers et outils SEO agressifs bloqués par le middleware.
          </p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: '4px solid #64748b' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>🔝 Top Robots Identifiés</h2>
          {topBots.length === 0 ? <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Aucun robot identifié pour le moment.</p> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {topBots.map((bot, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#475569' }}>{bot.name}</span>
                  <span style={{ fontWeight: 'bold' }}>{bot.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>



      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', fontSize: '0.9rem' }}>
        <p><strong>Note Technique :</strong> Les revenus estimés sont calculés à partir de la base d'abonnements enregistrés. Les pages vues représentent le trafic global dédoublonné (une vue par article par jour par visiteur).</p>
      </div>

    </div>
  );
}

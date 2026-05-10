import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MarketSparkline from "@/components/MarketSparkline";
import BrvmTable from "@/components/BrvmTable";
import GlobalMarketSection from "@/components/GlobalMarketSection";
import CompanyMarketExplorer from "@/components/CompanyMarketExplorer";
import BrvmQuarterlyResults from "@/components/BrvmQuarterlyResults";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Économique UEMOA & BRVM - Le Débat Ivoirien",
  description: "Suivez en temps réel les indices de la BRVM, les cours des matières premières et les indicateurs économiques de l'espace UEMOA.",
};

export default async function EconomieDashboardPage() {
  const [indicators, macroData, recentArticles] = await Promise.all([
    prisma.marketIndicator.findMany({ include: { history: { orderBy: { date: 'asc' }, take: 10 } }, orderBy: { order: 'asc' } }),
    prisma.economicalIndicator.findMany({ orderBy: [{ country: 'asc' }, { category: 'asc' }] }),
    prisma.article.findMany({ where: { categories: { some: { slug: 'economie' } }, publishedAt: { not: null } }, take: 3, orderBy: { publishedAt: 'desc' } })
  ]);

  // Group indicators
  const getGroup = (group: string) => indicators.filter(i => i.group === group);
  const brvmIndices = getGroup('BRVM');
  const commodities = getGroup('COMMODITY').concat(getGroup('CACAO'));
  const currencies = getGroup('MONNAIES');

  // Simulated top movers if none in DB
  const topMovers = [
    { symbol: 'SNTS', name: 'SONATEL SN', price: '18 500', change: '2.5', trend: 'UP' as const },
    { symbol: 'ETIT', name: 'ECOBANK TRANS. INC. TG', price: '19', change: '5.2', trend: 'UP' as const },
    { symbol: 'SIBC', name: 'SIB CI', price: '5 400', change: '-1.2', trend: 'DOWN' as const },
    { symbol: 'PALC', name: 'PALM CI', price: '9 800', change: '0.0', trend: 'FLAT' as const },
    { symbol: 'BOAB', name: 'BOA BENIN', price: '6 200', change: '1.8', trend: 'UP' as const },
  ];

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '100vh' }}>
      <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <div className="dashboard-header">
          <div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>Dashboard Économique</h1>
            <p style={{ color: 'var(--muted)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>Le baromètre financier de l'espace UEMOA et de la Côte d'Ivoire.</p>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'left' }}>
            Mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* MAIN CONTENT */}
        <div style={{ minWidth: 0 }}>
          {/* BRVM INDICES */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--primary)' }}>📊</span> Marché Financier (BRVM)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {brvmIndices.length > 0 ? brvmIndices.map(idx => (
                <div key={idx.id} style={{ padding: '1.5rem', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--muted)' }}>{idx.label}</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{idx.value}</div>
                    </div>
                    <div style={{ color: idx.trend === 'UP' ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>
                      {idx.trend === 'UP' ? '↑' : '↓'} {idx.extraText || '0.0%'}
                    </div>
                  </div>
                  <MarketSparkline data={idx.history.map(h => h.value)} width={200} height={40} />
                </div>
              )) : (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', gridColumn: '1/-1' }}>
                  Données BRVM temporairement indisponibles.
                </div>
              )}
            </div>
          </section>

          {/* AFRICAN MARKETS LIVE */}
          <GlobalMarketSection type="africa" />

          {/* GLOBAL MARKETS LIVE */}
          <GlobalMarketSection type="global" />

          {/* TOP 100 COMPANIES EXPLORER */}
          <CompanyMarketExplorer />

          {/* TOP MOVERS TABLE */}
          <section style={{ marginBottom: '4rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Titres les plus actifs</h3>
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <BrvmTable stocks={topMovers} />
            </div>
          </section>

          {/* COMMODITIES & FOREX */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem', marginBottom: '4rem' }}>
            <section>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Matières Premières</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {commodities.map(comm => (
                  <div key={comm.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 700 }}>{comm.label}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800 }}>{comm.value}</div>
                      <div style={{ fontSize: '0.7rem', color: comm.trend === 'UP' ? '#22c55e' : '#ef4444' }}>
                        {comm.trend === 'UP' ? '↗' : '↘'} {comm.extraText}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Devises (Taux de Change)</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {currencies.map(curr => (
                  <div key={curr.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 700 }}>{curr.label}</span>
                    <span style={{ fontWeight: 800 }}>{curr.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* MACRO BAROMETER */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Baromètre Macro-économique</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <div style={{ padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#1e40af' }}>PIB CÔTE D'IVOIRE</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e3a8a' }}>+7.2%</div>
                <div style={{ fontSize: '0.75rem', color: '#60a5fa' }}>Prévisions 2026</div>
              </div>
              <div style={{ padding: '1.5rem', backgroundColor: '#fff7ed', borderRadius: '12px', border: '1px solid #ffedd5' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#9a3412' }}>INFLATION UEMOA</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#7c2d12' }}>3.4%</div>
                <div style={{ fontSize: '0.75rem', color: '#fb923c' }}>Moyenne régionale</div>
              </div>
              <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#166534' }}>DETTE PUBLIQUE (CI)</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#14532d' }}>56.1%</div>
                <div style={{ fontSize: '0.75rem', color: '#4ade80' }}>% du PIB</div>
              </div>
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside>
          <div style={{ position: 'sticky', top: '2rem' }}>
            {/* BRVM QUARTERLY RESULTS */}
            <BrvmQuarterlyResults />

            {/* LATEST ECO NEWS */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Dernières Analyses</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {recentArticles.map(article => (
                <Link href={`/article/${article.slug}`} key={article.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '0.5rem' }}>{article.title}</h4>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      {new Date(article.publishedAt!).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* AD SLOT */}
            <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f1f5f9', borderRadius: '12px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '1rem' }}>PUBLICITÉ</div>
              <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                Espace Annonceur
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

import React from 'react';

interface QuarterlyResult {
  symbol: string;
  name: string;
  revenue: string;
  netProfit: string;
  growth: string;
  trend: 'UP' | 'DOWN';
  period: string;
}

export default function BrvmQuarterlyResults() {
  const results: QuarterlyResult[] = [
    { symbol: 'SNTS', name: 'SONATEL', revenue: '412 Mrd', netProfit: '82.5 Mrd', growth: '+12%', trend: 'UP', period: 'T1 2026' },
    { symbol: 'ORGT', name: 'ORANGE CI', revenue: '245 Mrd', netProfit: '45.2 Mrd', growth: '+8.5%', trend: 'UP', period: 'T1 2026' },
    { symbol: 'ETIT', name: 'ECOBANK', revenue: '512 Mrd', netProfit: '92.1 Mrd', growth: '+15.2%', trend: 'UP', period: 'T1 2026' },
    { symbol: 'CBIB', name: 'CORIS BANK', revenue: '68 Mrd', netProfit: '22.4 Mrd', growth: '+5.4%', trend: 'UP', period: 'T1 2026' },
    { symbol: 'SGBC', name: 'SOCIETE GENERALE', revenue: '82 Mrd', netProfit: '18.9 Mrd', growth: '-2.1%', trend: 'DOWN', period: 'T1 2026' },
    { symbol: 'SIBC', name: 'SIB CI', revenue: '45 Mrd', netProfit: '12.6 Mrd', growth: '+3.2%', trend: 'UP', period: 'T1 2026' },
    { symbol: 'NSBC', name: 'NSIA BANQUE', revenue: '38 Mrd', netProfit: '9.2 Mrd', growth: '+1.5%', trend: 'UP', period: 'T1 2026' },
    { symbol: 'PALC', name: 'PALM CI', revenue: '52 Mrd', netProfit: '14.5 Mrd', growth: '-4.8%', trend: 'DOWN', period: 'T1 2026' },
    { symbol: 'ONTBF', name: 'ONATEL BF', revenue: '42 Mrd', netProfit: '8.8 Mrd', growth: '+0.8%', trend: 'UP', period: 'T1 2026' },
    { symbol: 'TOCI', name: 'TOTAL CI', revenue: '128 Mrd', netProfit: '6.4 Mrd', growth: '+2.1%', trend: 'UP', period: 'T1 2026' },
  ];

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '2.5rem' }}>
      <div style={{ padding: '1rem', backgroundColor: '#1e3a8a', color: 'white' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 900, margin: 0 }}>🏆 Top 10 Résultats (BRVM)</h3>
        <p style={{ fontSize: '0.7rem', opacity: 0.8, margin: '0.2rem 0 0 0' }}>Derniers rapports trimestriels publiés</p>
      </div>
      <div style={{ padding: '0.5rem' }}>
        {results.map((res, idx) => (
          <div key={res.symbol} style={{ 
            padding: '0.75rem', 
            borderBottom: idx === results.length - 1 ? 'none' : '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{res.symbol} <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '0.7rem' }}>- {res.name}</span></span>
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 900, 
                color: res.trend === 'UP' ? '#22c55e' : '#ef4444',
                backgroundColor: res.trend === 'UP' ? '#f0fdf4' : '#fef2f2',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {res.growth}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <div style={{ color: 'var(--muted)' }}>CA : <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>{res.revenue}</span></div>
              <div style={{ color: 'var(--muted)' }}>R. Net : <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>{res.netProfit}</span></div>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'right', marginTop: '0.2rem' }}>Période : {res.period}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

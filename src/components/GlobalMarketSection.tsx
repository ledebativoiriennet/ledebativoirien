'use client';

import { useState, useEffect } from 'react';
import MarketSparkline from './MarketSparkline';

interface MarketData {
  symbol: string;
  name: string;
  value: string;
  change: string;
  changePercent: string;
  trend: 'UP' | 'DOWN' | 'FLAT';
  history: number[];
}

export default function GlobalMarketSection({ type = 'global' }: { type?: 'global' | 'africa' }) {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchMarkets = async () => {
    try {
      const res = await fetch('/api/market/global');
      const allData = await res.json();
      if (Array.isArray(allData)) {
        const globalSymbols = ['^GSPC', '^IXIC', '^FCHI', '^GDAXI', '^N225', '^FTSE'];
        const data = type === 'global' 
          ? allData.filter(m => globalSymbols.includes(m.symbol))
          : allData.filter(m => !globalSymbols.includes(m.symbol));
          
        setMarkets(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch global markets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 30000); // Mise à jour toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  if (loading && markets.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        Chargement des indices mondiaux...
      </div>
    );
  }

  return (
    <section style={{ marginBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: type === 'global' ? '#3b82f6' : '#059669' }}>{type === 'global' ? '🌍' : '🐘'}</span> 
          {type === 'global' ? 'Marchés Mondiaux (Live)' : 'Places Africaines (Live)'}
        </h2>
        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%', display: 'inline-block' }}></span>
          Mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {markets.map(market => (
          <div key={market.symbol} style={{ padding: '1.5rem', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s' }} className="hover-scale">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--muted)' }}>{market.name}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{market.value}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: market.trend === 'UP' ? '#22c55e' : '#ef4444', fontWeight: 'bold', fontSize: '1rem' }}>
                  {market.trend === 'UP' ? '▲' : '▼'} {market.changePercent}%
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{market.change} pts</div>
              </div>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <MarketSparkline data={market.history} width={220} height={40} color={market.trend === 'UP' ? '#22c55e' : '#ef4444'} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

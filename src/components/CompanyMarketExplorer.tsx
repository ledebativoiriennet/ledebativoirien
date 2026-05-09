'use client';

import { useState, useEffect } from 'react';

interface CompanyData {
  id: string;
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  trend: 'UP' | 'DOWN' | 'FLAT';
  volume: string;
}

export default function CompanyMarketExplorer() {
  const [activeTab, setActiveTab] = useState<'world' | 'africa'>('africa');
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchCompanies = async () => {
    try {
      const res = await fetch(`/api/market/companies?type=${activeTab}`);
      const data = await res.json();
      setCompanies(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCompanies();
    const interval = setInterval(fetchCompanies, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section style={{ marginBottom: '4rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'var(--foreground)', color: 'white' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, textTransform: 'uppercase' }}>Explorer les Marchés Actions</h2>
        <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}</div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
        <button 
          onClick={() => setActiveTab('africa')}
          style={{ 
            flex: 1, padding: '1rem', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
            backgroundColor: activeTab === 'africa' ? 'white' : 'transparent',
            color: activeTab === 'africa' ? 'var(--primary)' : 'var(--muted)',
            borderBottom: activeTab === 'africa' ? '3px solid var(--primary)' : 'none'
          }}
        >
          🌍 Top 100 Afrique
        </button>
        <button 
          onClick={() => setActiveTab('world')}
          style={{ 
            flex: 1, padding: '1rem', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
            backgroundColor: activeTab === 'world' ? 'white' : 'transparent',
            color: activeTab === 'world' ? 'var(--primary)' : 'var(--muted)',
            borderBottom: activeTab === 'world' ? '3px solid var(--primary)' : 'none'
          }}
        >
          🌐 Top 100 Mondial
        </button>
      </div>

      {/* SEARCH BAR */}
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
        <input 
          type="text" 
          placeholder="Rechercher une entreprise ou un symbole..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '0.9rem' }}
        />
      </div>

      {/* TABLE */}
      <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f1f5f9', zIndex: 10 }}>
            <tr>
              <th style={{ padding: '1rem' }}>Symbole</th>
              <th style={{ padding: '1rem' }}>Entreprise</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Dernier</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Var. %</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Volume</th>
            </tr>
          </thead>
          <tbody>
            {loading && companies.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>Chargement des données boursières...</td>
              </tr>
            ) : filteredCompanies.map((c, idx) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                <td style={{ padding: '1rem', fontWeight: 800 }}>{c.symbol}</td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800 }}>{c.price}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: c.trend === 'UP' ? '#22c55e' : '#ef4444' }}>
                  {c.trend === 'UP' ? '+' : ''}{c.changePercent}%
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--muted)' }}>{c.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '1rem', textAlign: 'center', background: '#f8fafc', fontSize: '0.75rem', color: 'var(--muted)' }}>
        Données fournies à titre indicatif. Source : Flux financiers globaux.
      </div>
    </section>
  );
}

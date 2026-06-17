"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  slug: string;
  region: string | null;
  publishedAt: Date | null;
}

interface Region {
  id: string;
  name: string;
  cx: string;
  cy: string;
}

const REGIONS: Region[] = [
  { id: 'Abidjan', name: 'Abidjan', cx: '60%', cy: '85%' },
  { id: 'San-Pédro', name: 'San-Pédro', cx: '35%', cy: '88%' },
  { id: 'Yamoussoukro', name: 'Yamoussoukro', cx: '55%', cy: '65%' },
  { id: 'Bouaké', name: 'Bouaké', cx: '55%', cy: '50%' },
  { id: 'Daloa', name: 'Daloa', cx: '40%', cy: '60%' },
  { id: 'Man', name: 'Man', cx: '25%', cy: '55%' },
  { id: 'Korhogo', name: 'Korhogo', cx: '50%', cy: '25%' },
];

export default function InteractiveMap({ articles }: { articles: Article[] }) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Group articles by region
  const articlesByRegion = articles.reduce((acc, article) => {
    if (article.region) {
      if (!acc[article.region]) acc[article.region] = [];
      acc[article.region].push(article);
    }
    return acc;
  }, {} as Record<string, Article[]>);

  const displayedArticles = selectedRegion 
    ? articlesByRegion[selectedRegion] || []
    : articles.filter(a => a.region);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', minHeight: '600px' }}>
      
      {/* Map Section */}
      <div style={{ backgroundColor: '#f1f5f9', borderRadius: '16px', padding: '2rem', position: 'relative', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
        <h2 style={{ position: 'absolute', top: '1rem', left: '1rem', margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>
          Carte de l'actualité
        </h2>
        
        {/* Placeholder for SVG map - Stylized representation */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', opacity: 0.1, backgroundColor: '#cbd5e1', borderRadius: '30px 100px 50px 80px', pointerEvents: 'none' }}></div>

        {REGIONS.map(region => {
          const count = articlesByRegion[region.name]?.length || 0;
          const isSelected = selectedRegion === region.name;
          
          return (
            <div 
              key={region.id}
              onClick={() => setSelectedRegion(region.name === selectedRegion ? null : region.name)}
              style={{
                position: 'absolute',
                left: region.cx,
                top: region.cy,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: isSelected ? 10 : 1
              }}
            >
              <div style={{
                width: isSelected ? '24px' : '16px',
                height: isSelected ? '24px' : '16px',
                backgroundColor: count > 0 ? (isSelected ? '#dc2626' : '#ef4444') : '#94a3b8',
                borderRadius: '50%',
                border: '3px solid white',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.6rem',
                fontWeight: 'bold'
              }}>
                {count > 0 && isSelected && count}
              </div>
              <div style={{
                marginTop: '0.25rem',
                backgroundColor: isSelected ? '#1e293b' : 'rgba(255,255,255,0.8)',
                color: isSelected ? 'white' : '#475569',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}>
                {region.name} {count > 0 && !isSelected && `(${count})`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Articles List Section */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
            {selectedRegion ? `Actu à ${selectedRegion}` : 'Toutes les régions'}
          </h3>
          {selectedRegion && (
            <button onClick={() => setSelectedRegion(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
              Réinitialiser
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {displayedArticles.length > 0 ? (
            displayedArticles.map(article => (
              <Link 
                key={article.id} 
                href={`/article/${article.slug}`}
                style={{ textDecoration: 'none', color: 'inherit', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}
                className="hover-scale"
              >
                {!selectedRegion && (
                  <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    📍 {article.region}
                  </div>
                )}
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.3 }}>{article.title}</h4>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                  {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR') : ''}
                </div>
              </Link>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>
              Aucune actualité pour cette région en ce moment.
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}

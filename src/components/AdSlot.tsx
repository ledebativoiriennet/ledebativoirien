'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type AdSlotProps = {
  format?: 'rectangle' | 'leaderboard' | 'skyscraper';
  style?: React.CSSProperties;
};

export function AdSlot({ format = 'rectangle', style }: AdSlotProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Futur point d'injection pour Google AdSense, Teads ou autre régie
    // if (window) { (window.adsbygoogle = window.adsbygoogle || []).push({}); }
  }, []);

  // Dimensions IAB standard
  const dimensions = {
    rectangle: { width: '100%', minHeight: '250px' },
    leaderboard: { width: '100%', minHeight: '90px' },
    skyscraper: { width: '100%', minHeight: '400px', writingMode: 'vertical-rl' as any }
  };

  const adStyle = dimensions[format];

  return (
    <Link 
      href="/annonceurs" 
      className="ad-slot-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
        border: '1px dashed #cbd5e1',
        color: '#94a3b8',
        fontSize: '0.8rem',
        textDecoration: 'none',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.2s ease',
        ...adStyle,
        ...style
      }}
      title="Devenez Annonceur - Contactez-nous"
    >
      <span style={{ position: 'relative', zIndex: 1, fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
        Espace Publicitaire
      </span>
      {isClient && (
        <div style={{ position: 'absolute', bottom: '4px', right: '4px', fontSize: '0.55rem', color: '#cbd5e1' }}>
          LDI Ads
        </div>
      )}
    </Link>
  );
}

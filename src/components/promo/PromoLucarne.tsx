'use client';
import { useState, useEffect } from 'react';
import ArchivePromo from './ArchivePromo';
import NewsletterPromo from './NewsletterPromo';

export default function PromoLucarne() {
  const [promoType, setPromoType] = useState<number | null>(null);

  useEffect(() => {
    // Choose randomly on mount (client-side only to avoid hydration mismatch)
    setPromoType(Math.random() > 0.5 ? 1 : 0);
  }, []);

  if (promoType === null) return <div style={{ height: '180px', background: '#f8fafc', borderRadius: 'var(--radius)' }} />;

  return (
    <div className="promo-lucarne" style={{ marginBottom: '1.5rem' }}>
      {promoType === 0 ? <ArchivePromo /> : <NewsletterPromo />}
    </div>
  );
}

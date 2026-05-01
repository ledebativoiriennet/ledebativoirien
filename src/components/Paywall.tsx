'use client';
import Link from 'next/link';

export function Paywall() {
  return (
    <div className="premium-locker-container">
      <div className="premium-locker-overlay">
        <div className="premium-locker-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2.5rem', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--foreground)' }}>
            Lisez la suite de cette enquête
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Cet article est réservé aux abonnés Premium. Abonnez-vous pour lire l'intégralité de cet article et soutenir le journalisme d'investigation ivoirien.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <Link href="/abonnement" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', width: '100%', maxWidth: '300px' }}>
              S'abonner pour lire la suite
            </Link>
            <div style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
              Déjà abonné ? <Link href="#" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'underline' }}>Connectez-vous</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

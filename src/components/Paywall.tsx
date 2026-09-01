'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PaywallProps {
  type?: 'premium' | 'confidentiel' | 'archive';
  articleId?: string;
}

export function Paywall({ type = 'premium', articleId }: PaywallProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfidentiel = type === 'confidentiel';
  const isArchive = type === 'archive';

  const handleArticlePurchase = async () => {
    if (status === 'unauthenticated' || !session?.user?.email) {
      alert('Veuillez vous connecter pour acheter cet article.');
      router.push(`/login?callbackUrl=${window.location.pathname}`);
      return;
    }

    if (!articleId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/payment/article/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          email: session.user.email,
          name: session.user.name,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.payment_url) {
        window.location.href = data.data.payment_url;
      } else {
        throw new Error(data.error || 'Erreur de connexion à GeniusPay.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue.');
      setLoading(false);
    }
  };

  return (
    <div className="premium-locker-container">
      <div className="premium-locker-overlay">
        <div className="premium-locker-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2.5rem', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            {isArchive ? '🗂️' : isConfidentiel ? '🕵️‍♂️' : '🔒'}
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--foreground)' }}>
            {isArchive 
              ? 'Article archivé' 
              : isConfidentiel 
              ? 'Enquête Confidentielle' 
              : "Lisez la suite de cette enquête"}
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
            {isArchive 
              ? "Cet article fait partie des archives du Débat Ivoirien (publié il y a plus d'un an). Accédez-y en vous abonnant à l'offre Annuelle ou achetez-le individuellement."
              : isConfidentiel 
              ? "Cet article fait partie de nos exclusivités 'Confidentiel'. Abonnez-vous pour accéder à nos révélations et analyses réservées."
              : "Cet article est réservé aux abonnés Premium. Abonnez-vous pour lire l'intégralité de cet article et soutenir le journalisme d'investigation ivoirien."}
          </p>

          {error && (
            <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <Link href="/abonnement" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', width: '100%', backgroundColor: isArchive ? '#1e293b' : isConfidentiel ? '#7f1d1d' : 'var(--primary)' }}>
              {isArchive 
                ? "S'abonner à l'offre Annuelle (Archives incluses)" 
                : isConfidentiel 
                ? "S'abonner au pack Confidentiel (Illimité)" 
                : "S'abonner pour lire la suite (Illimité)"}
            </Link>
            
            {articleId && (
              <>
                <div style={{ margin: '1rem 0', width: '100%', position: 'relative' }}>
                  <div style={{ borderTop: '1px solid var(--border)', position: 'absolute', top: '50%', width: '100%', zIndex: 0 }}></div>
                  <span style={{ backgroundColor: 'var(--card-bg)', padding: '0 1rem', position: 'relative', zIndex: 1, color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    OU ACHETER CET ARTICLE À L'UNITÉ
                  </span>
                </div>

                <button
                  onClick={handleArticlePurchase}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: isArchive ? '#1e293b' : isConfidentiel ? '#7f1d1d' : 'var(--primary)',
                    color: 'white',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '1.05rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.15)',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading
                    ? '⏳ Redirection vers le paiement...'
                    : '💳 Débloquer cet article — 250 FCFA'}
                </button>

                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0.25rem 0 0' }}>
                  Paiement sécurisé via GeniusPay (Wave, Orange Money, MTN MoMo, carte bancaire)
                </p>
              </>
            )}

            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Déjà abonné ? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'underline' }}>Connectez-vous</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

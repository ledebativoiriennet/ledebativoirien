"use client";

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

function AbonnementContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success');

  const handlePayment = async (plan: string, amount: number) => {
    if (status === "unauthenticated" || !session?.user?.email) {
      alert("Veuillez vous connecter pour vous abonner.");
      router.push("/login");
      return;
    }

    setLoading(plan);
    try {
      const res = await fetch('/api/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, amount, email: session.user.email, name: session.user.name })
      });
      const data = await res.json();
      
      if (data.code === '201' && data.data?.payment_url) {
        window.location.href = data.data.payment_url;
      } else {
        alert("Erreur de connexion à CinetPay. Veuillez réessayer.");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur réseau.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', marginTop: '4rem', marginBottom: '4rem', textAlign: 'center' }}>
      {isSuccess && (
        <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '1rem', borderRadius: '4px', border: '1px solid #10b981', marginBottom: '2rem' }}>
          🎉 Merci pour votre abonnement ! Votre compte est désormais Premium.
        </div>
      )}
      <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>Rejoignez Le Débat Ivoirien</h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--muted)', marginBottom: '3rem' }}>
        Soutenez un journalisme indépendant, d'investigation et sans concession.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', textAlign: 'left' }}>
        {/* Offre Quotidienne */}
        <div className="article-card" style={{ padding: '2rem', borderTop: '4px solid #94a3b8' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Quotidien</h2>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, margin: '1rem 0' }}>
            200 FCFA <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/ jour</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--foreground)', fontSize: '0.9rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>✓ 24h d'accès illimité</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Sans publicité</li>
          </ul>
          <div style={{ flexGrow: 1 }} />
          <button 
            className="btn" 
            style={{ width: '100%', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', opacity: loading === 'Quotidien' ? 0.7 : 1, marginTop: 'auto' }}
            onClick={() => handlePayment('Quotidien', 200)}
            disabled={loading !== null}
          >
            {loading === 'Quotidien' ? "Connexion..." : "CinetPay"}
          </button>
        </div>

        {/* Offre Hebdomadaire */}
        <div className="article-card" style={{ padding: '2rem', borderTop: '4px solid #64748b' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Hebdo</h2>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, margin: '1rem 0' }}>
            700 FCFA <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/ sem</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--foreground)', fontSize: '0.9rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>✓ 7 jours d'accès illimité</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Sans publicité</li>
          </ul>
          <div style={{ flexGrow: 1 }} />
          <button 
            className="btn" 
            style={{ width: '100%', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', opacity: loading === 'Hebdo' ? 0.7 : 1, marginTop: 'auto' }}
            onClick={() => handlePayment('Hebdo', 700)}
            disabled={loading !== null}
          >
            {loading === 'Hebdo' ? "Connexion..." : "CinetPay"}
          </button>
        </div>

        {/* Offre Mensuelle */}
        <div className="article-card" style={{ padding: '2rem', borderTop: '4px solid var(--secondary)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Mensuel</h2>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, margin: '1rem 0' }}>
            2 000 FCFA <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/ mois</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--foreground)', fontSize: '0.9rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>✓ Accès illimité à tous les articles</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Sans publicité</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Newsletters exclusives</li>
          </ul>
          <div style={{ flexGrow: 1 }} />
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', opacity: loading === 'Mensuel' ? 0.7 : 1 }}
            onClick={() => handlePayment('Mensuel', 2000)}
            disabled={loading !== null}
          >
            {loading === 'Mensuel' ? "Connexion..." : "S'abonner via CinetPay"}
          </button>
        </div>

        {/* Offre Annuelle */}
        <div className="article-card" style={{ padding: '2rem', borderTop: '4px solid var(--primary)', transform: 'scale(1.05)' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'var(--primary)', color: 'white', padding: '0.25rem 1rem', fontSize: '0.75rem', fontWeight: 'bold', borderBottomLeftRadius: 'var(--radius)' }}>
            LE PLUS POPULAIRE
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Annuel</h2>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, margin: '1rem 0' }}>
            20 000 FCFA <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/ an</span>
          </div>
          <p style={{ color: 'var(--primary)', fontWeight: 'bold', marginBottom: '1rem' }}>Soit 2 mois offerts !</p>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--foreground)', fontSize: '0.9rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>✓ Accès illimité à tous les articles</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Sans publicité</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Accès aux archives</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Invitation aux événements exclusifs</li>
          </ul>
          <div style={{ flexGrow: 1 }} />
          <button 
            className="btn" 
            style={{ width: '100%', backgroundColor: 'var(--primary)', color: 'white', opacity: loading === 'Annuel' ? 0.7 : 1 }}
            onClick={() => handlePayment('Annuel', 20000)}
            disabled={loading !== null}
          >
            {loading === 'Annuel' ? "Connexion..." : "S'abonner via CinetPay"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AbonnementPage() {
  return (
    <Suspense fallback={<div style={{textAlign:'center', marginTop:'5rem'}}>Chargement...</div>}>
      <AbonnementContent />
    </Suspense>
  )
}

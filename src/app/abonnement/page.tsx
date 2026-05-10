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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', textAlign: 'left' }}>
        {/* SECTION PREMIUM */}
        <div style={{ display: 'contents' }}>
          <div className="article-card" style={{ padding: '2rem', borderTop: '4px solid #64748b', display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>OFFRE PREMIUM</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Premium Hebdo</h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, margin: '1rem 0' }}>
              700 FCFA <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/ sem</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--foreground)', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>✓ Accès illimité aux articles Premium</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ Sans publicité</li>
            </ul>
            <div style={{ flexGrow: 1 }} />
            <button 
              className="btn" 
              style={{ width: '100%', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', opacity: loading === 'Hebdo' ? 0.7 : 1 }}
              onClick={() => handlePayment('Hebdo', 700)}
              disabled={loading !== null}
            >
              {loading === 'Hebdo' ? "Connexion..." : "CinetPay"}
            </button>
          </div>

          <div className="article-card" style={{ padding: '2rem', borderTop: '4px solid var(--secondary)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>OFFRE PREMIUM</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Premium Mensuel</h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, margin: '1rem 0' }}>
              2 000 FCFA <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/ mois</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--foreground)', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>✓ Accès illimité aux articles Premium</li>
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
        </div>

        {/* SECTION CONFIDENTIEL */}
        <div style={{ display: 'contents' }}>
          <div className="article-card" style={{ padding: '2rem', borderTop: '4px solid #7f1d1d', backgroundColor: '#fffcfc', display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#7f1d1d', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>EXCLUSIF : CONFIDENTIEL</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Confidentiel Hebdo</h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, margin: '1rem 0', color: '#7f1d1d' }}>
              1 000 FCFA <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/ sem</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--foreground)', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>✓ Accès complet aux Enquêtes Confidentielles</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ Révélations exclusives</li>
            </ul>
            <div style={{ flexGrow: 1 }} />
            <button 
              className="btn" 
              style={{ width: '100%', backgroundColor: '#7f1d1d', color: 'white', opacity: loading === 'Confidentiel-Hebdo' ? 0.7 : 1 }}
              onClick={() => handlePayment('Confidentiel-Hebdo', 1000)}
              disabled={loading !== null}
            >
              {loading === 'Confidentiel-Hebdo' ? "Connexion..." : "S'abonner Confidentiel"}
            </button>
          </div>

          <div className="article-card" style={{ padding: '2rem', borderTop: '4px solid #7f1d1d', backgroundColor: '#fffcfc', display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#7f1d1d', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>EXCLUSIF : CONFIDENTIEL</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Confidentiel Mensuel</h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, margin: '1rem 0', color: '#7f1d1d' }}>
              3 000 FCFA <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/ mois</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--foreground)', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>✓ Accès complet aux Enquêtes Confidentielles</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ Dossiers spéciaux confidentiels</li>
            </ul>
            <div style={{ flexGrow: 1 }} />
            <button 
              className="btn" 
              style={{ width: '100%', backgroundColor: '#7f1d1d', color: 'white', opacity: loading === 'Confidentiel-Mensuel' ? 0.7 : 1 }}
              onClick={() => handlePayment('Confidentiel-Mensuel', 3000)}
              disabled={loading !== null}
            >
              {loading === 'Confidentiel-Mensuel' ? "Connexion..." : "S'abonner Confidentiel"}
            </button>
          </div>
        </div>

        {/* SECTION ULTIMATE */}
        <div className="article-card" style={{ padding: '2rem', borderTop: '4px solid #1e293b', background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)', gridColumn: '1 / -1', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '15px', right: '-35px', backgroundColor: '#1e293b', color: 'white', padding: '0.5rem 3rem', transform: 'rotate(45deg)', fontSize: '0.75rem', fontWeight: 900 }}>OFFRE ULTIME</div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 400px' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Pack Ultimate</h2>
              <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '2rem' }}>L'expérience complète du Débat Ivoirien : Tous les articles Premium + Toutes les enquêtes Confidentielles.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <ul style={{ listStyle: 'none', padding: 0, color: 'var(--foreground)', fontSize: '0.9rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>✓ Tout le contenu Premium</li>
                  <li style={{ marginBottom: '0.5rem' }}>✓ Tout le contenu Confidentiel</li>
                  <li style={{ marginBottom: '0.5rem' }}>✓ Sans publicité</li>
                </ul>
                <ul style={{ listStyle: 'none', padding: 0, color: 'var(--foreground)', fontSize: '0.9rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>✓ Archives illimitées</li>
                  <li style={{ marginBottom: '0.5rem' }}>✓ Support prioritaire</li>
                  <li style={{ marginBottom: '0.5rem' }}>✓ Événements abonnés</li>
                </ul>
              </div>
            </div>

            <div style={{ flex: '0 0 auto', textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#1e293b' }}>
                27 000 FCFA <span style={{ fontSize: '1rem', color: '#64748b' }}>/ an</span>
              </div>
              <p style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '1.5rem' }}>Paiement annuel unique</p>
              <button 
                className="btn" 
                style={{ width: '100%', backgroundColor: '#1e293b', color: 'white', padding: '1rem 2rem', fontSize: '1.1rem', opacity: loading === 'Ultimate' ? 0.7 : 1 }}
                onClick={() => handlePayment('Ultimate', 27000)}
                disabled={loading !== null}
              >
                {loading === 'Ultimate' ? "Connexion..." : "Passer à l'Ultimate"}
              </button>
            </div>
          </div>
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

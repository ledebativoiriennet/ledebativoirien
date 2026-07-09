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
      
      if (data.success && data.data?.payment_url) {
        window.location.href = data.data.payment_url;
      } else {
        alert("Erreur de connexion à GeniusPay. Veuillez réessayer.");
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', textAlign: 'left' }}>
        {/* PREMIUM HEBDO */}
        <div className="article-card" style={{ padding: '2rem', borderTop: '4px solid #64748b', display: 'flex', flexDirection: 'column', borderRadius: '12px', background: 'var(--card-bg)' }}>
          <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>OFFRE PREMIUM</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Hebdomadaire</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0 0 1rem 0' }}>Idéal pour tester ou pour un besoin ponctuel</p>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0.5rem 0 1.5rem 0' }}>
            2 000 FCFA <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 500 }}>/ sem</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--foreground)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>✓ Lectures illimitées des articles Premium</li>
            <li>✓ Téléchargement du journal PDF</li>
            <li>✓ Sans publicité intrusive</li>
          </ul>
          <div style={{ flexGrow: 1 }} />
          <button 
            className="btn" 
            style={{ width: '100%', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: loading === 'Hebdomadaire' ? 0.7 : 1 }}
            onClick={() => handlePayment('Hebdomadaire', 2000)}
            disabled={loading !== null}
          >
            {loading === 'Hebdomadaire' ? "Connexion..." : "S'abonner via GeniusPay"}
          </button>
        </div>

        {/* PREMIUM MENSUEL */}
        <div className="article-card" style={{ padding: '2rem', borderTop: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', borderRadius: '12px', background: 'var(--card-bg)', boxShadow: '0 10px 20px rgba(230,0,0,0.05)' }}>
          <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>OFFRE PREMIUM</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Mensuel</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0 0 1rem 0' }}>Notre formule la plus populaire</p>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0.5rem 0 1.5rem 0' }}>
            5 000 FCFA <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 500 }}>/ mois</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--foreground)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>✓ Lectures illimitées des articles Premium</li>
            <li>✓ Téléchargement du journal PDF</li>
            <li>✓ Sans publicité intrusive</li>
            <li>✓ Newsletters réservées aux abonnés</li>
          </ul>
          <div style={{ flexGrow: 1 }} />
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: loading === 'Mensuel' ? 0.7 : 1 }}
            onClick={() => handlePayment('Mensuel', 5000)}
            disabled={loading !== null}
          >
            {loading === 'Mensuel' ? "Connexion..." : "S'abonner via GeniusPay"}
          </button>
        </div>

        {/* CONFIDENTIEL */}
        <div className="article-card" style={{ padding: '2rem', borderTop: '4px solid #7f1d1d', backgroundColor: '#fffcfc', display: 'flex', flexDirection: 'column', borderRadius: '12px' }}>
          <div style={{ color: '#7f1d1d', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>ACCÈS EXCLUSIF</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Confidentiels</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0 0 1rem 0' }}>Pour les décideurs et passionnés de révélations</p>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0.5rem 0 1.5rem 0', color: '#7f1d1d' }}>
            5 000 FCFA <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 500 }}>/ mois</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--foreground)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>✓ Accès aux articles 🔒 Confidentiels</li>
            <li>✓ Enquêtes et indiscrétions exclusives</li>
            <li>✓ Dossiers politiques et financiers</li>
          </ul>
          <div style={{ flexGrow: 1 }} />
          <button 
            className="btn" 
            style={{ width: '100%', backgroundColor: '#7f1d1d', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: loading === 'Confidentiel' ? 0.7 : 1 }}
            onClick={() => handlePayment('Confidentiel', 5000)}
            disabled={loading !== null}
          >
            {loading === 'Confidentiel' ? "Connexion..." : "S'abonner aux Confidentiels"}
          </button>
        </div>

        {/* ULTIMATE ANNUEL */}
        <div className="article-card" style={{ padding: '2rem', borderTop: '4px solid #1e293b', background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)', display: 'flex', flexDirection: 'column', borderRadius: '12px', boxShadow: '0 15px 30px rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '12px', right: '-25px', backgroundColor: '#1e293b', color: 'white', padding: '0.25rem 2.5rem', transform: 'rotate(45deg)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>MEILLEUR TARIF</div>
          <div style={{ color: '#1e293b', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>OFFRE COMPLÈTE</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Annuel</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0 0 1rem 0' }}>La formule ultime pour les grands lecteurs</p>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0.5rem 0 1.5rem 0', color: '#1e293b' }}>
            25 000 FCFA <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 500 }}>/ an</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--foreground)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>✓ Lectures illimitées Premium</li>
            <li>✓ Accès aux Enquêtes Confidentielles</li>
            <li>✓ Téléchargements illimités des journaux</li>
            <li>✓ <b>Accès complet aux archives du journal</b></li>
            <li>✓ Support prioritaire</li>
          </ul>
          <div style={{ flexGrow: 1 }} />
          <button 
            className="btn" 
            style={{ width: '100%', backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: loading === 'Annuel' ? 0.7 : 1 }}
            onClick={() => handlePayment('Annuel', 25000)}
            disabled={loading !== null}
          >
            {loading === 'Annuel' ? "Connexion..." : "S'abonner à l'Annuel"}
          </button>
        </div>
      </div>

      {/* SECTION ARCHIVES À L'UNITÉ */}
      <div style={{
        marginTop: '4rem',
        padding: '2.5rem',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        textAlign: 'left',
        boxShadow: 'var(--shadow)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 500px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: 'var(--foreground)' }}>
              🗂️ Accès aux archives à l&apos;unité
            </h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Vous souhaitez consulter un ancien numéro ou un article d&apos;enquête historique sans vous engager sur un abonnement Annuel ? 
              Nous proposons l&apos;<strong>achat d&apos;articles d&apos;archives à l&apos;unité pour 500 FCFA</strong>. 
              Pour cela, rendez-vous simplement dans la rubrique <Link href="/archives" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}>Archives</Link>, sélectionnez l&apos;article désiré et procédez au paiement individuel.
            </p>
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <Link href="/archives" className="btn btn-primary" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', textDecoration: 'none', fontWeight: 'bold' }}>
              Parcourir les Archives
            </Link>
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

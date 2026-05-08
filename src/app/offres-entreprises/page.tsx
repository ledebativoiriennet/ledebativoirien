import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offres Entreprises & B2B - Le Débat Ivoirien',
  description: 'Découvrez nos solutions sur mesure pour les entreprises : abonnements groupés, accès multi-utilisateurs et visibilité premium.',
};

export default function B2BPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e293b, #0f172a)', 
        color: 'white', 
        padding: '5rem 1rem', 
        textAlign: 'center' 
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            Solutions <span style={{ color: 'var(--primary)' }}>Entreprises</span>
          </h1>
          <p style={{ fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto', opacity: 0.9, lineHeight: 1.6 }}>
            Accompagnez vos collaborateurs avec une information de qualité. 
            Découvrez nos offres d'abonnements groupés et nos outils d'analyse économique.
          </p>
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/contact?subject=B2B" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Demander un devis
            </Link>
            <a href="#offres" style={{ padding: '1rem 2rem', fontSize: '1.1rem', color: 'white', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 'var(--radius)' }}>
              Voir les offres
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container" style={{ padding: '5rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {[
            { 
              title: 'Accès Multi-utilisateurs', 
              desc: 'Gérez centralement les accès de vos collaborateurs via un tableau de bord unique.', 
              icon: '👥' 
            },
            { 
              title: 'Kiosque PDF Illimité', 
              desc: 'Téléchargez automatiquement chaque édition papier dès sa parution pour vos archives.', 
              icon: '📄' 
            },
            { 
              title: 'Veille Économique', 
              desc: 'Accédez à des données de marché exclusives et des rapports sectoriels détaillés.', 
              icon: '📊' 
            },
            { 
              title: 'Visibilité Premium', 
              desc: 'Bénéficiez de tarifs préférentiels sur nos espaces publicitaires et publi-reportages.', 
              icon: '✨' 
            }
          ].map((f, i) => (
            <div key={i} style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div id="offres" style={{ backgroundColor: 'white', padding: '5rem 1rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900 }}>Nos Formules</h2>
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Des solutions adaptées à la taille de votre structure.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Lite Plan */}
            <div style={{ border: '1px solid var(--border)', borderRadius: '20px', padding: '3rem 2rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>PME / Start-up</h3>
              <div style={{ margin: '1.5rem 0' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>50.000</span>
                <span style={{ color: 'var(--muted)' }}> FCFA / an</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li>✅ Jusqu'à 10 collaborateurs</li>
                <li>✅ Accès Premium illimité</li>
                <li>✅ 5 téléchargements PDF / mois</li>
                <li>✅ Support prioritaire</li>
              </ul>
              <button style={{ marginTop: 'auto', width: '100%', padding: '1rem', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: 'var(--radius)', fontWeight: 'bold', background: 'none' }}>
                Choisir cette offre
              </button>
            </div>

            {/* Corporate Plan */}
            <div style={{ border: '2px solid var(--primary)', borderRadius: '20px', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: '#fff' }}>
              <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--primary)', color: 'white', padding: '0.4rem 1.2rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                RECOMMANDÉ
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Corporate</h3>
              <div style={{ margin: '1.5rem 0' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>150.000</span>
                <span style={{ color: 'var(--muted)' }}> FCFA / an</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li>✅ Jusqu'à 50 collaborateurs</li>
                <li>✅ Accès Premium illimité</li>
                <li>✅ Archives PDF illimitées</li>
                <li>✅ Dashboard Manager</li>
                <li>✅ 1 Publi-reportage offert / an</li>
              </ul>
              <button className="btn btn-primary" style={{ marginTop: 'auto', width: '100%', padding: '1rem' }}>
                Choisir cette offre
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

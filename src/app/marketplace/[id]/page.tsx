import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import MarketplaceCheckoutClient from './MarketplaceCheckoutClient';

export default async function NewspaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const newspaper = await prisma.digitalNewspaper.findUnique({
    where: { id }
  });

  if (!newspaper || !newspaper.isActive) {
    notFound();
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', padding: '4rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <Link href="/marketplace" style={{ color: 'var(--muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }} className="hover-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Retour au Kiosque</span>
          </Link>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '4rem',
          alignItems: 'start'
        }}>
          {/* Colonne Image - Couverture */}
          <div style={{ 
            position: 'relative', 
            borderRadius: '1.5rem', 
            overflow: 'hidden', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            backgroundColor: '#1e293b',
            aspectRatio: '2/3'
          }}>
            {newspaper.coverImageUrl ? (
              <img
                src={newspaper.coverImageUrl}
                alt={newspaper.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.2)' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>Pas de couverture</span>
              </div>
            )}
            <div style={{ 
              position: 'absolute', 
              top: '1.5rem', 
              right: '1.5rem', 
              backgroundColor: 'rgba(230, 0, 0, 0.9)', 
              backdropFilter: 'blur(4px)',
              padding: '0.5rem 1rem', 
              borderRadius: '0.75rem', 
              fontSize: '0.8rem', 
              fontWeight: 800, 
              color: 'white', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
            }}>
              ÉDITION PDF
            </div>
          </div>
          
          {/* Colonne Infos & Achat */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ 
              fontSize: '0.85rem', 
              fontWeight: 800, 
              color: 'var(--primary)', 
              textTransform: 'uppercase', 
              marginBottom: '1rem',
              letterSpacing: '2px'
            }}>
              Numéro {newspaper.issueNumber || '-'} • {new Date(newspaper.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <h1 style={{ 
              fontSize: 'clamp(2rem, 5vw, 3rem)', 
              fontWeight: 900, 
              color: 'var(--foreground)', 
              marginBottom: '1.5rem', 
              lineHeight: 1.1,
              letterSpacing: '-1px'
            }}>
              {newspaper.title}
            </h1>
            
            <div style={{ color: 'var(--muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              {newspaper.description ? (
                <p>{newspaper.description}</p>
              ) : (
                <p>Accédez à l'intégralité de cette édition en haute définition. Analyses exclusives, dossiers complets et toutes les rubriques de votre journal habituel.</p>
              )}
            </div>

            <div style={{ 
              backgroundColor: 'var(--card-bg)', 
              borderRadius: '1.5rem', 
              padding: '2rem', 
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)',
              marginBottom: '2.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '1rem' }}>Prix de l'édition</span>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--foreground)' }}>{newspaper.price} <span style={{fontSize: '1rem', color: 'var(--muted)'}}>FCFA</span></span>
              </div>
              
              <MarketplaceCheckoutClient 
                newspaper={{
                  id: newspaper.id,
                  title: newspaper.title,
                  price: newspaper.price
                }} 
              />
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1.5rem',
              padding: '0 1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ color: '#22c55e', fontSize: '1.25rem' }}>✓</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                  <strong>HD Qualité</strong><br/>Texte et images nets
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ color: '#22c55e', fontSize: '1.25rem' }}>✓</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                  <strong>Multi-Support</strong><br/>Mobile, Tablette, PC
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ color: '#22c55e', fontSize: '1.25rem' }}>✓</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                  <strong>Lien à vie</strong><br/>Accès permanent
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ color: '#22c55e', fontSize: '1.25rem' }}>✓</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                  <strong>Paiement Sûr</strong><br/>CinetPay Sécurisé
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

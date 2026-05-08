import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
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
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000', 
      position: 'relative',
      overflow: 'hidden',
      color: 'white'
    }}>
      {/* Background Immersif (Flou) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
      }}>
        {newspaper.coverImageUrl && (
          <div style={{
            position: 'absolute',
            inset: '-50px',
            backgroundImage: `url(${newspaper.coverImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px) brightness(0.4)',
            opacity: 0.8
          }} />
        )}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 20% 30%, rgba(230, 0, 0, 0.15) 0%, transparent 70%), radial-gradient(circle at 80% 70%, rgba(0, 0, 0, 0.5) 0%, transparent 70%)'
        }} />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '4rem 1rem', maxWidth: '1200px' }}>
        <div style={{ marginBottom: '3rem' }}>
          <Link href="/marketplace" style={{ 
            color: 'rgba(255,255,255,0.6)', 
            textDecoration: 'none', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            fontWeight: 700, 
            fontSize: '0.9rem',
            transition: 'all 0.3s'
          }} className="hover-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Retour au Kiosque</span>
          </Link>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', 
          gap: '5rem',
          alignItems: 'center'
        }}>
          {/* Cover Display Premium */}
          <div style={{ perspective: '1000px' }}>
            <div style={{ 
              position: 'relative', 
              borderRadius: '1rem', 
              overflow: 'hidden', 
              boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5), 0 30px 60px -30px rgba(0,0,0,0.5)',
              transform: 'rotateY(-5deg) rotateX(5deg)',
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }} className="newspaper-3d-cover">
              {newspaper.coverImageUrl ? (
                <img
                  src={newspaper.coverImageUrl}
                  alt={newspaper.title}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              ) : (
                <div style={{ aspectRatio: '2/3', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b', color: 'rgba(255,255,255,0.2)' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>Pas de couverture</span>
                </div>
              )}
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                pointerEvents: 'none'
              }} />
            </div>
          </div>
          
          {/* Glassmorphism Card Content */}
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.03)', 
            backdropFilter: 'blur(20px)',
            borderRadius: '2.5rem',
            padding: '3.5rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ 
              fontSize: '0.85rem', 
              fontWeight: 800, 
              color: 'var(--primary)', 
              textTransform: 'uppercase', 
              marginBottom: '1.5rem',
              letterSpacing: '3px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span style={{ width: '30px', height: '2px', backgroundColor: 'var(--primary)' }}></span>
              Édition du {new Date(newspaper.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
              fontWeight: 900, 
              color: 'white', 
              marginBottom: '1.5rem', 
              lineHeight: 0.95,
              letterSpacing: '-3px'
            }}>
              {newspaper.title}
            </h1>
            
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.15rem', lineHeight: 1.6, marginBottom: '3rem' }}>
              {newspaper.description ? (
                <p>{newspaper.description}</p>
              ) : (
                <p>Découvrez notre dossier exclusif et toutes les analyses qui font l'actualité de la semaine. Disponible en haute définition pour une lecture parfaite.</p>
              )}
            </div>

            <div style={{ marginBottom: '3.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '4rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{newspaper.price}</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>FCFA</span>
              </div>
              
              <div style={{ 
                backgroundColor: 'rgba(0,0,0,0.3)', 
                borderRadius: '1.5rem', 
                padding: '2rem',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <MarketplaceCheckoutClient 
                  newspaper={{
                    id: newspaper.id,
                    title: newspaper.title,
                    price: newspaper.price
                  }} 
                />
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '2rem',
              opacity: 0.7
            }}>
              {[
                { label: 'Qualité HD', icon: '💎' },
                { label: 'Accès mobile', icon: '📱' },
                { label: 'Téléchargement', icon: '⚡' },
                { label: 'Archive à vie', icon: '📂' }
              ].map((feature, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span style={{ fontSize: '1.25rem' }}>{feature.icon}</span>
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .newspaper-3d-cover:hover {
          transform: rotateY(0deg) rotateX(0deg) scale(1.05);
        }
        .hover-white:hover {
          color: white !important;
          transform: translateX(-5px);
        }
      `}} />
    </div>
  );
}

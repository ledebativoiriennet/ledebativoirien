import React from 'react';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Kiosque PDF - Le Débat Ivoirien',
  description: 'Téléchargez la version numérique intégrale du journal Le Débat Ivoirien.',
};

export default async function MarketplacePage() {
  const newspapers = await prisma.digitalNewspaper.findMany({
    where: { isActive: true },
    orderBy: { publishedAt: 'desc' }
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Hero Section Premium */}
      <div style={{ 
        position: 'relative', 
        padding: '5rem 1rem', 
        backgroundColor: '#000', 
        backgroundImage: 'linear-gradient(to bottom right, #000, #1e293b, #7f1d1d)',
        overflow: 'hidden',
        marginBottom: '4rem'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: 'radial-gradient(circle at 50% 50%, #fff 1%, transparent 1%)',
          backgroundSize: '30px 30px'
        }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-block', 
            backgroundColor: 'rgba(230, 0, 0, 0.1)', 
            color: 'var(--primary)', 
            padding: '0.5rem 1rem', 
            borderRadius: '999px', 
            fontSize: '0.75rem', 
            fontWeight: 800, 
            textTransform: 'uppercase', 
            letterSpacing: '2px',
            marginBottom: '1.5rem',
            border: '1px solid rgba(230, 0, 0, 0.2)'
          }}>
            L'actualité entre vos mains
          </div>
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', 
            fontWeight: 900, 
            color: 'white', 
            lineHeight: 1,
            marginBottom: '1.5rem',
            letterSpacing: '-2px'
          }}>
            Le Kiosque <span style={{ color: 'var(--primary)' }}>Numérique</span>
          </h1>
          <p style={{ 
            maxWidth: '600px', 
            margin: '0 auto', 
            fontSize: '1.25rem', 
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.6
          }}>
            Retrouvez l'intégralité de nos éditions papier en format PDF haute définition. 
            Lisez partout, tout le temps.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '6rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Dernières Parutions</h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--muted)', fontWeight: 600 }}>
            {newspapers.length} Édition(s) disponible(s)
          </div>
        </div>

        {newspapers.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: 'var(--muted)', 
            padding: '5rem 2rem', 
            backgroundColor: 'var(--card-bg)', 
            borderRadius: '1.5rem', 
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)'
          }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 500 }}>Aucune édition n'est disponible pour le moment.</p>
            <p style={{ marginTop: '0.5rem' }}>Revenez bientôt pour nos prochaines publications.</p>
          </div>
        ) : (
          <div className="grid-responsive-4col" style={{ gap: '2.5rem' }}>
            {newspapers.map((paper) => (
              <Link 
                href={`/marketplace/${paper.id}`} 
                key={paper.id} 
                className="article-card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  textDecoration: 'none',
                  borderRadius: '1rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  overflow: 'visible'
                }}
              >
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: '420px', 
                  backgroundColor: '#1e293b', 
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }} className="newspaper-cover-container">
                  {paper.coverImageUrl ? (
                    <img
                      src={paper.coverImageUrl}
                      alt={paper.title}
                      className="article-card-img"
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' 
                      }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.3)' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 600 }}>Pas de couverture</span>
                    </div>
                  )}
                  
                  {/* Overlay au hover */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                    opacity: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '1.5rem',
                    transition: 'opacity 0.3s'
                  }}>
                    <div style={{ 
                      backgroundColor: 'var(--primary)', 
                      color: 'white', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '0.5rem', 
                      fontSize: '0.875rem', 
                      fontWeight: 800,
                      alignSelf: 'flex-start',
                      boxShadow: '0 4px 6px -1px rgba(230, 0, 0, 0.4)'
                    }}>
                      {paper.price} FCFA
                    </div>
                  </div>
                </div>
                
                <div style={{ padding: '1.25rem 0.25rem' }}>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 800, 
                    color: 'var(--primary)', 
                    textTransform: 'uppercase', 
                    marginBottom: '0.5rem',
                    letterSpacing: '1px'
                  }}>
                    Édition n° {paper.issueNumber || '-'}
                  </div>
                  <h3 style={{ 
                    fontSize: '1.15rem', 
                    fontWeight: 800, 
                    marginBottom: '0.5rem',
                    lineHeight: 1.2,
                    color: 'var(--foreground)'
                  }}>
                    {paper.title}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500 }}>
                    Paru le {new Date(paper.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .newspaper-cover-container:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .newspaper-cover-container:hover img {
          transform: scale(1.1);
        }
      `}} />
    </div>
  );
}

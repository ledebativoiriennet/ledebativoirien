import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const metadata = {
  title: 'Admin - Kiosque PDF',
};

export default async function AdminMarketplacePage() {
  const newspapers = await prisma.digitalNewspaper.findMany({
    orderBy: { publishedAt: 'desc' },
    include: {
      _count: {
        select: {
          purchases: {
            where: { status: 'COMPLETED' }
          }
        }
      },
      purchases: {
        where: { status: 'COMPLETED' },
        select: { amount: true }
      }
    }
  });

  const totalActive = newspapers.filter(p => p.isActive).length;
  const totalDraft = newspapers.filter(p => !p.isActive).length;
  const totalRevenue = newspapers.reduce(
    (sum, p) => sum + p.purchases.reduce((s, purchase) => s + purchase.amount, 0),
    0
  );
  const totalSales = newspapers.reduce((sum, p) => sum + p._count.purchases, 0);

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>

      {/* ── En-tête ────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)',
        border: '1px solid #2a2a2a',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Texture subtile */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
          backgroundSize: '12px 12px',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #ec1a24, #a00)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', boxShadow: '0 0 20px rgba(236,26,36,0.4)'
              }}>📰</div>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                Kiosque <span style={{ color: '#ec1a24' }}>Numérique</span>
              </h1>
            </div>
            <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
              Gérez les journaux PDF — publications, prix et ventes
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/admin/marketplace/ventes" style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: '#1a1a1a', border: '1px solid #333',
              color: 'white', padding: '0.65rem 1.25rem',
              borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem',
              textDecoration: 'none', transition: 'all 0.2s'
            }}>
              <span>💰</span> Historique des ventes
            </Link>
            <Link href="/admin/marketplace/nouveau" style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, #ec1a24, #cc0000)',
              border: 'none', color: 'white',
              padding: '0.65rem 1.25rem', borderRadius: '10px',
              fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none',
              boxShadow: '0 0 20px rgba(236,26,36,0.35)',
              transition: 'all 0.2s'
            }}>
              <span style={{ fontSize: '1.1rem' }}>＋</span> Ajouter un Journal
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { icon: '📚', label: 'Total publications', value: newspapers.length, color: '#6366f1' },
          { icon: '🟢', label: 'En ligne', value: totalActive, color: '#22c55e' },
          { icon: '🔒', label: 'Brouillons', value: totalDraft, color: '#f59e0b' },
          { icon: '🛒', label: 'Ventes validées', value: totalSales, color: '#ec1a24' },
          { icon: '💵', label: 'Chiffre d\'affaires', value: `${totalRevenue.toLocaleString('fr-FR')} F`, color: '#10b981' },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: '#0f0f0f',
            border: '1px solid #1e1e1e',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            borderLeft: `3px solid ${stat.color}`
          }}>
            <div style={{ fontSize: '1.4rem' }}>{stat.icon}</div>
            <div style={{ fontSize: stat.value.toString().length > 6 ? '1.1rem' : '1.6rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Grille journaux ─────────────────────────────────────────── */}
      {newspapers.length === 0 ? (
        <div style={{
          background: '#0f0f0f', border: '1px dashed #2a2a2a',
          borderRadius: '16px', padding: '5rem 2rem',
          textAlign: 'center', color: '#444'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.4 }}>📭</div>
          <h3 style={{ color: '#888', fontWeight: 700, margin: '0 0 0.5rem' }}>Aucun journal disponible</h3>
          <p style={{ color: '#555', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Commencez par uploader votre premier journal PDF pour le proposer à vos lecteurs.
          </p>
          <Link href="/admin/marketplace/nouveau" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: '#ec1a24', color: 'white',
            padding: '0.75rem 1.5rem', borderRadius: '10px',
            fontWeight: 700, textDecoration: 'none'
          }}>
            ＋ Ajouter mon premier journal
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.5rem'
        }}>
          {newspapers.map((paper) => {
            const salesCount = paper._count.purchases;
            const revenue = paper.purchases.reduce((s, p) => s + p.amount, 0);

            return (
              <div key={paper.id} className="kiosk-card" style={{
                background: '#0f0f0f',
                border: '1px solid #1e1e1e',
                borderRadius: '14px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}>

                {/* ── Image couverture ─ */}
                <div style={{
                  position: 'relative',
                  aspectRatio: '3/4',
                  background: 'linear-gradient(135deg, #1a1a1a, #111)',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {paper.coverImageUrl ? (
                    <img
                      src={paper.coverImageUrl}
                      alt={`Couverture — ${paper.title}`}
                      className="kiosk-cover-img"
                      style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                    />
                  ) : (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#333'
                    }}>
                      <span style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📄</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#333' }}>Pas de couverture</span>
                    </div>
                  )}

                  {/* Gradient overlay bas */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'
                  }} />

                  {/* Badge statut */}
                  <div style={{ position: 'absolute', top: '0.6rem', left: '0.6rem' }}>
                    <span style={{
                      display: 'inline-block',
                      background: paper.isActive
                        ? 'rgba(34,197,94,0.85)'
                        : 'rgba(245,158,11,0.85)',
                      backdropFilter: 'blur(8px)',
                      color: 'white',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.6rem',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {paper.isActive ? '● En ligne' : '● Brouillon'}
                    </span>
                  </div>

                  {/* Prix overlay */}
                  <div style={{
                    position: 'absolute', top: '0.6rem', right: '0.6rem',
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(236,26,36,0.4)',
                    borderRadius: '8px',
                    padding: '0.25rem 0.6rem',
                    color: '#ec1a24',
                    fontWeight: 800,
                    fontSize: '0.8rem'
                  }}>
                    {Number(paper.price).toLocaleString('fr-FR')} F
                  </div>

                  {/* Infos basses */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '0.75rem'
                  }}>
                    {paper.issueNumber && (
                      <div style={{ fontSize: '0.65rem', color: '#ec1a24', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>
                        N° {paper.issueNumber}
                      </div>
                    )}
                    <h3 style={{
                      margin: 0, color: 'white', fontWeight: 800,
                      fontSize: '0.9rem', lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {paper.title}
                    </h3>
                  </div>
                </div>

                {/* ── Métadonnées ─ */}
                <div style={{ padding: '0.875rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                  {/* Date publication */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: '#555' }}>
                      {new Date(paper.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {paper.pdfUrl && (
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Voir le PDF"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          fontSize: '0.65rem', color: '#888', textDecoration: 'none',
                          background: '#1a1a1a', border: '1px solid #2a2a2a',
                          padding: '0.2rem 0.5rem', borderRadius: '6px',
                          fontWeight: 600, transition: 'all 0.2s'
                        }}
                      >
                        📄 PDF
                      </a>
                    )}
                  </div>

                  {/* Stats ventes */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      background: '#141414', border: '1px solid #1e1e1e',
                      borderRadius: '8px', padding: '0.5rem 0.65rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: salesCount > 0 ? '#22c55e' : '#333' }}>
                        {salesCount}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Ventes
                      </div>
                    </div>
                    <div style={{
                      background: '#141414', border: '1px solid #1e1e1e',
                      borderRadius: '8px', padding: '0.5rem 0.65rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: revenue > 0 ? '0.8rem' : '1rem', fontWeight: 800, color: revenue > 0 ? '#10b981' : '#333', lineHeight: 1.2 }}>
                        {revenue > 0 ? `${revenue.toLocaleString('fr-FR')} F` : '—'}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        CA
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {paper.description && (
                    <p style={{
                      margin: 0, fontSize: '0.75rem', color: '#555',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {paper.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div style={{
                    display: 'flex', gap: '0.5rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid #1a1a1a',
                    marginTop: 'auto'
                  }}>
                    <Link
                      href={`/admin/marketplace/${paper.id}`}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '0.35rem',
                        background: '#1a1a1a', border: '1px solid #2a2a2a',
                        color: 'white', borderRadius: '8px',
                        padding: '0.55rem', fontSize: '0.78rem',
                        fontWeight: 600, textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                      className="kiosk-edit-btn"
                    >
                      ✏️ Modifier
                    </Link>
                    <a
                      href={`/marketplace/${paper.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Voir sur le site"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '36px', flexShrink: 0,
                        background: '#1a1a1a', border: '1px solid #2a2a2a',
                        color: '#888', borderRadius: '8px',
                        fontSize: '0.875rem', textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      👁️
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .kiosk-card:hover {
          border-color: rgba(236, 26, 36, 0.4) !important;
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(236,26,36,0.15);
        }
        .kiosk-card:hover .kiosk-cover-img {
          transform: scale(1.05);
        }
        .kiosk-edit-btn:hover {
          background: #ec1a24 !important;
          border-color: #ec1a24 !important;
        }
        @media (max-width: 640px) {
          .kiosk-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}} />
    </div>
  );
}

import React from 'react';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Boutique PDF - Le Débat Ivoirien',
  description: 'Téléchargez la version numérique du journal physique Le Débat Ivoirien.',
};

export default async function MarketplacePage() {
  const newspapers = await prisma.digitalNewspaper.findMany({
    where: { isActive: true },
    orderBy: { publishedAt: 'desc' }
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--foreground)' }}>
            Boutique Numérique
          </h1>
          <p style={{ marginTop: '1rem', fontSize: '1.25rem', color: 'var(--muted)' }}>
            Achetez et téléchargez la version PDF de notre journal papier.
          </p>
        </div>

        {newspapers.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '3rem', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '1.125rem' }}>Aucun journal numérique n'est disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid-responsive-4col">
            {newspapers.map((paper) => (
              <Link href={`/marketplace/${paper.id}`} key={paper.id} className="article-card" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none' }}>
                <div style={{ position: 'relative', width: '100%', height: '320px', backgroundColor: 'var(--border)', overflow: 'hidden' }}>
                  {paper.coverImageUrl ? (
                    <img
                      src={paper.coverImageUrl}
                      alt={paper.title}
                      className="article-card-img"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)' }}>
                      <span style={{ fontSize: '0.875rem' }}>Pas de couverture</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'var(--primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                    {paper.price} FCFA
                  </div>
                </div>
                
                <div className="article-card-content" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    N° {paper.issueNumber || '-'} • {new Date(paper.publishedAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="article-title" style={{ marginBottom: '0.5rem' }}>
                    {paper.title}
                  </h3>
                  {paper.description && (
                    <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1rem', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {paper.description}
                    </p>
                  )}
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div className="btn btn-primary" style={{ width: '100%', display: 'block', boxSizing: 'border-box' }}>
                      Acheter le PDF
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

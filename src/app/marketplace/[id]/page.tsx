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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', padding: '3rem 1rem' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/marketplace" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Retour à la boutique</span>
          </Link>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .product-layout-inline {
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          @media (min-width: 768px) {
            .product-layout-inline {
              flex-direction: row;
            }
            .product-layout-inline > div {
              flex: 1;
            }
          }
        `}} />

        <div className="article-card product-layout-inline">
          <div style={{ position: 'relative', minHeight: '400px', backgroundColor: 'var(--border)' }}>
            {newspaper.coverImageUrl ? (
              <img
                src={newspaper.coverImageUrl}
                alt={newspaper.title}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)' }}>
                <span style={{ fontSize: '1.125rem' }}>Aucune couverture disponible</span>
              </div>
            )}
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'var(--card-bg)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--foreground)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              PDF Numérique
            </div>
          </div>
          
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              N° {newspaper.issueNumber || '-'} • Paru le {new Date(newspaper.publishedAt).toLocaleDateString('fr-FR')}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--foreground)', marginBottom: '1rem', lineHeight: 1.2 }}>
              {newspaper.title}
            </h1>
            
            <div className="article-content" style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
              {newspaper.description ? (
                <p>{newspaper.description}</p>
              ) : (
                <p>Retrouvez toute l'actualité décryptée par nos journalistes dans cette édition complète.</p>
              )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Points forts de ce numéro :</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'Édition intégrale en haute définition',
                  'Lecture optimisée pour mobile et tablette',
                  'Accès aux archives historiques',
                  'Analyses et dossiers exclusifs'
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <span style={{ color: '#22c55e' }}>✓</span> {item}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--background)', borderRadius: 'var(--radius)', padding: '1.5rem', border: '1px solid var(--border)', marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--muted)', fontWeight: 500 }}>Prix du PDF</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--foreground)' }}>{newspaper.price} FCFA</span>
              </div>
              
              <MarketplaceCheckoutClient 
                newspaper={{
                  id: newspaper.id,
                  title: newspaper.title,
                  price: newspaper.price
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

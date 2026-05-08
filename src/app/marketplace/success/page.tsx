import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function MarketplaceSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; transaction_id?: string }>;
}) {
  const { token, transaction_id } = await searchParams;

  let purchase = null;

  if (token) {
    purchase = await prisma.purchase.findUnique({
      where: { downloadToken: token },
      include: { digitalNewspaper: true }
    });
  } else if (transaction_id) {
    purchase = await prisma.purchase.findUnique({
      where: { transactionId: transaction_id },
      include: { digitalNewspaper: true }
    });
  }

  if (!purchase) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ backgroundColor: '#111', border: '1px solid #222', padding: '3rem', borderRadius: '1.5rem', textAlign: 'center', maxWidth: '400px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>Achat introuvable</h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>Nous n'avons pas pu trouver les informations de votre achat.</p>
          <Link href="/marketplace" style={{ width: '100%', backgroundColor: 'white', color: 'black', padding: '1rem 2rem', borderRadius: '1rem', fontWeight: 900, textDecoration: 'none', display: 'inline-block' }}>
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  const isPending = purchase.status === 'PENDING';

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#050505', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      paddingTop: '6rem', 
      paddingBottom: '6rem', 
      paddingLeft: '1rem', 
      paddingRight: '1rem', 
      overflow: 'hidden', 
      position: 'relative' 
    }}>
      {/* Background Decor */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '900px', height: '400px', background: 'rgba(230, 0, 0, 0.08)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      
      <div style={{ maxWidth: '600px', width: '100%', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            width: '96px', 
            height: '96px', 
            backgroundColor: 'white', 
            color: 'black', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 2rem', 
            boxShadow: '0 0 50px rgba(255,255,255,0.15)' 
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: 900, color: 'white', marginBottom: '1rem', letterSpacing: '-0.05em' }}>Excellent choix.</h1>
          <p style={{ color: '#71717a', fontWeight: 600, fontSize: '1.125rem' }}>Votre édition est prête pour une lecture haute fidélité.</p>
        </div>

        {/* Reçu Ultra-Premium */}
        <div style={{ 
          backgroundColor: '#0f0f0f', 
          border: '1px solid #1f1f1f', 
          borderRadius: '2.5rem', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
          overflow: 'hidden', 
          marginBottom: '2.5rem' 
        }}>
          {/* Header du reçu */}
          <div style={{ padding: '2.5rem', borderBottom: '1px solid #1f1f1f', background: 'linear-gradient(to bottom right, #0f0f0f, #050505)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p style={{ color: '#52525b', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Transaction ID</p>
                <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#a1a1aa' }}>{purchase.transactionId}</p>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p style={{ color: '#52525b', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Date d'achat</p>
                <p style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: 700 }}>{new Date(purchase.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: 'fit-content', padding: '0.25rem 0.75rem', backgroundColor: 'rgba(230, 0, 0, 0.1)', color: '#ef4444', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '9999px' }}>Digital Edition</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>{purchase.digitalNewspaper.title}</h2>
            </div>
          </div>

          {/* Corps du reçu */}
          <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p style={{ color: '#52525b', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Destinataire</p>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{purchase.customerEmail}</p>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p style={{ color: '#52525b', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Format</p>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>PDF Haute Définition</p>
              </div>
            </div>

            <div style={{ paddingTop: '2rem', borderTop: '1px solid #1f1f1f', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p style={{ color: '#52525b', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Montant Total</p>
                <p style={{ color: '#52525b', fontSize: '12px', fontWeight: 500, fontStyle: 'italic' }}>Paiement via CinetPay</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.05em' }}>{purchase.amount} <span style={{ fontSize: '0.875rem', color: '#52525b' }}>FCFA</span></p>
              </div>
            </div>

            {/* Bouton de téléchargement */}
            <div style={{ paddingTop: '1.5rem' }}>
              {isPending ? (
                <div style={{ backgroundColor: 'rgba(31, 31, 31, 0.5)', padding: '2rem', borderRadius: '1.5rem', textAlign: 'center', border: '1px dashed #3f3f46' }}>
                  <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
                  <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }} />
                  <p style={{ color: 'white', fontWeight: 700, marginBottom: '0.25rem' }}>Finalisation en cours...</p>
                  <p style={{ color: '#71717a', fontSize: '0.75rem' }}>Nous préparons votre fichier.</p>
                </div>
              ) : (
                <a 
                  href={`/api/marketplace/download/${purchase.downloadToken}`}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    width: '100%', 
                    backgroundColor: 'white', 
                    color: 'black', 
                    padding: '1.5rem 2rem', 
                    borderRadius: '1.5rem', 
                    fontWeight: 900, 
                    textDecoration: 'none', 
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                    boxShadow: '0 20px 40px rgba(255,255,255,0.1)' 
                  }}
                  className="download-btn-premium"
                >
                  <span style={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}>Télécharger le PDF</span>
                  <div style={{ width: '40px', height: '40px', backgroundColor: 'black', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <Link 
            href="/marketplace" 
            style={{ 
              color: '#71717a', 
              textDecoration: 'none', 
              fontWeight: 900, 
              fontSize: '12px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.3em', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              transition: 'color 0.3s'
            }}
            className="hover-white-text"
          >
            <span style={{ width: '32px', height: '1px', backgroundColor: '#27272a' }}></span>
            <span>Continuer mes achats</span>
          </Link>
          <p style={{ fontSize: '10px', color: '#3f3f46', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Le Débat Ivoirien • Kiosque Numérique</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .download-btn-premium:hover {
          transform: scale(1.02);
        }
        .download-btn-premium:active {
          transform: scale(0.98);
        }
        .hover-white-text:hover {
          color: white !important;
        }
      `}} />
    </div>
  );
}

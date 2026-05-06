import React from 'react';
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MainNavigation from "@/components/MainNavigation";

export const metadata = {
  title: "Le Direct (Fil Info) - Le Débat Ivoirien"
};

export const revalidate = 60;

export default async function EnContinuPage() {
  const flashNews = await prisma.flashNews.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100 // Les 100 dernières alertes
  });

  return (
    <>
      <MainNavigation categories={[]} />
      <main className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: 'var(--primary)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
          Le Direct (Fil Info)
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2.5rem', fontSize: '1.1rem', borderBottom: '4px solid var(--border)', paddingBottom: '1rem' }}>
          Suivez l'actualité brûlante de la Côte d'Ivoire et du monde, minute par minute.
        </p>
        
        {flashNews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--muted)', fontSize: '1.2rem' }}>
            Aucune alerte n'est disponible pour le moment.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {flashNews.map((news) => {
              const date = new Date(news.createdAt);
              return (
                <div key={news.id} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem 0', borderBottom: '1px solid var(--border)', position: 'relative' }}>
                  
                  {/* Ligne de temps verticale */}
                  <div style={{ position: 'absolute', left: '20px', top: '3rem', bottom: '-1.5rem', width: '2px', backgroundColor: 'var(--border)', zIndex: -1 }}></div>

                  {/* Temps */}
                  <div style={{ width: '60px', flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary)', backgroundColor: 'var(--background)', padding: '0.2rem 0' }}>
                      {news.time}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 'bold', marginTop: '0.2rem', textTransform: 'uppercase' }}>
                      {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  
                  {/* Contenu */}
                  <div style={{ flex: 1, backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                    {news.source && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'white', backgroundColor: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', marginBottom: '1rem', display: 'inline-block' }}>
                        Source : {news.source}
                      </span>
                    )}
                    
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--foreground)', margin: 0, lineHeight: 1.5 }}>
                      {news.content}
                    </p>

                    {news.link && (
                      <div style={{ marginTop: '1rem' }}>
                        <a href={news.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          Lire l'article complet →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold' }}>
            ← Retour à l'accueil
          </Link>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(236, 26, 36, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(236, 26, 36, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(236, 26, 36, 0); }
        }
      `}} />
    </>
  );
}

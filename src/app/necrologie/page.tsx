import React from 'react';
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import MainNavigation from "@/components/MainNavigation";

export const metadata = {
  title: "Nécrologie - Avis de décès - Le Débat Ivoirien"
};

export const revalidate = 60;

export default async function NecrologiePage() {
  const obituaries = await prisma.obituary.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <>
      <MainNavigation categories={[]} />
      <main className="container" style={{ padding: '4rem 1rem', maxWidth: '1000px', margin: '0 auto', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', color: 'var(--primary)', borderBottom: '4px solid var(--border)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>🕊️</span> Avis de décès et Nécrologie
        </h1>
        
        {obituaries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--muted)', fontSize: '1.2rem' }}>
            Aucun avis de décès n'est publié pour le moment.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {obituaries.map((obituary) => (
              <div key={obituary.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--card-bg)' }}>
                <div style={{ height: '200px', backgroundColor: '#f1f5f9', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {obituary.imageUrl ? (
                    <img 
                      src={obituary.imageUrl} 
                      alt={obituary.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '4rem', opacity: 0.2 }}>🕊️</span>
                  )}
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                    {obituary.name}
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                    Publié le {new Date(obituary.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--foreground)', whiteSpace: 'pre-line' }}>
                    {obituary.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold' }}>
            ← Retour à l'accueil
          </Link>
        </div>
      </main>
    </>
  );
}

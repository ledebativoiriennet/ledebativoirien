import React from 'react';
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MainNavigation from "@/components/MainNavigation";

export const metadata = {
  title: "Communiqués de Presse - Le Débat Ivoirien"
};

export const revalidate = 60;

export default async function CommuniquesPage() {
  const communiques = await prisma.pressRelease.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <>
      <MainNavigation categories={[]} />
      <main className="container" style={{ padding: '4rem 1rem', maxWidth: '1000px', margin: '0 auto', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', color: 'var(--primary)', borderBottom: '4px solid var(--border)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>📢</span> Communiqués de Presse
        </h1>
        
        {communiques.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--muted)', fontSize: '1.2rem' }}>
            Aucun communiqué de presse disponible.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {communiques.map((comm) => (
              <div key={comm.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--card-bg)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', flex: 1 }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--foreground)', lineHeight: 1.4 }}>
                    {comm.title}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold', marginBottom: '1rem' }}>
                    <span>🏢</span> {comm.company}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    Publié le {new Date(comm.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                {comm.url && (
                  <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                    <Link href={comm.url} target="_blank" style={{ display: 'inline-block', backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem', textDecoration: 'none' }}>
                      Lire le communiqué →
                    </Link>
                  </div>
                )}
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

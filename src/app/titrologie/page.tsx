import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Titrologie - Le Débat Ivoirien',
  description: 'Toutes les unes des journaux ivoiriens du jour.',
};

export default async function TitrologiePage() {
  const items = await prisma.titrologie.findMany({
    orderBy: { date: 'desc' }
  });

  return (
    <div className="container" style={{ marginTop: '3rem', marginBottom: '4rem', minHeight: '60vh' }}>
      <h1 className="portal-section-title" style={{ fontSize: '2rem', marginBottom: '2rem', borderBottom: '3px solid var(--primary)', display: 'inline-block' }}>Toute la Titrologie</h1>
      
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          Aucune une de journal n'a été publiée pour l'instant.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {items.map(item => (
            <div key={item.id} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
              <div style={{ height: '400px', backgroundColor: '#f1f5f9', position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.newspaperName || 'Une de journal'} style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#fff' }} />
              </div>
              <div style={{ padding: '1.25rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.25rem', color: 'var(--foreground)' }}>{item.newspaperName || 'Une (Titrologie)'}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  {item.date ? new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Date inconnue'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

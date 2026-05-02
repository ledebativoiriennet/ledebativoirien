import React from 'react';
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MainNavigation from "@/components/MainNavigation";

export const metadata = {
  title: "Toutes les dépêches - Le Débat Ivoirien"
};

export const revalidate = 60;

export default async function DepechesPage() {
  const depeches = await prisma.flashNews.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <>
      <MainNavigation categories={[]} />
      <main className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', color: 'var(--primary)', borderBottom: '4px solid var(--border)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#ef4444' }}>⚡</span> Flash Infos / Dépêches
        </h1>
        
        {depeches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--muted)', fontSize: '1.2rem' }}>
            Aucune dépêche n'est disponible pour le moment.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {depeches.map((news) => (
              <div key={news.id} style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                <div style={{ color: '#ef4444', fontSize: '1.5rem', lineHeight: 1 }}>●</div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    {new Date(news.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {news.link ? (
                    <Link href={news.link} style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--foreground)', textDecoration: 'none', lineHeight: 1.5 }}>
                      {news.content}
                    </Link>
                  ) : (
                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--foreground)', margin: 0, lineHeight: 1.5 }}>
                      {news.content}
                    </p>
                  )}
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

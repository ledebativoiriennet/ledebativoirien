import { prisma } from "@/lib/prisma";
import BreakingNewsClient from "./BreakingNewsClient";

export default async function BreakingNewsPage() {
  const items = await prisma.breakingNews.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem' }}>🚨 Gestion Breaking News</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Ajoutez un bandeau rouge déroulant qui apparaîtra en haut du site public pour informer rapidement les lecteurs d'une actualité chaude.
      </p>
      
      <BreakingNewsClient items={items} />
    </div>
  );
}

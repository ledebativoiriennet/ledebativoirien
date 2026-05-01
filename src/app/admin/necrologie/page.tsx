import { prisma } from "@/lib/prisma";
import NecroClient from "./NecroClient";

export default async function NecrologiePage() {
  const items = await prisma.obituary.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem' }}>✝️ Nécrologie</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Publiez les avis de décès pour informer la communauté. Ces annonces apparaîtront dans la section Nécrologie.
      </p>
      
      <NecroClient items={items} />
    </div>
  );
}

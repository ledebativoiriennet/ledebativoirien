import { prisma } from "@/lib/prisma";
import TitrologieClient from "./TitrologieClient";

export default async function TitrologiePage() {
  const items = await prisma.titrologie.findMany({
    orderBy: { date: 'desc' },
    take: 20
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem' }}>📰 Gestion Titrologie</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Uploadez les unes des journaux du jour pour qu'elles apparaissent dans la section Titrologie de la page d'accueil.
      </p>
      
      <TitrologieClient items={items} />
    </div>
  );
}

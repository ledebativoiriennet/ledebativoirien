import { prisma } from "@/lib/prisma";
import AgendaClient from "./AgendaClient";

export default async function AgendaPage() {
  const items = await prisma.activity.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem' }}>📅 Agenda / Activités</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Gérez les événements et activités qui s'afficheront dans le widget Agenda de la colonne de droite.
      </p>
      
      <AgendaClient items={items} />
    </div>
  );
}

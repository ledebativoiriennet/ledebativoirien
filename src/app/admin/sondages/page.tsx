import { prisma } from "@/lib/prisma";
import SondagesClient from "./SondagesClient";

export default async function SondagesPage() {
  const items = await prisma.poll.findMany({
    orderBy: { createdAt: 'desc' },
    include: { options: true }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem' }}>📊 Gestion Sondages</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Créez des sondages pour interagir avec vos lecteurs. Un seul sondage peut être actif à la fois ("Sondage du Jour").
      </p>
      
      <SondagesClient items={items} />
    </div>
  );
}

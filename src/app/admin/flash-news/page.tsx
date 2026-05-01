import { prisma } from "@/lib/prisma";
import FlashNewsClient from "./FlashNewsClient";

export default async function FlashNewsPage() {
  const items = await prisma.flashNews.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem' }}>⚡ Gestion Flash Infos</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Ajoutez rapidement de courtes dépêches qui s'afficheront dans le fil d'actualité en continu sur la page d'accueil.
      </p>
      
      <FlashNewsClient items={items} />
    </div>
  );
}

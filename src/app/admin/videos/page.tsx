import { prisma } from "@/lib/prisma";
import VideoClient from "./VideoClient";

export default async function VideosPage() {
  const items = await prisma.video.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem' }}>▶️ Vidéos WebTV</h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Ajoutez et gérez les vidéos affichées dans le bloc WebTV de la page d'accueil.
      </p>
      
      <VideoClient items={items} />
    </div>
  );
}

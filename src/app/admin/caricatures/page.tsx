import { prisma } from "@/lib/prisma";
import CaricaturesClient from "./CaricaturesClient";

export default async function CaricaturesPage() {
  const items = await prisma.caricature.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem' }}>🎨 Gestion des Caricatures</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Gérez les caricatures (Dessin de Presse) qui s'affichent sur la page d'accueil. La plus récente sera affichée en priorité.
      </p>
      
      <CaricaturesClient items={items} />
    </div>
  );
}

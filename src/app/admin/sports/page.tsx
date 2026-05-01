import { prisma } from "@/lib/prisma";
import SportsClient from "./SportsClient";

export default async function SportsPage() {
  // @ts-ignore
  const matches = await prisma.footballMatch.findMany({
    orderBy: { matchDate: 'asc' }
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', color: '#0f172a' }}>⚽ Régie des Sports</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Gérez les matchs de la Coupe du Monde / CAN affichés sur la page d'accueil.</p>
      
      <SportsClient initialMatches={matches} />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import CommuniquesClient from "./CommuniquesClient";

export default async function CommuniquesPage() {
  const items = await prisma.pressRelease.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem' }}>📢 Communiqués</h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Publiez des communiqués de presse d'entreprises, institutions ou organisations.
      </p>
      
      <CommuniquesClient items={items} />
    </div>
  );
}

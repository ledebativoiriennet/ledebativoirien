import { prisma } from "@/lib/prisma";
import EmploisClient from "./EmploisClient";

export default async function EmploisPage() {
  const items = await prisma.jobOffer.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem' }}>💼 Offres d'Emploi</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Gérez les offres d'emploi affichées sur le site pour votre audience professionnelle.
      </p>
      
      <EmploisClient items={items} />
    </div>
  );
}

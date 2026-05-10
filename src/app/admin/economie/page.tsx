import { prisma } from "@/lib/prisma";
import EconomicalIndicatorClient from "./EconomicalIndicatorClient";

export default async function EconomiePage() {
  const items = await prisma.economicalIndicator.findMany({
    orderBy: [
      { country: 'asc' },
      { category: 'asc' }
    ]
  });

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem' }}>📈 Indicateurs Macroéconomiques</h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Mettez à jour les données macroéconomiques (PIB, Inflation, etc.) affichées dans le Dashboard Économique.
      </p>
      
      <EconomicalIndicatorClient items={items} />
    </div>
  );
}

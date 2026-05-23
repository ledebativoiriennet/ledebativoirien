import { prisma } from "@/lib/prisma";
import StatsClient from "./StatsClient";

export default async function AdStatsPage() {
  const ads = await prisma.advertisement.findMany({
    include: {
      _count: {
        select: { events: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch recent events for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const events = await prisma.adEvent.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo }
    },
    include: {
      ad: {
        select: { title: true, company: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100 // Last 100 events for the "live" feed
  });

  // Aggregate stats by day for charts (using a raw query if SQLite, or manual group by)
  // For simplicity and since it's a small app, we'll aggregate in memory
  const dailyStats = await prisma.adEvent.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo }
    },
    select: {
      type: true,
      createdAt: true
    }
  });

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>Régie Publicitaire : Statistiques & Traçabilité</h1>
          <p style={{ color: '#64748b' }}>Analyse des performances et suivi détaillé des campagnes.</p>
        </div>
      </div>
      
      <StatsClient initialAds={ads} recentEvents={events} dailyRaw={dailyStats} />
    </div>
  );
}

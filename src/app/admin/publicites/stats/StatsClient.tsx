"use client";

import { useMemo } from "react";
import Link from "next/link";

export default function StatsClient({ initialAds, recentEvents, dailyRaw }: { initialAds: any[], recentEvents: any[], dailyRaw: any[] }) {
  
  const stats = useMemo(() => {
    const totalImpressions = initialAds.reduce((acc, ad) => acc + ad.impressions, 0);
    const totalClicks = initialAds.reduce((acc, ad) => acc + ad.clicks, 0);
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    
    return { totalImpressions, totalClicks, avgCTR };
  }, [initialAds]);

  // Aggregate daily data for a simple sparkline/bar chart
  const dailyChart = useMemo(() => {
    const days: Record<string, { impressions: number, clicks: number }> = {};
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const dayKey = date.toISOString().split('T')[0];
        days[dayKey] = { impressions: 0, clicks: 0 };
    }

    dailyRaw.forEach(event => {
        const dayKey = new Date(event.createdAt).toISOString().split('T')[0];
        if (days[dayKey]) {
            if (event.type === "IMPRESSION") days[dayKey].impressions++;
            else if (event.type === "CLICK") days[dayKey].clicks++;
        }
    });

    return Object.entries(days).sort().map(([date, counts]) => ({ date, ...counts }));
  }, [dailyRaw]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', marginBottom: '0.5rem' }}>TOTAL IMPRESSIONS</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{stats.totalImpressions.toLocaleString()}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', marginBottom: '0.5rem' }}>TOTAL CLICS</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#3b82f6' }}>{stats.totalClicks.toLocaleString()}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', marginBottom: '0.5rem' }}>CTR MOYEN</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>{stats.avgCTR.toFixed(2)}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
         {/* Main Chart area / Ads List */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
               <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Performance par Campagne</h2>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {initialAds.map(ad => (
                    <div key={ad.id} style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div>
                          <div style={{ fontWeight: 'bold' }}>{ad.title}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{ad.company} • {ad.slot}</div>
                       </div>
                       <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.9rem' }}><b>{ad.impressions}</b> vues / <b>{ad.clicks}</b> clics</div>
                          <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 'bold' }}>CTR: {ad.impressions > 0 ? (ad.clicks / ad.impressions * 100).toFixed(2) : 0}%</div>
                       </div>
                    </div>
                  ))}
               </div>
            </section>
         </div>

         {/* Traceability Feed */}
         <section style={{ backgroundColor: '#0f172a', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)', maxHeight: '600px', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <span style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', display: 'inline-block' }}></span>
               Live Traceability Feed
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               {recentEvents.map(event => (
                  <div key={event.id} style={{ fontSize: '0.75rem', fontFamily: 'monospace', padding: '0.5rem', borderLeft: `2px solid ${event.type === 'CLICK' ? '#3b82f6' : '#64748b'}`, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ color: event.type === 'CLICK' ? '#3b82f6' : '#94a3b8', fontWeight: 'bold' }}>[{event.type}]</span>
                        <span style={{ color: '#475569' }}>{new Date(event.createdAt).toLocaleTimeString()}</span>
                     </div>
                     <div style={{ color: '#cbd5e1' }}>{event.ad.title}</div>
                     <div style={{ color: '#475569', fontSize: '0.7rem' }}>IP: {event.ipHash} • {event.userAgent.substring(0, 30)}...</div>
                  </div>
               ))}
               {recentEvents.length === 0 && <div style={{ color: '#475569', textAlign: 'center', padding: '2rem' }}>En attente de nouvelles données...</div>}
            </div>
         </section>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
         <Link href="/admin/publicites" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>← Retour à la gestion des publicités</Link>
      </div>
    </div>
  );
}

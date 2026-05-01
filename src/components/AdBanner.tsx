import { prisma } from "@/lib/prisma";

export default async function AdBanner({ slot }: { slot: string }) {
  const now = new Date();
  
  // @ts-ignore
  const ad = await prisma.advertisement.findFirst({
    where: {
      slot,
      status: "ACTIVE",
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } },
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!ad) return null;

  const targetUrl = ad.linkUrl ? `/api/ad-click?id=${ad.id}&url=${encodeURIComponent(ad.linkUrl)}` : null;

  return (
    <div style={{ margin: '1rem 0', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
        <span style={{ position: 'absolute', top: '-15px', right: '0', fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase' }}>Publicité</span>
        {targetUrl ? (
          <a href={targetUrl} target="_blank" rel="noopener noreferrer">
            <img src={ad.imageUrl} alt={ad.title} style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'block' }} />
          </a>
        ) : (
          <img src={ad.imageUrl} alt={ad.title} style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'block' }} />
        )}
      </div>
    </div>
  );
}

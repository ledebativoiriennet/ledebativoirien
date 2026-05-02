import { prisma } from "@/lib/prisma";
import GlobalAdPopup from "./GlobalAdPopup";

export default async function PopupAd() {
  const now = new Date();
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  try {
    // @ts-ignore
    const ad = await prisma.advertisement.findFirst({
      where: {
        slot: "GLOBAL_POPUP",
        status: "ACTIVE",
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: startOfDay } },
          { startDate: { lte: now }, endDate: { gte: startOfDay } },
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!ad) return null;

    const targetUrl = ad.linkUrl ? `/api/ad-click?id=${ad.id}&url=${encodeURIComponent(ad.linkUrl)}` : null;

    return (
      <GlobalAdPopup>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          {targetUrl ? (
            <a href={targetUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', maxWidth: '100%' }}>
              <img src={ad.imageUrl} alt={ad.title} style={{ maxWidth: '100%', maxHeight: '85vh', height: 'auto', borderRadius: '8px', display: 'block', objectFit: 'contain' }} />
            </a>
          ) : (
            <img src={ad.imageUrl} alt={ad.title} style={{ maxWidth: '100%', maxHeight: '85vh', height: 'auto', borderRadius: '8px', display: 'block', objectFit: 'contain' }} />
          )}
        </div>
      </GlobalAdPopup>
    );
  } catch (error) {
    console.error("Failed to load popup ad:", error);
    return null;
  }
}

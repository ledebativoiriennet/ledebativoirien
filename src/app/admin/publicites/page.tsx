import { prisma } from "@/lib/prisma";
import AdsClient from "./AdsClient";

export default async function PublicitesPage() {
  // @ts-ignore
  const ads = await prisma.advertisement.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const siteSettings = await prisma.siteSettings.findUnique({
    where: { id: "global" }
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', color: '#0f172a' }}>Régie Publicitaire</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Gérez les bannières publicitaires et leurs emplacements sur le site.</p>
      
      <AdsClient initialAds={ads} siteSettings={siteSettings} />
    </div>
  );
}

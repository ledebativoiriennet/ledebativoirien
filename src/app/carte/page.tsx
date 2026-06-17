import { prisma } from "@/lib/prisma";
import InteractiveMap from "@/components/InteractiveMap";

export const metadata = {
  title: "Carte d'Actualité Interactive - Le Débat Ivoirien",
  description: "Découvrez les actualités de la Côte d'Ivoire région par région grâce à notre carte interactive.",
};

export const revalidate = 300; // 5 minutes

export default async function CartePage() {
  const articles = await prisma.article.findMany({
    where: {
      publishedAt: { not: null, lte: new Date() },
      region: { not: null }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      region: true,
      publishedAt: true
    },
    orderBy: { publishedAt: 'desc' },
    take: 100 // Limit to recent localized news
  });

  return (
    <div className="container" style={{ margin: '4rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--foreground)', marginBottom: '1rem', lineHeight: 1.2 }}>
          L'Actualité en Côte d'Ivoire
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--muted)', maxWidth: '700px', margin: '0 auto' }}>
          Explorez les dernières dépêches et articles par région. Cliquez sur une ville pour voir les informations locales.
        </p>
      </div>

      <InteractiveMap articles={articles as any} />
      
    </div>
  );
}

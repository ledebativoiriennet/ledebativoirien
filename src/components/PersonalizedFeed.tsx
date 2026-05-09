import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getArticleImage } from "@/lib/utils";

export default async function PersonalizedFeed() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  const userId = (session.user as any).id;
  if (!userId) return null;

  // 1. Récupérer l'historique de lecture
  const history = await prisma.readingHistory.findMany({
    where: { userId },
    include: {
      article: {
        include: { categories: true }
      }
    },
    orderBy: { readAt: 'desc' },
    take: 15
  });

  if (history.length === 0) return null;

  // 2. Extraire les catégories préférées
  const categoryCount: Record<string, number> = {};
  const readArticleIds = new Set<string>();

  history.forEach(item => {
    readArticleIds.add(item.articleId);
    item.article.categories.forEach(cat => {
      categoryCount[cat.id] = (categoryCount[cat.id] || 0) + 1;
    });
  });

  const topCategoryIds = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(entry => entry[0]);

  // 3. Récupérer les recommandations
  const recommendations = await prisma.article.findMany({
    where: {
      publishedAt: { not: null },
      categories: { some: { id: { in: topCategoryIds } } },
      id: { notIn: Array.from(readArticleIds) }
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    include: { categories: true }
  });

  if (recommendations.length === 0) return null;

  return (
    <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "1.5rem" }}>
      <h2 className="portal-section-title" style={{ backgroundColor: "var(--primary)", borderColor: "#b91c1c", color: "white", fontSize: '0.9rem' }}>
        ✨ RECOMMANDÉ POUR VOUS
      </h2>
      <div style={{ padding: "0" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {recommendations.map((article) => {
            const imgUrl = getArticleImage(article);
            return (
              <li key={article.id} style={{ borderBottom: "1px solid var(--border)", padding: "0.75rem 1rem" }}>
                <Link href={`/article/${article.slug}`} style={{ display: "flex", gap: "0.75rem", textDecoration: 'none' }}>
                  <div style={{ width: "60px", height: "60px", backgroundColor: "#f1f5f9", flexShrink: 0, borderRadius: "4px", overflow: "hidden" }}>
                    {imgUrl && <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--primary)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                      {article.categories[0]?.name || "À LIRE"}
                    </div>
                    <h3 style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.2 }}>
                      {article.title}
                    </h3>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

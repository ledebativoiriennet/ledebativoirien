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

  // 1. Récupérer l'historique de lecture de l'utilisateur
  const history = await prisma.readingHistory.findMany({
    where: { userId },
    include: {
      article: {
        include: { categories: true }
      }
    },
    orderBy: { readAt: 'desc' },
    take: 20
  });

  if (history.length === 0) {
    return null; // Ne rien afficher s'il n'a encore rien lu
  }

  // 2. Extraire les catégories les plus lues
  const categoryCount: Record<string, number> = {};
  const readArticleIds = new Set<string>();

  history.forEach(item => {
    readArticleIds.add(item.articleId);
    item.article.categories.forEach(cat => {
      categoryCount[cat.id] = (categoryCount[cat.id] || 0) + 1;
    });
  });

  // Trier les catégories par fréquence
  const topCategoryIds = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);

  if (topCategoryIds.length === 0) return null;

  // 3. Récupérer les recommandations d'articles (pas encore lus)
  const recommendations = await prisma.article.findMany({
    where: {
      publishedAt: { not: null },
      categories: { some: { id: { in: topCategoryIds } } },
      id: { notIn: Array.from(readArticleIds) }
    },
    orderBy: { publishedAt: 'desc' },
    take: 4,
    include: { categories: true }
  });

  if (recommendations.length === 0) {
    return null; // Pas assez de contenu pertinent à recommander
  }

  return (
    <div style={{ backgroundColor: "var(--card-bg)", border: "2px solid var(--primary)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "2rem", boxShadow: "0 4px 15px rgba(236, 26, 36, 0.1)" }}>
      <h2 className="portal-section-title" style={{ backgroundColor: "var(--primary)", borderColor: "#b91c1c", color: "white", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        ✨ Recommandé pour vous
      </h2>
      <div style={{ padding: "1rem" }}>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1rem" }}>
          Sélectionné spécialement pour vous en fonction de vos lectures récentes.
        </p>
        <div className="grid-responsive-2col">
          {recommendations.map((article) => {
            const imgUrl = getArticleImage(article);
            return (
              <Link href={`/article/${article.slug}`} key={article.id} style={{ display: "flex", gap: "0.75rem", backgroundColor: "#f8fafc", padding: "0.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", transition: "transform 0.2s" }} className="hover-scale">
                <div style={{ width: "80px", height: "80px", backgroundColor: "var(--muted)", flexShrink: 0, overflow: "hidden", borderRadius: "4px" }}>
                  {imgUrl && <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.65rem", color: "var(--primary)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                    {article.categories[0]?.name || "Général"}
                  </div>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.3 }}>{article.title}</h3>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}

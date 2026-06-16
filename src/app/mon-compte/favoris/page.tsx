import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";

export const metadata = {
  title: "Mes Favoris - Le Débat Ivoirien",
};

export default async function FavorisPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/mon-compte/favoris");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      bookmarks: {
        include: {
          article: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.5rem" }}>Mes Favoris</h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
        Retrouvez ici tous les articles que vous avez sauvegardés pour lire plus tard.
      </p>

      {user.bookmarks.length === 0 ? (
        <div style={{ 
          padding: "3rem", 
          backgroundColor: "var(--card-bg)", 
          border: "1px dashed var(--border)", 
          borderRadius: "var(--radius)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>📑</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Aucun favori pour le moment</h2>
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
            Cliquez sur l'icône marque-page sur les articles pour les sauvegarder ici.
          </p>
          <Link href="/" className="btn btn-primary">
            Découvrir des articles
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {user.bookmarks.map((bookmark) => {
            const article = bookmark.article;
            // Clean URL for display
            let cleanImageUrl = article.imageUrl;
            if (cleanImageUrl && cleanImageUrl.includes("ledebativoirien.africanewsquick.net")) {
              cleanImageUrl = cleanImageUrl.replace(/http(s)?:\/\/ledebativoirien\.africanewsquick\.net/g, "https://ledebativoirien.net");
            }

            return (
              <div key={bookmark.id} style={{ 
                display: "flex", 
                gap: "1.5rem", 
                padding: "1.5rem", 
                backgroundColor: "var(--card-bg)", 
                border: "1px solid var(--border)", 
                borderRadius: "var(--radius)",
                flexDirection: "column",
                position: "relative"
              }}>
                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                  {cleanImageUrl && (
                    <div style={{ width: "150px", height: "100px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, backgroundColor: "#f1f5f9" }}>
                      <SafeImage src={cleanImageUrl} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: "250px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      {article.isPremium && <span className="premium-badge" style={{ fontSize: "0.6rem" }}>PREMIUM</span>}
                      {article.isConfidentiel && <span style={{ backgroundColor: '#7f1d1d', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 'bold' }}>CONFIDENTIEL</span>}
                      <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                        {new Date(article.publishedAt || new Date()).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    
                    <Link href={`/article/${article.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.3, marginBottom: "0.5rem" }} className="hover-primary">
                        {article.title}
                      </h3>
                    </Link>
                    
                    {article.excerpt && (
                      <p style={{ fontSize: "0.9rem", color: "var(--muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

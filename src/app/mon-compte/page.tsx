import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardAbonne() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: { 
      subscriptions: true,
      readingHistory: {
        include: { 
          article: {
            include: { categories: true }
          }
        },
        orderBy: { readAt: 'desc' },
        take: 10
      },
      _count: {
        select: { readingHistory: true, articleLikes: true }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  const activeSubscriptions = user.subscriptions.filter(s => s.status === 'ACTIVE');
  const isPremium = activeSubscriptions.length > 0 || user.role === 'ADMIN' || user.role === 'EDITOR';

  // 1. Extraire les catégories des articles lus
  const readCategoryIds = new Set<string>();
  user.readingHistory.forEach(history => {
    history.article.categories.forEach(cat => readCategoryIds.add(cat.id));
  });

  // 2. Récupérer les recommandations
  let recommendations: any[] = [];
  if (readCategoryIds.size > 0) {
    recommendations = await prisma.article.findMany({
      where: {
        publishedAt: { not: null },
        categories: { some: { id: { in: Array.from(readCategoryIds) } } },
        id: { notIn: user.readingHistory.map(h => h.article.id) } // Exclure ce qui a déjà été lu
      },
      take: 4,
      orderBy: { publishedAt: 'desc' },
      include: { categories: true }
    });
  }

  // Si pas de recommandations (ou si l'utilisateur a tout lu), on prend les articles récents
  if (recommendations.length === 0) {
    recommendations = await prisma.article.findMany({
      where: { publishedAt: { not: null } },
      take: 4,
      orderBy: { publishedAt: 'desc' },
      include: { categories: true }
    });
  }

  return (
    <div className="container" style={{ margin: '4rem auto' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--foreground)' }}>Mon Compte</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '2rem' }}>
        {/* Colonne Profil */}
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 1rem auto' }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{user.name}</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{user.email}</p>
          
          {isPremium ? (
             <span style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '1.5rem' }}>⭐ Membre Premium</span>
          ) : (
             <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '1.5rem' }}>Lecteur Gratuit</span>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <Link href="/mon-compte/favoris" className="btn btn-secondary" style={{ display: 'block', width: '100%', padding: '0.75rem' }}>
              📑 Mes Favoris
            </Link>
          </div>
        </div>

        {/* Colonne Principale : Abonnements & Historique */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          {/* Statistiques Rapides */}
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>Mes Statistiques</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--foreground)' }}>{user._count.readingHistory}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>Articles lus</div>
              </div>
              <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#dc2626' }}>{user._count.articleLikes}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>Réactions (J'aime)</div>
              </div>
            </div>
          </div>

          {/* Abonnements */}
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>Mes Abonnements</h3>
          
          {activeSubscriptions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeSubscriptions.map(sub => (
                <div key={sub.id} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid #10b981', borderRadius: 'var(--radius)', padding: '1.5rem', borderLeftWidth: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{sub.plan}</h4>
                    <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>ACTIF</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                    Souscrit le : {new Date(sub.startDate).toLocaleDateString("fr-FR")}
                  </p>
                  {sub.endDate && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                      Expire le : {new Date(sub.endDate).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--card-bg)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Vous n'avez aucun abonnement actif.</p>
              <Link href="/abonnement" className="btn btn-primary">Découvrir nos offres Premium</Link>
            </div>
          )}
          </div>

          {/* Historique de Lecture */}
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>Derniers articles consultés</h3>
            
            {user.readingHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {user.readingHistory.map(history => (
                  <Link href={`/article/${history.article.slug}`} key={history.id} style={{ display: 'block', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', textDecoration: 'none', color: 'inherit', transition: 'all 0.2s ease' }} className="article-card">
                    <h4 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.25rem', lineHeight: 1.3 }}>{history.article.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Lu le {new Date(history.readAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--muted)' }}>Vous n'avez pas encore lu d'articles.</p>
            )}
          </div>
          
          
        </div>

        {/* Colonne de Droite : Recommandations */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>Vous pourriez aimer</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recommendations.map(article => (
              <Link href={`/article/${article.slug}`} key={article.id} style={{ display: 'block', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', textDecoration: 'none', color: 'inherit', transition: 'all 0.2s ease' }} className="article-card">
                <div style={{ padding: '1rem' }}>
                  {article.categories.length > 0 && (
                     <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
                       {article.categories[0].name}
                     </span>
                  )}
                  <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>{article.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

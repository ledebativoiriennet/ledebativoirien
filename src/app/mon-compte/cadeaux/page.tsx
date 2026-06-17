import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CadeauxPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: {
      giftLinks: {
        include: {
          article: true
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
    <div className="container" style={{ margin: '4rem auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/mon-compte" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>
          ← Retour à Mon Compte
        </Link>
      </div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--foreground)' }}>Mes Liens Cadeaux</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>
        En tant qu'abonné Premium, vous pouvez offrir la lecture de vos articles préférés à vos proches.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {user.giftLinks.length > 0 ? (
          user.giftLinks.map(gift => {
            const isExpired = new Date(gift.expiresAt) < new Date();
            const statusColor = isExpired ? 'var(--muted)' : (gift.isUsed ? '#10b981' : 'var(--primary)');
            const statusText = isExpired ? 'Expiré' : (gift.isUsed ? 'Utilisé' : 'Actif');

            return (
              <div key={gift.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--card-bg)', border: `1px solid var(--border)`, borderLeft: `4px solid ${statusColor}`, borderRadius: 'var(--radius)', padding: '1.5rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    <Link href={`/article/${gift.article.slug}`} style={{ color: 'var(--foreground)', textDecoration: 'none' }}>
                      {gift.article.title}
                    </Link>
                  </h3>
                  <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                    <span>Créé le : {new Date(gift.createdAt).toLocaleDateString("fr-FR")}</span>
                    <span>Expire le : {new Date(gift.expiresAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                  {!isExpired && !gift.isUsed && (
                     <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.85rem', userSelect: 'all' }}>
                        {process.env.NEXT_PUBLIC_APP_URL || 'https://ledebativoirien.net'}/article/{gift.article.slug}?gift={gift.token}
                     </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                   <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: isExpired ? '#f1f5f9' : (gift.isUsed ? '#ecfdf5' : '#eff6ff'), color: statusColor }}>
                     {statusText}
                   </span>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ backgroundColor: 'var(--card-bg)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', padding: '4rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginBottom: '1rem' }}>Vous n'avez pas encore généré de lien cadeau.</p>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Lisez un article Premium et cliquez sur l'icône Cadeau pour l'offrir.</p>
          </div>
        )}
      </div>
    </div>
  );
}

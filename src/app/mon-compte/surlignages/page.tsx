import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SurlignagesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: {
      highlights: {
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
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--foreground)' }}>Mes Surlignages</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {user.highlights.length > 0 ? (
          user.highlights.map(highlight => (
            <div key={highlight.id} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderLeft: '4px solid var(--primary)', borderRadius: 'var(--radius)', padding: '2rem' }}>
              <blockquote style={{ fontSize: '1.2rem', fontStyle: 'italic', margin: '0 0 1.5rem 0', color: 'var(--foreground)', lineHeight: 1.6 }}>
                "{highlight.text}"
              </blockquote>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 'bold' }}>Tiré de l'article :</p>
                  <Link href={`/article/${highlight.article.slug}`} style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', textDecoration: 'none' }}>
                    {highlight.article.title}
                  </Link>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  Surligné le {new Date(highlight.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ backgroundColor: 'var(--card-bg)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', padding: '4rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginBottom: '1rem' }}>Vous n'avez pas encore de surlignages.</p>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Sélectionnez du texte dans un article pour le sauvegarder ici.</p>
          </div>
        )}
      </div>
    </div>
  );
}

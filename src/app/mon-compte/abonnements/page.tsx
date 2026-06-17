import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AbonnementsAlertesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: {
      authorSubscriptions: {
        include: {
          author: true
        }
      },
      tagSubscriptions: {
        include: {
          tag: true
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
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--foreground)' }}>Abonnements & Alertes</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>
        Gérez vos abonnements aux auteurs et aux mots-clés pour recevoir des alertes par email.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Auteurs */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>Mes Auteurs Favoris</h2>
          {user.authorSubscriptions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {user.authorSubscriptions.map(sub => (
                <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
                  <div style={{ fontWeight: 'bold' }}>{sub.author.name}</div>
                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>Se désabonner</button>
                </div>
              ))}
            </div>
          ) : (
             <div style={{ backgroundColor: 'var(--card-bg)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center' }}>
               <p style={{ color: 'var(--muted)' }}>Vous n'êtes abonné à aucun auteur.</p>
             </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>Mes Sujets (Mots-clés)</h2>
          {user.tagSubscriptions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {user.tagSubscriptions.map(sub => (
                <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
                  <div style={{ fontWeight: 'bold' }}>#{sub.tag.name}</div>
                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>Se désabonner</button>
                </div>
              ))}
            </div>
          ) : (
             <div style={{ backgroundColor: 'var(--card-bg)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center' }}>
               <p style={{ color: 'var(--muted)' }}>Vous ne suivez aucun mot-clé.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

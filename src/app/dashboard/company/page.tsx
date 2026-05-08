import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CompanyDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: { company: { include: { users: true, purchases: { include: { digitalNewspaper: true } } } } }
  });

  if (!user?.company) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h1>Accès réservé aux entreprises</h1>
        <p>Vous n'êtes actuellement lié à aucune entreprise partenaire.</p>
        <Link href="/offres-entreprises" className="btn btn-primary" style={{ marginTop: '2rem' }}>
          Découvrir nos offres B2B
        </Link>
      </div>
    );
  }

  const company = user.company;
  const isAdmin = (user.role === 'ADMIN' || user.role === 'COMPANY_ADMIN');

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>Espace Entreprise : {company.name}</h1>
          <p style={{ color: 'var(--muted)' }}>Gérez vos accès collaborateurs et vos ressources numériques.</p>
        </div>
        <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold' }}>
          Plan : {company.plan}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Collaborators Card */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Collaborateurs ({company.users.length}/{company.maxUsers})</h2>
            {isAdmin && <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>+ Inviter</button>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {company.users.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{u.name || 'Utilisateur'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{u.email}</div>
                </div>
                <div style={{ fontSize: '0.7rem', color: u.role === 'COMPANY_ADMIN' ? 'var(--primary)' : 'var(--muted)', fontWeight: 'bold' }}>
                  {u.role}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kiosque Card */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Bibliothèque PDF</h2>
          {company.purchases.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
              {company.purchases.map(p => (
                <Link href={`/marketplace/download/${p.downloadToken}`} key={p.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '100%', aspectRatio: '3/4', backgroundColor: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.5rem', border: '1px solid #e2e8f0' }}>
                      {p.digitalNewspaper.coverImageUrl && <img src={p.digitalNewspaper.coverImageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.digitalNewspaper.title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
              Aucun journal téléchargé.
              <Link href="/marketplace" style={{ display: 'block', marginTop: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>Aller à la boutique →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Placeholder */}
      <div style={{ marginTop: '3rem', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Veille Stratégique (Beta)</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Bientôt disponible : Suivez les thématiques les plus consultées par vos équipes pour orienter votre veille.</p>
        <div style={{ height: '100px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          Graphique d'engagement des lecteurs
        </div>
      </div>
    </div>
  );
}

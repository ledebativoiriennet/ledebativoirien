import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewsletterAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>Abonnés Newsletter ({subscribers.length})</h1>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Email</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Date d'inscription</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map(sub => (
              <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold', color: '#0f172a' }}>{sub.email}</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{new Date(sub.createdAt).toLocaleDateString('fr-FR')}</td>
                <td style={{ padding: '1rem' }}>
                  {sub.isActive ? (
                    <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Actif</span>
                  ) : (
                    <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Désinscrit</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>ℹ️ Envoi automatique</h3>
        <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
          La newsletter est configurée pour s'envoyer automatiquement tous les jours à 20h00 via la route CRON <code>/api/cron/newsletter</code>. 
          Elle récupère tous les articles publiés dans la journée et envoie un beau résumé HTML à tous les abonnés actifs ci-dessus.
        </p>
      </div>
    </div>
  );
}

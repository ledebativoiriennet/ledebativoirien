import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLogsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') {
    redirect("/admin");
  }

  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const perPage = 50;

  const [logs, totalLogs] = await Promise.all([
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * perPage,
      take: perPage,
    }),
    prisma.activityLog.count()
  ]);

  const totalPages = Math.ceil(totalLogs / perPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>📜 Journal d'Activité</h1>
        <div style={{ fontSize: '0.9rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold' }}>
          {totalLogs} événements enregistrés
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Utilisateur</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Action</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Ressource</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Localisation</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Équipement</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{log.userName || 'Système'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.userEmail || '-'}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    backgroundColor: log.action.includes('DELETE') ? '#fee2e2' : log.action === 'LOGIN' ? '#ecfdf5' : '#eff6ff',
                    color: log.action.includes('DELETE') ? '#991b1b' : log.action === 'LOGIN' ? '#065f46' : '#1e40af',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '0.7rem'
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ color: '#334155', fontWeight: 500 }}>{log.resource || '-'}</div>
                  {log.details && <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>{log.details}</div>}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ color: '#334155' }}>{log.ipAddress}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {log.city || 'Ville inconnue'}, {log.country || 'Pays inconnu'}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{log.device === 'Mobile' ? '📱' : log.device === 'Tablet' ? '平板' : '💻'}</span>
                    <span>{log.browser} / {log.os}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                  {new Date(log.createdAt).toLocaleString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination compacte */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          {currentPage > 1 && (
            <Link href={`/admin/logs?page=${currentPage - 1}`} style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #cbd5e1', textDecoration: 'none', color: '#475569' }}>Précédent</Link>
          )}
          <span style={{ fontWeight: 'bold' }}>Page {currentPage} sur {totalPages}</span>
          {currentPage < totalPages && (
            <Link href={`/admin/logs?page=${currentPage + 1}`} style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #cbd5e1', textDecoration: 'none', color: '#475569' }}>Suivant</Link>
          )}
        </div>
      )}
    </div>
  );
}

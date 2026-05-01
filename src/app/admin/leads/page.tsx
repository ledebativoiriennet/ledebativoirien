import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLeads() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') {
    redirect("/admin"); // Editors cannot access this
  }

  const leads = await prisma.adInquiry.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem', color: '#0f172a' }}>Leads Annonceurs</h1>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Date</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Entreprise</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Contact</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Format souhaité</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Message</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Aucune demande pour le moment.</td></tr>
            ) : leads.map(lead => (
              <tr key={lead.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                  {new Date(lead.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td style={{ padding: '1rem', fontWeight: 'bold', color: '#0f172a' }}>
                  {lead.company}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ color: '#0f172a' }}>{lead.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#3b82f6' }}>{lead.email}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{lead.phone}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {lead.format || 'Non spécifié'}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#475569', maxWidth: '300px' }}>
                  {lead.message ? (
                    <div style={{ maxHeight: '60px', overflowY: 'auto' }}>{lead.message}</div>
                  ) : (
                    <span style={{ color: '#cbd5e1' }}>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

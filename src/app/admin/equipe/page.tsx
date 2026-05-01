import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TeamForm from "./TeamForm";
import RevokeButton from "./RevokeButton";

export default async function EquipePage() {
  const session = await getServerSession(authOptions);
  
  // Double vérification que c'est bien un ADMIN qui accède à la page
  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email as string },
    select: { role: true, id: true }
  });

  if (dbUser?.role !== "ADMIN") {
    redirect("/admin"); // Les Éditeurs ne peuvent pas voir l'équipe
  }

  const teamMembers = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "EDITOR", "CONTRIBUTOR"] }
    },
    orderBy: [
      { role: "asc" },
      { createdAt: "desc" }
    ],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem', color: '#0f172a' }}>Gestion de l'Équipe</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Liste des membres actuels */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            Membres Actuels ({teamMembers.length})
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem' }}>Nom & Email</th>
                  <th style={{ padding: '1rem' }}>Rôle</th>
                  <th style={{ padding: '1rem' }}>Date d'ajout</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{member.name || 'Utilisateur'}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{member.email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '999px', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold',
                        backgroundColor: member.role === 'ADMIN' ? '#fee2e2' : member.role === 'EDITOR' ? '#e0e7ff' : '#fef3c7',
                        color: member.role === 'ADMIN' ? '#991b1b' : member.role === 'EDITOR' ? '#3730a3' : '#92400e'
                      }}>
                        {member.role === 'ADMIN' ? 'Administrateur' : member.role === 'EDITOR' ? 'Éditeur' : 'Contributeur'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>
                      {new Date(member.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {member.id !== dbUser.id ? (
                        <RevokeButton userId={member.id} userName={member.name || member.email!} />
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Vous-même</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formulaire d'ajout */}
        <TeamForm />
        
      </div>
    </div>
  );
}

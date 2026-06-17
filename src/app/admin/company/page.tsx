import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminCompanyPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const companies = await prisma.company.findMany({
    include: {
      _count: {
        select: { users: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container" style={{ padding: "4rem 1rem" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "2rem", color: "var(--foreground)" }}>Administration B2B (Entreprises)</h1>
      <p style={{ color: "var(--muted)", marginBottom: "3rem", fontSize: "1.1rem" }}>
        Gérez les abonnements de groupe et l'utilisation des licences par entreprise.
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "var(--card-bg)", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
          <thead style={{ backgroundColor: "var(--primary)", color: "white", textAlign: "left" }}>
            <tr>
              <th style={{ padding: "1rem" }}>Nom de l'entreprise</th>
              <th style={{ padding: "1rem" }}>Email / Domaine</th>
              <th style={{ padding: "1rem" }}>Utilisateurs Actifs</th>
              <th style={{ padding: "1rem" }}>Licences Max</th>
              <th style={{ padding: "1rem" }}>Statut</th>
              <th style={{ padding: "1rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(company => {
              const isOverLimit = company._count.users >= company.maxUsers;
              const usagePercentage = Math.round((company._count.users / company.maxUsers) * 100);

              return (
                <tr key={company.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem", fontWeight: "bold" }}>{company.name}</td>
                  <td style={{ padding: "1rem", color: "var(--muted)" }}>{company.email}</td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>{company._count.users}</span>
                      <div style={{ width: "60px", height: "6px", backgroundColor: "var(--muted)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(usagePercentage, 100)}%`, height: "100%", backgroundColor: isOverLimit ? "#ef4444" : "#22c55e" }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>{company.maxUsers}</td>
                  <td style={{ padding: "1rem" }}>
                    {isOverLimit ? (
                      <span style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold" }}>Saturé</span>
                    ) : (
                      <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold" }}>OK</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <button className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>Modifier</button>
                  </td>
                </tr>
              );
            })}
            {companies.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>Aucune entreprise B2B enregistrée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

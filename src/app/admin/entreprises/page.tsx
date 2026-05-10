import { prisma } from "@/lib/prisma";
import CompanyClient from "./CompanyClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EntreprisesPage() {
  const session = await getServerSession(authOptions);
  
  // Restriction supplémentaire aux ADMIN
  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email as string },
    select: { role: true }
  });
  
  if (dbUser?.role !== "ADMIN") {
    redirect("/admin");
  }

  const items = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { users: true, purchases: true }
      }
    }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem' }}>🏢 Entreprises B2B</h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Gérez les comptes entreprises pour les offres d'abonnement groupé et les achats en volume.
      </p>
      
      <CompanyClient items={items} />
    </div>
  );
}

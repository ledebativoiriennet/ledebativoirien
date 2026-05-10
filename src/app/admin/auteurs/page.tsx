import { prisma } from "@/lib/prisma";
import AuthorClient from "./AuthorClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuteursPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  
  if (role !== "ADMIN") {
    redirect("/admin");
  }

  const items = await prisma.author.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { articles: true, subscribers: true }
      }
    }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem' }}>✍️ Auteurs & Rédacteurs</h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Gérez les profils des journalistes. L'email permet de lier automatiquement un article au compte de connexion.
      </p>
      
      <AuthorClient items={items} />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import CategoryClient from "./CategoryClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  
  if (role !== "ADMIN" && role !== "EDITOR") {
    redirect("/admin");
  }

  const items = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      parent: true,
      _count: {
        select: { articles: true, children: true }
      }
    }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem' }}>📁 Catégories</h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Gérez l'arborescence des rubriques de vos articles.
      </p>
      
      <CategoryClient items={items} />
    </div>
  );
}

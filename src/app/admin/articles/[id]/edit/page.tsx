import { prisma } from "@/lib/prisma";
import EditArticleForm from "./EditArticleForm";
import { notFound } from "next/navigation";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const article = await prisma.article.findUnique({
    where: { id },
    include: { 
      categories: true,
      tags: true
    }
  });

  if (!article) return notFound();

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  return <EditArticleForm article={article} categories={categories} />;
}

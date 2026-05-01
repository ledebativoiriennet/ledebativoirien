import { prisma } from "@/lib/prisma";
import CreateArticleForm from "./CreateArticleForm";

export default async function CreateArticlePage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  return <CreateArticleForm categories={categories} />;
}

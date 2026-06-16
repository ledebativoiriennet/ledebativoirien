import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import LiveAdminClient from "./LiveAdminClient";

export default async function LiveBlogAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      isLiveBlog: true,
      slug: true,
    }
  });

  if (!article) return notFound();
  if (!article.isLiveBlog) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Cet article n'est pas configuré pour le Live Blog.</h1>
        <p>Activez l'option "Activer le Live Blog" dans l'édition de l'article.</p>
      </div>
    );
  }

  const initialUpdates = await prisma.liveUpdate.findMany({
    where: { articleId: id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <LiveAdminClient article={article} initialUpdates={initialUpdates} />
  );
}

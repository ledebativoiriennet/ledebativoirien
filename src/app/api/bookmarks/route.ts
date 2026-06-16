import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { articleId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId: user.id,
          articleId: articleId,
        },
      },
    });

    if (existingBookmark) {
      // Retirer des favoris
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      return NextResponse.json({ bookmarked: false, message: "Article retiré des favoris." });
    } else {
      // Ajouter aux favoris
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          articleId: articleId,
        },
      });
      return NextResponse.json({ bookmarked: true, message: "Article ajouté aux favoris." });
    }
  } catch (error) {
    console.error("Erreur API Bookmark:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const url = new URL(req.url);
    const articleId = url.searchParams.get("articleId");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) return NextResponse.json({ bookmarked: false });

    if (articleId) {
      // Vérifier si un article spécifique est en favoris
      const bookmark = await prisma.bookmark.findUnique({
        where: {
          userId_articleId: {
            userId: user.id,
            articleId: articleId,
          },
        },
      });
      return NextResponse.json({ bookmarked: !!bookmark });
    } else {
      // Retourner tous les favoris
      const bookmarks = await prisma.bookmark.findMany({
        where: { userId: user.id },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              imageUrl: true,
              excerpt: true,
              publishedAt: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(bookmarks);
    }
  } catch (error) {
    console.error("Erreur API GET Bookmark:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

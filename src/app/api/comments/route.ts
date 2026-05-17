import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");

  if (!articleId) {
    return NextResponse.json({ error: "articleId is required" }, { status: 400 });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { 
        articleId,
        isActive: true // Only fetch active comments
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Vous devez être connecté pour publier un commentaire." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { articleId, content } = body;

    if (!articleId || !content || content.trim().length === 0) {
      return NextResponse.json({ error: "L'article et le contenu sont requis." }, { status: 400 });
    }

    // 2. Create the comment as inactive (pending validation)
    const newComment = await prisma.comment.create({
      data: {
        articleId,
        userId,
        content: content.trim(),
        isActive: false // Requires admin validation
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Votre commentaire a été envoyé et est en attente de validation par un modérateur.",
      comment: newComment 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Une erreur est survenue lors de la publication." }, { status: 500 });
  }
}

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

    const { articleId, text, context } = await req.json();

    if (!text || !articleId) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

    const highlight = await prisma.highlight.create({
      data: {
        userId: user.id,
        articleId,
        text,
        context
      }
    });

    return NextResponse.json({ message: "Surlignage sauvegardé", highlight });
  } catch (error) {
    console.error("Highlight POST error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

    const highlights = await prisma.highlight.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        article: { select: { title: true, slug: true } }
      }
    });

    return NextResponse.json({ highlights });
  } catch (error) {
    console.error("Highlight GET error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

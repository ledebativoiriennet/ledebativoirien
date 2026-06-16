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

    const { type, targetId, action } = await req.json(); // type: "author" | "tag", action: "follow" | "unfollow"

    if (!type || !targetId || !action) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true },
    });

    if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

    if (type === "author") {
      if (action === "follow") {
        await prisma.authorSubscriber.upsert({
          where: { email_authorId: { email: user.email!, authorId: targetId } },
          update: { userId: user.id },
          create: { email: user.email!, userId: user.id, authorId: targetId }
        });
      } else {
        await prisma.authorSubscriber.deleteMany({
          where: { email: user.email!, authorId: targetId }
        });
      }
    } else if (type === "tag") {
      if (action === "follow") {
        await prisma.tagSubscriber.upsert({
          where: { userId_tagId: { userId: user.id, tagId: targetId } },
          update: {},
          create: { userId: user.id, tagId: targetId }
        });
      } else {
        await prisma.tagSubscriber.deleteMany({
          where: { userId: user.id, tagId: targetId }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Follow POST error:", error);
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
      select: { id: true, email: true },
    });

    if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

    const authorSubs = await prisma.authorSubscriber.findMany({
      where: { userId: user.id },
      select: { authorId: true }
    });

    const tagSubs = await prisma.tagSubscriber.findMany({
      where: { userId: user.id },
      select: { tagId: true }
    });

    return NextResponse.json({ 
      authors: authorSubs.map(s => s.authorId),
      tags: tagSubs.map(s => s.tagId)
    });
  } catch (error) {
    console.error("Follow GET error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

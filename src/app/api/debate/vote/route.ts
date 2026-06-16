import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { argumentId } = await req.json();
    if (!argumentId) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Check if user already voted for this argument
    const existingVote = await prisma.argumentVote.findUnique({
      where: {
        argumentId_userId: {
          argumentId,
          userId
        }
      }
    });

    if (existingVote) {
      return NextResponse.json({ error: "Déjà voté" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.argumentVote.create({
        data: { argumentId, userId }
      }),
      prisma.debateArgument.update({
        where: { id: argumentId },
        data: { votes: { increment: 1 } }
      })
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error DebateVote:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

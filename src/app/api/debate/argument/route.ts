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

    const { debateId, content, type } = await req.json();

    if (!debateId || !content || !type) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const argument = await prisma.debateArgument.create({
      data: {
        debateId,
        userId: (session.user as any).id,
        content,
        type,
      },
      include: {
        user: { select: { name: true } }
      }
    });

    return NextResponse.json(argument, { status: 201 });
  } catch (error) {
    console.error("Error DebateArgument:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

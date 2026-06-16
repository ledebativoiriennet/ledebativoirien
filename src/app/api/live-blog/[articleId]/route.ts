import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ articleId: string }> }) {
  try {
    const { articleId } = await params;
    const updates = await prisma.liveUpdate.findMany({
      where: { articleId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(updates);
  } catch (error) {
    console.error("Error LiveBlog GET:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

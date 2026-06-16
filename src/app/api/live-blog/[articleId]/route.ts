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

export async function POST(req: Request, { params }: { params: Promise<{ articleId: string }> }) {
  try {
    const { articleId } = await params;
    const body = await req.json();
    const { content, author, createdAt } = body;

    if (!content) {
      return NextResponse.json({ error: "Le contenu est obligatoire" }, { status: 400 });
    }

    const newUpdate = await prisma.liveUpdate.create({
      data: {
        articleId: articleId,
        content,
        authorName: author,
        createdAt: createdAt ? new Date(createdAt) : new Date()
      }
    });

    return NextResponse.json(newUpdate, { status: 201 });
  } catch (error) {
    console.error("Error LiveBlog POST:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ articleId: string }> }) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "L'ID de la mise à jour est requis" }, { status: 400 });
    }

    await prisma.liveUpdate.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error LiveBlog DELETE:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

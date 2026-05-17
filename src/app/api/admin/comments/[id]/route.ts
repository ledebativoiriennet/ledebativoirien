import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Middleware interne pour vérifier les droits admin/editeur
async function requireAdminOrEditor() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).email) {
    return false;
  }
  
  const dbUser = await prisma.user.findUnique({
    where: { email: (session.user as any).email },
    select: { role: true }
  });

  if (!dbUser || (dbUser.role !== "ADMIN" && dbUser.role !== "EDITOR")) {
    return false;
  }

  return true;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminOrEditor())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { isActive } = body;

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { isActive }
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminOrEditor())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    await prisma.comment.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}

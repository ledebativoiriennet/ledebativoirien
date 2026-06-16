import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { quizId, isPerfect } = await request.json();

    if (!quizId) {
      return NextResponse.json({ error: "Quiz ID manquant" }, { status: 400 });
    }

    // Si le score est parfait, on ajoute 20 points
    if (isPerfect) {
      const user = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          points: {
            increment: 20
          }
        }
      });

      return NextResponse.json({ success: true, points: user.points, message: "Félicitations, 20 points ajoutés !" });
    }

    return NextResponse.json({ success: true, message: "Quiz terminé." });
  } catch (error) {
    console.error("Erreur quiz submit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la soumission du quiz" },
      { status: 500 }
    );
  }
}

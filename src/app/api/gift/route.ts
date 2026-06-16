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
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const isPremium = ["PREMIUM", "CONFIDENTIEL", "ULTIMATE", "EDITOR", "ADMIN"].includes(user.role);
    if (!isPremium) {
      return NextResponse.json({ error: "Seuls les abonnés Premium peuvent offrir un article." }, { status: 403 });
    }

    // Vérifier la limite mensuelle (ex: max 5 cadeaux par mois)
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const giftsThisMonth = await prisma.giftLink.count({
      where: {
        userId: user.id,
        createdAt: { gte: firstDayOfMonth }
      }
    });

    if (giftsThisMonth >= 5) {
      return NextResponse.json({ error: "Vous avez atteint votre limite de 5 articles offerts ce mois-ci." }, { status: 429 });
    }

    // Créer le lien cadeau (valide 7 jours)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const giftLink = await prisma.giftLink.create({
      data: {
        userId: user.id,
        articleId: articleId,
        expiresAt: expiresAt,
      },
    });

    return NextResponse.json({ 
      token: giftLink.token,
      message: "Lien généré avec succès.",
      giftsRemaining: 4 - giftsThisMonth
    });
  } catch (error) {
    console.error("Erreur API Gift:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

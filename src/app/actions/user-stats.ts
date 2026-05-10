"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { headers } from "next/headers";
import crypto from "crypto";

export async function recordArticleView(articleId: string) {
  try {
    const headerList = await headers();
    const ip = headerList.get("x-vercel-ip") || headerList.get("x-forwarded-for") || headerList.get("x-real-ip") || "unknown";
    
    // Hash IP + Date du jour + ArticleId pour dédoublonnage (1 vue max par jour par article par IP)
    const todayStr = new Date().toISOString().split("T")[0];
    const ipHash = crypto.createHash("sha256").update(`${ip}-${todayStr}-${articleId}`).digest("hex");

    // Vérifier si une vue existe déjà aujourd'hui pour cet article/IP
    const existing = await prisma.articleView.findFirst({
      where: { ipHash }
    });

    if (!existing) {
      await prisma.articleView.create({
        data: {
          articleId: articleId,
          ipHash: ipHash
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to record view:", error);
    return { success: false };
  }
}

export async function recordArticleRead(articleId: string) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.id) return { success: false };

  try {
    await prisma.readingHistory.upsert({
      where: {
        userId_articleId: {
          userId: (session!.user as any).id as string,
          articleId: articleId
        }
      },
      update: {
        readAt: new Date()
      },
      create: {
        userId: (session!.user as any).id as string,
        articleId: articleId
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to record read:", error);
    return { success: false };
  }
}

export async function toggleArticleLike(articleId: string) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.id) return { success: false, error: "Non authentifié" };

  try {
    const existingLike = await prisma.articleLike.findUnique({
      where: {
        userId_articleId: {
          userId: (session!.user as any).id as string,
          articleId: articleId
        }
      }
    });

    if (existingLike) {
      await prisma.articleLike.delete({
        where: { id: existingLike.id }
      });
      revalidatePath(`/article/`); // Ideally we'd pass slug but root article path is okay
      return { success: true, liked: false };
    } else {
      await prisma.articleLike.create({
        data: {
          userId: (session!.user as any).id as string,
          articleId: articleId
        }
      });
      revalidatePath(`/article/`);
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

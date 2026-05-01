"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createQuote(text: string, author: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Non autorisé" };

  try {
    const quote = await prisma.quote.create({
      data: { text, author }
    });
    return { success: true, quote };
  } catch (error) {
    return { success: false, error: "Erreur serveur" };
  }
}

export async function toggleQuoteActive(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Non autorisé" };

  try {
    // Désactiver toutes les autres
    await prisma.quote.updateMany({
      where: { id: { not: id } },
      data: { isActive: false }
    });

    // Activer celle-ci
    await prisma.quote.update({
      where: { id },
      data: { isActive: true }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur serveur" };
  }
}

export async function deleteQuote(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Non autorisé" };

  try {
    await prisma.quote.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur serveur" };
  }
}

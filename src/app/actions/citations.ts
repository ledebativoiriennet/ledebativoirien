"use server";

import { prisma } from "@/lib/prisma";
import { checkAdminOrEditor } from "@/lib/auth";

export async function createQuote(text: string, author: string) {
  try {
    await checkAdminOrEditor();
    const quote = await prisma.quote.create({
      data: { text, author }
    });
    return { success: true, quote };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur serveur" };
  }
}

export async function toggleQuoteActive(id: string) {
  try {
    await checkAdminOrEditor();
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
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur serveur" };
  }
}

export async function deleteQuote(id: string) {
  try {
    await checkAdminOrEditor();
    await prisma.quote.delete({
      where: { id }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur serveur" };
  }
}

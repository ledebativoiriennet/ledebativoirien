"use server";

import { prisma } from "@/lib/prisma";

export async function subscribeNewsletter(email: string) {
  if (!email || !email.includes("@")) return { success: false, error: "Email invalide" };

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de l'inscription" };
  }
}

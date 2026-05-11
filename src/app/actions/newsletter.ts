"use server";

import { prisma } from "@/lib/prisma";

export async function subscribeNewsletter(formData: FormData) {
  const email = formData.get("email") as string;
  const honeypot = formData.get("website_url") as string;

  if (honeypot) {
    console.warn("Newsletter subscription blocked by honeypot");
    return { success: false, error: "Bot detected" };
  }

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

export async function subscribeToAuthor(email: string, authorId: string) {
  if (!email || !email.includes("@")) return { success: false, error: "Email invalide" };
  if (!authorId) return { success: false, error: "Auteur introuvable" };

  try {
    // Vérifier si l'auteur existe
    const author = await prisma.author.findUnique({ where: { id: authorId } });
    if (!author) return { success: false, error: "Auteur introuvable" };

    // Créer ou ignorer si déjà abonné
    await prisma.authorSubscriber.upsert({
      where: {
        email_authorId: { email, authorId }
      },
      update: {},
      create: { email, authorId }
    });
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de l'abonnement à l'auteur" };
  }
}

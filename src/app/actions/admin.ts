"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { sendNewArticleNotification } from "@/lib/newsletter";

// Convert a title to a URL-friendly slug
function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function publishArticle(formData: FormData) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "ADMIN" && role !== "EDITOR" && role !== "CONTRIBUTOR") {
    return { success: false, error: "Non autorisé" };
  }

  const title = formData.get("title") as string;
  const excerpt = formData.get("excerpt") as string;
  const content = formData.get("content") as string;
  const isPremium = formData.get("isPremium") === "on";
  const imageFile = formData.get("image") as File | null;
  const categoryIds = formData.getAll("categories") as string[];

  if (!title || !content) {
    return { success: false, error: "Le titre et le contenu sont obligatoires." };
  }

  try {
    let imageUrl = formData.get("imageUrlLink") as string || null;
    
    // Gérer l'upload de l'image si elle est présente (priorité sur le lien externe si uploadé)
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const path = join(process.cwd(), 'public', 'uploads', filename);
      await writeFile(path, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    let slug = generateSlug(title);
    
    // Check if slug exists
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const newArticle = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        imageUrl,
        isPremium,
        publishedAt: role === "CONTRIBUTOR" ? null : new Date(),
        categories: categoryIds.length > 0 ? {
          connect: categoryIds.map(id => ({ id }))
        } : undefined
      }
    });

    // Envoyer la notification si publié immédiatement
    if (role !== "CONTRIBUTOR") {
      sendNewArticleNotification(newArticle.id).catch(console.error);
    }

    return { success: true };
  } catch (error) {
    console.error("Erreur création article:", error);
    return { success: false, error: "Erreur serveur lors de la publication." };
  }
}

export async function approveArticle(articleId: string) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "ADMIN" && role !== "EDITOR") {
    return { success: false, error: "Accès refusé. Seul un Éditeur ou Administrateur peut valider un article." };
  }

  try {
    await prisma.article.update({
      where: { id: articleId },
      data: { publishedAt: new Date() }
    });

    // Envoyer la notification
    sendNewArticleNotification(articleId).catch(console.error);

    return { success: true };
  } catch (error) {
    console.error("Erreur approveArticle:", error);
    return { success: false, error: "Erreur serveur lors de la validation." };
  }
}

export async function toggleArticlePremiumStatus(articleId: string, currentStatus: boolean) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "ADMIN" && role !== "EDITOR") {
    return { success: false, error: "Accès refusé. Seul un Éditeur ou Administrateur peut modifier le statut d'un article." };
  }

  try {
    await prisma.article.update({
      where: { id: articleId },
      data: { isPremium: !currentStatus }
    });
    return { success: true };
  } catch (error) {
    console.error("Erreur toggleArticlePremiumStatus:", error);
    return { success: false, error: "Erreur serveur lors de la modification du statut Premium." };
  }
}

export async function updateArticle(articleId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false, error: "Non autorisé" };

  const title = formData.get("title") as string;
  const excerpt = formData.get("excerpt") as string;
  const content = formData.get("content") as string;
  const isPremium = formData.get("isPremium") === "on";
  const categoryIds = formData.getAll("categories") as string[];

  if (!title || !content) {
    return { success: false, error: "Le titre et le contenu sont obligatoires." };
  }

  let imageUrl = formData.get("existingImageUrl") as string;
  const externalLink = formData.get("imageUrlLink") as string;
  if (externalLink) {
    imageUrl = externalLink;
  }

  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
    const filePath = join(process.cwd(), "public/uploads", filename);
    await writeFile(filePath, buffer);
    imageUrl = `/uploads/${filename}`;
  }

  try {
    await prisma.article.update({
      where: { id: articleId },
      data: {
        title,
        excerpt,
        content,
        imageUrl: imageUrl || null,
        isPremium,
        categories: {
          set: [],
          connect: categoryIds.map(id => ({ id }))
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur updateArticle:", error);
    return { success: false, error: "Erreur lors de la modification de l'article." };
  }
}

export async function unpublishArticle(articleId: string) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "ADMIN" && role !== "EDITOR") {
    return { success: false, error: "Accès refusé. Seul un Éditeur ou Administrateur peut dépublier un article." };
  }

  try {
    await prisma.article.update({
      where: { id: articleId },
      data: { publishedAt: null }
    });
    return { success: true };
  } catch (error) {
    console.error("Erreur unpublishArticle:", error);
    return { success: false, error: "Erreur serveur lors de la dépublication." };
  }
}

export async function deleteArticle(articleId: string) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "ADMIN" && role !== "EDITOR") {
    return { success: false, error: "Accès refusé. Seul un Éditeur ou Administrateur peut supprimer un article." };
  }

  try {
    await prisma.article.delete({
      where: { id: articleId }
    });
    return { success: true };
  } catch (error) {
    console.error("Erreur deleteArticle:", error);
    return { success: false, error: "Erreur serveur lors de la suppression." };
  }
}

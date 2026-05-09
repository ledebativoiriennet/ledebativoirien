"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { saveUpload } from "@/lib/upload";
import { sendNewArticleNotification } from "@/lib/newsletter";
import { sendPushNotification } from "@/lib/push";
import { logActivity } from "@/lib/activity";

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
  const isAudioAvailable = formData.get("isAudioAvailable") === "on";
  const isConfidentiel = formData.get("isConfidentiel") === "on";
  const imageFile = formData.get("image") as File | null;
  const categoryIds = formData.getAll("categories") as string[];
  const tagsString = formData.get("tags") as string || "";

  if (!title || !content) {
    return { success: false, error: "Le titre et le contenu sont obligatoires." };
  }

  try {
    let imageUrl = formData.get("imageUrlLink") as string || null;
    
    // Gérer l'upload de l'image si elle est présente (priorité sur le lien externe si uploadé)
    if (imageFile && imageFile.size > 0) {
      imageUrl = await saveUpload(imageFile);
    }

    let slug = generateSlug(title);
    
    // Check if slug exists
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const videoUrl = formData.get("videoUrl") as string || null;
    const videoFile = formData.get("videoFile") as File | null;
    const imageCaption = formData.get("imageCaption") as string || null;
    const videoCaption = formData.get("videoCaption") as string || null;
    let savedVideoPath = null;

    if (videoFile && videoFile.size > 0) {
      savedVideoPath = await saveUpload(videoFile);
    }

    const newArticle = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        imageUrl,
        imageCaption,
        videoUrl,
        videoFile: savedVideoPath,
        videoCaption,
        isPremium,
        isAudioAvailable,
        isConfidentiel,
        publishedAt: role === "CONTRIBUTOR" ? null : new Date(),
        categories: categoryIds.length > 0 ? {
          connect: categoryIds.map(id => ({ id }))
        } : undefined,
        tags: tagsString.trim() ? {
          connectOrCreate: tagsString.split(',').map(tag => {
            const trimmed = tag.trim();
            const tagSlug = generateSlug(trimmed);
            return {
              where: { slug: tagSlug },
              create: { name: trimmed, slug: tagSlug }
            };
          })
        } : undefined
      }
    });

    // Envoyer la notification de manière asynchrone pour ne pas bloquer Next.js
    if (role !== "CONTRIBUTOR") {
      setTimeout(() => {
        sendNewArticleNotification(newArticle.id).catch(console.error);
        sendPushNotification(newArticle.id).catch(console.error);
      }, 500);
    }

    await logActivity({
      action: "CREATE_ARTICLE",
      resource: `Article: ${newArticle.title}`,
      details: `Article créé avec le slug: ${newArticle.slug}`
    });

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

    // Envoyer la notification de manière asynchrone pour ne pas bloquer Next.js
    setTimeout(() => {
      sendNewArticleNotification(articleId).catch(console.error);
      sendPushNotification(articleId).catch(console.error);
    }, 500);

    await logActivity({
      action: "APPROVE_ARTICLE",
      resource: `Article ID: ${articleId}`,
      details: "Article validé et publié"
    });

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
    await logActivity({
      action: "TOGGLE_PREMIUM",
      resource: `Article ID: ${articleId}`,
      details: `Passage à ${!currentStatus ? 'Premium' : 'Gratuit'}`
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur toggleArticlePremiumStatus:", error);
    return { success: false, error: "Erreur serveur lors de la modification du statut Premium." };
  }
}

export async function updateArticle(articleId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "ADMIN" && role !== "EDITOR") {
    return { success: false, error: "Accès refusé. Seul un Éditeur ou Administrateur peut modifier un article." };
  }

  const title = formData.get("title") as string;
  const excerpt = formData.get("excerpt") as string;
  const content = formData.get("content") as string;
  const isPremium = formData.get("isPremium") === "on";
  const isAudioAvailable = formData.get("isAudioAvailable") === "on";
  const isConfidentiel = formData.get("isConfidentiel") === "on";
  const categoryIds = formData.getAll("categories") as string[];
  const tagsString = formData.get("tags") as string || "";
  const imageCaption = formData.get("imageCaption") as string || null;
  const videoCaption = formData.get("videoCaption") as string || null;

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
    imageUrl = await saveUpload(imageFile);
  }

  try {
    const videoUrl = formData.get("videoUrl") as string || null;
    const videoFile = formData.get("videoFile") as File | null;
    let savedVideoPath = formData.get("existingVideoFile") as string || null;

    if (videoFile && videoFile.size > 0) {
      savedVideoPath = await saveUpload(videoFile);
    }

    await prisma.article.update({
      where: { id: articleId },
      data: {
        title,
        excerpt,
        content,
        imageUrl: imageUrl || null,
        imageCaption: imageCaption || null,
        videoUrl,
        videoFile: savedVideoPath,
        videoCaption: videoCaption || null,
        isPremium,
        isAudioAvailable,
        isConfidentiel,
        categories: {
          set: [],
          connect: categoryIds.map(id => ({ id }))
        },
        tags: {
          set: [],
          connectOrCreate: tagsString.split(',').map(tag => {
            const trimmed = tag.trim();
            if (!trimmed) return null;
            const tagSlug = generateSlug(trimmed);
            return {
              where: { slug: tagSlug },
              create: { name: trimmed, slug: tagSlug }
            };
          }).filter(t => t !== null) as any
        }
      }
    });

    await logActivity({
      action: "UPDATE_ARTICLE",
      resource: `Article ID: ${articleId}`,
      details: `Article modifié: ${title}`
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
    await logActivity({
      action: "UNPUBLISH_ARTICLE",
      resource: `Article ID: ${articleId}`,
      details: "Article retiré de la publication (brouillon)"
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
    await logActivity({
      action: "DELETE_ARTICLE",
      resource: `Article ID: ${articleId}`,
      details: "Article supprimé définitivement"
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur deleteArticle:", error);
    return { success: false, error: "Erreur serveur lors de la suppression." };
  }
}

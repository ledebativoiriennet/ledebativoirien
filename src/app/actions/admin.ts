"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

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
    let imageUrl = null;
    
    // Gérer l'upload de l'image si elle est présente
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

    await prisma.article.create({
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
    return { success: true };
  } catch (error) {
    console.error("Erreur approveArticle:", error);
    return { success: false, error: "Erreur serveur lors de la validation." };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdminOrEditor } from "@/lib/auth";

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createAuthor(formData: FormData) {
  await checkAdminOrEditor();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name) {
    return { success: false, error: "Le nom est obligatoire." };
  }

  try {
    let slug = generateSlug(name);
    const existingSlug = await prisma.author.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    if (email) {
      const existingEmail = await prisma.author.findFirst({ where: { email } });
      if (existingEmail) {
         return { success: false, error: "Un auteur avec cet email existe déjà." };
      }
    }

    await prisma.author.create({
      data: { name, slug, email: email || null }
    });
    
    revalidatePath("/admin/auteurs");
    return { success: true };
  } catch (error) {
    console.error("Erreur Author:", error);
    return { success: false, error: "Erreur lors de la création de l'auteur." };
  }
}

export async function deleteAuthor(id: string) {
  await checkAdminOrEditor();
  try {
    await prisma.author.delete({ where: { id } });
    revalidatePath("/admin/auteurs");
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression Author:", error);
    return { success: false, error: "Impossible de supprimer cet auteur (il est peut-être lié à des articles)." };
  }
}

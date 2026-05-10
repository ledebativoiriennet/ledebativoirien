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

export async function createCategory(formData: FormData) {
  await checkAdminOrEditor();
  const name = formData.get("name") as string;
  const parentIdStr = formData.get("parentId") as string;

  if (!name) {
    return { success: false, error: "Le nom est obligatoire." };
  }

  try {
    let slug = generateSlug(name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const parentId = parentIdStr && parentIdStr !== "" ? parentIdStr : null;

    await prisma.category.create({
      data: { name, slug, parentId }
    });
    
    revalidatePath("/admin/categories");
    revalidatePath("/admin/articles/create");
    return { success: true };
  } catch (error) {
    console.error("Erreur Category:", error);
    return { success: false, error: "Erreur lors de la création de la catégorie." };
  }
}

export async function deleteCategory(id: string) {
  await checkAdminOrEditor();
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    revalidatePath("/admin/articles/create");
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression Category:", error);
    return { success: false, error: "Impossible de supprimer cette catégorie (elle est peut-être liée à des articles)." };
  }
}

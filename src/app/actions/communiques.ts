"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { saveUpload } from "@/lib/upload";
import { checkAdminOrEditor } from "@/lib/auth";

export async function createPressRelease(formData: FormData) {
  await checkAdminOrEditor();
  const title = formData.get("title") as string;
  const company = formData.get("company") as string;
  const link = formData.get("url") as string;
  const file = formData.get("file") as File | null;

  if (!title || !company) {
    return { success: false, error: "Titre et entreprise sont obligatoires." };
  }

  try {
    let url = link || null;
    
    // If a PDF file was uploaded
    if (file && file.size > 0) {
      url = await saveUpload(file);
    }

    await prisma.pressRelease.create({
      data: { title, company, url }
    });
    
    revalidatePath("/admin/communiques");
    revalidatePath("/");
    revalidatePath("/communiques");
    return { success: true };
  } catch (error) {
    console.error("Erreur Communique:", error);
    return { success: false, error: "Erreur lors de l'enregistrement." };
  }
}

export async function deletePressRelease(id: string) {
  await checkAdminOrEditor();
  await prisma.pressRelease.delete({ where: { id } });
  revalidatePath("/admin/communiques");
  revalidatePath("/");
  revalidatePath("/communiques");
  return { success: true };
}

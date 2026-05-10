"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdminOrEditor } from "@/lib/auth";

export async function createVideo(formData: FormData) {
  await checkAdminOrEditor();
  const title = formData.get("title") as string;
  const youtubeUrl = formData.get("youtubeUrl") as string;

  if (!title || !youtubeUrl) {
    return { success: false, error: "Le titre et le lien Youtube sont obligatoires." };
  }

  // Extract YouTube ID from URL
  let youtubeId = "";
  try {
    const urlObj = new URL(youtubeUrl);
    if (youtubeUrl.includes("youtu.be")) {
      youtubeId = urlObj.pathname.slice(1);
    } else {
      youtubeId = urlObj.searchParams.get("v") || "";
    }
  } catch (e) {
    // If it's not a full URL, assume it's just the ID
    youtubeId = youtubeUrl;
  }

  if (!youtubeId) {
    return { success: false, error: "Impossible d'extraire l'identifiant de la vidéo." };
  }

  try {
    await prisma.video.create({
      data: { title, youtubeId }
    });
    
    revalidatePath("/admin/videos");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erreur Video:", error);
    return { success: false, error: "Erreur lors de l'enregistrement." };
  }
}

export async function deleteVideo(id: string) {
  await checkAdminOrEditor();
  await prisma.video.delete({ where: { id } });
  revalidatePath("/admin/videos");
  revalidatePath("/");
  return { success: true };
}

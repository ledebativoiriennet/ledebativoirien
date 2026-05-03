"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { saveUpload } from "@/lib/upload";
import { checkAdminOrEditor } from "@/lib/auth";

export async function createAd(formData: FormData) {
  try {
    await checkAdminOrEditor();
  } catch (e: any) {
    return { error: e.message };
  }

  const title = formData.get("title") as string;
  const company = formData.get("company") as string;
  const linkUrl = formData.get("linkUrl") as string;
  const slot = formData.get("slot") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const file = formData.get("image") as File;

  if (!title || !company || !slot || !file) {
    return { error: "Champs obligatoires manquants" };
  }

  let imageUrl = "";
  try {
    imageUrl = await saveUpload(file);
  } catch (e) {
    return { error: "Erreur lors du téléchargement de l'image" };
  }

  try {
    await prisma.advertisement.create({
      data: {
        title,
        company,
        imageUrl,
        linkUrl: linkUrl || null,
        slot,
        status: "PENDING",
        startDate: startDateStr ? new Date(`${startDateStr}T00:00:00Z`) : null,
        endDate: endDateStr ? new Date(`${endDateStr}T23:59:59Z`) : null,
      }
    });
    revalidatePath("/admin/publicites");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Prisma error during ad creation:", error);
    return { error: "Erreur de base de données" };
  }
}

export async function updateAdStatus(id: string, status: string) {
  try {
    await checkAdminOrEditor();
  } catch (e) {
    return { error: "Non autorisé" };
  }

  await prisma.advertisement.update({
    where: { id },
    data: { status }
  });
  revalidatePath("/admin/publicites");
  revalidatePath("/");
}

export async function deleteAd(id: string) {
  try {
    await checkAdminOrEditor();
  } catch (e) {
    return { error: "Non autorisé" };
  }

  await prisma.advertisement.delete({
    where: { id }
  });
  revalidatePath("/admin/publicites");
  revalidatePath("/");
}

export async function incrementAdClick(id: string) {
  await prisma.advertisement.update({
    where: { id },
    data: { clicks: { increment: 1 } }
  });
}

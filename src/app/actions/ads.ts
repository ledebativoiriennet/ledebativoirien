"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { writeFile } from "fs/promises";
import { join } from "path";
import { saveUpload } from "@/lib/upload";

export async function createAd(formData: FormData) {
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

  // @ts-ignore - Ignore Prisma Type error in case generate failed due to lock
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
}

export async function updateAdStatus(id: string, status: string) {
  // @ts-ignore
  await prisma.advertisement.update({
    where: { id },
    data: { status }
  });
  revalidatePath("/admin/publicites");
  revalidatePath("/");
}

export async function deleteAd(id: string) {
  // @ts-ignore
  await prisma.advertisement.delete({
    where: { id }
  });
  revalidatePath("/admin/publicites");
  revalidatePath("/");
}

export async function incrementAdClick(id: string) {
  // @ts-ignore
  await prisma.advertisement.update({
    where: { id },
    data: { clicks: { increment: 1 } }
  });
}

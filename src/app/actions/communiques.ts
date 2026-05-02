"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

async function checkAdminOrEditor() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    throw new Error("Non autorisé. Vous devez être Administrateur ou Éditeur.");
  }
}

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
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `communique-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const path = join(process.cwd(), 'public', 'uploads', filename);
      await writeFile(path, buffer);
      url = `/uploads/${filename}`;
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

"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";
import { revalidatePath } from "next/cache";

export async function saveNewspaper(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    
    if (role !== "ADMIN" && role !== "EDITOR") {
      return { success: false, error: "Non autorisé. Action requiert le rôle ADMIN ou EDITOR." };
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const issueNumberStr = formData.get('issueNumber') as string;
    const issueNumber = issueNumberStr ? parseInt(issueNumberStr, 10) : null;
    const priceStr = formData.get('price') as string;
    const price = parseFloat(priceStr);
    const isActive = formData.get('isActive') === 'true';
    
    const pdfFile = formData.get('pdfFile') as File | null;
    const coverFile = formData.get('coverFile') as File | null;

    if (!title || isNaN(price) || !pdfFile || pdfFile.size === 0) {
      return { success: false, error: "Données manquantes ou invalides (Titre, Prix et Fichier PDF obligatoires)." };
    }

    const pdfUrl = await saveUpload(pdfFile);

    let coverUrl = null;
    if (coverFile && coverFile.size > 0) {
      coverUrl = await saveUpload(coverFile);
    }

    const newspaper = await prisma.digitalNewspaper.create({
      data: {
        title,
        description,
        issueNumber,
        price,
        pdfUrl,
        coverImageUrl: coverUrl,
        isActive,
      }
    });

    revalidatePath("/admin/marketplace");
    revalidatePath("/kiosque");
    return { success: true, id: newspaper.id };
  } catch (error: any) {
    console.error("Erreur saveNewspaper Server Action:", error);
    return { success: false, error: `Erreur serveur: ${error.message || String(error)}` };
  }
}

export async function updateNewspaper(id: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    
    if (role !== "ADMIN" && role !== "EDITOR") {
      return { success: false, error: "Non autorisé. Action requiert le rôle ADMIN ou EDITOR." };
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const issueNumberStr = formData.get('issueNumber') as string;
    const issueNumber = issueNumberStr ? parseInt(issueNumberStr, 10) : null;
    const priceStr = formData.get('price') as string;
    const price = parseFloat(priceStr);
    const isActive = formData.get('isActive') === 'true';
    
    const pdfFile = formData.get('pdfFile') as File | null;
    const coverFile = formData.get('coverFile') as File | null;

    if (!title || isNaN(price)) {
      return { success: false, error: "Le titre et le prix sont invalides." };
    }

    const updateData: any = {
      title,
      description,
      issueNumber,
      price,
      isActive,
    };

    if (pdfFile && pdfFile.size > 0) {
      updateData.pdfUrl = await saveUpload(pdfFile);
    }

    if (coverFile && coverFile.size > 0) {
      updateData.coverImageUrl = await saveUpload(coverFile);
    }

    await prisma.digitalNewspaper.update({
      where: { id },
      data: updateData
    });

    revalidatePath("/admin/marketplace");
    revalidatePath("/kiosque");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur updateNewspaper Server Action:", error);
    return { success: false, error: `Erreur serveur: ${error.message || String(error)}` };
  }
}

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
    
    const pdfUrl = formData.get('pdfUrl') as string;
    const coverImageUrl = formData.get('coverImageUrl') as string | null;

    if (!title || isNaN(price) || !pdfUrl) {
      return { success: false, error: "Données manquantes ou invalides (Titre, Prix et Fichier PDF obligatoires)." };
    }

    const newspaper = await prisma.digitalNewspaper.create({
      data: {
        title,
        description,
        issueNumber,
        price,
        pdfUrl,
        coverImageUrl: coverImageUrl || null,
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
    
    const pdfUrl = formData.get('pdfUrl') as string | null;
    const coverImageUrl = formData.get('coverImageUrl') as string | null;

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

    if (pdfUrl) updateData.pdfUrl = pdfUrl;
    if (coverImageUrl) updateData.coverImageUrl = coverImageUrl;

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

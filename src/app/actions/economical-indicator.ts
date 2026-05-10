"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdminOrEditor } from "@/lib/auth";

export async function createEconomicalIndicator(formData: FormData) {
  await checkAdminOrEditor();
  const country = formData.get("country") as string;
  const category = formData.get("category") as string;
  const value = formData.get("value") as string;
  const unit = formData.get("unit") as string;
  const yearStr = formData.get("year") as string;
  const trend = formData.get("trend") as string;
  const source = formData.get("source") as string;

  if (!country || !category || !value || !yearStr) {
    return { success: false, error: "Pays, Catégorie, Valeur et Année sont obligatoires." };
  }

  try {
    await prisma.economicalIndicator.create({
      data: {
        country,
        category,
        value,
        unit: unit || null,
        year: parseInt(yearStr, 10),
        trend: trend || null,
        source: source || null
      }
    });
    
    revalidatePath("/admin/economie");
    revalidatePath("/economie/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erreur EconomicalIndicator:", error);
    return { success: false, error: "Erreur lors de l'enregistrement." };
  }
}

export async function deleteEconomicalIndicator(id: string) {
  await checkAdminOrEditor();
  try {
    await prisma.economicalIndicator.delete({ where: { id } });
    revalidatePath("/admin/economie");
    revalidatePath("/economie/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression EconomicalIndicator:", error);
    return { success: false, error: "Impossible de supprimer cet indicateur." };
  }
}

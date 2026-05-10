"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdminOrEditor } from "@/lib/auth";

export async function createCompany(formData: FormData) {
  await checkAdminOrEditor();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const plan = formData.get("plan") as string || "B2B_STANDARD";
  const maxUsersStr = formData.get("maxUsers") as string;
  const maxUsers = maxUsersStr ? parseInt(maxUsersStr, 10) : 10;

  if (!name || !email) {
    return { success: false, error: "Le nom et l'email sont obligatoires." };
  }

  try {
    const existing = await prisma.company.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "Une entreprise avec cet email existe déjà." };
    }

    await prisma.company.create({
      data: { name, email, plan, maxUsers }
    });
    
    revalidatePath("/admin/entreprises");
    return { success: true };
  } catch (error) {
    console.error("Erreur Company:", error);
    return { success: false, error: "Erreur lors de l'enregistrement de l'entreprise." };
  }
}

export async function deleteCompany(id: string) {
  await checkAdminOrEditor();
  try {
    await prisma.company.delete({ where: { id } });
    revalidatePath("/admin/entreprises");
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression Company:", error);
    return { success: false, error: "Impossible de supprimer cette entreprise (elle est peut-être liée à des utilisateurs ou des achats)." };
  }
}

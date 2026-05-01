"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfile(name: string, email: string) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.id) return { error: "Non autorisé" };

  try {
    await prisma.user.update({
      where: { id: (session!.user as any).id as string },
      data: { name, email }
    });
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la mise à jour du profil. L'email est peut-être déjà utilisé." };
  }
}

export async function updatePassword(password: string) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.id) return { error: "Non autorisé" };

  if (!password || password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: (session!.user as any).id as string },
      data: { password: hashedPassword }
    });
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la mise à jour du mot de passe." };
  }
}

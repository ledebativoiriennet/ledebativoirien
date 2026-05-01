"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// Vérifie si l'utilisateur appelant est bien un ADMIN
async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) return false;

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  return dbUser?.role === "ADMIN";
}

export async function manageTeamMember(formData: FormData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: "Accès refusé. Seul un Administrateur peut effectuer cette action." };
  }

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;

  if (!email || !role) {
    return { success: false, error: "L'email et le rôle sont obligatoires." };
  }

  if (role !== "ADMIN" && role !== "EDITOR" && role !== "CONTRIBUTOR") {
    return { success: false, error: "Le rôle doit être ADMIN, EDITOR ou CONTRIBUTOR." };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      // Promotion ou modification de l'utilisateur existant
      await prisma.user.update({
        where: { email },
        data: {
          role,
          // Mettre à jour le nom si fourni
          ...(name ? { name } : {}),
          // Mettre à jour le mot de passe s'il est fourni (optionnel pour les comptes existants)
          ...(password ? { password: await bcrypt.hash(password, 10) } : {})
        }
      });
      revalidatePath("/admin/equipe");
      return { success: true, message: `L'utilisateur ${email} a été promu au rôle ${role}.` };
    } else {
      // Création d'un nouvel utilisateur (mot de passe obligatoire)
      if (!password) {
        return { success: false, error: "Un mot de passe est obligatoire pour la création d'un nouveau compte." };
      }

      await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          password: await bcrypt.hash(password, 10),
          role
        }
      });
      revalidatePath("/admin/equipe");
      return { success: true, message: `Le compte ${email} a été créé avec le rôle ${role}.` };
    }
  } catch (error) {
    console.error("Erreur manageTeamMember:", error);
    return { success: false, error: "Une erreur est survenue lors de l'enregistrement." };
  }
}

export async function revokeAccess(userId: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: "Accès refusé." };
  }

  try {
    // Vérifier qu'on ne se révoque pas soi-même par erreur de logique
    const session = await getServerSession(authOptions);
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    
    if (targetUser?.email === session?.user?.email) {
      return { success: false, error: "Vous ne pouvez pas révoquer vos propres accès d'administrateur." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: "USER" }
    });
    
    revalidatePath("/admin/equipe");
    return { success: true };
  } catch (error) {
    console.error("Erreur revokeAccess:", error);
    return { success: false, error: "Erreur lors de la révocation." };
  }
}

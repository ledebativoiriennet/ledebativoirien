"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdminOrEditor } from "@/lib/auth";

export async function createMatch(data: {
  team1: string;
  team2: string;
  team1Flag?: string;
  team2Flag?: string;
  matchDate: Date;
  phase?: string;
  status?: string;
}) {
  try {
    await checkAdminOrEditor();
    await prisma.footballMatch.create({
      data: {
        team1: data.team1,
        team2: data.team2,
        team1Flag: data.team1Flag || null,
        team2Flag: data.team2Flag || null,
        matchDate: data.matchDate,
        phase: data.phase || null,
        status: data.status || "UPCOMING",
      }
    });
    revalidatePath("/admin/sports");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur" };
  }
}

export async function updateMatchScore(id: string, score: string, status: string) {
  try {
    await checkAdminOrEditor();
    await prisma.footballMatch.update({
      where: { id },
      data: { score, status }
    });
    revalidatePath("/admin/sports");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur" };
  }
}

export async function deleteMatch(id: string) {
  try {
    await checkAdminOrEditor();
    await prisma.footballMatch.delete({
      where: { id }
    });
    revalidatePath("/admin/sports");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur" };
  }
}

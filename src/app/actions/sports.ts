"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMatch(data: {
  team1: string;
  team2: string;
  team1Flag?: string;
  team2Flag?: string;
  matchDate: Date;
  phase?: string;
  status?: string;
}) {
  // @ts-ignore
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
}

export async function updateMatchScore(id: string, score: string, status: string) {
  // @ts-ignore
  await prisma.footballMatch.update({
    where: { id },
    data: { score, status }
  });
  revalidatePath("/admin/sports");
  revalidatePath("/");
}

export async function deleteMatch(id: string) {
  // @ts-ignore
  await prisma.footballMatch.delete({
    where: { id }
  });
  revalidatePath("/admin/sports");
  revalidatePath("/");
}

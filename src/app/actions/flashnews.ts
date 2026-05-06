"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFlashNews() {
  return prisma.flashNews.findMany({
    orderBy: { createdAt: "desc" },
    take: 50
  });
}

export async function createFlashNews(data: { time: string; content: string; link?: string; source?: string }) {
  await prisma.flashNews.create({
    data: {
      time: data.time,
      content: data.content,
      link: data.link || null,
      source: data.source || null,
    }
  });
  
  revalidatePath("/");
  revalidatePath("/en-continu");
  revalidatePath("/admin/flashnews");
  
  return { success: true };
}

export async function deleteFlashNews(id: string) {
  await prisma.flashNews.delete({
    where: { id }
  });
  
  revalidatePath("/");
  revalidatePath("/en-continu");
  revalidatePath("/admin/flashnews");
  
  return { success: true };
}

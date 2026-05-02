"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function voteOnPoll(optionId: string) {
  try {
    await prisma.pollOption.update({
      where: { id: optionId },
      data: { votes: { increment: 1 } }
    });
    
    // Revalidate paths where poll is shown (e.g., home page)
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Error voting on poll:", error);
    return { success: false, error: "Failed to vote." };
  }
}

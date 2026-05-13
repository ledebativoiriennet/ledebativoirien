import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Always fresh

export async function GET() {
  try {
    const live = await prisma.liveStream.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(live, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json(null);
  }
}

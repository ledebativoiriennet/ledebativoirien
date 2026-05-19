import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { searchEventId, position } = body;

    if (!searchEventId || typeof position !== "number") {
      return NextResponse.json({ success: false, error: "Paramètres invalides" }, { status: 400 });
    }

    await prisma.searchEvent.update({
      where: { id: searchEventId },
      data: { clickedPosition: position }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Search click tracking error:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

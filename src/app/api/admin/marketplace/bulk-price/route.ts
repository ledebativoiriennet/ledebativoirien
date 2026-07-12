import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== "ADMIN" && role !== "EDITOR") {
      return NextResponse.json({ error: "Unauthorized. Action requires ADMIN or EDITOR role." }, { status: 401 });
    }

    const { price } = await request.json();

    if (price === undefined || isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Prix invalide." }, { status: 400 });
    }

    const result = await prisma.digitalNewspaper.updateMany({
      data: {
        price: parseFloat(price),
      }
    });

    return NextResponse.json({ success: true, count: result.count });

  } catch (error: any) {
    console.error("Erreur mise à jour en masse du prix:", error);
    return NextResponse.json({ error: `Erreur serveur: ${error.message || String(error)}` }, { status: 500 });
  }
}

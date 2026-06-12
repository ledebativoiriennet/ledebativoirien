import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Always fresh data

export async function GET() {
  try {
    const now = new Date();
    // Start and end of the current day in local server time
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Fetch matches scheduled for today
    // @ts-ignore
    let matches = await prisma.footballMatch.findMany({
      where: {
        sport: "Football",
        matchDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      orderBy: { matchDate: "asc" },
    });

    // Fallback: If no matches today, fetch the latest/upcoming matches in the database
    // so the ticker is never empty in development or testing.
    if (matches.length === 0) {
      // @ts-ignore
      matches = await prisma.footballMatch.findMany({
        where: {
          sport: "Football",
        },
        orderBy: { matchDate: "asc" },
        take: 10,
      });
    }

    return NextResponse.json(matches, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching football matches:", error);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}

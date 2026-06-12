import { NextResponse } from "next/server";
import { getMatchesAndSync } from "@/lib/sports";

export const revalidate = 0; // Always fresh data

export async function GET() {
  try {
    const matches = await getMatchesAndSync();
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


import { NextResponse } from "next/server";
import { getMatchesAndSync } from "@/lib/sports";

export const revalidate = 0; // Always dynamic

export async function GET(request: Request) {
  try {
    // 1. Cron secret security check for production environments
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    // Run the sync
    await getMatchesAndSync();

    return NextResponse.json({
      success: true,
      message: "Synchronisation réussie.",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[CRON SPORTS-SYNC ERROR]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    const { recordAdEvent } = require("@/lib/ad-tracking");
    // recordAdEvent handles both the increment and the detailed log
    await recordAdEvent(id, "CLICK").catch(console.error);
  }

  if (url) {
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(new URL("/", req.url));
}

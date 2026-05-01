import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    // @ts-ignore
    await prisma.advertisement.update({
      where: { id },
      data: { clicks: { increment: 1 } }
    }).catch(() => {});
  }

  if (url) {
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(new URL("/", req.url));
}

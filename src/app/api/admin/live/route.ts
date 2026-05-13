import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function detectPlatform(url: string): string {
  if (!url) return "OTHER";
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "YOUTUBE";
  if (u.includes("facebook.com") || u.includes("fb.com") || u.includes("fb.watch")) return "FACEBOOK";
  if (u.includes("tiktok.com")) return "TIKTOK";
  return "OTHER";
}

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  return user?.role === "ADMIN" || user?.role === "EDITOR";
}

// GET - list all streams (admin)
export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const streams = await prisma.liveStream.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(streams);
}

// POST - create or update the active live stream (only one active at a time)
export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, url, activate } = await req.json();

  if (!url || !url.trim()) {
    return NextResponse.json({ error: "URL requise" }, { status: 400 });
  }

  const platform = detectPlatform(url);

  // Deactivate all existing streams first
  await prisma.liveStream.updateMany({ data: { isActive: false } });

  // Create new stream (active if requested)
  const stream = await prisma.liveStream.create({
    data: {
      title: title || "Direct LDI",
      url: url.trim(),
      platform,
      isActive: activate !== false,
    },
  });

  return NextResponse.json(stream);
}

// PATCH - toggle isActive on existing stream
export async function PATCH(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, isActive } = await req.json();

  // If activating, deactivate all others first
  if (isActive) {
    await prisma.liveStream.updateMany({ data: { isActive: false } });
  }

  const stream = await prisma.liveStream.update({
    where: { id },
    data: { isActive },
  });
  return NextResponse.json(stream);
}

// DELETE - delete a stream
export async function DELETE(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  await prisma.liveStream.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

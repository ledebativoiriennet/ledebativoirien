import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const subscription = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId: (session?.user as any)?.id || null,
        p256dh,
        auth
      },
      create: {
        endpoint,
        p256dh,
        auth,
        userId: (session?.user as any)?.id || null
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

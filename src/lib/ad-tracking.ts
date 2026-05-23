import { prisma } from "./prisma";
import { headers } from "next/headers";
import crypto from "crypto";

export async function recordAdEvent(adId: string, type: "IMPRESSION" | "CLICK", path?: string) {
  try {
    const headerList = await headers();
    const userAgent = headerList.get("user-agent") || "unknown";
    const forwarded = headerList.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";
    
    // Hash IP for privacy
    const ipHash = crypto.createHash('sha256').update(ip + (process.env.IP_SALT || 'ldi-salt')).digest('hex').substring(0, 16);

    // Update aggregate counts
    if (type === "IMPRESSION") {
      await prisma.advertisement.update({
        where: { id: adId },
        data: { impressions: { increment: 1 } }
      });
    } else {
      await prisma.advertisement.update({
        where: { id: adId },
        data: { clicks: { increment: 1 } }
      });
    }

    // Record detailed event
    await prisma.adEvent.create({
      data: {
        adId,
        type,
        path,
        ipHash,
        userAgent
      }
    });
  } catch (error) {
    console.error("Failed to record ad event:", error);
  }
}

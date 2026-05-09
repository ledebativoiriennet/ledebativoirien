import { prisma } from "./prisma";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function logActivity({
  action,
  resource,
  details,
  userId: manualUserId,
  userName: manualUserName,
  userEmail: manualUserEmail
}: {
  action: string;
  resource?: string;
  details?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
}) {
  try {
    const headerList = await headers();
    const userAgent = headerList.get("user-agent") || "Unknown";
    const ipAddress = headerList.get("x-forwarded-for")?.split(",")[0] || 
                      headerList.get("x-real-ip") || 
                      "127.0.0.1";

    // Tentative de récupération de la localisation via les headers standard (Cloudflare/Vercel/etc)
    const country = headerList.get("cf-ipcountry") || headerList.get("x-vercel-ip-country") || null;
    const city = headerList.get("x-vercel-ip-city") || null;

    // Parsing sommaire du User Agent (sans lib externe pour le moment)
    let browser = "Other";
    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";

    let os = "Other";
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac OS")) os = "Mac OS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";

    let device = "Desktop";
    if (userAgent.includes("Mobi")) device = "Mobile";
    if (userAgent.includes("Tablet")) device = "Tablet";

    let finalUserId = manualUserId;
    let finalUserName = manualUserName;
    let finalUserEmail = manualUserEmail;

    // Si on n'a pas passé d'utilisateur manuellement, on essaie de récupérer la session
    if (!finalUserId) {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        finalUserId = (session.user as any).id;
        finalUserName = session.user.name || null;
        finalUserEmail = session.user.email || null;
      }
    }

    await prisma.activityLog.create({
      data: {
        userId: finalUserId,
        userName: finalUserName,
        userEmail: finalUserEmail,
        action,
        resource,
        details,
        ipAddress,
        userAgent,
        browser,
        device,
        os,
        city,
        country
      }
    });

    // Si c'est un login, on met aussi à jour lastLoginAt sur l'utilisateur
    if (action === "LOGIN" && finalUserId) {
      await prisma.user.update({
        where: { id: finalUserId },
        data: { lastLoginAt: new Date() }
      });
    }

  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

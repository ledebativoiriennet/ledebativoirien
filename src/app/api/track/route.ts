import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UAParser } from "ua-parser-js";
import crypto from "crypto";
import { detectBot } from "@/lib/bot-detector";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-vercel-ip") || req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    
    const userAgent = req.headers.get("user-agent") || "";
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const browser = result.browser.name || "Unknown";
    const os = result.os.name || "Unknown";
    const deviceType = result.device.type ? (result.device.type.charAt(0).toUpperCase() + result.device.type.slice(1)) : "Desktop";
    const brand = result.device.vendor || "Unknown";

    const botInfo = detectBot(userAgent);

    let country = req.headers.get("x-vercel-ip-country");
    let city = req.headers.get("x-vercel-ip-city");

    const body = await req.json().catch(() => ({}));
    const path = body.path || "/";

    // Appel optionnel API publique si pas sur Vercel
    if (!country && ip !== "unknown" && ip !== "::1" && ip !== "127.0.0.1") {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode,city`, { cache: 'no-store' });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.countryCode) country = geoData.countryCode;
          if (geoData.city) city = geoData.city;
        }
      } catch (e) {
        // Ignorer l'erreur silencieusement
      }
    }

    if (!country) country = body.timezone ? body.timezone.split("/")[1] || "Unknown" : "Unknown";

    // Hash IP + Date du jour + Path (pour compter les visites par page)
    const todayStr = new Date().toISOString().split("T")[0];
    const ipHash = crypto.createHash("sha256").update(`${ip}-${todayStr}-${path}`).digest("hex");

    // Enregistrer s'il n'existe pas aujourd'hui pour ce chemin
    const existing = await prisma.visitor.findFirst({
      where: { ipHash }
    });

    if (!existing) {
      await prisma.visitor.create({
        data: {
          ipHash,
          country: country,
          city: city || "Unknown",
          browser,
          os,
          device: deviceType,
          brand,
          isBot: botInfo.isBot,
          botName: botInfo.name,
          botCategory: botInfo.category,
          path: path
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

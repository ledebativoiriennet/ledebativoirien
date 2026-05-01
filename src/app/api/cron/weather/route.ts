import { NextResponse } from "next/server";
import { fetchWeatherData } from "@/lib/weather";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Vérification basique de sécurité (Optionnelle, par exemple un token dans l'URL)
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    
    // Si vous voulez sécuriser le CRON, définissez CRON_SECRET dans votre .env
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const weatherData = await fetchWeatherData();

    // @ts-ignore
    const weather = await prisma.weatherReport.findFirst({
      orderBy: { date: 'desc' }
    });

    if (weather) {
      // @ts-ignore
      await prisma.weatherReport.update({
        where: { id: weather.id },
        data: weatherData
      });
    } else {
      // @ts-ignore
      await prisma.weatherReport.create({
        data: weatherData
      });
    }

    return NextResponse.json({ success: true, data: weatherData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

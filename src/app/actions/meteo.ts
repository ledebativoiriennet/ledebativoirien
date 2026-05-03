"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { fetchWeatherData } from "@/lib/weather";
import { checkAdminOrEditor } from "@/lib/auth";

export async function updateWeather(data: any) {
  try {
    await checkAdminOrEditor();
    
    const weather = await prisma.weatherReport.findFirst({
      orderBy: { date: 'desc' }
    });

    if (weather) {
      await prisma.weatherReport.update({
        where: { id: weather.id },
        data
      });
    } else {
      await prisma.weatherReport.create({
        data
      });
    }

    revalidatePath("/");
    revalidatePath("/admin/meteo");
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Erreur" };
  }
}

export async function autoUpdateWeather() {
  try {
    const data = await fetchWeatherData();
    return await updateWeather(data);
  } catch (e: any) {
    return { error: e.message || "Erreur lors de la synchronisation automatique" };
  }
}

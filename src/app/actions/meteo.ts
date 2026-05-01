"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { fetchWeatherData } from "@/lib/weather";

export async function updateWeather(data: any) {
  try {
    // @ts-ignore
    const weather = await prisma.weatherReport.findFirst({
      orderBy: { date: 'desc' }
    });

    if (weather) {
      // @ts-ignore
      await prisma.weatherReport.update({
        where: { id: weather.id },
        data
      });
    } else {
      // @ts-ignore
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

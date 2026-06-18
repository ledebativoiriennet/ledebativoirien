"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function executeCronJob(endpoint: string) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    
    if (role !== "ADMIN" && role !== "EDITOR") {
      return { success: false, error: "Non autorisé" };
    }

    // Liste des crons autorisés pour éviter les SSRF
    const allowedCrons = [
      '/api/cron/monthly-digest',
      '/api/cron/newsletter',
      '/api/cron/sports-sync',
      '/api/cron/sync-international-rss',
      '/api/cron/sync-search-console',
      '/api/cron/update-markets',
      '/api/cron/weather',
      '/api/cron/weekly-digest'
    ];

    if (!allowedCrons.includes(endpoint)) {
      return { success: false, error: "Endpoint Cron non reconnu" };
    }

    // Construction de l'URL absolue (nécessaire pour un fetch depuis le serveur)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const secret = process.env.CRON_SECRET || 'ldi_secret_update_2026';
    
    const url = `${baseUrl}${endpoint}?secret=${secret}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secret}`
      },
      // On évite le cache
      cache: 'no-store'
    });

    const data = await res.text();
    let jsonResult;
    try {
      jsonResult = JSON.parse(data);
    } catch {
      jsonResult = data;
    }

    if (!res.ok) {
      return { success: false, error: `Erreur ${res.status}: ${JSON.stringify(jsonResult)}` };
    }

    return { success: true, data: jsonResult };
  } catch (error: any) {
    console.error("Erreur exécution cron :", error);
    return { success: false, error: error.message || String(error) };
  }
}

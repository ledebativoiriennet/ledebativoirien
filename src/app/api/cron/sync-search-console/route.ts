import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const googleKey = process.env.GOOGLE_SERVICE_KEY;
    const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;

    // Protection par token optionnelle pour le Cron (sauf en dev)
    const isDev = process.env.NODE_ENV === "development";
    const authHeader = req.headers.get("authorization");
    if (!isDev && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    if (!googleKey || !siteUrl) {
      return NextResponse.json({ 
        success: false, 
        error: "Variables d'environnement GOOGLE_SERVICE_KEY ou GOOGLE_SEARCH_CONSOLE_SITE_URL manquantes." 
      }, { status: 500 });
    }

    let credentials;
    try {
      let keyString = googleKey.trim();
      if (keyString.startsWith("'") && keyString.endsWith("'")) {
        keyString = keyString.slice(1, -1);
      }
      if (keyString.startsWith('"') && keyString.endsWith('"')) {
        keyString = keyString.slice(1, -1);
      }
      
      // Unescape characters if they were escaped by the shell/environment loader
      keyString = keyString.replace(/\\"/g, '"');
      keyString = keyString.replace(/\\{/g, '{');
      keyString = keyString.replace(/\\}/g, '}');
      keyString = keyString.replace(/\\\[/g, '[');
      keyString = keyString.replace(/\\\]/g, ']');
      keyString = keyString.replace(/\\\//g, '/');
      
      // Fix \u when NOT followed by 4 hex digits (like \universe_domain)
      keyString = keyString.replace(/\\u(?![0-9a-fA-F]{4})/g, 'u');
      
      // Remove any other backslash escaping normal letters (except valid JSON escapes: \n, \r, \t, \b, \f)
      keyString = keyString.replace(/\\([^nrtbfu/"])/g, '$1');
      
      credentials = JSON.parse(keyString);
    } catch (e: any) {
      console.error("JSON parse error for GOOGLE_SERVICE_KEY:", e);
      return NextResponse.json({ 
        success: false, 
        error: `GOOGLE_SERVICE_KEY n'est pas un JSON valide: ${e.message}. Valeur reçue (tronquée): ${googleKey.substring(0, 50)}...` 
      }, { status: 500 });
    }

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"]
    });

    const searchconsole = google.searchconsole({ version: "v1", auth });

    // Récupération des sites autorisés pour ce compte
    let accessibleSites: string[] = [];
    try {
      const sitesRes = await searchconsole.sites.list();
      accessibleSites = (sitesRes.data.siteEntry || []).map(s => s.siteUrl || "");
    } catch (e: any) {
      console.error("Error listing sites:", e);
      return NextResponse.json({
        success: false,
        error: `Impossible de récupérer la liste des sites Google : ${e.message}`
      }, { status: 500 });
    }

    let finalSiteUrl = siteUrl;
    if (accessibleSites.length > 0) {
      if (!accessibleSites.includes(siteUrl)) {
        // Recherche d'un domaine correspondant dans les sites autorisés
        const match = accessibleSites.find(s => s.includes("ledebativoirien.net"));
        finalSiteUrl = match || accessibleSites[0];
        console.log(`Auto-switching siteUrl from '${siteUrl}' to '${finalSiteUrl}' based on Search Console permissions.`);
      }
    } else {
      return NextResponse.json({
        success: false,
        error: `Le compte de service '${credentials.client_email}' n'a accès à aucune propriété sur votre Google Search Console. Sites trouvés: []. Assurez-vous d'avoir ajouté cet email comme utilisateur sur Google Search Console.`,
      }, { status: 403 });
    }

    const today = new Date();
    // On recule de 3 jours car Google a généralement 2 à 3 jours de latence sur Search Console
    const endDate = new Date();
    endDate.setDate(today.getDate() - 2);
    
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30); // 30 jours de données

    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

    console.log(`Querying Search Console from ${formattedStartDate} to ${formattedEndDate} for site ${finalSiteUrl}`);

    const response = await searchconsole.searchanalytics.query({
      siteUrl: finalSiteUrl,
      requestBody: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        dimensions: ["date", "query"],
        rowLimit: 1000,
      },
    });

    const rows = response.data.rows || [];
    console.log(`Retrieved ${rows.length} rows from Google Search Console.`);

    let addedCount = 0;

    // Utilisation d'une transaction Prisma séquentielle pour éviter de bloquer SQLite
    await prisma.$transaction(
      rows.map((row) => {
        const dateStr = row.keys?.[0];
        const query = row.keys?.[1];
        if (!dateStr || !query) return prisma.$executeRaw`SELECT 1`; // no-op

        const date = new Date(dateStr + "T00:00:00Z");
        const clicks = row.clicks || 0;
        const impressions = row.impressions || 0;
        const ctr = row.ctr || 0;
        const position = row.position || 0;

        addedCount++;

        return prisma.googleSearchStat.upsert({
          where: {
            date_query: {
              date,
              query,
            },
          },
          update: {
            clicks,
            impressions,
            ctr,
            position,
          },
          create: {
            date,
            query,
            clicks,
            impressions,
            ctr,
            position,
          },
        });
      })
    );

    return NextResponse.json({ 
      success: true, 
      message: `${addedCount} statistiques de recherche synchronisées avec succès.` 
    });
  } catch (error: any) {
    console.error("Search Console sync error:", error);
    return NextResponse.json({ success: false, error: error.message || "Erreur interne" }, { status: 500 });
  }
}

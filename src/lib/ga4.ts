import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

export async function getGA4Stats() {
  try {
    let auth;
    const credsPath = path.join(process.cwd(), 'google-credentials.json');
    console.log("getGA4Stats called. process.cwd() =", process.cwd(), "credsPath =", credsPath);
    
    if (process.env.GOOGLE_CREDENTIALS) {
      console.log("Using GOOGLE_CREDENTIALS env var");
      try {
        // Nettoyage au cas où Vercel ajoute des guillemets simples autour du JSON
        let rawCreds = process.env.GOOGLE_CREDENTIALS.trim();
        if (rawCreds.startsWith("'") && rawCreds.endsWith("'")) {
          rawCreds = rawCreds.slice(1, -1);
        }
        const credentials = JSON.parse(rawCreds);
        auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
        });
      } catch (e: any) {
        console.error("Erreur critique: Impossible de parser GOOGLE_CREDENTIALS. Vérifiez le format JSON sur Vercel. Erreur:", e.message);
        return { activeUsers: 0, pageViews: 0, avgSessionDuration: 0, bounceRate: 0 };
      }
    } else if (fs.existsSync(credsPath)) {
      console.log("Using google-credentials.json from fs");
      auth = new google.auth.GoogleAuth({
        keyFile: credsPath,
        scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
      });
    } else {
      console.warn("No Google credentials found. Please set GOOGLE_CREDENTIALS env variable or provide google-credentials.json");
      return { activeUsers: 0, pageViews: 0, avgSessionDuration: 0, bounceRate: 0 };
    }

    const analyticsdata = google.analyticsdata({
      version: 'v1beta',
      auth: auth,
    });

    const response = await analyticsdata.properties.runReport({
      property: 'properties/361832064',
      requestBody: {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [
          { name: 'activeUsers' }, 
          { name: 'screenPageViews' }, 
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' }
        ],
      },
    });

    if (response.data.rows && response.data.rows.length > 0) {
      const values = response.data.rows[0].metricValues || [];
      console.log("GA4 Data fetched successfully:", values);
      return {
        activeUsers: parseInt(values[0]?.value || '0', 10),
        pageViews: parseInt(values[1]?.value || '0', 10),
        avgSessionDuration: parseFloat(values[2]?.value || '0'),
        bounceRate: parseFloat(values[3]?.value || '0')
      };
    } else {
      console.log("GA4 Data fetched but no rows found:", response.data);
    }
  } catch (error) {
    console.error('Error fetching GA4 data:', error);
  }

  return {
    activeUsers: 0,
    pageViews: 0,
    avgSessionDuration: 0,
    bounceRate: 0
  };
}

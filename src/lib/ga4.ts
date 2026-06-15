import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

export async function getGA4Stats() {
  try {
    let auth;
    const credsPath = path.join(process.cwd(), 'google-credentials.json');
    
    if (process.env.GOOGLE_CREDENTIALS) {
      // Use environment variable if available
      const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
      });
    } else if (fs.existsSync(credsPath)) {
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
      return {
        activeUsers: parseInt(values[0]?.value || '0', 10),
        pageViews: parseInt(values[1]?.value || '0', 10),
        avgSessionDuration: parseFloat(values[2]?.value || '0'),
        bounceRate: parseFloat(values[3]?.value || '0')
      };
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

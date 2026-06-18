import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import xml2js from 'xml2js';

const RSS_FEEDS = [
  'http://atlasflux.suptribune.org/Outil_RSS_lecture.php?code_id=30091&charge=&urllist=fra_territoire_afrique',
  'https://feeds.feedburner.com/AfricaIntelligence-fr'
];

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    // Sécurité basique pour le cron Vercel ou appel manuel sécurisé
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const itemsToSave: { title: string; link: string; date: Date; source: string }[] = [];

    for (const feedUrl of RSS_FEEDS) {
      try {
        const res = await fetch(feedUrl, { cache: 'no-store' });
        if (!res.ok) {
          console.error(`Failed to fetch ${feedUrl}: ${res.statusText}`);
          continue;
        }

        const buffer = await res.arrayBuffer();
        const decoder = new TextDecoder(feedUrl.includes('atlasflux') ? 'iso-8859-1' : 'utf-8');
        const xml = decoder.decode(buffer);
        
        let items: any[] = [];
        
        try {
          // Attempt to parse as XML
          const parsed = await xml2js.parseStringPromise(xml, { explicitArray: false });
          if (parsed?.rss?.channel?.item) {
            items = Array.isArray(parsed.rss.channel.item) 
              ? parsed.rss.channel.item 
              : [parsed.rss.channel.item];
          }
        } catch (xmlError) {
          // Fallback to regex if it's an HTML page (like AtlasFlux)
          if (xml.includes('<html')) {
            const itemMatchesNew = [...xml.matchAll(/<a[^>]+href=['"]([^'"]+)['"][^>]*>(?:(?!<\/a>)[\s\S])*?<div\s+class=['"]titre['"][^>]*>(.*?)<\/div>/gi)];
            if (itemMatchesNew.length > 0) {
              for (let i = 0; i < Math.min(itemMatchesNew.length, 10); i++) {
                const rawTitle = itemMatchesNew[i][2].replace(/<[^>]*>?/gm, '');
                items.push({ title: rawTitle, link: itemMatchesNew[i][1] });
              }
            } else {
              const titleMatches = [...xml.matchAll(/class="[^"]*titre[^"]*"[^>]*>(.*?)<\/a>/gi)];
              const linkMatches = [...xml.matchAll(/href="([^"]+)"[^>]*class="[^"]*titre[^"]*"/gi)];
              
              for (let i = 0; i < Math.min(titleMatches.length, 10); i++) {
                // Strip HTML tags from title
                const rawTitle = titleMatches[i][1].replace(/<[^>]*>?/gm, '');
                const link = linkMatches[i] ? linkMatches[i][1] : feedUrl;
                items.push({ title: rawTitle, link: link });
              }
            }
          } else {
            throw xmlError;
          }
        }

        // Garder les 10 plus récents
        const recentItems = items.slice(0, 10);

        for (const item of recentItems) {
          if (item.title) {
            itemsToSave.push({
              title: typeof item.title === 'string' ? item.title : item.title._ || 'Sans titre',
              link: typeof item.link === 'string' ? item.link : item.link?._ || '',
              date: item.pubDate ? new Date(item.pubDate) : new Date(),
              source: feedUrl.includes('AfricaIntelligence') ? 'Africa Intelligence' : 'AtlasFlux',
            });
          }
        }
      } catch (err) {
        console.error(`Error parsing feed ${feedUrl}:`, err);
      }
    }

    let addedCount = 0;

    for (const item of itemsToSave) {
      // Nettoyage du titre
      const cleanTitle = item.title.trim();
      if (!cleanTitle) continue;

      // On vérifie si l'article n'existe pas déjà (via son lien exact ou son titre)
      const existingNews = await prisma.flashNews.findFirst({
        where: {
          OR: [
            { link: item.link },
            { content: cleanTitle }
          ],
          region: "International"
        }
      });

      if (!existingNews) {
        await prisma.flashNews.create({
          data: {
            time: item.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            content: cleanTitle,
            source: item.source,
            region: "International",
            createdAt: item.date
          }
        });
        addedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Synchronisation terminée. ${addedCount} flash(s) ajouté(s).` 
    });

  } catch (error: any) {
    console.error('Error syncing international RSS:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

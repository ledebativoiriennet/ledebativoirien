import { prisma } from "@/lib/prisma";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ledebativoirien.net';
  
  const articles = await prisma.article.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    include: { author: true }
  });
  const rssItems = (await Promise.all(articles.map(async (article) => {
    const { getArticleImage } = await import("@/lib/utils");
    let imageUrl = getArticleImage(article);
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }

    return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/article/${article.slug}</link>
      <guid isPermaLink="true">${baseUrl}/article/${article.slug}</guid>
      <pubDate>${article.publishedAt?.toUTCString()}</pubDate>
      <description><![CDATA[${article.excerpt || article.content.replace(/<[^>]*>?/gm, '').substring(0, 200)}...]]></description>
      <dc:creator><![CDATA[${article.author?.name || 'La Rédaction'}]]></dc:creator>
      ${imageUrl ? `<enclosure url="${imageUrl}" length="0" type="image/jpeg" />` : ''}
      ${imageUrl ? `<media:content url="${imageUrl}" medium="image" />` : ''}
    </item>`;
  }))).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
    <channel>
      <title>Le Débat Ivoirien</title>
      <link>${baseUrl}</link>
      <description>L'information d'investigation en Côte d'Ivoire</description>
      <language>fr-ci</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
      ${rssItems}
    </channel>
  </rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}

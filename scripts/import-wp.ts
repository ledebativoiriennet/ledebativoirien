import 'dotenv/config';
import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { PrismaClient } from '@prisma/client';
import he from 'he';

const prisma = new PrismaClient();

function getString(val: any): string | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val.__cdata !== undefined) return String(val.__cdata);
  return String(val);
}

async function main() {
  const filePath = 'C:\\Users\\hecki\\Downloads\\ledebativoirien.WordPress.2026-05-09.xml';
  console.log(`Reading XML from ${filePath}...`);
  const xmlData = fs.readFileSync(filePath, 'utf8');

  console.log('Parsing XML...');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    cdataPropName: '__cdata',
    tagValueProcessor: (tagName, tagValue) => {
      try {
        return typeof tagValue === 'string' ? he.decode(tagValue) : tagValue;
      } catch (e) {
        return tagValue;
      }
    }
  });
  const jsonObj = parser.parse(xmlData);

  const channel = jsonObj.rss?.channel;
  if (!channel) {
    console.error('Invalid WordPress XML format: missing rss.channel');
    return;
  }

  const items = channel.item || [];
  const itemArray = Array.isArray(items) ? items : [items];

  // 1. Map all attachments to get URLs
  console.log('Mapping attachments...');
  const attachmentMap: Record<string, string> = {};
  itemArray.forEach((item: any) => {
    if (getString(item['wp:post_type']) === 'attachment') {
      const id = getString(item['wp:post_id']);
      const url = getString(item['wp:attachment_url']);
      if (id && url) attachmentMap[id] = url;
    }
  });

  // 2. Authors
  const authors = channel['wp:author'] || [];
  const authorArray = Array.isArray(authors) ? authors : [authors];
  for (const author of authorArray) {
    if (!author) continue;
    const wpId = parseInt(author['wp:author_id']);
    const login = getString(author['wp:author_login']) || 'unknown';
    const name = getString(author['wp:author_display_name']) || login;
    await prisma.author.upsert({
      where: { slug: login },
      update: { name, wpId },
      create: { slug: login, name, wpId },
    });
  }

  // 3. Categories
  const categories = channel['wp:category'] || [];
  const categoryArray = Array.isArray(categories) ? categories : [categories];
  for (const cat of categoryArray) {
    if (!cat) continue;
    const slug = getString(cat['wp:category_nicename']) || `cat-${cat['wp:term_id']}`;
    const name = getString(cat['wp:cat_name']) || slug;
    await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { slug, name },
    });
  }

  const SLUG_ALIASES: Record<string, string> = {
    'art-culture': 'culture',
    'arts': 'culture',
    'economie-finances': 'economie',
    'finances': 'economie',
    'faits_divers': 'faits-divers',
    'international': 'internationale',
  };

  async function ensureCategory(slug: string, name: string) {
    const normalized = SLUG_ALIASES[slug] || slug;
    let cat = await prisma.category.findUnique({ where: { slug: normalized } });
    if (!cat) {
      cat = await prisma.category.create({ data: { slug: normalized, name: name || normalized } });
    }
    return cat;
  }

  // 4. Articles
  const articles = itemArray.filter((i: any) => getString(i['wp:post_type']) === 'post' && getString(i['wp:status']) === 'publish');
  console.log(`Found ${articles.length} published articles. Importing...`);

  let count = 0;
  for (const item of articles) {
    const wpId = parseInt(item['wp:post_id']);
    const title = getString(item.title) || 'Untitled';
    const content = getString(item['content:encoded']) || '';
    const excerpt = getString(item['excerpt:encoded']);
    const slug = getString(item['wp:post_name']) || `post-${wpId}`;
    const publishedAt = new Date(getString(item.pubDate) || new Date());
    const authorSlug = getString(item['dc:creator']);
    
    let authorId = null;
    if (authorSlug) {
      const author = await prisma.author.findUnique({ where: { slug: authorSlug } });
      if (author) authorId = author.id;
    }

    const categoriesList = item.category || [];
    const catArray = Array.isArray(categoriesList) ? categoriesList : [categoriesList];
    const categoriesConnect = [];
    for (const catItem of catArray) {
      const catSlug = getString(catItem['@_nicename']);
      if (!catSlug) continue;
      const dbCat = await ensureCategory(catSlug, getString(catItem['#text']) || catSlug);
      if (dbCat) categoriesConnect.push({ id: dbCat.id });
    }

    // Find featured image
    let imageUrl: string | null = null;
    const postMeta = item['wp:postmeta'] || [];
    const metaArray = Array.isArray(postMeta) ? postMeta : [postMeta];
    for (const meta of metaArray) {
      if (getString(meta['wp:meta_key']) === '_thumbnail_id') {
        const thumbId = getString(meta['wp:meta_value']);
        if (thumbId && attachmentMap[thumbId]) {
          imageUrl = attachmentMap[thumbId];
        }
        break;
      }
    }

    // Fallback: search for first image in content
    if (!imageUrl) {
      const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch) imageUrl = imgMatch[1];
    }

    try {
      await prisma.article.upsert({
        where: { slug },
        update: {
          title, content, excerpt, publishedAt, authorId, imageUrl,
          categories: { set: categoriesConnect }
        },
        create: {
          wpId, title, slug, content, excerpt, publishedAt, authorId, imageUrl,
          categories: { connect: categoriesConnect },
          isPremium: false
        }
      });
      count++;
      process.stdout.write(`\rImporting: ${count}/${articles.length}`);
    } catch (e: any) {
      console.error(`\nError with ${slug}:`, e.message);
    }
  }

  console.log(`\n\n✅ Done! Imported/Updated: ${count}`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());

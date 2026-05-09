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

  // 1. Authors
  const authors = channel['wp:author'] || [];
  const authorArray = Array.isArray(authors) ? authors : [authors];
  console.log(`Found ${authorArray.length} authors.`);
  
  for (const author of authorArray) {
    if (!author) continue;
    const wpId = parseInt(author['wp:author_id']);
    const login = getString(author['wp:author_login']) || 'unknown';
    const email = getString(author['wp:author_email']);
    const name = getString(author['wp:author_display_name']) || login;

    await prisma.author.upsert({
      where: { slug: login },
      update: { name, email, wpId },
      create: { slug: login, name, email, wpId },
    });
  }

  // 2. Categories
  const categories = channel['wp:category'] || [];
  const categoryArray = Array.isArray(categories) ? categories : [categories];
  console.log(`Found ${categoryArray.length} categories.`);
  
  for (const cat of categoryArray) {
    if (!cat) continue;
    const wpId = parseInt(cat['wp:term_id']);
    const slug = getString(cat['wp:category_nicename']) || `cat-${wpId}`;
    const name = getString(cat['wp:cat_name']) || slug;
    const parentSlug = getString(cat['wp:category_parent']);

    let parentId = null;
    if (parentSlug) {
      const parent = await prisma.category.findUnique({ where: { slug: parentSlug } });
      if (parent) parentId = parent.id;
    }

    try {
      await prisma.category.upsert({
        where: { slug },
        update: { name, wpId, parentId },
        create: { slug, name, wpId, parentId },
      });
    } catch (e) {
      console.error(`Error with category ${slug}`);
    }
  }

// Alias map: normalize WP slugs to DB slugs
const SLUG_ALIASES: Record<string, string> = {
  'art-culture': 'culture',
  'arts':        'culture',
  'politique':   'politique',
  'politiques':  'politique',
  'economie-finances': 'economie',
  'finances':    'economie',
  'faits_divers': 'faits-divers',
  'international': 'internationale',
};

function normalizeSlug(slug: string): string {
  return SLUG_ALIASES[slug] || slug;
}

async function ensureCategory(slug: string, name: string) {
  const normalized = normalizeSlug(slug);
  let cat = await prisma.category.findUnique({ where: { slug: normalized } });
  if (!cat) {
    cat = await prisma.category.create({
      data: { slug: normalized, name: name || normalized }
    });
    console.log(`  → Created missing category: "${name}" (${normalized})`);
  }
  return cat;
}

  // 3. Articles (Items)
  const items = channel.item || [];
  const itemArray = Array.isArray(items) ? items : [items];
  const articles = itemArray.filter((i: any) => getString(i['wp:post_type']) === 'post' && getString(i['wp:status']) === 'publish');
  console.log(`Found ${articles.length} published articles. Importing...`);

  let count = 0;
  let skipped = 0;
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
      const catName = getString(catItem['#text'] ?? catItem.__cdata ?? catItem) || catSlug;
      if (!catSlug) continue;
      const dbCat = await ensureCategory(catSlug, catName || catSlug);
      if (dbCat) categoriesConnect.push({ id: dbCat.id });
    }

    // Extract featured image from WordPress meta
    const postMeta = item['wp:postmeta'] || [];
    const metaArray = Array.isArray(postMeta) ? postMeta : [postMeta];
    let featuredImageUrl: string | null = null;
    for (const meta of metaArray) {
      if (getString(meta['wp:meta_key']) === '_thumbnail_id') {
        // Store the thumbnail ID reference if needed in future
        break;
      }
    }

    try {
      await prisma.article.upsert({
        where: { slug },
        update: {
          title,
          content,
          excerpt,
          publishedAt,
          authorId,
          categories: { set: categoriesConnect }
        },
        create: {
          wpId,
          title,
          slug,
          content,
          excerpt,
          publishedAt,
          authorId,
          categories: { connect: categoriesConnect },
          isPremium: false
        }
      });
      count++;
      console.log(`  [${count}/${articles.length}] "${title.substring(0, 60)}..." → cats: [${categoriesConnect.map((c: any) => c.id).join(', ')}]`);
    } catch (e: any) {
      console.error(`  ✗ Error importing article ${wpId} (${slug}):`, e.message);
      skipped++;
    }
  }

  console.log(`\n✅ Import completed! Imported: ${count} | Errors: ${skipped}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

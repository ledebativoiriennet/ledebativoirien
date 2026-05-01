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
  const filePath = 'C:\\Users\\hecki\\Downloads\\ledebativoirien.WordPress.2026-05-01.xml';
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

  // 3. Articles (Items)
  const items = channel.item || [];
  const itemArray = Array.isArray(items) ? items : [items];
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
    const categorySlugs = catArray.map((c: any) => getString(c['@_nicename'])).filter(Boolean);

    const categoriesConnect = [];
    for (const catSlug of categorySlugs) {
      if (!catSlug) continue;
      const dbCat = await prisma.category.findUnique({ where: { slug: catSlug } });
      if (dbCat) categoriesConnect.push({ id: dbCat.id });
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
          isPremium: Math.random() > 0.8 // Simulate 20% premium
        }
      });
      count++;
      if (count % 100 === 0) console.log(`Imported ${count}/${articles.length} articles`);
    } catch (e: any) {
      console.error(`Error importing article ${wpId}:`, e.message);
    }
  }

  console.log(`Import completed successfully! Total imported: ${count}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
